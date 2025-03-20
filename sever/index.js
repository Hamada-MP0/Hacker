const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

io.on("connection", (socket) => {
  console.log("⚡ مستخدم متصل:", socket.id);

  socket.on("start-stream", () => {
    io.emit("start-stream");
  });

  socket.on("disconnect", () => {
    console.log("❌ مستخدم قطع الاتصال:", socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
