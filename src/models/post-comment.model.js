import { model, Schema } from "mongoose";

const postCommentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    replies: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const PostComment = model("PostComment", postCommentSchema);
