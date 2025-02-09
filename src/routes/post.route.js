import { Router } from "express";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";
import {

  addPost,
  bookMarkPost,
  deletePost,

  getAllPosts,
  likeUnlikeItem,
} from "../controllers/post.controllers.js";
import { postLimiter } from "../middlewares/express-rate-limiter.middleware.js";

const router = Router();

router.route("/post").post(verifyUser, isEmailVerified,  addPost);
router.route("/post").get(verifyUser, getAllPosts);
router.route("/like-unlike/:refId").patch(verifyUser, likeUnlikeItem);

router.route("/post/bookmark/:postId").patch(verifyUser, bookMarkPost);
router.route("/post/delete/:postId").delete(verifyUser, deletePost);

export default router;
