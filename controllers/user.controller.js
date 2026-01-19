import User from "../models/User.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Count questions & answers
    const [questionsCount, answersCount] = await Promise.all([
      Question.countDocuments({ userId: id }),
      Answer.countDocuments({ userId: id }),
    ]);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      reputation: user.reputation,
      badges: user.badges || [],
      questionsCount,
      answersCount,
      isOwner: req.user?.id === user._id.toString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to load user profile" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users sorted by reputation descending
    const users = await User.find()
      .select("-password") // exclude passwords
      .sort({ reputation: -1 });

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};