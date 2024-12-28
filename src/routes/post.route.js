import { Router } from "express";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";
import {
  addCommentOnPost,
  addPost,
  bookMarkPost,
  deletePost,
  getAllCommentsForPost,
  getAllPosts,
  likeUnlikePost,
} from "../controllers/post.controllers.js";

const router = Router();

router.route("/post").post(verifyUser, isEmailVerified, addPost);
router.route("/post").get(verifyUser, getAllPosts);
router.route("/post/like-unlike/:postId").patch(verifyUser, likeUnlikePost);
router.route("/post/comment").post(verifyUser, isEmailVerified, addCommentOnPost);
router.route("/post/comment").get(getAllCommentsForPost);
router.route("/post/bookmark/:postId").patch(verifyUser, bookMarkPost);
router.route("/post/delete/:postId").delete(verifyUser, deletePost);

export default router;
