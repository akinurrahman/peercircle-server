import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";


const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// route imports
import userRoutes from "./routes/user.route.js";
import FileRoutes from "./routes/file.route.js";
import PostsRoutes from "./routes/post.route.js";
import MessageRoutes from "./routes/message.route.js";
import ProductRoutes from "./routes/product.route.js";
import FeedRoutes from "./routes/feed.routes.js";
import CommentRoutes from './routes/comment.routes.js'
import searchRoutes from "./routes/search.routes.js";

app.use("/api/v1", userRoutes);
app.use("/api/v1", FileRoutes);
app.use("/api/v1", PostsRoutes);
app.use("/api/v1", MessageRoutes);
app.use("/api/v1", ProductRoutes)
app.use("/api/v1", FeedRoutes)
app.use("/api/v1", CommentRoutes)
app.use("/api/v1", searchRoutes)


app.use(errorHandler);
export { app };
