const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit('message', {
      user: 'Chatbot',
      text: `${user.name}さん、部屋「${user.room}」へようこそ！`,
    });
    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'Chatbot', text: `${user.name} さんが入室しました` });

    socket.join(user.room);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // メッセージが送られてきた時
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // Timerが送られてきた時
  socket.on('sendTimer', (timer) => {
    const user = getUser(socket.id);
    const { second } = timer;
    io.to(user.room).emit('timer', { second: second });
  });

  // 稼働状況が送られてきた時
  socket.on('sendWorkingStatus', (status) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('status', status);
  });

  // buttonのdisable状態が送られてきた時
  socket.on('sendDisabledButton', (disabledButton) => {
    const user = getUser(socket.id);
    io.to(user.room).emit('disabledButton', disabledButton);
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', {
        user: 'Chatbot',
        text: `${user.name} さんが退出しました。`,
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
