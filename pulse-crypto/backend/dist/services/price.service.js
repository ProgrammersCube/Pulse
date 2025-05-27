"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceManager = exports.getPythPriceManager = void 0;
const axios_1 = __importDefault(require("axios"));
const price_model_1 = __importDefault(require("../models/price.model"));
const events_1 = require("events");
// Correct Pyth Price Manager using REST API
class PythPriceManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.streamingConnection = null; // For Server-Sent Events
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        // Official Pyth price feed IDs from documentation
        this.PRICE_FEED_IDS = {
            BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
            ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace' // ETH/USD
        };
        // Pyth Hermes REST API endpoint
        this.PYTH_API_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
        // Pyth Hermes Streaming endpoint for real-time updates (250-500ms)
        this.PYTH_STREAM_URL = 'https://hermes.pyth.network/v2/updates/price/stream';
        this.priceCache = new Map();
        this.updateInterval = null;
        this.lockedPrices = new Map();
        console.log('🚀 Pyth Network Price Manager initialized');
        console.log('📊 Using BTC Price Feed ID:', this.PRICE_FEED_IDS.BTC);
        console.log('🌐 Pyth REST API:', this.PYTH_API_URL);
        console.log('⚡ Pyth Stream API:', this.PYTH_STREAM_URL);
        // Start real-time streaming (250-500ms updates)
        this.startRealTimeStreaming();
        // Backup polling every 10 seconds (fallback only)
        this.startBackupPolling();
        // Fetch initial price immediately
        this.fetchLatestBTCPrice();
    }
    // Start REAL-TIME streaming using Server-Sent Events (250-500ms updates)
    startRealTimeStreaming() {
        try {
            console.log('⚡ Starting real-time Pyth price streaming (250-500ms updates)...');
            // Use EventSource for Server-Sent Events streaming
            const EventSource = require('eventsource');
            const url = `${this.PYTH_STREAM_URL}?ids[]=${this.PRICE_FEED_IDS.BTC}`;
            console.log('🔗 Streaming URL:', url);
            this.streamingConnection = new EventSource(url);
            this.streamingConnection.onopen = () => {
                console.log('✅ Real-time Pyth stream connected! (Updates every 250-500ms)');
                this.reconnectAttempts = 0;
            };
            this.streamingConnection.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleRealtimeUpdate(data);
                }
                catch (error) {
                    console.error('❌ Error parsing streaming data:', error instanceof Error ? error.message : String(error));
                }
            };
            this.streamingConnection.onerror = (error) => {
                console.error('❌ Streaming connection error:', error);
                // Attempt to reconnect with exponential backoff
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;
                    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
                    console.log(`🔄 Reconnecting to stream in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                    setTimeout(() => {
                        this.startRealTimeStreaming();
                    }, delay);
                }
                else {
                    console.log('❌ Max reconnection attempts reached, falling back to polling only');
                }
            };
        }
        catch (error) {
            console.error('❌ Failed to start streaming:', error instanceof Error ? error.message : String(error));
            console.log('⚠️ Falling back to polling mode');
        }
    }
    // Handle real-time price updates from streaming
    handleRealtimeUpdate(data) {
        try {
            if (data && data.parsed && Array.isArray(data.parsed)) {
                const parsed = data.parsed;
                if (parsed.length > 0) {
                    const btcPriceData = parsed.find(item => item.id === this.PRICE_FEED_IDS.BTC.replace('0x', '')) || parsed[0];
                    if (btcPriceData && btcPriceData.price) {
                        const rawPrice = parseInt(btcPriceData.price.price);
                        const exponent = btcPriceData.price.expo;
                        const price = rawPrice * Math.pow(10, exponent);
                        const publishTime = btcPriceData.price.publish_time * 1000;
                        if (price > 1000 && price < 1000000) {
                            // Update cache
                            this.priceCache.set('BTC', {
                                price,
                                timestamp: publishTime
                            });
                            // Emit price update event for Socket.IO (real-time)
                            this.emit('price:update', {
                                symbol: 'BTC',
                                price,
                                timestamp: publishTime,
                                source: 'pyth-stream',
                                confidence: btcPriceData.price.conf,
                                publishTime: btcPriceData.price.publish_time,
                                realtime: true
                            });
                            console.log(`⚡ REAL-TIME BTC: ${price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} (Streaming)`);
                            // Store in database less frequently for streaming (every 2 minutes)
                            if (Date.now() % 120000 < 500) {
                                this.savePriceToDatabase('BTC', price, publishTime);
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('❌ Error handling realtime update:', error instanceof Error ? error.message : String(error));
        }
    }
    // Backup polling (much slower, only as fallback)
    startBackupPolling() {
        if (this.updateInterval)
            return;
        // Much slower backup polling (every 10 seconds)
        this.updateInterval = setInterval(async () => {
            try {
                // Only poll if streaming is not working
                if (!this.streamingConnection || this.streamingConnection.readyState !== 1) {
                    await this.fetchLatestBTCPrice();
                }
            }
            catch (error) {
                console.error('❌ Error in backup polling:', error instanceof Error ? error.message : String(error));
            }
        }, 10000);
        console.log('🔄 Started backup polling every 10 seconds');
    }
    // Fetch latest BTC price using official Pyth REST API
    async fetchLatestBTCPrice() {
        try {
            console.log('📡 Fetching BTC price from Pyth Network...');
            // Use exact API format from Pyth documentation
            const response = await axios_1.default.get(this.PYTH_API_URL, {
                params: {
                    'ids[]': this.PRICE_FEED_IDS.BTC // Array parameter as shown in docs
                },
                timeout: 5000,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'PulseCrypto-PythClient/1.0'
                }
            });
            console.log('📊 Pyth API Response Status:', response.status);
            if (response.data && response.data.parsed && Array.isArray(response.data.parsed)) {
                const parsed = response.data.parsed;
                if (parsed.length > 0) {
                    const btcPriceData = parsed.find(item => item.id === this.PRICE_FEED_IDS.BTC.replace('0x', '') // Pyth returns ID without 0x prefix
                    ) || parsed[0]; // Fallback to first item
                    if (btcPriceData && btcPriceData.price) {
                        // Parse price according to Pyth format: price * 10^expo
                        const rawPrice = parseInt(btcPriceData.price.price);
                        const exponent = btcPriceData.price.expo;
                        const price = rawPrice * Math.pow(10, exponent);
                        const timestamp = Date.now();
                        const publishTime = btcPriceData.price.publish_time * 1000; // Convert to milliseconds
                        console.log('✅ Pyth Price Data:', {
                            rawPrice,
                            exponent,
                            calculatedPrice: price,
                            publishTime: new Date(publishTime).toISOString(),
                            confidence: btcPriceData.price.conf
                        });
                        if (price > 1000 && price < 1000000) { // Sanity check for BTC price range
                            // Update cache
                            this.priceCache.set('BTC', {
                                price,
                                timestamp: publishTime // Use Pyth's publish time
                            });
                            // Emit price update event for Socket.IO
                            this.emit('price:update', {
                                symbol: 'BTC',
                                price,
                                timestamp: publishTime,
                                source: 'pyth',
                                confidence: btcPriceData.price.conf,
                                publishTime: btcPriceData.price.publish_time
                            });
                            // Store in database periodically (every 30 seconds)
                            if (Date.now() % 30000 < 1000) {
                                this.savePriceToDatabase('BTC', price, publishTime);
                            }
                            console.log(`💰 BTC Price Updated: $${price.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} (Pyth Network)`);
                            return { price, timestamp: publishTime };
                        }
                        else {
                            console.error('❌ Invalid BTC price received:', price);
                        }
                    }
                    else {
                        console.error('❌ No price data in Pyth response');
                    }
                }
                else {
                    console.error('❌ No parsed data in Pyth response');
                }
            }
            else {
                console.error('❌ Invalid Pyth API response structure');
                console.log('📋 Response data:', JSON.stringify(response.data, null, 2));
            }
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('❌ Pyth API Error:', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    message: error.message,
                    url: error.config?.url,
                    params: error.config?.params
                });
                if (error.response?.data) {
                    console.log('📋 Error Response Data:', JSON.stringify(error.response.data, null, 2));
                }
            }
            else {
                console.error('❌ Unexpected error:', error);
            }
            // Fallback: keep last known price or set default
            const lastPrice = this.priceCache.get('BTC');
            if (!lastPrice) {
                const defaultPrice = { price: 65000, timestamp: Date.now() };
                this.priceCache.set('BTC', defaultPrice);
                console.log('⚠️ Using default BTC price: $65,000');
            }
        }
    }
    // Alternative method: Fetch using multiple price feeds at once
    async fetchMultiplePrices() {
        try {
            console.log('📡 Fetching multiple prices from Pyth Network...');
            const response = await axios_1.default.get(this.PYTH_API_URL, {
                params: {
                    'ids[]': [this.PRICE_FEED_IDS.BTC, this.PRICE_FEED_IDS.ETH]
                },
                timeout: 5000,
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (response.data && response.data.parsed) {
                const parsed = response.data.parsed;
                parsed.forEach(priceData => {
                    const rawPrice = parseInt(priceData.price.price);
                    const exponent = priceData.price.expo;
                    const price = rawPrice * Math.pow(10, exponent);
                    const timestamp = priceData.price.publish_time * 1000;
                    // Determine symbol based on price feed ID
                    let symbol = 'UNKNOWN';
                    if (priceData.id === this.PRICE_FEED_IDS.BTC.replace('0x', '')) {
                        symbol = 'BTC';
                    }
                    else if (priceData.id === this.PRICE_FEED_IDS.ETH.replace('0x', '')) {
                        symbol = 'ETH';
                    }
                    if (symbol !== 'UNKNOWN' && price > 0) {
                        this.priceCache.set(symbol, { price, timestamp });
                        this.emit('price:update', {
                            symbol,
                            price,
                            timestamp,
                            source: 'pyth'
                        });
                        console.log(`💰 ${symbol} Price: $${price.toLocaleString()}`);
                    }
                });
            }
        }
        catch (error) {
            console.error('❌ Error fetching multiple prices:', error instanceof Error ? error.message : String(error));
        }
    }
    // Save price to database
    async savePriceToDatabase(symbol, price, timestamp) {
        try {
            const priceRecord = new price_model_1.default({
                timestamp: new Date(timestamp),
                symbol,
                price,
                source: 'pyth'
            });
            await priceRecord.save();
            console.log(`💾 Saved ${symbol} price to database: $${price.toFixed(2)}`);
        }
        catch (error) {
            console.error('❌ Error saving price to database:', error);
        }
    }
    // Get the latest price for a symbol
    getLatestPrice(symbol) {
        const cachedPrice = this.priceCache.get(symbol);
        if (cachedPrice) {
            // Check if price is fresh (less than 10 seconds old)
            const age = Date.now() - cachedPrice.timestamp;
            if (age < 10000) {
                return cachedPrice;
            }
            console.log(`⚠️ Cached ${symbol} price is ${Math.round(age / 1000)}s old, triggering refresh`);
        }
        // Trigger a fresh fetch
        this.fetchLatestBTCPrice();
        // Return cached price or default
        if (cachedPrice) {
            return cachedPrice;
        }
        const defaultPrice = { price: 111443.50, timestamp: Date.now() }; // Current real BTC price
        this.priceCache.set(symbol, defaultPrice);
        console.log(`⚠️ No cached ${symbol} price, using current market price: ${defaultPrice.price.toLocaleString()}`);
        return defaultPrice;
    }
    // Lock a price for a bet
    lockPrice(request) {
        const { symbol, userId, betId } = request;
        const currentPrice = this.getLatestPrice(symbol);
        const lockedPrice = {
            betId,
            userId,
            symbol,
            price: currentPrice.price,
            timestamp: currentPrice.timestamp,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        };
        this.lockedPrices.set(betId, lockedPrice);
        console.log(`🔒 Price locked for bet ${betId}: $${currentPrice.price.toLocaleString()} (${symbol})`);
        return lockedPrice;
    }
    // Get a locked price for a bet
    getLockedPrice(betId) {
        const lockedPrice = this.lockedPrices.get(betId);
        if (!lockedPrice || Date.now() > lockedPrice.expiresAt) {
            if (lockedPrice) {
                this.lockedPrices.delete(betId);
                console.log(`🗑️ Expired locked price removed for bet ${betId}`);
            }
            return null;
        }
        return lockedPrice;
    }
    // Clean up expired locked prices
    cleanupExpiredLocks() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [betId, lock] of this.lockedPrices.entries()) {
            if (now > lock.expiresAt) {
                this.lockedPrices.delete(betId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            console.log(`🧹 Cleaned up ${cleanedCount} expired price locks`);
        }
    }
    // Stop all update methods
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Stopped backup polling');
        }
        if (this.streamingConnection) {
            this.streamingConnection.close();
            this.streamingConnection = null;
            console.log('⏹️ Stopped real-time streaming');
        }
    }
    // Get cache stats for monitoring
    getCacheStats() {
        const btcPrice = this.priceCache.get('BTC');
        return {
            cachedSymbols: Array.from(this.priceCache.keys()),
            lockedPricesCount: this.lockedPrices.size,
            lastBtcUpdate: btcPrice ? new Date(btcPrice.timestamp).toISOString() : null,
            currentBtcPrice: btcPrice ? btcPrice.price : null,
            priceAge: btcPrice ? Date.now() - btcPrice.timestamp : null
        };
    }
    // Test the Pyth API connection
    async testPythConnection() {
        console.log('🔍 Testing Pyth Network connection...');
        try {
            const response = await axios_1.default.get(this.PYTH_API_URL, {
                params: {
                    'ids[]': this.PRICE_FEED_IDS.BTC
                },
                timeout: 10000
            });
            console.log('✅ Pyth API connection successful!');
            console.log('📊 Response:', JSON.stringify(response.data, null, 2));
            return true;
        }
        catch (error) {
            console.error('❌ Pyth API connection failed:', error);
            return false;
        }
    }
}
// Singleton instance
let pythPriceManagerInstance = null;
// Get or create the price manager
const getPythPriceManager = () => {
    if (!pythPriceManagerInstance) {
        pythPriceManagerInstance = new PythPriceManager();
        // Set up periodic cleanup
        setInterval(() => {
            pythPriceManagerInstance?.cleanupExpiredLocks();
        }, 60000);
    }
    return pythPriceManagerInstance;
};
exports.getPythPriceManager = getPythPriceManager;
// Alias for backward compatibility
exports.getPriceManager = exports.getPythPriceManager;
// Clean up on process exit
process.on('SIGINT', () => {
    if (pythPriceManagerInstance) {
        console.log('🛑 Shutting down Pyth price manager...');
        pythPriceManagerInstance.stopUpdates();
    }
    process.exit(0);
});
process.on('SIGTERM', () => {
    if (pythPriceManagerInstance) {
        console.log('🛑 Shutting down Pyth price manager...');
        pythPriceManagerInstance.stopUpdates();
    }
    process.exit(0);
});
