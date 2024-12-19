import { Router } from "express";
import { isVerified, verifyUser } from "../middlewares/verifyUser.middleware.js";
import { addPost, bookMarkPost, getAllComments, getAllPosts, likeUnlikePost, postComment } from "../controllers/post.controllers.js";

const router = Router()

router.route("/post").post(verifyUser, isVerified, addPost)
router.route("/my-posts").get(verifyUser, isVerified, getAllPosts); // to get all of my posts
router.route("/posts/:id").get(verifyUser, getAllPosts) // to get all of someone elses posts
router.route("/post/like-unlike").patch(verifyUser, likeUnlikePost)
router.route("/post/comment/:postId").post(verifyUser, isVerified, postComment);
router.route("/post/comments/:postId").get(verifyUser, getAllComments)
router.route("/post/bookmark/:postId").post(verifyUser, bookMarkPost)

export default router