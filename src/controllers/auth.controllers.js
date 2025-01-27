import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOtpOnEmail } from "../utils/email.js";
import { verifyEmailOtpTemplate } from "../utils/verifyEmailOtpTemplate.js";
import { welcomeEmailTemplate } from "../utils/welcomeEmailTemplate.js";
import jwt from "jsonwebtoken";

const options = {
  domain: process.env.COOKIE_DOMAIN,
  httpOnly: true,
  secure: true,
  sameSite: "Strict", // Prevent CSRF attacks by restricting cookie transmission
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
};

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  //check if user already exists
  const existingUser = await User.findOne({
    email,
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // create user and generate otp
  const user = new User({ fullName, email, password });
  await user.generateUniqueUsername();
  const otp = user.generateOtp();
  await user.save();

  //send otp to email
  await sendOtpOnEmail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailOtpTemplate(otp),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User registered. Check your email for OTP.")
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User not found");

  // Check if OTP is valid
  if (!user.verifyEmail(otp)) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  // Check if the user's email is already verified
  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  // Mark user as verified and clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Send the welcome email if necessary
  await sendOtpOnEmail({
    to: email,
    subject: "Welcome to PeerCircle!",
    html: welcomeEmailTemplate(user.fullName),
  });

  // Return a success response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP verified successfully"));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.user;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if the email is already verified
  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified. OTP cannot be resent.");
  }

  const otp = user.generateOtp();
  await user.save();

  await sendOtpOnEmail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailOtpTemplate(otp),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError(404, "User doesn't exists");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials!");
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            profilePicture: user?.profilePicture,
          },
          accessToken,
        },
        "User logged In Successfully"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  if (!decoded) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(decoded._id);

  if (!user) {
    throw new ApiError(401, "Unauthorized", ERROR_CODES.UNAUTHORIZED);
  }

  const accessToken = await user.generateAccessToken();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          profilePicture: user?.profilePicture,
        },
        accessToken,
      },
      "Token refreshed successfully"
    )
  );
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  // Fetch suggested users for any user (logged in or not)
  const suggestedUsers = await User.find({
    _id: { $ne: currentUser ? currentUser._id : null }, // Exclude current user if logged in
    isVerified: true,
  }).select("fullName profilePicture username _id");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { suggestedUsers },
        "Suggested users fetched successfully"
      )
    );
});
