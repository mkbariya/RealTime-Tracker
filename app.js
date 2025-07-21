const express = require("express");
const path = require("path");
const app = express();
const socket = require("socket.io");
const http = require("http");

const server = http.createServer(app);

const io = socket(server);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

io.on("connection", (socket) => {
  console.log("connected");

  socket.on("location", (data) => {
    io.emit("recievelocation", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    io.emit("user-disconnected",  socket.id );
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
