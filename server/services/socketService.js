// services/socketService.js

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('New user connected:', socket.id);

        // Listen for game prediction events
        socket.on('startGame', (data) => {
            console.log('Game started with data:', data);
            // Broadcast the start of the game to all connected clients
            io.emit('gameStarted', { message: 'A new game has started!', data });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
};
