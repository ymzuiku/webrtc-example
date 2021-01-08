const port = 4600;
const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, { path: "/webrtc/io" });

const { nanoid } = require("nanoid");
const { PeerServer } = require("peer");

const peerServer = PeerServer({ port: port + 1, path: "/webrtc-peer" });

app.set("view engine", "ejs");
// app.use(
//   "/webrtc/peer",
//   createProxyMiddleware({
//     target: `http://127.0.0.1:` + port + 1,
//     pathRewrite: "/",
//   })
// );
app.use("/webrtc", express.static("public"));
const {} = require("uuid");

app.get("/webrtc", (req, res) => {
  res.redirect(`/webrtc/${nanoid()}`);
});

app.get("/webrtc/:room", (req, res) => {
  res.render("room", { roomId: req.params.room, isDev: global.isDev });
});

// const theIo = io.path("/webrtc");
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

http.listen(port, () => {
  console.log("listen: http://127.0.0.1:" + port);
});
