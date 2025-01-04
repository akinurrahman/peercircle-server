import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getSocketId, io } from "../socket/socket.js";

import { Conversation } from "../models/conversition.model.js";
import { Message } from "../models/message.model.js";

// send message
export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user?._id;
  const { receiverId, message } = req.body;

  if (!senderId || !receiverId || !message) {
    throw new ApiError(400, "Missing required fields");
  }

  // find the conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId.toString(), receiverId] },
  });

  // establish conversation if it doesn't exit
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // create new message and add it to the conversation
  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages.push(newMessage._id);
    await conversation.save();
  }

  const response = {
    _id: newMessage._id,
    conversationId: conversation._id,
    senderId,
    message,
    createdAt: newMessage.createdAt,
    fullName: req.user.fullName,
    profilePicture: req.user?.profilePicture,
  };

  // socket implementation
  const recieverSocketId = getSocketId(receiverId);
  if (recieverSocketId) {
    io.to(recieverSocketId).emit("newMessage", response);
  }

  res
    .status(201)
    .json(new ApiResponse(201, response, "Message sent successfully"));
});

// get messages
export const getMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const { receiverId } = req.query;

  if (!senderId || !receiverId) {
    throw new ApiError(400, "Missing required fields");
  }

  // find the conversation
  const conversation = await Conversation.findOne({
    participants: {
      $all: [senderId.toString(), receiverId],
    },
  })
    .populate({
      path: "messages",
      populate: {
        path: "senderId",
        select: "fullName profilePicture",
      },
    })
    .lean();

  if (!conversation) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Conversation not found"));
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
  .lean()

  if(!conversations){
    return res.status(200).json(new ApiResponse(200, [], "Conversations not found"));
  }

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

  res.status(200).json(new ApiResponse(200, response, "Conversations fetched successfully"));
})