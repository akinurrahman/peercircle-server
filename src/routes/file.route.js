import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";

import {
  verifyUser,
  isEmailVerified,
} from "../middlewares/verifyUser.middleware.js";
import {
  fileUpload,
  fileUploadMultiple,
} from "../controllers/util.controllers.js";

const router = Router();

router
  .route("/file")
  .post(verifyUser, isEmailVerified, upload.single("file"), fileUpload);

router
  .route("/files")
  .post(
    verifyUser,
    isEmailVerified,
    upload.array("files", 5),
    fileUploadMultiple
  ); 

export default router;
