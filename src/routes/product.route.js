import { Router } from "express";
import { addCategory, addProduct, getAllCategories, getAllProducts } from "../controllers/product.controllers.js";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/product").post(verifyUser, isEmailVerified, addProduct);
router.route("/product").get(verifyUser, getAllProducts);
router.route("/category").post(addCategory); //todo: make this admin only
router.route("/category").get(verifyUser, isEmailVerified,getAllCategories); 
export default router;
