// price.service.ts - COMPLETE FILE WITH TS FIXES

import axios from 'axios';
import PriceRecord from '../models/price.model';
import { EventEmitter } from 'events';
import WebSocket from 'ws';

// Price cache interface
interface PriceCache {
  price: number;
  timestamp: number;
  locked?: boolean;
  source?: string;
}

// Lock price request interface
interface LockPriceRequest {
  symbol: string;
  userId: string;
  betId: string;
}

// Locked price record
interface LockedPrice {
  betId: string;
  userId: string;
  symbol: string;
  price: number;
  timestamp: number;
  expiresAt: number;
}

// Pyth Price Data Interface (based on documentation)
interface PythPriceData {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  metadata?: {
    slot: number;
    proof_available_time: number;
    prev_publish_time: number;
  };
}

// Pyth API Response Interface
interface PythApiResponse {
  binary?: {
    encoding: string;
    data: string[];
  };
  parsed: PythPriceData[];
}

// Token registration interface
interface TokenConfig {
  symbol: string;
  pythFeedId: string;
  binanceSymbol: string; // e.g., 'BTCUSDT', 'AVAXUSDT'
}

// Hybrid Price Manager with Pyth + Binance
class HybridPriceManager extends EventEmitter {
  private priceCache: Map<string, PriceCache>;
  private updateInterval: NodeJS.Timeout | null;
  private lockedPrices: Map<string, LockedPrice>;
  private binanceWs: WebSocket | null = null;
  private pythStreamConnection: any = null;
  private priceUpdateTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null; // Debounce reconnect attempts
  private isReconnecting: boolean = false; // Prevent concurrent reconnections
  
  // Track registered tokens: symbol -> TokenConfig
  private registeredTokens: Map<string, TokenConfig>;
  
  // Track last known prices per token: symbol -> { binance: number, pyth: number }
  private lastPrices: Map<string, { binance: number; pyth: number }>;
  
  // Official Pyth price feed IDs from documentation
  private readonly PRICE_FEED_IDS = {
    BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
    ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'  // ETH/USD
  };
  
  // API endpoints
  private readonly PYTH_API_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
  private readonly PYTH_STREAM_URL = 'https://hermes.pyth.network/v2/updates/price/stream';
  private readonly BINANCE_WS_BASE = 'wss://stream.binance.com:9443';
  
  constructor() {
    super();
    
    this.priceCache = new Map();
    this.updateInterval = null;
    this.lockedPrices = new Map();
    this.registeredTokens = new Map();
    this.lastPrices = new Map();
    
    console.log('🚀 Hybrid Price Manager (Pyth + Binance) initialized');
    console.log('🌐 Pyth REST API:', this.PYTH_API_URL);
    console.log('🔌 Binance WebSocket Base:', this.BINANCE_WS_BASE);
    
    // Register BTC by default
    this.registerToken({
      symbol: 'BTC',
      pythFeedId: this.PRICE_FEED_IDS.BTC,
      binanceSymbol: 'BTCUSDT'
    });
    
    // Start all price sources
    this.startBinanceWebSocket();
    this.startPythPolling();
    this.startHybridPriceUpdates();
    
    // Fetch initial prices
    this.fetchInitialPrices();
  }
  
  // Register a token for hybrid price tracking
  public registerToken(config: TokenConfig): void {
    const { symbol, pythFeedId, binanceSymbol } = config;
    
    const isNewToken = !this.registeredTokens.has(symbol);
    
    if (isNewToken) {
      console.log(`📝 Registering token: ${symbol} (Pyth: ${pythFeedId.slice(0, 20)}..., Binance: ${binanceSymbol})`);
    } else {
      console.log(`🔄 Token ${symbol} already registered, skipping reconnect`);
      // Update config but don't reconnect
      this.registeredTokens.set(symbol, config);
      return; // Early return - don't reconnect if already registered
    }
    
    this.registeredTokens.set(symbol, config);
    this.lastPrices.set(symbol, { binance: 0, pyth: 0 });
    
    // Only reconnect if this is a new token
    this.reconnectBinanceWebSocket();
  }
  
