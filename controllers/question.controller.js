import Question from "../models/Question.js";
import Answer from "../models/Answer.js";
import Vote from "../models/Vote.js";

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
// export const getQuestions = async (req, res) => {
//   try {
//     const questions = await Question.find()
//       .populate("userId", "name reputation")
//       .sort({ createdAt: -1 });

//     res.json(questions);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch questions" });
//   }
// };

//filter questions by newest, active, votes, unanswered
export const getQuestions = async (req, res) => {
  try {
    const { filter } = req.query;

    // Unanswered: questions that have no answers
    if (filter === "unanswered") {
      const answeredIds = await Answer.distinct("questionId");
      const unanswered = await Question.find({ _id: { $nin: answeredIds } })
        .populate("userId", "name reputation")
        .sort({ createdAt: -1 });

      return res.json(unanswered);
    }

    // Votes: sort questions by net vote count (up - down)
    if (filter === "votes") {
      const questions = await Question.aggregate([
        {
          $lookup: {
            from: "votes",
            localField: "_id",
            foreignField: "postId",
            as: "votes",
          },
        },
        {
          $addFields: {
            voteCount: {
              $sum: {
                $map: {
                  input: "$votes",
                  as: "v",
                  in: {
                    $cond: [{ $eq: ["$$v.voteType", "up"] }, 1, -1],
                  },
                },
              },
            },
          },
        },
        { $sort: { voteCount: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            userId: "$user",
          },
        },
        {
          $project: {
            user: 0,
            votes: 0,
          },
        },
      ]);

      return res.json(questions);
    }

    // Default sorting: newest or active
    let sortOption = { createdAt: -1 };
    if (filter === "active") sortOption = { updatedAt: -1 };

    const questions = await Question.find().populate("userId", "name reputation").sort(sortOption);
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
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