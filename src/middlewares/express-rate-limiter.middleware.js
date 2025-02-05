import { rateLimit } from "express-rate-limit";

export const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});
