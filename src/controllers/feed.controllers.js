import mongoose from "mongoose";
import { getPaginationInfo, getPaginationParams } from "../hooks/pagination.js";
import { Post } from "../models/post.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



export const fetchAllPosts = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null; 

  const posts = await Post.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: "$author",
    },
    {
      $addFields: {
        isLiked: {
          $in: [userId, "$likes"],
        },
        isBookmarked: {
          $in: ["$_id", "$author.bookmarks"],
        },
        isFollowing: {
          $in: [userId, "$author.following"],
        },
        likeCount: {
          $size: "$likes",
        },
        commentCount: { $size: "$comments" },
        type: "post",
        isMine: {
          $eq: ["$author._id", userId],
        },
      },
    },
    {
      $project: {
        _id: 1,
        caption: 1,
        mediaUrls: 1,
        isMine: 1,
        type: 1,
        likeCount: 1,
        commentCount: 1,
        createdAt: 1,

        isLiked: 1,
        isBookmarked: 1,
        isFollowing: 1,

        author: {
          _id: "$author._id",
          fullName: "$author.fullName",
          username: "$author.username",
          profilePicture: "$author.profilePicture",
        },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, posts, "Fetched successfully!"));
});

export const fetchAllProducts = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;

  const products = await Product.aggregate([
    {
      $sort: { createdAt: -1 },
    },
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "seller",
      },
    },
    {
      $unwind: "$seller",
    },
    {
      $addFields: {
        isLiked: {
          $in: [ userId, "$likes"],
        },
        isFollowing: {
          $in: [ userId, "$seller.following"],
        },
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
        type: "product",
        isMine: {
          $eq: ["$seller._id",  userId],
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        mediaUrls: 1,
        isMine: 1,
        type: 1,
        likeCount: 1,
        commentCount: 1,
        createdAt: 1,
        isLiked: 1,
        isFollowing: 1,

        author: {
          _id: "$seller._id",
          fullName: "$seller.fullName",
          username: "$seller.username",
          profilePicture: "$seller.profilePicture",
        },
      },
    },
  ]);

  res.status(200).json(new ApiResponse(200, products, "Fetched successfully!"));
});


export const fetchAllFeed = asyncHandler(async (req, res) => {
  const userId = req.user?._id || null;

  const data = await Post.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: "$author",
    },
    {
      $addFields: {
        isLiked: {
          $in: [userId, "$likes"],
        },
        isBookmarked: {
          $in: ["$_id", "$author.bookmarks"],
        },
        isFollowing: {
          $in: [userId, "$author.following"],
        },
        likeCount: {
          $size: "$likes",
        },
        commentCount: { $size: "$comments" },
        type: "post",
        isMine: {
          $eq: ["$author._id", userId],
        },
      },
    },
    {
      $project: {
        _id: 1,
        caption: 1,
        mediaUrls: 1,
        isMine: 1,
        type: 1,
        likeCount: 1,
        commentCount: 1,
        createdAt: 1,
        isLiked: 1,
        isBookmarked: 1,
        isFollowing: 1,
        author: {
          _id: "$author._id",
          fullName: "$author.fullName",
          username: "$author.username",
          profilePicture: "$author.profilePicture",
        },
      },
    },
  ]);

  const products = await Product.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "seller",
        foreignField: "_id",
        as: "seller",
      },
    },
    {
      $unwind: "$seller",
    },
    {
      $addFields: {
        isLiked: {
          $in: [userId, "$likes"],
        },
        isFollowing: {
          $in: [userId, "$seller.following"],
        },
        likeCount: { $size: "$likes" },
        commentCount: { $size: "$comments" },
        type: "product",
        isMine: {
          $eq: ["$seller._id", userId],
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        mediaUrls: 1,
        isMine: 1,
        type: 1,
        likeCount: 1,
        commentCount: 1,
        createdAt: 1,
        isLiked: 1,
        isFollowing: 1,
        author: {
          _id: "$seller._id",
          fullName: "$seller.fullName",
          username: "$seller.username",
          profilePicture: "$seller.profilePicture",
        },
      },
    },
  ]);

  // Combine posts and products into one array
  const feedItems = [...data, ...products];

  // Sort the combined array by the createdAt field (latest first)
  feedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res
    .status(200)
    .json(new ApiResponse(200, feedItems, "Fetched feed successfully!"));
});
