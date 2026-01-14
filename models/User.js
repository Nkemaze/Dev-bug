import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    reputation: { type: Number, default: 0 },

    // OTP reset fields (from your MySQL logic)
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
