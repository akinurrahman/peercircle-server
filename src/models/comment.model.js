import mongoose, { model, Schema } from "mongoose";

const commentSchema = new Schema(
  {
    text: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the resource (Post or Product)
    resourceType: {
      type: String,
      required: true,
      enum: ["post", "product"], // Specify the type of resource
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // Reference to parent comment for nested comments
  },
  { timestamps: true }
);

export const Comment = model("Comment", commentSchema);
