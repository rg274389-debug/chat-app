const socket = io();

// ONLINE USER COUNT
socket.on("count", num => {
  document.getElementById("count").innerText = "Online Users: " + num;
});

// MATCHED
socket.on("matched", () => {
  document.getElementById("status").innerText = "Connected";
});

// RECEIVE MESSAGE
socket.on("message", msg => {
  addMessage("Stranger: " + msg);
});

// STRANGER LEFT
socket.on("partner-left", () => {
  document.getElementById("status").innerText = "Finding Stranger...";
  document.getElementBy
