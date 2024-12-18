import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";
import { addPost, getAllPosts } from "../controllers/post.controllers.js";

const router = Router()

router.route("/post").post(verifyUser, addPost)
router.route("/posts").get(verifyUser, getAllPosts);
router.route("/posts/:id").get(verifyUser, getAllPosts)

export default router