import Vote from "../models/Vote.js";
import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import { updateReputation } from "../helpers/reputation.helper.js";

/**
 * Vote on a Question or Answer
 * Rules:
 * - User cannot vote own post
 * - One vote per user per post
 * - Clicking same vote removes it
 * - Changing vote updates reputation correctly
 */
export const votePost = async (req, res) => {
  try {
    const { postType, postId, voteType } = req.body;

    // ✅ Validate input
    if (!["question", "answer"].includes(postType)) {
      return res.status(400).json({ message: "Invalid post type" });
    }

    if (!["up", "down"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }

    // ✅ Get post
    let post;
    if (postType === "question") {
      post = await Question.findById(postId);
    } else {
      post = await Answer.findById(postId);
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const postOwnerId = post.userId.toString();

    // 🚫 Cannot vote own post
    if (postOwnerId === req.user.id) {
      return res.status(403).json({
        message: "You cannot vote on your own post",
      });
    }

    // Check existing vote
    const existingVote = await Vote.findOne({
      postId,
      postType,
      userId: req.user.id,
    });

    let reputationChange = 0;

    // 🆕 New vote
    if (!existingVote) {
      await Vote.create({
        postType,
        postId,
        voteType,
        userId: req.user.id,
      });

      reputationChange =
        voteType === "up"
          ? postType === "answer"
            ? 10
            : 5
          : -2;
    }

    // Same vote clicked → remove vote
    else if (existingVote.voteType === voteType) {
      await existingVote.deleteOne();

      reputationChange =
        voteType === "up"
          ? postType === "answer"
            ? -10
            : -5
          : 2;
    }

    // 🔄 Change vote (up ↔ down)
    else {
      existingVote.voteType = voteType;
      await existingVote.save();

      reputationChange =
        voteType === "up"
          ? postType === "answer"
            ? 12
            : 7
          : -12;
    }

    // ✅ Update reputation
    await updateReputation(postOwnerId, reputationChange);

    res.json({
      message: "Vote processed successfully",
      reputationChange,
    });
  } catch (error) {
    // Duplicate vote safety
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate vote detected" });
    }

    console.error(error);
    res.status(500).json({ message: "Voting failed" });
  }
};

export const getVotes = async (req, res) => {
  try {
    const { postType, postId } = req.params;

    if (!["question", "answer"].includes(postType)) {
      return res.status(400).json({ message: "Invalid post type" });
    }

    const votes = await Vote.find({ postType, postId });

    // Optionally, you can return upvotes/downvotes separately:
    const upvotes = votes.filter(v => v.voteType === "up").length;
    const downvotes = votes.filter(v => v.voteType === "down").length;

    res.json({ total: votes.length, upvotes, downvotes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch votes" });
  }
};