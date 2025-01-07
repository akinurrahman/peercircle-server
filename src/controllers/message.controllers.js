import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getSocketId, io } from "../socket/socket.js";

import { Conversation } from "../models/conversition.model.js";
import { Message } from "../models/message.model.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { conversationId, message } = req.body;

  if (!message || !message.trim() || !conversationId) {
    throw new ApiError(400, "Missing required fields");
  }

  // Find the existing conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Get the receiverId from the conversation
  const receiverId = conversation.participants.find(
    (id) => id.toString() !== senderId.toString()
  );

  // Create a new message
  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  // Add the new message to the conversation
  conversation.messages.push(newMessage._id);
  await conversation.save();

  const response = {
    _id: newMessage._id,
    conversationId: conversation._id,
    senderId,
    message,
    createdAt: newMessage.createdAt,
    fullName: req.user.fullName,
    profilePicture: req.user?.profilePicture,
  };

  // Emit the new message to the receiver (if applicable)
  const receiverSocketId = getSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", {
      _id: newMessage._id,
      conversationId: conversation._id,
      senderId,
      message,
      createdAt: newMessage.createdAt,
      fullName: req.user.fullName,
      profilePicture: req.user?.profilePicture,
    });
  }

  res
    .status(201)
    .json(new ApiResponse(201, response, "Message sent successfully"));
});

// get messages
export const getMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { conversationId } = req.query;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  // Find the conversation using conversationId
  const conversation = await Conversation.findById(conversationId)
    .populate({
      path: "messages",
      populate: {
        path: "senderId",
        select: "fullName profilePicture",
      },
    })
    .lean();

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }



  const messages = conversation.messages.map((msg) => ({
    _id: msg._id,
    conversationId: conversation._id,
    senderId: msg.senderId._id,
    message: msg.message,
    createdAt: msg.createdAt,
    fullName: msg.senderId.fullName,
    profilePicture: msg.senderId.profilePicture || null,
  }));

  res.status(200).json(new ApiResponse(200, messages, "Conversation found"));
});

// get all conversastions
export const getAllConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate({
      path: "participants",
      select: "profilePicture fullName username",
    })
    .lean();

  const response = conversations.map((conversation) => {
    const otherParticipant = conversation.participants.find(
      (participant) => participant._id.toString() !== userId.toString()
    );



    return {
      conversationId: conversation._id,
      userId: otherParticipant?._id,
      fullName: otherParticipant?.fullName,
      username: otherParticipant?.username,
      profilePicture: otherParticipant?.profilePicture,
    };
  });

  res
    .status(200)
    .json(new ApiResponse(200, response, "Conversations fetched successfully"));
});

// creaste conversation if not
export const createOrFetchConversation = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new ApiError(400, "Receiver ID is required");
  }

  // Check if the conversation already exists
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  // If conversation doesn't exist, create a new one
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });

    // New conversation message
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { conversationId: conversation._id },
          "New conversation created successfully"
        )
      );
  }

  // If conversation exists
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { conversationId: conversation._id },
        "Conversation already exists"
      )
    );
});
