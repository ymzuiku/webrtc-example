const dev = require("dev-start");
global.isDev = true;
dev(() => require("./webrtc"));
