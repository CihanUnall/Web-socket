import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Message from "./models/Message.js";

// Ortam değişkenlerini yükle
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5500;

// ===== MongoDB Bağlantısı =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB bağlantısı başarılı"))
  .catch((err) => console.error("❌ MongoDB bağlantı hatası:", err));

// ===== Middleware =====
app.use(cors({ origin: [process.env.FRONTEND_URL, "http://localhost:3000"] }));
app.use(express.json());

// ===== Socket.IO =====
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`🔌 Yeni kullanıcı bağlandı: ${socket.id}`);

  socket.on("join_room", async (data) => {
    const { roomId, userId, userType } = data;
    socket.join(roomId);
    console.log(`👤 ${userType} (${userId}) odaya katıldı: ${roomId}`);

    try {
      const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
      socket.emit("chat_history", messages);
    } catch (err) {
      console.error("Mesaj geçmişi yüklenirken hata:", err);
    }
  });

  socket.on("send_message", async (data) => {
    const { roomId, senderId, senderType, message } = data;

    const newMessage = new Message({
      roomId,
      senderId,
      senderType,
      message,
    });

    try {
      await newMessage.save();
      io.to(roomId).emit("receive_message", newMessage);
      console.log(`💬 Mesaj kaydedildi: ${message}`);
    } catch (err) {
      console.error("Mesaj kaydedilirken hata:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Kullanıcı ayrıldı: ${socket.id}`);
  });
});

// Basit test endpoint'i
app.get("/", (req, res) => {
  res.send("✅ Socket.IO Chat Backend çalışıyor");
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Backend http://localhost:${PORT} adresinde çalışıyor`);
});
