import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    body: {
      type: String,
      required: true,
      minlength: 5,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Answer", answerSchema);
