import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// helper
const sendError = (res, status, message) =>
  res.status(status).json({ error: true, message });

// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const exists = await User.findOne({ email });
    if (exists) return sendError(res, 400, "User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Error registering user");
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, 404, "User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendError(res, 401, "Invalid credentials");

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safeUser } = user._doc;

    res.json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Login failed");
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, 400, "Email is required");

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 5 * 60 * 1000);

  const user = await User.findOneAndUpdate(
    { email },
    { otp: code, otpExpires: expires, otpVerified: false },
    { new: true }
  );

  if (!user) return sendError(res, 404, "Email not found");

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Code",
    text: `Your password reset code is: ${code}`,
  });

  res.json({ message: "Verification code sent", otpExpires: expires });
};

// VERIFY CODE
export const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email, otp: code });
  if (!user) return sendError(res, 400, "Invalid code");

  if (user.otpExpires < new Date())
    return sendError(res, 400, "Code expired");

  user.otpVerified = true;
  await user.save();

  res.json({ message: "Code verified. You can now reset your password." });
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return sendError(res, 404, "User not found");

  if (!user.otpVerified)
    return sendError(res, 400, "OTP not verified yet");

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = null;
  user.otpExpires = null;
  user.otpVerified = false;

  await user.save();

  res.json({ message: "Password changed successfully" });
};
