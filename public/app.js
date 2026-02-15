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

// ONLINE COUNT
socket.on("count",num=>{
 document.getElementById("count").innerText="Online Users: "+num;
});

// MATCHED
socket.on("matched",()=>{
 document.getElementById("status").innerText="Connected";
});

// RECEIVE MESSAGE
socket.on("message",data=>{
 addMessage(data.name+": "+data.msg);
});

// STRANGER LEFT
socket.on("partner-left",()=>{
 document.getElementById("status").innerText="Finding Stranger...";
 document.getElementById("chat").innerHTML="";
});

// SEND MESSAGE
function send(){
 let input=document.getElementById("msg");
 if(input.value==="") return;

 socket.emit("message",{
  name:username,
  msg:input.value
 });

 addMessage("You: "+input.value);
 input.value="";
}

// NEXT USER
function nextUser(){
 socket.emit("next");
 document.getElementById("chat").innerHTML="";
 document.getElementById("status").innerText="Finding Stranger...";
}

// SHOW MESSAGE
function addMessage(text){
 let div=document.createElement("div");
 div.innerText=text;
 document.getElementById("chat").appendChild(div);
}
