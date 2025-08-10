import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  senderType: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
