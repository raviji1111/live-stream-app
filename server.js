const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;
let broadcaster = null;
let viewerCount = 0;

// Serve public folder
app.use(express.static('public'));

io.on('connection', (socket) => {
    viewerCount++;
    // Broadcast updated count (subtracting 1 for the broadcaster if they are online)
    io.emit('viewer-count', broadcaster ? viewerCount - 1 : viewerCount);

    // Jab broadcaster connect ho
    socket.on('broadcaster', () => {
        broadcaster = socket.id;
        socket.broadcast.emit('broadcaster');
    });

    // Jab koi viewer website khele
    socket.on('watcher', () => {
        if (broadcaster) {
            socket.to(broadcaster).emit('watcher', socket.id);
        }
    });

    // WebRTC Signaling
    socket.on('offer', (id, message) => {
        socket.to(id).emit('offer', socket.id, message);
    });
    socket.on('answer', (id, message) => {
        socket.to(id).emit('answer', socket.id, message);
    });
    socket.on('candidate', (id, message) => {
        socket.to(id).emit('candidate', socket.id, message);
    });

    // Disconnection logic
    socket.on('disconnect', () => {
        viewerCount--;
        io.emit('viewer-count', broadcaster ? viewerCount - 1 : Math.max(0, viewerCount));
        
        if (broadcaster === socket.id) {
            broadcaster = null;
            socket.broadcast.emit('disconnectPeer', socket.id);
        } else if (broadcaster) {
            socket.to(broadcaster).emit('disconnectPeer', socket.id);
        }
    });
});

http.listen(port, () => console.log(`Server running on port ${port}`));