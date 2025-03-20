const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);

// إعداد CORS
app.use(cors({
  origin: "https://hacker-production-8851.up.railway.app",
  methods: ["GET", "POST"],
  credentials: true,
}));

// تقديم الملفات الثابتة (Static Files) من مجلد dist
app.use(express.static(path.join(__dirname, "../client/dist")));

// إعادة توجيه جميع الطلبات إلى index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// إعداد Socket.io
const io = new Server(server, {
  cors: { origin: "*" },
});

// عند اتصال المستخدمين بالخادم
io.on("connection", (socket) => {
  console.log("⚡ مستخدم متصل:", socket.id);

  socket.on("offer", (data) => {
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ مستخدم قطع الاتصال:", socket.id);
  });
});

// ✅ استخدام المتغير البيئي PORT أو المنفذ 5000 كقيمة افتراضية
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});