import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voteType: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    postType: {
      type: String,
      enum: ["question", "answer"],
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

//  Prevent multiple votes on same post by same user
voteSchema.index({ postId: 1, userId: 1 }, { unique: true });

export default mongoose.model("Vote", voteSchema);
