import { Router } from "express";
import {
  createOrFetchConversation,
  getAllConversations,
  getMessage,
  sendMessage,
} from "../controllers/message.controllers.js";
import {
  isEmailVerified,
  verifyUser,
} from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.route("/message").post(verifyUser, isEmailVerified, sendMessage);
router.route("/message").get(verifyUser, isEmailVerified, getMessage);
router
  .route("/conversation")
  .get(verifyUser, isEmailVerified, getAllConversations);
router
  .route("/conversation")
  .post(verifyUser, isEmailVerified, createOrFetchConversation);

export default router;
