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
