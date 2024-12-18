import { Router } from "express";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";
import { addPost, getAllComments, getAllPosts, likeUnlikePost, postComment } from "../controllers/post.controllers.js";

const router = Router()

router.route("/post").post(verifyUser, addPost)
router.route("/posts").get(verifyUser, getAllPosts); // to get all of my posts
router.route("/posts/:id").get(verifyUser, getAllPosts) // to get all of someone elses posts
router.route("/post/like-unlike").patch(verifyUser, likeUnlikePost)
router.route("/post/comment/:postId").post(verifyUser, postComment);
router.route("/post/comments/:postId").get(verifyUser, getAllComments)

export default router