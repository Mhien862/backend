import mongoose from "mongoose";

const commentSchema = mongoose.Schema({
  contribution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contribution",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: String,
  submissionDate: Date,
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
