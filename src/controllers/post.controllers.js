import { Comment } from "../models/comment.model.js";
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
  return  res.status(200).json(new ApiResponse(200, [], "No posts found"));
  }

 const response = user.posts.map((post) => ({
   id: post._id,
   caption: post.caption,
   mediaUrl: post.mediaUrl,
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
  const { postId } = req.body;
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

  // Perform the update in a single atomic operation
  await Post.findByIdAndUpdate(postId, update, { new: true });

  const action = post.likes.includes(userId) ? "Unliked" : "Liked";

  res.status(200).json(new ApiResponse(200, {}, `${action} successfully!`));
});

export const postComment = asyncHandler(async (req, res) => {
  const commenterId = req.user._id;
  const { text, postId } = req.body;

  if (!text) {
    throw new ApiError(400, "Please provide valid fields");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = new Comment({
    text,
    author: commenterId,
    resourceId: postId, // ID of the product/post being commented on
    resourceType: "Post",
  });
  await comment.save();

  post.comments.push(comment._id);
  await post.save();

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
  }).populate("bookmarks");

  const action = isBookmarked ? "Unbookmarked" : "Bookmarked";

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser.bookmarks, `${action} successfully!`)
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
