import { Router } from "express";
import { addCategory, addProduct, getAllCategories } from "../controllers/product.controllers.js";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/product").post(verifyUser, isEmailVerified, addProduct);
router.route("/category").post(addCategory); //todo: make this admin only
router.route("/category").get(verifyUser, isEmailVerified,getAllCategories); 
export default router;
