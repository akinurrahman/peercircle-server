import { User } from "../models/user.model.js";
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
