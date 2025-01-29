import { Router } from "express";
import { isEmailVerified, verifyUser } from "../middlewares/verifyUser.middleware.js";
import { addComment, getAllComment } from "../controllers/post.controllers.js";

const router = Router()

router.route("/comment").post(verifyUser, isEmailVerified, addComment);
router.route("/comment/:refType").get(getAllComment);

export default router