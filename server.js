const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waiting = null;
let users = 0;

io.on("connection", socket => {

  users++;
  io.emit("count", users);

  // USERNAME
  socket.on("join", name=>{
    socket.username = name;
  });

  // MATCHING
  if(waiting){
    socket.partner = waiting;
    waiting.partner = socket;

    socket.emit("matched");
    waiting.emit("matched");

    waiting = null;
  }
  else{
    waiting = socket;
  }

  // MESSAGE
  socket.on("message", data=>{
    if(socket.partner){
      socket.partner.emit("message", data);
    }
  });

  // NEXT USER
  socket.on("next", ()=>{
    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
    socket.partner = null;
    waiting = socket;
  });

  // DISCONNECT
  socket.on("disconnect", ()=>{

    users--;
    io.emit("count", users);

    if(waiting === socket)
      waiting = null;

    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
  });

});


// RENDER PORT SUPPORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=>console.log("Server running"));
