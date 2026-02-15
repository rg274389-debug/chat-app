const socket = io();
let username="";

// JOIN CHAT
function join(){
 username=document.getElementById("nameInput").value.trim();
 if(username==="") return alert("Enter name");

 document.getElementById("login").style.display="none";
 document.getElementById("chatUI").style.display="block";

 socket.emit("join",username);
}

// ONLINE USERS COUNT
socket.on("count",num=>{
 document.getElementById("count").innerText="Online Users: "+num;
});

// MATCHED
socket.on("matched",()=>{
 document.getElementById("status").innerText="Connected";

 let sound=document.getElementById("matchSound");
 if(sound) sound.play().catch(()=>{});
});

// RECEIVE MESSAGE
socket.on("message",data=>{
 addMessage(data.name+": "+data.msg);
});

// TYPING INDICATOR
socket.on("typing",()=>{
 document.getElementById("status").innerText="Stranger is typing...";

 setTimeout(()=>{
  document.getElementById("status").innerText="Connected";
 },1000);
});

// STRANGER LEFT
socket.on("partner-left",()=>{
 document.getElementById("status").innerText="Finding Stranger...";
 document.getElementById("chat").innerHTML="";
});

// BANNED USER
socket.on("banned",()=>{
 alert("You have been banned from chat.");
 location.reload();
});

// SEND MESSAGE
function send(){
 let input=document.getElementById("msg");

 if(input.value.trim()==="") return;

 socket.emit("message",{name:username,msg:input.value});
 addMessage("You: "+input.value);

 input.value="";
}

// NEXT USER
function nextUser(){
 socket.emit("next");
 document.getElementById("chat").innerHTML="";
 document.getElementById("status").innerText="Finding Stranger...";
}

// REPORT USER
function reportUser(){
 if(confirm("Report this user?")){
  socket.emit("report");
 }
}

// ADD MESSAGE
function addMessage(text){
 let div=document.createElement("div");
 div.innerText=text;
 document.getElementById("chat").appendChild(div);
}

// DETECT TYPING
document.addEventListener("input",e=>{
