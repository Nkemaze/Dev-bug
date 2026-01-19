import Answer from "../models/Answer.js";
import Question from "../models/Question.js";

// Post Answer
// Post Answer
export const createAnswer = async (req, res) => {
  try {
    const { body } = req.body;
    const questionId = req.params.questionId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Create answer
    const answer = await Answer.create({
      body,
      userId: req.user.id,
      questionId,
    });

    // Populate user info before sending response
    const populatedAnswer = await Answer.findById(answer._id)
      .populate("userId", "name reputation");

    res.status(201).json({
      message: "Answer posted successfully",
      answer: populatedAnswer,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to post answer" });
  }
};


// Get Answers by Question
export const getAnswersByQuestion = async (req, res) => {
  try {
    const answers = await Answer.find({
      questionId: req.params.questionId,
    })
      .populate("userId", "name reputation")
      .sort({ isAccepted: -1, createdAt: -1 });

    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch answers" });
  }
};

// Update Answers by Owner
export const updateAnswer = async (req, res) => {
  try {
    const { body } = req.body;

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    answer.body = body || answer.body;
    await answer.save();

    res.json({ message: "Answer updated", answer });
  } catch (error) {
    res.status(500).json({ message: "Failed to update answer" });
  }
};

// Delete Answers by Owner
export const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    if (answer.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await answer.deleteOne();

    res.json({ message: "Answer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete answer" });
  }
};

// Accept Answers by Owner of question
export const acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Answer not found" });
    }

    const question = await Question.findById(answer.questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (question.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Remove previous accepted answer
    await Answer.updateMany(
      { questionId: question._id },
      { isAccepted: false }
    );

    answer.isAccepted = true;
    await answer.save();

    question.acceptedAns = answer._id;
    await question.save();

    res.json({ message: "Answer accepted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to accept answer" });
  }
};
