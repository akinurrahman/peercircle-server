import { Router } from "express";
import { searchUsers } from "../controllers/search.controller.js";
import { verifyUser } from "../middlewares/verifyUser.middleware.js";

const router = Router()

router.route("/results").get(verifyUser, searchUsers);

export default router;