import { Router } from "express";
import { addProduct } from "../controllers/product.controllers.js";
import { isEmailVerified, verifyUser } from "../middlewares/verifyUser.middleware.js";

const router = Router()

router.route("/product").post(verifyUser, isEmailVerified, addProduct)

export default router