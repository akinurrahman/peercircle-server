import { getPaginationInfo, getPaginationParams } from "../hooks/pagination.js";
import { Post } from "../models/post.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { shuffleArray } from "../utils/index.js";

export const fetchAllPostAndProducts = asyncHandler(async (req, res) => {});

export const fetchAllPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPaginationParams(req);

  // Fetch total posts count and posts with populated fields
  const [totalPosts, posts] = await Promise.all([
    Post.countDocuments(),
    Post.find()
      .skip(skip)
      .limit(limit)
      .populate({
        path: "author",
        select: "fullName profilePicture username _id",
      })
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "fullName profilePicture ",
        },
        select: "text author",
        options: { limit: 0 }, // Do not limit comments initially
      })
      .select("caption mediaUrls likes comments")
      .lean(),
  ]);

  // Fetch the current user to check following status (if `req.user` exists)
  const currentUser = req.user
    ? await User.findById(req.user._id).lean()
    : null;

  // Transform posts data
  const enrichedPosts = posts.map((post) => {
    const isFollowing =
      currentUser?.followers.includes(post.author?._id) || false;

    // Get the total comment count
    const totalComments = post.comments.length;

    // Shuffle comments and pick 2 random comments
    const randomComments = shuffleArray(post.comments)
      .slice(0, 2)
      .map((comment) => ({
        commentId: comment._id,
        text: comment.text,
        commenterName: comment.author?.fullName || "Unknown",
        commenterId: comment.author?._id || null,
        profilePicture: comment.author?.profilePicture || "",
      }));

    return {
      _id: post._id,
      caption: post.caption,
      mediaUrls: post.mediaUrls,
      likeCount: post.likes.length,
      authorName: post.author?.fullName || "Unknown",
      authorId: post.author?._id || null,
      isMine: currentUser
        ? post.author?._id.toString() === currentUser._id.toString()
        : false,
      username: post.author?.username || "Unknown",
      profilePicture: post.author?.profilePicture || "",
      commentCount: totalComments,
      isFollowing,
      randomComments,
    };
  });

  // Get pagination info
  const paginationInfo = getPaginationInfo(totalPosts, page, limit);

  // Send response
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { posts: enrichedPosts, paginationInfo },
        "Fetched successfully!"
      )
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
      new ApiResponse(
        200,
        { products, paginationInfo },
        "Fetched successfully!"
      )
    );
});