  // Unregister a token
  public unregisterToken(symbol: string): void {
    if (this.registeredTokens.delete(symbol)) {
      this.lastPrices.delete(symbol);
      console.log(`🗑️ Unregistered token: ${symbol}`);
      // Reconnect Binance WebSocket to remove token
      this.reconnectBinanceWebSocket();
    }
  }
  
  // Get all registered tokens
  public getRegisteredTokens(): TokenConfig[] {
    return Array.from(this.registeredTokens.values());
  }
  
  // Start Binance WebSocket for real-time updates (supports multiple tokens)
  private startBinanceWebSocket() {
    try {
      const tokens = Array.from(this.registeredTokens.values());
      
      if (tokens.length === 0) {
        console.log('⚠️ No tokens registered, skipping Binance WebSocket');
        this.isReconnecting = false;
        return;
      }
      
      // Don't start if already connecting or connected (unless we're explicitly reconnecting)
      if (this.binanceWs && !this.isReconnecting) {
        const state = this.binanceWs.readyState;
        if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
          console.log('⚠️ Binance WebSocket already connecting/connected, skipping');
          return;
        }
      }
      
      // Build combined stream URL for multiple tokens
      // Format: wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/avaxusdt@trade
      const streams = tokens.map(t => `${t.binanceSymbol.toLowerCase()}@trade`).join('/');
      const wsUrl = `${this.BINANCE_WS_BASE}/stream?streams=${streams}`;
      
      console.log(`🔌 Connecting to Binance WebSocket for ${tokens.length} token(s)...`);
      
      // Close existing connection if any
      if (this.binanceWs) {
        try {
          // Remove all listeners to prevent duplicate handlers
          this.binanceWs.removeAllListeners();
          if (this.binanceWs.readyState === WebSocket.OPEN || 
              this.binanceWs.readyState === WebSocket.CONNECTING) {
            this.binanceWs.close();
          }
        } catch (e) {
          // Ignore errors when closing
        }
        this.binanceWs = null;
      }
      
      this.isReconnecting = false; // Reset flag before creating new connection
      this.binanceWs = new WebSocket(wsUrl);
      
      this.binanceWs.on('open', () => {
        console.log(`✅ Binance WebSocket connected! Tracking: ${tokens.map(t => t.symbol).join(', ')}`);
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
      });
      
      this.binanceWs.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          
          // Binance combined stream format: { stream: "btcusdt@trade", data: { ... } }
          if (message.stream && message.data) {
            const stream = message.stream;
            const trade = message.data;
            const price = parseFloat(trade.p);
            
            // Find which token this stream belongs to
            const tokenConfig = tokens.find(t => 
              stream.toLowerCase() === `${t.binanceSymbol.toLowerCase()}@trade`
            );
            
            if (tokenConfig && price > 0) {
              const symbol = tokenConfig.symbol;
              
              // Sanity check based on token (BTC: 1000-1000000, others: 0.01-100000)
              const maxPrice = symbol === 'BTC' ? 1000000 : 100000;
              const minPrice = symbol === 'BTC' ? 1000 : 0.01;
              
              if (price >= minPrice && price <= maxPrice) {
                const lastPrices = this.lastPrices.get(symbol) || { binance: 0, pyth: 0 };
                lastPrices.binance = price;
                this.lastPrices.set(symbol, lastPrices);
                
                // Update cache with Binance price
                this.priceCache.set(`${symbol}_BINANCE`, {
                  price,
                  timestamp: Date.now(),
                  source: 'binance'
                });
              }
            }
          } else if (message.p) {
            // Fallback: single stream format (for backward compatibility)
            const price = parseFloat(message.p);
            if (price > 0 && price < 1000000) {
              const btcConfig = this.registeredTokens.get('BTC');
              if (btcConfig) {
                const lastPrices = this.lastPrices.get('BTC') || { binance: 0, pyth: 0 };
                lastPrices.binance = price;
                this.lastPrices.set('BTC', lastPrices);
                
                this.priceCache.set('BTC_BINANCE', {
                  price,
                  timestamp: Date.now(),
                  source: 'binance'
                });
              }
            }
          }
        } catch (error) {
          console.error('Error parsing Binance data:', error);
        }
      });
      
      this.binanceWs.on('error', (error: Error) => {
        console.error('❌ Binance WebSocket error:', error.message);
      });
      
      this.binanceWs.on('close', () => {
        // Only log if this wasn't an intentional close (reconnect)
        if (!this.isReconnecting) {
          console.log('🔄 Binance WebSocket disconnected, reconnecting...');
        }
        
        // Exponential backoff for reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          
          setTimeout(() => {
            this.isReconnecting = false; // Reset flag before reconnecting
            this.startBinanceWebSocket();
          }, delay);
        } else {
          this.isReconnecting = false;
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to start Binance WebSocket:', error);
      
      // Try again after delay
      setTimeout(() => {
        this.startBinanceWebSocket();
      }, 5000);
    }
  }
  
  // Reconnect Binance WebSocket (used when tokens are added/removed)
  private reconnectBinanceWebSocket() {
    // Clear any pending reconnect timeout to debounce rapid calls
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Don't reconnect if already reconnecting
    if (this.isReconnecting) {
      console.log('⚠️ Reconnect already in progress, skipping');
      return;
    }
    
    this.isReconnecting = true;
    
    // Close existing connection if open or connecting
    if (this.binanceWs) {
      try {
        if (this.binanceWs.readyState === WebSocket.OPEN || 
            this.binanceWs.readyState === WebSocket.CONNECTING) {
          this.binanceWs.removeAllListeners();
          this.binanceWs.close();
        }
      } catch (e) {
        // Ignore errors when closing
      }
      this.binanceWs = null;
    }
    
    // Debounce reconnect to prevent rapid reconnections
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.isReconnecting = false; // Reset flag before starting
      this.startBinanceWebSocket();
    }, 1000);
  }
  
  // Pyth polling for reliable price (every 5 seconds) - supports multiple tokens
  private startPythPolling() {
    // Initial fetch
    this.fetchPythPrices();
    
    // Then poll every 5 seconds
    this.updateInterval = setInterval(async () => {
      await this.fetchPythPrices();
    }, 5000);
    
    console.log('🔄 Started Pyth polling every 5 seconds');
  }
  
  // Fetch latest prices for all registered tokens using official Pyth REST API
  private async fetchPythPrices() {
    const tokens = Array.from(this.registeredTokens.values());
    
    if (tokens.length === 0) {
      return;
    }
    
    try {
      // Fetch all tokens in one request
      const feedIds = tokens.map(t => t.pythFeedId);
      
      const response = await axios.get(this.PYTH_API_URL, {
        params: {
          'ids[]': feedIds
        },
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PulseCrypto-PythClient/1.0'
        }
      });
      
      if (response.data && response.data.parsed && Array.isArray(response.data.parsed)) {
        const parsed = response.data.parsed as PythPriceData[];
        
        // Process each token's price
        tokens.forEach(tokenConfig => {
          const { symbol, pythFeedId } = tokenConfig;
          
          // Find matching price data (Pyth returns feed ID without 0x prefix)
          const feedIdWithoutPrefix = pythFeedId.replace('0x', '');
          const priceData = parsed.find(item => 
            item.id === feedIdWithoutPrefix || item.id === pythFeedId
          );
          
          if (priceData && priceData.price) {
            const rawPrice = parseInt(priceData.price.price);
            const exponent = priceData.price.expo;
            const price = rawPrice * Math.pow(10, exponent);
            const publishTime = priceData.price.publish_time * 1000;
            
            // Sanity check based on token
            const maxPrice = symbol === 'BTC' ? 1000000 : 100000;
            const minPrice = symbol === 'BTC' ? 1000 : 0.01;
            
            if (price >= minPrice && price <= maxPrice) {
              const lastPrices = this.lastPrices.get(symbol) || { binance: 0, pyth: 0 };
              lastPrices.pyth = price;
              this.lastPrices.set(symbol, lastPrices);
              
              this.priceCache.set(`${symbol}_PYTH`, {
                price,
                timestamp: publishTime,
                source: 'pyth'
              });
              
              // Store in database occasionally (every minute, only for BTC)
              if (symbol === 'BTC' && Date.now() % 60000 < 5000) {
                this.savePriceToDatabase('BTC', price, publishTime);
              }
            }
          }
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Pyth API Error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else if (error instanceof Error) {
        console.error('❌ Unexpected error fetching Pyth prices:', error.message);
      } else {
        console.error('❌ Unknown error fetching Pyth prices:', error);
      }
    }
  }
  
  // Hybrid price update system - combines both sources every 250ms for all tokens
  private startHybridPriceUpdates() {
    // Update every 250ms using interpolation and combination
    this.priceUpdateTimer = setInterval(() => {
      const tokens = Array.from(this.registeredTokens.keys());
      
      tokens.forEach(symbol => {
        const hybridPrice = this.calculateHybridPrice(symbol);
        
        if (hybridPrice > 0) {
          // Add micro-movements for realism (very small variations)
          // Scale micro-movement based on token price (BTC: ±$0.25, others: ±0.1%)
          const microMovementScale = symbol === 'BTC' ? 0.50 : hybridPrice * 0.001;
          const microMovement = (Math.random() - 0.5) * microMovementScale;
          const finalPrice = parseFloat((hybridPrice + microMovement).toFixed(2));
          
          // Update main cache
          this.priceCache.set(symbol, {
            price: finalPrice,
            timestamp: Date.now(),
            source: 'hybrid'
          });
          
          const lastPrices = this.lastPrices.get(symbol) || { binance: 0, pyth: 0 };
          
          // Emit price update event for Socket.IO
          this.emit('price:update', {
            symbol,
            price: finalPrice,
            timestamp: Date.now(),
            source: 'hybrid',
            binancePrice: lastPrices.binance,
            pythPrice: lastPrices.pyth,
            confidence: this.calculateConfidence(symbol)
          });
        }
      });
    }, 250); // Every 250ms for smooth updates
    
    console.log('⚡ Started hybrid price updates every 250ms');
  }
  
  // Calculate hybrid price using weighted average for a specific token
  private calculateHybridPrice(symbol: string): number {
    let totalPrice = 0;
    let totalWeight = 0;
    
    const lastPrices = this.lastPrices.get(symbol) || { binance: 0, pyth: 0 };
    
    // Get Binance price (higher weight for real-time)
    const binanceData = this.priceCache.get(`${symbol}_BINANCE`);
    if (binanceData && (Date.now() - binanceData.timestamp) < 3000) { // Fresh if < 3 seconds
      totalPrice += binanceData.price * 0.7; // 70% weight
      totalWeight += 0.7;
    } else if (lastPrices.binance > 0) {
      // Use last known Binance price with reduced weight
      totalPrice += lastPrices.binance * 0.5;
      totalWeight += 0.5;
    }
    
    // Get Pyth price (lower weight but reliable)
    const pythData = this.priceCache.get(`${symbol}_PYTH`);
    if (pythData && (Date.now() - pythData.timestamp) < 10000) { // Fresh if < 10 seconds
      totalPrice += pythData.price * 0.3; // 30% weight
      totalWeight += 0.3;
    } else if (lastPrices.pyth > 0) {
      // Use last known Pyth price with reduced weight
      totalPrice += lastPrices.pyth * 0.2;
      totalWeight += 0.2;
    }
    
    // Calculate weighted average
    if (totalWeight > 0) {
      return totalPrice / totalWeight;
    }
    
    // Fallback to any available price
    const fallbackPrice = lastPrices.binance || lastPrices.pyth;
    if (fallbackPrice > 0) {
      return fallbackPrice;
    }
    
    // Ultimate fallback (only for BTC)
    return symbol === 'BTC' ? 65000 : 0;
  }
  
  // Calculate confidence level based on data freshness for a specific token
  private calculateConfidence(symbol: string): number {
    let confidence = 0;
    
    const binanceData = this.priceCache.get(`${symbol}_BINANCE`);
    const pythData = this.priceCache.get(`${symbol}_PYTH`);
    
    if (binanceData && (Date.now() - binanceData.timestamp) < 1000) {
      confidence += 50;
    }
    
    if (pythData && (Date.now() - pythData.timestamp) < 5000) {
      confidence += 50;
    }
    
    return confidence;
  }
  
  // Fetch initial prices from both sources for all registered tokens
  private async fetchInitialPrices() {
    console.log('📡 Fetching initial prices...');
    
    const tokens = Array.from(this.registeredTokens.values());
    
    // Fetch from Pyth
    await this.fetchPythPrices();
    
    // Fetch from Binance REST API as backup for each token
    for (const tokenConfig of tokens) {
      try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
          params: { symbol: tokenConfig.binanceSymbol },
          timeout: 5000
        });
        
        const price = parseFloat(response.data.price);
        
        if (price > 0) {
          const lastPrices = this.lastPrices.get(tokenConfig.symbol) || { binance: 0, pyth: 0 };
          lastPrices.binance = price;
          this.lastPrices.set(tokenConfig.symbol, lastPrices);
          
          this.priceCache.set(`${tokenConfig.symbol}_BINANCE`, {
            price,
            timestamp: Date.now(),
            source: 'binance'
          });
          
          console.log(`💰 Initial Binance ${tokenConfig.symbol} Price: $${price.toFixed(2)}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(`Error fetching initial Binance price for ${tokenConfig.symbol}:`, error.message);
        } else if (error instanceof Error) {
          console.error(`Error fetching initial Binance price for ${tokenConfig.symbol}:`, error.message);
        } else {
          console.error(`Error fetching initial Binance price for ${tokenConfig.symbol}:`, String(error));
        }
      }
    }
    
    // Set initial hybrid prices for all tokens
    tokens.forEach(tokenConfig => {
      const hybridPrice = this.calculateHybridPrice(tokenConfig.symbol);
      if (hybridPrice > 0) {
        this.priceCache.set(tokenConfig.symbol, {
          price: hybridPrice,
          timestamp: Date.now(),
          source: 'hybrid'
        });
      }
    });
  }
  
  // Save price to database
  private async savePriceToDatabase(symbol: string, price: number, timestamp: number) {
    try {
      const priceRecord = new PriceRecord({
        timestamp: new Date(timestamp),
        symbol,
        price,
        source: 'hybrid'
      });
      
      await priceRecord.save();
      console.log(`💾 Saved ${symbol} pricec to database: $${price.toFixed(2)}`);
    } catch (error) {
      console.error('❌ Error saving price to database:', error);
    }
  }
  
  // Get the latest price for a symbol
  public getLatestPrice(symbol: string): PriceCache {
    const cachedPrice = this.priceCache.get(symbol);
    
    if (cachedPrice) {
      // Check if price is fresh (less than 1 second old)
      const age = Date.now() - cachedPrice.timestamp;
      if (age < 1000) {
        return cachedPrice;
      }
    }
    
    // Calculate fresh hybrid price
    const hybridPrice = this.calculateHybridPrice(symbol);
    
    if (hybridPrice > 0) {
      const newPrice = {
        price: hybridPrice,
        timestamp: Date.now(),
        source: 'hybrid'
      };
      
      this.priceCache.set(symbol, newPrice);
      return newPrice;
    }
    
    // Ultimate fallback
    const lastPrices = this.lastPrices.get(symbol) || { binance: 0, pyth: 0 };
    const fallbackPrice = lastPrices.binance || lastPrices.pyth || (symbol === 'BTC' ? 111443.50 : 0);
    
    const defaultPrice = { 
      price: fallbackPrice, 
      timestamp: Date.now(),
      source: 'fallback'
    };
    
    this.priceCache.set(symbol, defaultPrice);
    return defaultPrice;
  }
  
  // Lock a price for a bet
  public lockPrice(request: LockPriceRequest): LockedPrice {
    const { symbol, userId, betId } = request;
    
    const currentPrice = this.getLatestPrice(symbol);
    
    const lockedPrice: LockedPrice = {
      betId,
      userId,
      symbol,
      price: currentPrice.price,
      timestamp: currentPrice.timestamp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    };
    
    this.lockedPrices.set(betId, lockedPrice);
    
    console.log(`🔒 Price locked for bet ${betId}: $${currentPrice.price.toFixed(2)} (${symbol})`);
    
    return lockedPrice;
  }
  
  // Get a locked price for a bet
  public getLockedPrice(betId: string): LockedPrice | null {
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
  public cleanupExpiredLocks() {
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
  public stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      console.log('⏹️ Stopped Pyth polling');
    }
    
    if (this.priceUpdateTimer) {
      clearInterval(this.priceUpdateTimer);
      this.priceUpdateTimer = null;
      console.log('⏹️ Stopped hybrid price updates');
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.isReconnecting = false;
    
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
      console.log('⏹️ Closed Binance WebSocket');
    }
    
    if (this.pythStreamConnection) {
      this.pythStreamConnection.close();
      this.pythStreamConnection = null;
      console.log('⏹️ Stopped Pyth streaming');
    }
  }
  
  // Get cache stats for monitoring
  public getCacheStats() {
    const tokens = Array.from(this.registeredTokens.keys());
    const stats: any = {
      cachedSymbols: Array.from(this.priceCache.keys()),
      lockedPricesCount: this.lockedPrices.size,
      registeredTokens: tokens,
      tokens: {}
    };
    
    // Get stats for each registered token
    tokens.forEach(symbol => {
      const hybridPrice = this.priceCache.get(symbol);
      const binanceData = this.priceCache.get(`${symbol}_BINANCE`);
      const pythData = this.priceCache.get(`${symbol}_PYTH`);
      const lastPrices = this.lastPrices.get(symbol) || { binance: 0, pyth: 0 };
      
      stats.tokens[symbol] = {
        hybridPrice: hybridPrice?.price,
        binancePrice: lastPrices.binance,
        pythPrice: lastPrices.pyth,
        lastUpdate: hybridPrice?.timestamp ? new Date(hybridPrice.timestamp).toISOString() : null,
        priceAge: hybridPrice ? Date.now() - hybridPrice.timestamp : null,
        binanceAge: binanceData ? Date.now() - binanceData.timestamp : null,
        pythAge: pythData ? Date.now() - pythData.timestamp : null,
        confidence: this.calculateConfidence(symbol)
      };
    });
    
    return stats;
  }
  
  // Test connections
  public async testConnections() {
    console.log('🔍 Testing price feed connections...');
    
    const results = {
      pyth: false,
      binance: false
    };
    
    // Test Pyth
    try {
      const response = await axios.get(this.PYTH_API_URL, {
        params: { 'ids[]': this.PRICE_FEED_IDS.BTC },
        timeout: 10000
      });
      
      if (response.data?.parsed?.[0]) {
        results.pyth = true;
        console.log('✅ Pyth API connection successful!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Pyth API connection failed:', error.message);
      } else {
        console.error('❌ Pyth API connection failed:', error);
      }
    }
    
    // Test Binance
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ping', {
        timeout: 5000
      });
      
      if (response.status === 200) {
        results.binance = true;
        console.log('✅ Binance API connection successful!');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Binance API connection failed:', error.message);
      } else {
        console.error('❌ Binance API connection failed:', error);
      }
    }
    
    return results;
  }
}

// Singleton instance
let hybridPriceManagerInstance: HybridPriceManager | null = null;

// Get or create the price manager
export const getPythPriceManager = (): HybridPriceManager => {
  if (!hybridPriceManagerInstance) {
    hybridPriceManagerInstance = new HybridPriceManager();
    
    // Set up periodic cleanup
    setInterval(() => {
      hybridPriceManagerInstance?.cleanupExpiredLocks();
    }, 60000);
  }
  return hybridPriceManagerInstance;
};

// Alias for backward compatibility
export const getPriceManager = getPythPriceManager;

// Clean up on process exit
process.on('SIGINT', () => {
  if (hybridPriceManagerInstance) {
    console.log('🛑 Shutting down Hybrid price manager...');
    hybridPriceManagerInstance.stopUpdates();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (hybridPriceManagerInstance) {
    console.log('🛑 Shutting down Hybrid price manager...');
    hybridPriceManagerInstance.stopUpdates();
  }
  process.exit(0);
});