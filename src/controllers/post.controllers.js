import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addPost = asyncHandler(async (req, res) => {
  const { caption, mediaUrl } = req.body;
  const author = req.user?._id;

  if (!mediaUrl) {
    throw new ApiError(400, "Media URL is required");
  }

  const post = new Post({
    caption: caption || undefined,
    mediaUrl,
    author,
  });
  const savedPost = await post.save();
  await User.findByIdAndUpdate(
    author,
    { $push: { posts: savedPost._id } },
    { new: true }
  );
  res
    .status(201)
    .json(new ApiResponse(201, post, "Post created successfully!"));
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user?._id;

  const user = await User.findById(userId).populate("posts");

  if (!user.posts || user.posts.length === 0) {
    throw new ApiError(404, "No posts found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user.posts, "Posts fetched successfully"));
});
