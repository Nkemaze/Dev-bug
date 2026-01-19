import Question from "../models/Question.js";

// Create Question
export const createQuestion = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user); // <-- check this

    const { title, body, tags } = req.body;
    const question = await Question.create({
      title,
      body,
      tags,
      userId: req.user.id,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error("Create question error:", error); // <-- full error
    res.status(500).json({ message: error.message });
  }
};


// Get All Questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find()
      .populate("userId", "name reputation")
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// Get Single Question
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate("userId", "name reputation");

    if (!question)
      return res.status(404).json({ message: "Question not found" });

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch question" });
  }
};

// Update Question (Owner only)
export const updateQuestion = async (req, res) => {
  try {
    const { title, body, tags } = req.body;

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Ownership check
    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields
    if (title) question.title = title;
    if (body) question.body = body;
    if (tags) question.tags = tags;

    await question.save();

    res.json({
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update question" });
  }
};


// Delete Question (Owner only)
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check ownership
    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await question.deleteOne();

    res.json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete question" });
  }
};
