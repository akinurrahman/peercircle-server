import { Server } from "socket.io";
import { createServer } from "http";
import { app } from "../app.js";

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSocketMap = {}; // Map to store user socket connections
const activeConversations = new Map();

export const getSocketId = (userId) => userSocketMap[userId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  socket.on("joinChat", ({ userId, conversationId }) => {
    activeConversations.set(userId, conversationId);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  socket.on("leaveChat", ({ userId }) => {
    activeConversations.delete(userId);
    console.log(`User ${userId} left chat`);
  });

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io,activeConversations };
