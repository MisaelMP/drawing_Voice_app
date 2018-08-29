const express = require('express');
const app = express();
const server = app.listen(3000);
app.use(express.static('public'));
console.log('this is working');

const socket = require('socket.io');
const io = socket(server);

io.sockets.on('connection', newConnection);
function newConnection(socket) {
  console.log(`new connection ${socket.id}`);
  socket.on('mouse', mouseMsg);
  function mouseMsg(data) {
    socket.broadcast.emit('mouse', data);
    console.log(data);
  }

}
