import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 10,
    },
    body: {
      type: String,
      required: true,
      minlength: 20,
    },
    tags: [{
      type: String,
    }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedAns: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
