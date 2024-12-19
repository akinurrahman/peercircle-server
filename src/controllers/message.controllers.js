import { Conversation } from "../models/conversition.model.js";
import { Message } from "../models/message.model.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params?.id;

  const { message } = req.body;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  //   generate conversation if not exist
  if (!conversation) {
    const newConversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
    conversation = newConversation;
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (!newMessage) {
   throw new ApiError(500, "Failed to send message");
  }


  if (newMessage) conversation.messages.push(newMessage._id);

  await Promise.all([newMessage.save(), conversation.save()]);

  res.status(201).json(new ApiResponse(201, newMessage, "message sent"));
});

export const getMessage = asyncHandler(async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate("messages")

 if (!conversation) {
   return res
     .status(200)
     .json(new ApiResponse(200, {}, "Conversation not found"));
 } else {
   return res
     .status(200)
     .json(
       new ApiResponse(
         200,
         { messages: conversation.messages },
         "Conversation found"
       )
     );
 }

});
