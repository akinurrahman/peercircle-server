import mongoose, { model, Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: [{ type: String, required: true }],
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true },
    condition: { type: String, enum: ["new", "used", "refurbished"] },
    isAvailable: { type: String, enum: ["yes", "no"], default: "yes" },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Product = model("Product", productSchema);
