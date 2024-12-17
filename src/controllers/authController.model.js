import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendOtpOnEmail } from "../utils/email.js";
import { verifyEmailOtpTemplate } from "../utils/verifyEmailOtpTemplate.js";
import { welcomeEmailTemplate } from "../utils/welcomeEmailTemplate.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  //check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email, username }],
  });
  if (existingUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // create user and generate otp
  const user = new User({ fullName, email, username, password });
  const otp = user.generateOtp();
  await user.save();

  //send otp to email
  await sendOtpOnEmail({
    to: email,
    subject: "Verify your email",
    html: verifyEmailOtpTemplate(otp),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(200, {}, "User registered. Check your email for OTP.")
    );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User not found");

  if (!user.verifyEmail(otp)) {
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  //send otp to email
  await sendOtpOnEmail({
    to: email,
    subject: "Welcome to PeerCircle!",
    html: welcomeEmailTemplate(user.fullName),
  });

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "OTP verified successfully"));
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
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
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
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
          },
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

export const logoutUser = asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(req.user._id,{
    $unset  : {
      refreshToken  : 1
    }
  }, {new : true})

  const options = {
    httpOnly : true,
    secure  : true
  }

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "logged out successfully!"))
})
