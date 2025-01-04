import { Router } from "express";
import {
  getSuggestedUsers,
  loginUser,
  logoutUser,
  refreshAccesToken,
  registerUser,
  resendOtp,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import {
  attachUserIfLoggedIn,
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";
import {
  checkIfUserNameExists,
  editProfile,
  getBasicProfileInfo,
  getProfile,
  toggleFollowUnfollow,
} from "../controllers/profile.controllers.js";

const router = Router();

// authentication
router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmail);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyUser, logoutUser);
router.route("/refresh-token").post(refreshAccesToken);
router.route("/resend-otp").post(verifyUser, resendOtp);

// profile
router.route("/profile").patch(verifyUser, isEmailVerified, editProfile);
router.route("/profile/:id?").get(verifyUser, getProfile);
router.route("/basic-profile").get(verifyUser, getBasicProfileInfo);
router
  .route("/toggle-follow-unfollow/:id")
  .patch(verifyUser, isEmailVerified, toggleFollowUnfollow);
router
  .route("/check-username/:username")
  .get(verifyUser, isEmailVerified, checkIfUserNameExists);

  router.route("/suggested-users").get(attachUserIfLoggedIn, getSuggestedUsers)

export default router;
