import { Router } from "express";
import {  loginUser, logoutUser, refreshAccesToken, registerUser, verifyEmail } from "../controllers/authController.model.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";
import { editProfile } from "../controllers/profile.controllers.js";



const router = Router()

router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmail)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyUser,logoutUser)
router.route("/refresh-token").post(refreshAccesToken)
router.route("/profile").patch(verifyUser, editProfile)

export default router