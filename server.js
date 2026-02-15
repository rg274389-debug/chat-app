const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// SOCKET SERVER
const io = new Server(server,{
  cors:{ origin:"*" }
});

// SERVE FRONTEND FILES
app.use(express.static("public"));

let waitingUser = null;

io.on("connection", socket => {

  console.log("User connected");

  // MATCH USERS
  if(waitingUser){
    socket.partner = waitingUser;
    waitingUser.partner = socket;

    socket.emit("matched", true);
    waitingUser.emit("matched", false);

    waitingUser = null;
  }
  else{
    waitingUser = socket;
  }

  // VIDEO SIGNAL RELAY
  socket.on("signal", data => {
    if(socket.partner){
      socket.partner.emit("signal", data);
    }
  });

  // NEXT STRANGER
  socket.on("next", ()=>{
    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
    socket.partner = null;
    waitingUser = socket;
  });

  // USER DISCONNECT
  socket.on("disconnect", ()=>{

    console.log("User disconnected");

    if(waitingUser === socket)
      waitingUser = null;

    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
  });

});

// RENDER PORT SUPPORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log("Server running on port " + PORT));
