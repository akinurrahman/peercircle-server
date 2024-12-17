import mongoose, { model, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required : true },
    postId : {type:mongoose.Schema.Types.ObjectId, ref: "Post", required : true}
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
