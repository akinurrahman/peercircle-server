import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(
      401,
      "Access denied! Token not found",
      "TOKEN_NOT_FOUND"
    );
  }

  const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodedToken || !decodedToken._id) {
    throw new ApiError(
      401,
      "Invalid or expired token",
      "TOKEN_INVALID"
    );
  }

  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    throw new ApiError(401, "User not found", [], "", "USER_NOT_FOUND");
  }

  req.user = user;
  next();
});


export const isEmailVerified = asyncHandler(async (req, res, next) => {
  if (!req.user?.isVerified) {
    throw new ApiError(
      401,
      "Email is not verified! Please verify your email",
      "EMAIL_NOT_VERIFIED"
    );
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