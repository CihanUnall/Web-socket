"use client";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Image from "next/image";

export default function ChatWidget({ userId, userType, roomId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const socketRef = useRef(null);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5500";
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.emit("join_room", { userId, userType, roomId });

    socket.on("chat_history", (history) => {
      setMessages(history);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (!isOpenRef.current && msg.senderType !== userType) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, userType, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen((prev) => {
      if (!prev) setUnreadCount(0);
      return !prev;
    });
  };

  const sendMessage = () => {
    if (input.trim() && socketRef.current) {
      socketRef.current.emit("send_message", {
        roomId,
        senderId: userId,
        senderType: userType,
        message: input,
      });
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[999] flex flex-col items-end">
      {isOpen && (
        <div className="mr-3 bg-white shadow-lg rounded-lg w-80 h-150 flex flex-col">
          <div className="bg-amber-500 text-shadow-black p-3 flex justify-between items-center rounded-t-lg">
            <span>Chat</span>
            <button onClick={() => setIsOpen(false)} className="text-sm">
              ✖
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`text-sm p-2 rounded-md ${
                  msg.senderType === userType
                    ? "bg-blue-100 self-end text-right"
                    : "bg-gray-100 self-start text-left"
                }`}
              >
                <div>
                  {msg.senderType !== userType && (
                    <span className="font-bold">{msg.senderId}: </span>
                  )}
                  {msg.message}
                </div>
                <div className="text-xs text-gray-500">{msg.timestamp}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-2 py-1 rounded-l focus:outline-none focus:ring-1 focus:mr-1 focus:ring-amber-500"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              className="bg-amber-500 text-shadow-black px-3 rounded-r"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button onClick={handleOpen} className="relative text-white">
        <Image src="/chatlogo.png" alt="Chat" width={80} height={80} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
