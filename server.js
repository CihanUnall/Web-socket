// server.js
import express from "express";
import { createServer } from "http"; // HTTP sunucusunu Express ile entegre etmek için
import { Server } from "socket.io"; // Socket.IO sunucusu
import cors from "cors";

const app = express();
const httpServer = createServer(app); // Socket.IO için HTTP sunucusu oluştur
const PORT = 3000;

// CORS ayarları: Frontend'in hangi adreslerden bağlanabileceğini belirtiriz
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:37713", "http://127.0.0.1:37713"], // Frontend'in çalışacağı portu buraya ekleyin (Live Server varsayılanı)
    methods: ["GET", "POST"],
  },
});

// Middleware'ler
app.use(cors());
app.use(express.json());

// Sohbet odalarını ve bağlı kullanıcıları takip etmek için basit bir yapı
// Gerçek bir uygulamada, bu bilgileri bir veritabanında (MongoDB gibi) tutmanız gerekir.
const chatSessions = new Map(); // Key: roomId (örn: 'customer1_restaurantA'), Value: { messages: [], participants: {} }

// Socket.IO bağlantısı kurulduğunda
io.on("connection", (socket) => {
  console.log(`Yeni bir kullanıcı bağlandı: ${socket.id}`);

  // Bir sohbet odasına katılma
  // Bu, müşteri veya restoran ilk kez sohbete başladığında çağrılır.
  socket.on("join_room", (data) => {
    const { roomId, userId, userType } = data; // roomId: örn: 'customer1_restaurantA'
    socket.join(roomId); // Kullanıcıyı belirli bir odaya dahil et

    if (!chatSessions.has(roomId)) {
      chatSessions.set(roomId, { messages: [], participants: {} });
    }
    const session = chatSessions.get(roomId);
    session.participants[userId] = socket.id; // Kullanıcının socket ID'sini kaydet

    console.log(`${userType} ${userId} odaya katıldı: ${roomId}`);

    // Odaya katılan herkese bu kullanıcının katıldığını bildir
    // Bu örnekte, katılınca önceki mesajları gönderiyoruz
    socket.emit("chat_history", session.messages);
  });

  // Mesaj alma
  socket.on("send_message", (data) => {
    const { roomId, senderId, senderType, message } = data; // senderType: 'customer' veya 'restaurant'
    console.log(
      `Oda ${roomId} - ${senderType} ${senderId} dedi ki: ${message}`
    );

    const session = chatSessions.get(roomId);
    if (session) {
      const newMessage = {
        senderId,
        senderType,
        message,
        timestamp: new Date().toLocaleTimeString(),
      };
      session.messages.push(newMessage); // Mesajı kaydet (geçici)

      // Mesajı o odadaki tüm kullanıcılara gönder
      io.to(roomId).emit("receive_message", newMessage);
    } else {
      console.warn(`Geçersiz oda ID'si: ${roomId}`);
    }
  });

  // Kullanıcı bağlantısı kesildiğinde
  socket.on("disconnect", () => {
    console.log(`Bir kullanıcı bağlantısı kesildi: ${socket.id}`);
    // Gerçek bir uygulamada, burada kullanıcının hangi odadan ayrıldığını bulup güncellemeler yapmanız gerekir.
    // Örneğin, katılımcılardan socket.id'yi kaldırın.
  });
});

// HTTP sunucusunu başlat
httpServer.listen(PORT, () => {
  console.log(`Backend sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
