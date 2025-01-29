import { Router } from "express";
import {
  fetchAllFeed,
  fetchAllPosts,
  fetchAllProducts,
} from "../controllers/feed.controllers.js";
import { attachUserIfLoggedIn } from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/feed").get(attachUserIfLoggedIn, fetchAllFeed);
router.route("/feed/posts").get(attachUserIfLoggedIn, fetchAllPosts);
router.route("/feed/products").get(attachUserIfLoggedIn,fetchAllProducts);

export default router;
