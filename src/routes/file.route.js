import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import {
  verifyUser,
  isEmailVerified,
} from "../middlewares/verifyUser.middleware.js";
import { fileUpload } from "../controllers/util.controllers.js";

const router = Router();

router
  .route("/file")
  .post(verifyUser, isEmailVerified, upload.single("file"), fileUpload);

export default router;
