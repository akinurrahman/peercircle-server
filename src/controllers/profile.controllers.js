import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const editProfile = asyncHandler(async (req, res) => {
  const { fullName, profilePicture, bio, gender } = req.body;

  if (!fullName && !profilePicture && !bio && !gender) {
    throw new ApiError(400, "Please provide valid fields");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id, // Directly use the ID
    { $set: { fullName, profilePicture, bio, gender } },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  res
    .status(201)
    .json(new ApiResponse(201, user, "profile updated successfully"));
});

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id).select(
    "-password -refreshToken -posts"
  );
  if (!user) {
    throw new ApiError(404, "profile not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "profile fetched successfully"));
});

export const getPublicProfileById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -refreshToken -posts");
  if (!user) {
    throw new ApiError(404, "profile not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "profile fetched successfully"));
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
      .json(new ApiResponse(200, {}, "unfollowed successfully!"));
  } else {
    //follow logic
    await Promise.all([
      User.updateOne({ _id: req.user?._id }, { $push: { following: userId } }),
      User.updateOne({ _id: userId }, { $push: { followers: req.user?._id } }),
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "followed successfully!"));
  }
});

export const checkIfUserNameExists = asyncHandler(async (req, res) => {
  const username = req.params.username;
  const user = await User.findOne({ username });
  if (user) {
    return res.status(409).json(new ApiResponse(409, {}, "user already exists"));
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Username is available"));
  }
});
