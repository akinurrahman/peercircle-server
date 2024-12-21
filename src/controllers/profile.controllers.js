import { response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const editProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    profilePicture,
    bio,
    gender,
    username,
    location,
    website_url,
  } = req.body;

  if (
    !fullName &&
    !profilePicture &&
    !bio &&
    !gender &&
    !username &&
    !location &&
    !website_url
  ) {
    throw new ApiError(400, "Please provide valid fields");
  }

  // Check if the username is already taken (exclude the current user's username)
  if (username) {
    const existingUser = await User.findOne({ username }).select("_id");
    if (
      existingUser &&
      existingUser._id.toString() !== req.user._id.toString()
    ) {
      throw new ApiError(400, "Username is already taken");
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id, // Directly use the ID
    {
      $set: {
        fullName,
        profilePicture,
        bio,
        gender,
        username,
        location,
        website_url,
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  res
    .status(201)
    .json(new ApiResponse(201, user, "profile updated successfully"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = id || req.user?._id;

  const user = await User.findById(userId).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "Profile not found");
  }

  const isFollowing =
    id && req.user?._id ? user.followers.includes(req.user._id) : undefined; // Only calculate for public profiles

  const response = {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    profilePicture: user.profilePicture,
    bio: user.bio,
    gender: user.gender,
    followers: user.followers.length,
    following: user.following.length,
    posts: user.posts.length,
    isVerified: user.isVerified,
    website_url: user.website_url,
    location: user.location,
    ...(id && { isFollowing }), // Add `isFollowing` only for public profiles
  };

  res
    .status(200)
    .json(new ApiResponse(200, response, "Profile fetched successfully"));
});

export const toggleFollowUnfollow = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (userId === req.user._id) {
    throw new ApiError(400, "Your can't follow/unfollow yourself");
  }

  const currentUser = await User.findById(req.user?._id);
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw new ApiError(404, "user not found");
  }

  // check if the current user is already following the target user
  if (currentUser.following.includes(userId)) {
    //unfollow logic
    await Promise.all([
      User.updateOne({ _id: req.user?._id }, { $pull: { following: userId } }),
      User.updateOne({ _id: userId }, { $pull: { followers: req.user?._id } }),
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isFollowing: false }, "unfollowed successfully!")
      );
  } else {
    //follow logic
    await Promise.all([
      User.updateOne({ _id: req.user?._id }, { $push: { following: userId } }),
      User.updateOne({ _id: userId }, { $push: { followers: req.user?._id } }),
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isFollowing: true }, "followed successfully!")
      );
  }
});

export const checkIfUserNameExists = asyncHandler(async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (user) {
    return res
      .status(409)
      .json(new ApiResponse(409, {available: false}, "user already exists"));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, {available: true}, "Username is available"));
  }
});
