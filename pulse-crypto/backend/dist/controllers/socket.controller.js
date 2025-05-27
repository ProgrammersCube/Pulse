"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketControllers = void 0;
const price_service_1 = require("../services/price.service");
// Socket controller setup
const setupSocketControllers = async (io) => {
    try {
        console.log('Setting up socket controllers');
        // Get price manager
        const priceManager = (0, price_service_1.getPriceManager)();
        // Setup price update interval for all connected clients
        const updateInterval = setInterval(() => {
            // Get latest price
            const btcPrice = priceManager.getLatestPrice('BTC');
            // Broadcast to all connected clients
            io.emit('price:btc', {
                symbol: 'BTC',
                price: btcPrice.price,
                timestamp: btcPrice.timestamp
            });
        }, 300); // Update every 300ms
        // Setup socket connections
        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            // Handle price subscription request
            socket.on('subscribe:btc-price', () => {
                console.log('Client subscribed to BTC price:', socket.id);
                // Send initial price immediately
                const btcPrice = priceManager.getLatestPrice('BTC');
                socket.emit('price:btc', {
                    symbol: 'BTC',
                    price: btcPrice.price,
                    timestamp: btcPrice.timestamp
                });
            });
            // Handle wallet connection
            socket.on('wallet:connect', (data) => {
                console.log('Wallet connected:', data.address);
                // Broadcast to other clients (for future P2P matchmaking)
                socket.broadcast.emit('user:online', { address: data.address });
            });
            // Handle wallet disconnection
            socket.on('wallet:disconnect', (data) => {
                console.log('Wallet disconnected:', data.address);
                // Broadcast to other clients
                socket.broadcast.emit('user:offline', { address: data.address });
            });
            // Handle client disconnection
            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });
        // Cleanup on server shutdown
        process.on('SIGINT', () => {
            clearInterval(updateInterval);
            process.exit(0);
        });
        console.log('Socket controllers setup complete');
    }
    catch (error) {
        console.error('Error setting up socket controllers:', error);
    }
};
exports.setupSocketControllers = setupSocketControllers;
