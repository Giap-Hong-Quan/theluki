import { io } from "socket.io-client";

// Đảm bảo URL cổng 8000 không bị dính đuôi /api
const rawApiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:8000";
const SOCKET_URL = rawApiUrl.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("🟢 [Admin Socket] Đã kết nối thành công tới server! ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("🔴 [Admin Socket] Lỗi kết nối Socket:", error.message);
});
