const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server,{ cors:{origin:"*"} });

app.use(express.static("public"));

let waitingUser=null;
let users=0;

// banned IP list
let banned = new Set();

io.on("connection",socket=>{

  const ip = socket.handshake.address;

  // BLOCK BANNED USER
  if(banned.has(ip)){
    socket.emit("banned");
    socket.disconnect();
    return;
  }

  users++;
  io.emit("count",users);

  socket.on("join",name=>{
    socket.username=name;
  });

  // MATCH
  if(waitingUser){
    socket.partner=waitingUser;
    waitingUser.partner=socket;

    socket.emit("matched");
    waitingUser.emit("matched");

    waitingUser=null;
  }
  else{
    waitingUser=socket;
  }

  // MESSAGE
  socket.on("message",data=>{
    if(socket.partner){
      socket.partner.emit("message",data);
    }
  });

  // TYPING
  socket.on("typing",()=>{
    if(socket.partner){
      socket.partner.emit("typing");
    }
  });

  // REPORT USER
  socket.on("report",()=>{
    if(socket.partner){
      let partnerIP = socket.partner.handshake.address;

      banned.add(partnerIP);

      socket.partner.emit("banned");
      socket.partner.disconnect();
    }
  });

  // NEXT
  socket.on("next",()=>{
    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner=null;
    }
    socket.partner=null;
    waitingUser=socket;
  });

  // DISCONNECT
  socket.on("disconnect",()=>{
    users--;
    io.emit("count",users);

    if(waitingUser===socket)
      waitingUser=null;

    if(socket.partner){
      socket.partner.emit("partner-left");
      socket.partner.partner=null;
    }
  });

});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log("Server running"));
