// export const getMessage = asyncHandler(async (req, res) => {
//   const senderId = req.user._id; // Logged-in user's ID
//   const receiverId = req.params.id; // Other participant's ID

//   const conversation = await Conversation.findOne({
//     participants: { $all: [senderId, receiverId] },
//   })
//     .populate({
//       path: "messages",
//       populate: {
//         path: "senderId receiverId",
//         select: "fullName profilePicture",
//       },
//     })
//     .lean();

//   if (!conversation) {
//     return res
//       .status(200)
//       .json(new ApiResponse(200, [], "Conversation not found"));
//   }

//   const messages = conversation.messages.map((message) => {
//     const user = message.senderId; // Set the sender of the message as userId

//     return {
//       createdAt: message.createdAt,
//       message: message.message,
//       _id: user._id, // Use senderId as userId
//       fullName: user.fullName,
//       profilePicture: user.profilePicture,
//     };
//   });

//   const receiverInfo = await User.findById(receiverId).select(
//     "fullName username profilePicture _id"
//   );

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, { messages, receiverInfo }, "Conversation found")
//     );
// });

// export const getAllConversations = asyncHandler(async(req,res)=>{
//   const userId = req.user._id;

//   const conversations = await Conversation.find({
//     participants: userId,
//   })
//     .populate({
//       path: "participants",
//       select: "profilePicture fullName username",
//     })
//     .lean();

//     // Extract the details of the other participant
//     const conversationsData = conversations.map((conversation) => {
//       const participants = conversation.participants.find(
//         (participant) => participant._id.toString() !== userId.toString()
//       );
//       return {
//         _id: conversation._id,
//         participants,
//       };
//     });

//     res.status(200).json(new ApiResponse(200, conversationsData, "Conversations fetched successfully"));
// })

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getSocketId, io } from "../socket/socket.js";

import { Conversation } from "../models/conversition.model.js";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";

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
