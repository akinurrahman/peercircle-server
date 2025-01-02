import { Server } from "socket.io";
import { createServer } from "http";
import {app} from './app.js'


const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; // Map to store user socket connections

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User connected:", userId);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    console.log("User disconnected:", userId);
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
