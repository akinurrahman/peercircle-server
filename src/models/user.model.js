import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    refreshToken: { type: String },
    isVerified: { type: Boolean, default: false },
    otp: { type: String },
    otpExpires: { type: Date },
    profilePicture: { type: String, default: "" },
    bio : {type:String},
    gender: { type: String, enum: ["male", "female", "other"] },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateOtp = function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.otp = otp;
  this.otpExpires = Date.now() + 10 * 60 * 1000;
  return otp;
};

userSchema.methods.verifyEmail = function (otp) {
  // Check if OTP is expired
  if (this.otpExpires < Date.now()) {
    return false; // OTP expired
  }
  // Check if OTP matches
  return this.otp === otp;
};


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this.id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

// Instance method to generate a unique username
userSchema.methods.generateUniqueUsername = async function () {
  const baseUsername = this.fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_") // Replace non-alphanumeric characters with '_'
    .replace(/_+/g, "_") // Replace multiple underscores with a single underscore
    .replace(/^_|_$/g, ""); // Remove leading or trailing underscores

  let username = baseUsername;
  let count = 1;

  // Ensure the username is unique
  while (await mongoose.model("User").findOne({ username })) {
    username = `${baseUsername}_${count}`;
    count++;
  }

  this.username = username; // Assign the generated username to the instance
};

export const User = model("User", userSchema);
