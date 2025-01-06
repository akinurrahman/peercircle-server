import { Router } from "express";
import {  getAllConversations, getMessage, sendMessage } from "../controllers/message.controllers.js";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/message").post(verifyUser, isEmailVerified, sendMessage);
router.route("/message").get(verifyUser,isEmailVerified,getMessage)
router.route('/conversations').get(verifyUser,isEmailVerified,getAllConversations)

export default router;
