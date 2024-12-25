import { Router } from "express";
import { fetchAllPostAndProducts, fetchAllPosts, fetchAllProducts } from "../controllers/feed.controllers.js";

const router = Router()

router.route("/feed").get(fetchAllPostAndProducts)
router.route("/feed/posts").get(fetchAllPosts)
router.route("/feed/products").get(fetchAllProducts)

export default router