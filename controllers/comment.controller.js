import Comment from "../models/Comment.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";

// Post Comment
export const createComment = async (req, res) => {
  try {
    const { body, postType, postId } = req.body;

    // Validate postType
    if (!["question", "answer"].includes(postType)) {
      return res.status(400).json({ message: "Invalid post type" });
    }

    // Ensure post exists
    if (postType === "question") {
      const question = await Question.findById(postId);
      if (!question) return res.status(404).json({ message: "Question not found" });
    }

    if (postType === "answer") {
      const answer = await Answer.findById(postId);
      if (!answer) return res.status(404).json({ message: "Answer not found" });
    }

    const comment = await Comment.create({
      body,
      postType,
      postId,
      userId: req.user.id,
    });

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// Get comment by post
export const getCommentsByPost = async (req, res) => {
  try {
    const { postType, postId } = req.query;

    const comments = await Comment.find({ postType, postId })
      .populate("userId", "name")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.body = req.body.body || comment.body;
    await comment.save();

    res.json({ message: "Comment updated", comment });
  } catch (error) {
    res.status(500).json({ message: "Failed to update comment" });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
