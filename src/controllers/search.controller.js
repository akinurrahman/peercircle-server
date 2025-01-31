import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const searchUsers = asyncHandler(async (req, res) => {
    const { search_query } = req.query;

    if (!search_query) {
      throw new ApiError(400, "Search query is required");
    }

    const users = await User.find({
      $or: [
        { fullName: { $regex: search_query, $options: "i" } },
        { username: { $regex: search_query, $options: "i" } },
      ],
    }).select("fullName username profilePicture");

    if(users.length === 0){
      res.status(200).json(new ApiResponse(200, [], "No users found"));
    }

    res.status(200).json(new ApiResponse(200, users, "Users found"));
 
})
