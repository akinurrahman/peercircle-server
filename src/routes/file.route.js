import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import {
  verifyUser,
  isVerified,
} from "../middlewares/verifyUser.middleware.js";
import { fileUpload } from "../controllers/util.controllers.js";

const router = Router();

router
  .route("/file")
  .post(verifyUser, isVerified, upload.single("file"), fileUpload);

export default router;
