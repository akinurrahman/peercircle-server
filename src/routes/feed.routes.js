import { Router } from "express";
import {
  fetchAllPostAndProducts,
  fetchAllPosts,
  fetchAllProducts,
} from "../controllers/feed.controllers.js";
import { attachUserIfLoggedIn } from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/feed").get(fetchAllPostAndProducts);
router.route("/feed/posts").get(attachUserIfLoggedIn, fetchAllPosts);
router.route("/feed/products").get(fetchAllProducts);

export default router;
