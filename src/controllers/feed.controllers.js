import { getPaginationInfo, getPaginationParams } from "../hooks/pagination.js";
import { Post } from "../models/post.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const fetchAllPostAndProducts = asyncHandler(async (req, res) => {
  
});

export const fetchAllPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const totalPosts = await Post.countDocuments();
  const posts = await Post.find().skip(skip).limit(limit);

  const paginationInfo = getPaginationInfo(totalPosts, page, limit);

  res
    .status(200)
    .json(
      new ApiResponse(200, { posts, paginationInfo }, "Fetched successfully!")
    );
});
export const fetchAllProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  const totalProducts = await Product.countDocuments();
  const products = await Product.find().skip(skip).limit(limit);

  const paginationInfo = getPaginationInfo(totalProducts, page, limit);

  res
    .status(200)
    .json(
      new ApiResponse(200, { products, paginationInfo }, "Fetched successfully!")
    );
});