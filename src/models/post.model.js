import mongoose, { model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    caption: { type: String },
    mediaUrl: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ types: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ types: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
