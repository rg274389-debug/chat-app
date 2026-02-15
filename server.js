const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.static('public'));  // HTML/JS files ke liye

let waitingUsers = [];  // Simple queue for matching

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('find-match', () => {
    if (waitingUsers.length > 0) {
      // Match found!
      const partner = waitingUsers.pop();
      socket.join('room-' + partner);
      partner.join('room-' + socket.id);
      io.to('room-' + partner).emit('matched', socket.id);
      io.to('room-' + socket.id).emit('matched', partner);
    } else {
      waitingUsers.push(socket.id);
      socket.emit('waiting');
    }
  });
  
  socket.on('disconnect', () => {
    // Remove from queue
    waitingUsers = waitingUsers.filter(id => id !== socket.id);
  });
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
