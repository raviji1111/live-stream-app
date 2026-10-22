const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

let viewerCount = 0;

io.on('connection', (socket) => {
    viewerCount++;
    io.emit('viewer-count', viewerCount); // Sabhi ko naya count bhejein

    socket.on('disconnect', () => {
        viewerCount = Math.max(0, viewerCount - 1);
        io.emit('viewer-count', viewerCount);
    });
});

http.listen(port, () => console.log(`Server running on port ${port}`));
