import { getPaginationInfo, getPaginationParams } from "../hooks/pagination.js";
import { Post } from "../models/post.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { shuffleArray } from "../utils/index.js";

export const fetchAllPostAndProducts = asyncHandler(async (req, res) => {});

export const fetchAllPosts = asyncHandler(async (req, res) => {
  // Fetch total posts count and posts with populated fields, sorted by `createdAt` in descending order
  const [ posts, user] = await Promise.all([
    Post.find()
      .populate({
        path: "author",
        select: "fullName profilePicture username _id",
      })
      .select("caption mediaUrls likes comments likes createdAt")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .lean(),
    User.findById(req.user?._id).lean(), 
  ]);

  // Fetch the current user to check following status (if `req.user` exists)
  const currentUser = req.user
    ? await User.findById(req.user._id).lean()
    : null;

  // Transform posts data
  const enrichedPosts = posts.map((post) => {
    const isFollowing =
      currentUser?.following?.some(
        (followedUser) =>
          followedUser.toString() === post.author?._id.toString()
      ) || false;

    // Get the total comment count
    const totalComments = post.comments.length;
    const isBookmarkedByMe = user?.bookmarks?.some(
      (bookmark) => bookmark.toString() === post._id.toString()
    );

    return {
      _id: post._id,
      caption: post.caption,
      mediaUrls: post.mediaUrls,
      likeCount: post.likes.length,
      isLikedByMe: post.likes.some((like) => like.equals(req.user?._id)),
      isBookmarkedByMe,
      authorName: post.author?.fullName || "Unknown",
      authorId: post.author?._id || null,
      isMine: currentUser
        ? post.author?._id.toString() === currentUser._id.toString()
        : false,
      username: post.author?.username || "Unknown",
      profilePicture: post.author?.profilePicture || "",
      commentCount: totalComments,
      isFollowing,
    };
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, { posts: enrichedPosts }, "Fetched successfully!")
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
