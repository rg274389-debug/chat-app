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

  socket.on("message", msg=>{
    if(socket.partner){
      socket.partner.emit("message", msg);
    }
  });

  socket.on("next", ()=>{
    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
    socket.partner = null;
    waiting = socket;
  });

  socket.on("disconnect", ()=>{
    users--;
    io.emit("count", users);

    if(waiting === socket) waiting = null;

    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner = null;
    }
  });

});

server.listen(3000, ()=>console.log("Server running"));
