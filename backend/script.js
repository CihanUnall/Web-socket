// script.js
document.addEventListener("DOMContentLoaded", () => {
  // window.userConfig'ten kullanıcı bilgilerini al (HTML'den geliyor)
  const { userId, userType, roomId } = window.userConfig;

  const messagesBox = document.getElementById("messagesBox");
  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  // Socket.IO bağlantısı
  const socket = io("http://localhost:5500"); // Backend sunucusunun adresi

  socket.on("connect", () => {
    console.log(`${userType} bağlı: ${socket.id}`);
    // Bağlantı kurulduğunda hemen odaya katıl
    socket.emit("join_room", { roomId, userId, userType });
  });

  socket.on("chat_history", (messages) => {
    messages.forEach((msg) => displayMessage(msg));
    messagesBox.scrollTop = messagesBox.scrollHeight; // En alta kaydır
  });

  socket.on("receive_message", (message) => {
    displayMessage(message);
    messagesBox.scrollTop = messagesBox.scrollHeight; // En alta kaydır
  });

  sendMessageBtn.addEventListener("click", () => {
    const message = messageInput.value.trim();
    if (message) {
      socket.emit("send_message", {
        roomId,
        senderId: userId,
        senderType: userType,
        message: message,
      });
      messageInput.value = ""; // Giriş kutusunu temizle
    }
  });

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessageBtn.click(); // Enter tuşuna basınca da gönder
    }
  });

  function displayMessage(msg) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message-item");

    if (msg.senderType === userType) {
      messageElement.classList.add("my-message"); // Benim mesajlarım sağda
      messageElement.innerHTML = `
                <div class="message-content">${msg.message}</div>
                <div class="message-meta">${msg.timestamp}</div>
            `;
    } else {
      messageElement.classList.add("other-message"); // Diğerinin mesajları solda
      messageElement.innerHTML = `
                <div class="message-sender">${msg.senderId}:</div>
                <div class="message-content">${msg.message}</div>
                <div class="message-meta">${msg.timestamp}</div>
            `;
    }
    messagesBox.appendChild(messageElement);
  }
});
