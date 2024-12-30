import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { PostComment } from "../models/post-comment.model.js";

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

export const addCommentOnPost = asyncHandler(async (req, res) => {
  const { postId, comment, commentId, reply } = req.body;
  const userId = req.user?._id;

  if (commentId) {
    // Handle reply to a comment
    if (!userId || !reply || !commentId) {
      throw new ApiError(400, "Missing required fields for reply");
    }

    const parentComment = await PostComment.findById(commentId);
    if (!parentComment) {
      throw new ApiError(404, "Parent comment not found");
    }

    // Create a new reply object
    const newReply = {
      userId,
      comment: reply,
      createdAt: new Date(),
    };

    // Add the new reply to the parent comment's replies array
    parentComment.replies.push(newReply);
    await parentComment.save();

    // Fetch the newly added reply, and populate user info
    const populatedReply = await PostComment.findById(commentId)
      .populate("replies.userId", "fullName profilePicture")
      .select("replies -_id") // Only select the replies field
      .lean();

    // Get the last added reply
    const replyToSend =
      populatedReply.replies[populatedReply.replies.length - 1];

    res
      .status(201)
      .json(new ApiResponse(201, replyToSend, "Reply added successfully!"));
  } else {
    // Handle new comment
    if (!postId || !userId || !comment) {
      throw new ApiError(400, "Missing required fields for comment");
    }

    const newComment = new PostComment({
      postId,
      userId,
      comment,
      replies: [], // Initially no replies
    });

    // Save the new comment to the PostComment model
    const savedComment = await newComment.save();

    // Add the comment ID to the Post model
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: savedComment._id } },
      { new: true }
    );

    // Populate user information (fullName, profilePicture) for the new comment
    const populatedComment = await PostComment.findById(
      savedComment._id
    ).populate("userId", "fullName profilePicture");

    res
      .status(201)
      .json(
        new ApiResponse(201, populatedComment, "Comment added successfully!")
      );
  }
});


export const getAllCommentsForPost = asyncHandler(async (req, res) => {
  const { postId } = req.query;

  if (!postId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Post ID is required"));
  }

  const comments = await PostComment.find({ postId })
    .populate("userId", "fullName profilePicture")
    .populate("replies.userId", "fullName profilePicture")
    .lean();

  if (comments.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No comments found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully!"));
});
