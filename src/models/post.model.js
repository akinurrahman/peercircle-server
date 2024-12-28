import mongoose, { model, Schema } from "mongoose";

const postSchema = new Schema(
  {
    caption: { type: String },
    mediaUrls: [{ type: String, required: true }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "PostComment" }],
  },
  { timestamps: true }
);

export const Post = model("Post", postSchema);
