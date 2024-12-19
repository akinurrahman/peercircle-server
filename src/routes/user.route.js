import { Router } from "express";
import {  loginUser, logoutUser, refreshAccesToken, registerUser, resendOtp, verifyEmail } from "../controllers/auth.controllers.js";
import { isEmailVerified, verifyUser } from "../middlewares/verifyUser.middleware.js";
import {
  checkIfUserNameExists,
  editProfile,
  getMyProfile,
  getPublicProfileById,
  toggleFollowUnfollow,
} from "../controllers/profile.controllers.js";



const router = Router()


// authentication 
router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmail)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyUser,logoutUser)
router.route("/refresh-token").post(refreshAccesToken)
router.route("/resend-otp").post(verifyUser, resendOtp)

// profile
router.route("/profile").patch(verifyUser,isEmailVerified, editProfile)
router.route("/profile").get(verifyUser,getMyProfile);
router.route("/profile/:id").get(getPublicProfileById);
router.route("/toggle-follow-unfollow/:id").post(verifyUser, toggleFollowUnfollow);
router.route("/check-username/:username").get(verifyUser, isEmailVerified,checkIfUserNameExists)



export default router