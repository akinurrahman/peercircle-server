import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Access denied! Token not found");
  }

  const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "Invalid Access Token");
  }

  req.user = user;
  next();
});

export const isEmailVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.isVerified) {
    throw new ApiError(401, "User is not verified");
  }
  next();
});

export const attachUserIfLoggedIn = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // If no token, simply continue without attaching user
  if (!token) {
    return next();
  }

  try {
    // Decode the token
    const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

    // If token is invalid, move on without attaching user
    if (!decodedToken) {
      return next();
    }

    // Find the user from the token's ID
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    // If user exists, attach to the request
    if (user) {
      req.user = user;
    }

    return next();
  } catch (error) {
    return next(); // If any error occurs, move on without attaching user
  }
});