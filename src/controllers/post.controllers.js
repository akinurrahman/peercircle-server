import { Comment } from "../models/comment.model.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const addPost = asyncHandler(async (req, res) => {
  const { caption, mediaUrls } = req.body;
  const author = req.user?._id;

  if (!mediaUrls) {
    throw new ApiError(400, "Media URL is required");
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

export const likeUnlikePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  // Ensure the post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Check if the user already liked the post and update accordingly
  const update = post.likes.includes(userId)
    ? { $pull: { likes: userId } } // Unlike (remove user from likes array)
    : { $addToSet: { likes: userId } }; // Like (add user to likes array only if not already liked)

  // Perform the update in a single atomic operation and get the updated post
  const updatedPost = await Post.findByIdAndUpdate(postId, update, {
    new: true,
  });

  // Determine the action based on the updated post's likes array
  const action = updatedPost.likes.includes(userId) ? "Liked" : "Unliked";

  // Return the updated data
  res.status(200).json(
    new ApiResponse(
      200,
      {
        isLiked: updatedPost.likes.includes(userId), // Correct the isLiked value
        likeCount: updatedPost.likes.length, // Correct like count
      },
      `${action} successfully!`
    )
  );
});

export const postComment = asyncHandler(async (req, res) => {
  const commenterId = req.user._id;
  const { text, resourceId, resourceType, parentComment } = req.body;

  if (!text || !resourceId || !resourceType) {
    throw new ApiError(400, "Please provide valid fields");
  }

  // Determine whether it's a post or product comment
  let resource;

  if (resourceType === "Post") {
    resource = await Post.findById(resourceId);
  } else if (resourceType === "Product") {
    resource = await Product.findById(resourceId);
  } else {
    throw new ApiError(
      400,
      "Invalid resource type. Must be 'Post' or 'Product'"
    );
  }

  if (!resource) {
    throw new ApiError(404, `${resourceType} not found`);
  }

  // Check if the parent comment exists (for nested comment case)
  let parentCommentDocument = null;
  if (parentComment) {
    parentCommentDocument = await Comment.findById(parentComment);
    if (!parentCommentDocument) {
      throw new ApiError(404, "Parent comment not found");
    }
  }

  // Create a new comment
  const comment = new Comment({
    text,
    author: commenterId,
    resourceId,
    resourceType,
    parentComment: parentComment || null, // Only set parentComment if it's a reply
  });

  await comment.save();

  // Add the comment to the resource's comments array
  resource.comments.push(comment._id);

  await resource.save();

  // If it's a nested comment, add the new comment to the parent comment's replies (optional)
  if (parentComment) {
    parentCommentDocument.replies.push(comment._id);
    await parentCommentDocument.save();
  }

  res
    .status(201)
    .json(new ApiResponse(201, comment, "Comment added successfully!"));
});

export const getAllComments = asyncHandler(async (req, res) => {
  const postId = req.params?.postId;

  const post = await Post.findById(postId).populate({
    path: "comments",
    populate: {
      path: "author",
      select: "fullName profilePicture",
    },
  });
  if (post.comments.length === 0) {
    throw new ApiError(404, "No comments found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, post.comments, "Comments fetched successfully!")
    );
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

  await Comment.deleteMany({ postId });

  res.status(200).json(new ApiResponse(200, {}, "Post deleted successfully!"));
});
