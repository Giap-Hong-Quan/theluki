import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: (origin, callback) => {
                // Cho phép mọi origin (localhost, vps domain...) tương thích với credentials: true
                callback(null, true);
            },
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`🔌 Client đã kết nối Socket: ${socket.id}`.cyan);

        // Lắng nghe khi client ngắt kết nối
        socket.on("disconnect", () => {
            console.log(`❌ Client đã ngắt kết nối: ${socket.id}`.yellow);
        });

        // --------------------------------------------------
        // Bạn có thể đăng ký các sự kiện tùy ý ở đây
        // Ví dụ: Nhận tin nhắn chat từ client
        // --------------------------------------------------
        socket.on("send_message", (data) => {
            console.log("Nhận tin nhắn:", data);
            // Gửi lại tin nhắn cho tất cả mọi người
            io.emit("receive_message", data);
        });
    });

    return io;
};

// Hàm này giúp bất kỳ Controller hay Service nào trong dự án cũng có thể gọi Socket để bắn data realtime
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io chưa được khởi tạo!");
    }
    return io;
};
