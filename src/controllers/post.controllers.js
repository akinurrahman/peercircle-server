import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Product } from "../models/product.model.js";
import { isValidImageUrl } from "../utils/isValidImageUrl.js";

export const addPost = asyncHandler(async (req, res) => {
  const { caption, mediaUrls } = req.body;
  const author = req.user?._id;

  if (!mediaUrls || mediaUrls.length === 0) {
    throw new ApiError(400, "Media URL is required");
  }

  // Validate that mediaUrls is an array and contains valid URLs
  if (!Array.isArray(mediaUrls)) {
    throw new ApiError(400, "Media URLs should be an array.");
  }

  // Validate each media URL
  for (let url of mediaUrls) {
    const isValid = await isValidImageUrl(url);
    if (!isValid) {
      throw new ApiError(400, `Invalid media URL: ${url}`);
    }
  }

  const post = new Post({
    caption: caption || undefined,
    mediaUrls,
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
  const userId = req.query.profileId || req.user?._id;

  if (!userId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User ID is required"));
  }

  const user = await User.findById(userId).populate({
    path: "posts",
    populate: {
      path: "author",
      select: "fullName",
    },
  });

  if (!user.posts || user.posts.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No posts found"));
  }

  const response = user.posts.map((post) => ({
    id: post._id,
    caption: post.caption,
    mediaUrls: post.mediaUrls,
    author: post.author.fullName,
    likes: post.likes.length,
    comments: post.comments.length,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }));

  res
    .status(200)
    .json(new ApiResponse(200, response, "Posts fetched successfully"));
});

export const likeUnlikeItem = asyncHandler(async (req, res) => {
  const { refId } = req.params;
  const { refType } = req.body;
  const userId = req.user?._id;

  // Validate refType
  if (!["Post", "Product"].includes(refType)) {
    throw new ApiError(400, "Invalid reference type");
  }



  let item;
  if (refType === "Post") {
    item = await Post.findById(refId);
  } else {
    item = await Product.findById(refId);
  }

  if (!item) {
    throw new ApiError(404, "Item not found");
  }

  // Check if user has already liked the item
  const index = item.likes.indexOf(userId);

  if (index === -1) {
    // User hasn't liked the item yet, so add the user to likes
    item.likes.push(userId);
  } else {
    // User has already liked the item, so remove the user from likes
    item.likes.splice(index, 1);
  }

  // Save the item with updated likes array
  await item.save();

  const response = {
    isLiked : item.likes.includes(userId),
    likeCount: item.likes.length,
  }

  return res.status(200).json(new ApiResponse(200, response, "Item liked"));
});

export const bookMarkPost = asyncHandler(async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const user = await User.findById(userId);

  const isBookmarked = user.bookmarks.includes(postId);
  const update = isBookmarked
    ? { $pull: { bookmarks: postId } }
    : { $push: { bookmarks: postId } };
  const updatedUser = await User.findByIdAndUpdate(userId, update, {
    new: true,
  });

  const action = isBookmarked ? "Unbookmarked" : "Bookmarked";

  res.status(200).json(
    new ApiResponse(
      200,
      {
        isBookmarked: updatedUser.bookmarks.includes(postId),
      },
      `${action} successfully!`
    )
  );
});

export const deletePost = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this post");
  }

  await Post.findByIdAndDelete(postId);

  const user = await User.findById(userId);
  user.posts.pull(postId);
  await user.save();

  // await Comment.deleteMany({ postId });

  res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully!"));
});

export const addComment = asyncHandler(async (req, res) => {
  const { text, refType, refId } = req.body;
  const author = req.user?._id;

  if (!["Post", "Product"].includes(refType)) {
    throw new ApiError(400, "Invalid reference type");
  }

  const existingItem =
    refType === "Post"
      ? await Post.findById(refId)
      : await Product.findById(refId);
  if (!existingItem) {
    return res.status(404).json(new ApiResponse(404, null, "Item not found"));
  }

  const newComment = new Comment({ text, author, refType, refId });
  await newComment.save();

  // Push the new comment into the respective Post or Product
  if (refType === "Post") {
    await Post.findByIdAndUpdate(refId, {
      $push: { comments: newComment._id },
    });
  } else {
    await Product.findByIdAndUpdate(refId, {
      $push: { comments: newComment._id },
    });
  }

  const populatedComment = await Comment.findById(newComment._id).populate(
    "author",
    "fullName email profilePicture"
  );

  res
    .status(201)
    .json(
      new ApiResponse(201, populatedComment, "Comment added successfully!")
    );
});

export const getAllComment = asyncHandler(async (req, res) => {
  const { refType } = req.params;
  const { refId } = req.query;

  if (!["Post", "Product"].includes(refType)) {
    throw new ApiError(400, "Invalid reference type");
  }

  const comments = await Comment.find({ refType, refId }).populate(
    "author",
    "fullName email profilePicture"
  );

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully!"));
});
