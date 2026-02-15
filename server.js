const express=require("express");
const http=require("http");
const {Server}=require("socket.io");

const app=express();
const server=http.createServer(app);

const io=new Server(server,{cors:{origin:"*"}});

app.use(express.static("public"));

let waiting=null;

io.on("connection",socket=>{

 if(waiting){
  socket.partner=waiting;
  waiting.partner=socket;

  socket.emit("matched",true);
  waiting.emit("matched",false);

  waiting=null;
 }
 else{
  waiting=socket;
 }

 // SIGNAL RELAY (VIDEO)
 socket.on("signal",data=>{
  if(socket.partner){
   socket.partner.emit("signal",data);
  }
 });

 // TEXT MESSAGE
 socket.on("msg",msg=>{
  if(socket.partner){
   socket.partner.emit("msg",msg);
  }
 });

 // NEXT USER
 socket.on("next",()=>{
  if(socket.partner){
   socket.partner.emit("left");
   socket.partner.partner=null;
  }
  socket.partner=null;
  waiting=socket;
 });

 // DISCONNECT
 socket.on("disconnect",()=>{
  if(waiting===socket) waiting=null;

  if(socket.partner){
   socket.partner.emit("left");
   socket.partner.partner=null;
  }
 });

});

const PORT=process.env.PORT||3000;
server.listen(PORT,()=>console.log("Server running"));
