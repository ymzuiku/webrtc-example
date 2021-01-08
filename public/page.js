const peers = {};

// socket
const socket = io("/", { path: "/webrtc/io" });
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) {
    peers[userId].close();
  }
});

// peer
const myPeer = new Peer(
  undefined,
  isDev
    ? {
        host: "/",
        path: "/webrtc-peer",
        port: "4601",
      }
    : {
        host: "www.writeflowy.com",
        path: "/webrtc-peer",
        port: "443",
      }
);

myPeer.on("open", (userId) => {
  console.log("open", userId);
  socket.emit("join-room", ROOM_ID, userId);
});

// video
const videoGrid = document.getElementById("video-grid");
const myVideo = createVideo();

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then(getUserMedia);

function createVideo() {
  const video = document.createElement("video");
  video.muted = true;
  return video;
}

function getUserMedia(stream) {
  addVideoStream(myVideo, stream);
  myPeer.on("call", (call) => {
    call.answer(stream);
    const video = createVideo();
    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
    });
    call.on("close", () => {
      video.remove();
    });
  });
  socket.on("user-connected", (userId) => {
    console.log("user-connected", userId);
    connectToNewUser(userId, stream);
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = createVideo();
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}
