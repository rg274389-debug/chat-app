const socket = io();
let username="";

function join(){
 username=document.getElementById("nameInput").value.trim();
 if(username==="") return alert("Enter name");

 document.getElementById("login").style.display="none";
 document.getElementById("chatUI").style.display="block";

 socket.emit("join",username);
}

socket.on("count",num=>{
 document.getElementById("count").innerText="Online Users: "+num;
});

socket.on("matched",()=>{
 document.getElementById("status").innerText="Connected";
 let s=document.getElementById("matchSound");
 if(s) s.play().catch(()=>{});
});

socket.on("message",data=>{
 add(data.name+": "+data.msg);
});

socket.on("typing",()=>{
 document.getElementById("status").innerText="Stranger typing...";
 setTimeout(()=>{document.getElementById("status").innerText="Connected"},1000);
});

socket.on("partner-left",()=>{
 document.getElementById("status").innerText="Finding Stranger...";
 document.getElementById("chat").innerHTML="";
});

socket.on("banned",()=>{
 alert("You are banned");
 location.reload();
});

function send(){
 let input=document.getElementById("msg");
 if(input.value==="") return;

 socket.emit("message",{name:username,msg:input.value});
 add("You: "+input.value);
 input.value="";
}

function nextUser(){
 socket.emit("next");
 document.getElementById("chat").innerHTML="";
 document.getElementById("status").innerText="Finding Stranger...";
}

function reportUser(){
 if(confirm("Report this user?")){
  socket.emit("report");
 }
}

function add(t){
 let d=document.createElement("div");
 d.innerText=t;
 document.getElementById("chat").appendChild(d);
}

document.addEventListener("input",e=>{
 if(e.target.id==="msg"){
  socket.emit("typing");
 }
});
