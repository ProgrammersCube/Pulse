import { Server } from 'socket.io';
import { getPriceManager } from '../services/price.service';
import { getGameService } from '../services/game.service';
import { getMatchmakingService } from '../services/matchmaking.service';

// Store active token subscriptions: socketId -> Map<symbol, pythFeedId>
const tokenSubscriptions = new Map<string, Map<string, string>>();

// Helper function to map token symbol to Binance trading pair
function getBinanceSymbol(symbol: string): string {
  // Most tokens follow the pattern: SYMBOL -> SYMBOLUSDT
  // Special cases can be added here if needed
  const symbolUpper = symbol.toUpperCase();
  
  // Special mappings if any (e.g., MATIC -> MATICUSDT, but Polygon is MATIC)
  // For now, default to adding USDT
  return `${symbolUpper}USDT`;
}

// Socket controller setup
export const setupSocketControllers = async (io: Server): Promise<void> => {
  try {
    console.log('Setting up socket controllers');
    
    // Get price manager
    const priceManager = getPriceManager();
    
    // Setup BTC price update interval for all connected clients
    // CHANGED FROM 300ms to 250ms for faster real-time updates
    const btcUpdateInterval = setInterval(() => {
      // Get latest price
      const btcPrice = priceManager.getLatestPrice('BTC');
      
      // Broadcast to all connected clients
      io.emit('price:btc', {
        symbol: 'BTC',
        price: btcPrice.price,
        timestamp: btcPrice.timestamp
      });
    }, 250); // Update every 250ms for real-time feel
    
    // Listen for price updates from hybrid manager for all registered tokens
    priceManager.on('price:update', (data: { symbol: string; price: number; timestamp: number }) => {
      const { symbol, price, timestamp } = data;
      
      // Broadcast to all sockets subscribed to this token
      tokenSubscriptions.forEach((tokenMap, socketId) => {
        if (tokenMap.has(symbol)) {
          io.to(socketId).emit('price:token', {
            symbol,
            price,
            timestamp
          });
        }
      });
    });
    
    // Setup socket connections
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      // Initialize token subscriptions for this socket
      tokenSubscriptions.set(socket.id, new Map());
      
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
      
      // Handle prediction token price subscription
      socket.on('subscribe:token-price', async (data: { symbol: string; pythFeedId?: string | null }) => {
        const { symbol, pythFeedId: providedPythFeedId } = data;
        console.log(`🔌 Client subscribed to ${symbol} price:`, socket.id);
        
        // Look up pythFeedId from settings if not provided
        let pythFeedId = providedPythFeedId;
        if (!pythFeedId) {
          const Settings = (await import('../models/settings.model')).default;
          const settings = await Settings.findOne();
          if (settings) {
            const tokenConfig = settings.predictionTokens.find(pt => pt.name === symbol);
            if (tokenConfig && tokenConfig.pythFeedId) {
              pythFeedId = tokenConfig.pythFeedId;
              console.log(`📋 Found Pyth feed ID for ${symbol} from settings: ${pythFeedId}`);
            } else {
              console.warn(`⚠️ No Pyth feed ID found for ${symbol} in settings`);
              return;
            }
          } else {
            console.error(`❌ Settings not found, cannot look up Pyth feed ID for ${symbol}`);
            return;
          }
        }
        
        // Add to subscriptions
        const subscriptions = tokenSubscriptions.get(socket.id);
        if (subscriptions) {
          subscriptions.set(symbol, pythFeedId);
        } else {
          console.error(`❌ No subscriptions map found for socket ${socket.id}`);
          return;
        }
        
        // Register token with hybrid manager if not already registered
        const binanceSymbol = getBinanceSymbol(symbol);
        priceManager.registerToken({
          symbol,
          pythFeedId,
          binanceSymbol
        });
        
        // Send initial price immediately from hybrid manager
        try {
          const priceData = priceManager.getLatestPrice(symbol);
          if (priceData && priceData.price > 0) {
            socket.emit('price:token', {
              symbol,
              price: priceData.price,
              timestamp: priceData.timestamp
            });
          } else {
            console.warn(`⚠️ No initial price available for ${symbol}, will send when available`);
          }
        } catch (error) {
          console.error(`❌ Error getting initial price for ${symbol}:`, error);
        }
      });
      
      // Handle prediction token price unsubscription
      socket.on('unsubscribe:token-price', (data: { symbol: string }) => {
        const { symbol } = data;
        console.log(`Client unsubscribed from ${symbol} price:`, socket.id);
        
        const subscriptions = tokenSubscriptions.get(socket.id);
        if (subscriptions) {
          subscriptions.delete(symbol);
        }
        
        // Check if any other socket is still subscribed to this token
        let hasOtherSubscriptions = false;
        tokenSubscriptions.forEach((tokenMap) => {
          if (tokenMap.has(symbol)) {
            hasOtherSubscriptions = true;
          }
        });
        
        // If no other subscriptions, we could unregister the token
        // But for now, we'll keep it registered for faster re-subscription
        // Uncomment below if you want to unregister when no one is subscribed:
        // if (!hasOtherSubscriptions && symbol !== 'BTC') {
        //   priceManager.unregisterToken(symbol);
        // }
      });
      
      // Handle user joining room for game updates
      socket.on('user:join', (data) => {
        const { userId } = data;
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room: user:${userId}`);
      });
      
      // Handle wallet connection
      socket.on('wallet:connect', (data) => {
        console.log('Wallet connected:', data.address);
        socket.join(`user:${data.address}`);
        // Broadcast to other clients (for future P2P matchmaking)
        socket.broadcast.emit('user:online', { address: data.address });
      });
      
      // Handle wallet disconnection
      socket.on('wallet:disconnect', (data) => {
        console.log('Wallet disconnected:', data.address);
        socket.leave(`user:${data.address}`);
        // Broadcast to other clients
        socket.broadcast.emit('user:offline', { address: data.address });
      });
      
      // Handle client disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up subscriptions
        tokenSubscriptions.delete(socket.id);
      });
    });
    
    // Cleanup on server shutdown
    process.on('SIGINT', () => {
      clearInterval(btcUpdateInterval);
      process.exit(0);
    });
    
    console.log('Socket controllers setup complete');
  } catch (error) {
    console.error('Error setting up socket controllers:', error);
  }
};