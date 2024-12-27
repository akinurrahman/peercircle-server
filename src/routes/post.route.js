import { Router } from "express";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";
import { addPost, bookMarkPost, deletePost, getAllComments, getAllPosts, likeUnlikePost, postComment } from "../controllers/post.controllers.js";

const router = Router()

router.route("/post").post(verifyUser, isEmailVerified, addPost)
router.route("/post").get(verifyUser, getAllPosts); 
router.route("/post/like-unlike/:postId").patch(verifyUser, likeUnlikePost)
router.route("/post/comment").post(verifyUser, isEmailVerified, postComment);
router.route("/post/comments/:postId").get(verifyUser, getAllComments)
router.route("/post/bookmark/:postId").patch(verifyUser, bookMarkPost)
router.route("/post/delete/:postId").delete(verifyUser, deletePost)

export default router