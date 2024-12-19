import { Router } from "express";
import { getMessage, sendMessage } from "../controllers/message.controllers.js";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/message/:id").post(verifyUser, isEmailVerified, sendMessage);
router.route("/message/:id").get(verifyUser,isEmailVerified,getMessage)

export default router;
