import mongoose, { model, Schema } from "mongoose";

const conversationSchema = new Schema({
    perticipants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    message : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Message"
    }]
},{timestamps : true})

export const Conversation = model("Conversition", conversationSchema)