import mongoose, { Schema, model } from "mongoose";

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    refType: { type: String, enum: ["Post", "Product"], required: true }, 
    refId: { type: Schema.Types.ObjectId, required: true }, 
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
