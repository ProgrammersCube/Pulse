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

// Hybrid Price Manager with Pyth + Binance
class HybridPriceManager extends EventEmitter {
  private priceCache: Map<string, PriceCache>;
  private updateInterval: NodeJS.Timeout | null;
  private lockedPrices: Map<string, LockedPrice>;
  private binanceWs: WebSocket | null = null;
  private pythStreamConnection: any = null;
  private lastBinancePrice: number = 0;
  private lastPythPrice: number = 0;
  private priceUpdateTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  
  // Official Pyth price feed IDs from documentation
  private readonly PRICE_FEED_IDS = {
    BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC/USD
    ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace'  // ETH/USD
  };
  
  // API endpoints
  private readonly PYTH_API_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
  private readonly PYTH_STREAM_URL = 'https://hermes.pyth.network/v2/updates/price/stream';
  private readonly BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@trade';
  
  constructor() {
    super();
    
    this.priceCache = new Map();
    this.updateInterval = null;
    this.lockedPrices = new Map();
    
    console.log('🚀 Hybrid Price Manager (Pyth + Binance) initialized');
    console.log('📊 Using BTC Price Feed ID:', this.PRICE_FEED_IDS.BTC);
    console.log('🌐 Pyth REST API:', this.PYTH_API_URL);
    console.log('🔌 Binance WebSocket:', this.BINANCE_WS_URL);
    
    // Start all price sources
    this.startBinanceWebSocket();
    this.startPythPolling();
    this.startHybridPriceUpdates();
    
    // Fetch initial prices
    this.fetchInitialPrices();
  }
  
  // Start Binance WebSocket for real-time updates
  private startBinanceWebSocket() {
    try {
      console.log('🔌 Connecting to Binance WebSocket...');
      
      this.binanceWs = new WebSocket(this.BINANCE_WS_URL);
      
      this.binanceWs.on('open', () => {
        console.log('✅ Binance WebSocket connected!');
        this.reconnectAttempts = 0;
      });
      
      this.binanceWs.on('message', (data: Buffer) => {
        try {
          const trade = JSON.parse(data.toString());
          const price = parseFloat(trade.p);
          
          if (price > 0 && price < 1000000) { // Sanity check
            this.lastBinancePrice = price;
            
            // Update cache with Binance price
            this.priceCache.set('BTC_BINANCE', {
              price,
              timestamp: Date.now(),
              source: 'binance'
            });
          }
        } catch (error) {
          console.error('Error parsing Binance data:', error);
        }
      });
      
      this.binanceWs.on('error', (error: Error) => {
        console.error('❌ Binance WebSocket error:', error.message);
      });
      
      this.binanceWs.on('close', () => {
        console.log('🔄 Binance WebSocket disconnected, reconnecting...');
        
        // Exponential backoff for reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          
          setTimeout(() => {
            this.startBinanceWebSocket();
          }, delay);
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
  
  // Pyth polling for reliable price (every 5 seconds)
  private startPythPolling() {
    // Initial fetch
    this.fetchPythPrice();
    
    // Then poll every 5 seconds
    this.updateInterval = setInterval(async () => {
      await this.fetchPythPrice();
    }, 5000);
    
    console.log('🔄 Started Pyth polling every 5 seconds');
  }
  
  // Fetch latest BTC price using official Pyth REST API
  private async fetchPythPrice() {
    try {
      const response = await axios.get(this.PYTH_API_URL, {
        params: {
          'ids[]': this.PRICE_FEED_IDS.BTC
        },
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PulseCrypto-PythClient/1.0'
        }
      });
      
      if (response.data && response.data.parsed && Array.isArray(response.data.parsed)) {
        const parsed = response.data.parsed as PythPriceData[];
        
        if (parsed.length > 0) {
          const btcPriceData = parsed.find(item => 
            item.id === this.PRICE_FEED_IDS.BTC.replace('0x', '')
          ) || parsed[0];
          
          if (btcPriceData && btcPriceData.price) {
            const rawPrice = parseInt(btcPriceData.price.price);
            const exponent = btcPriceData.price.expo;
            const price = rawPrice * Math.pow(10, exponent);
            const publishTime = btcPriceData.price.publish_time * 1000;
            
            if (price > 1000 && price < 1000000) { // Sanity check for BTC price
              this.lastPythPrice = price;
              
              this.priceCache.set('BTC_PYTH', {
                price,
                timestamp: publishTime,
                source: 'pyth'
              });
              
              // Store in database occasionally (every minute)
              if (Date.now() % 60000 < 5000) {
                this.savePriceToDatabase('BTC', price, publishTime);
              }
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ Pyth API Error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      } else if (error instanceof Error) {
        console.error('❌ Unexpected error fetching Pyth price:', error.message);
      } else {
        console.error('❌ Unknown error fetching Pyth price:', error);
      }
    }
  }
  
  // Hybrid price update system - combines both sources every 250ms
  private startHybridPriceUpdates() {
    // Update every 250ms using interpolation and combination
    this.priceUpdateTimer = setInterval(() => {
      const hybridPrice = this.calculateHybridPrice();
      
      if (hybridPrice > 0) {
        // Add micro-movements for realism (very small variations)
        const microMovement = (Math.random() - 0.5) * 0.50; // ±$0.25 max
        const finalPrice = parseFloat((hybridPrice + microMovement).toFixed(2));
        
        // Update main cache
        this.priceCache.set('BTC', {
          price: finalPrice,
          timestamp: Date.now(),
          source: 'hybrid'
        });
        
        // Emit price update event for Socket.IO
        this.emit('price:update', {
          symbol: 'BTC',
          price: finalPrice,
          timestamp: Date.now(),
          source: 'hybrid',
          binancePrice: this.lastBinancePrice,
          pythPrice: this.lastPythPrice,
          confidence: this.calculateConfidence()
        });
      }
    }, 250); // Every 250ms for smooth updates
    
    console.log('⚡ Started hybrid price updates every 250ms');
  }
  
  // Calculate hybrid price using weighted average
  private calculateHybridPrice(): number {
    let totalPrice = 0;
    let totalWeight = 0;
    
    // Get Binance price (higher weight for real-time)
    const binanceData = this.priceCache.get('BTC_BINANCE');
    if (binanceData && (Date.now() - binanceData.timestamp) < 3000) { // Fresh if < 3 seconds
      totalPrice += binanceData.price * 0.7; // 70% weight
      totalWeight += 0.7;
    } else if (this.lastBinancePrice > 0) {
      // Use last known Binance price with reduced weight
      totalPrice += this.lastBinancePrice * 0.5;
      totalWeight += 0.5;
    }
    
    // Get Pyth price (lower weight but reliable)
    const pythData = this.priceCache.get('BTC_PYTH');
    if (pythData && (Date.now() - pythData.timestamp) < 10000) { // Fresh if < 10 seconds
      totalPrice += pythData.price * 0.3; // 30% weight
      totalWeight += 0.3;
    } else if (this.lastPythPrice > 0) {
      // Use last known Pyth price with reduced weight
      totalPrice += this.lastPythPrice * 0.2;
      totalWeight += 0.2;
    }
    
    // Calculate weighted average
    if (totalWeight > 0) {
      return totalPrice / totalWeight;
    }
    
    // Fallback to any available price
    return this.lastBinancePrice || this.lastPythPrice || 65000;
  }
  
  // Calculate confidence level based on data freshness
  private calculateConfidence(): number {
    let confidence = 0;
    
    const binanceData = this.priceCache.get('BTC_BINANCE');
    const pythData = this.priceCache.get('BTC_PYTH');
    
    if (binanceData && (Date.now() - binanceData.timestamp) < 1000) {
      confidence += 50;
    }
    
    if (pythData && (Date.now() - pythData.timestamp) < 5000) {
      confidence += 50;
    }
    
    return confidence;
  }
  
  // Fetch initial prices from both sources
  private async fetchInitialPrices() {
    console.log('📡 Fetching initial prices...');
    
    // Fetch from Pyth
    await this.fetchPythPrice();
    
    // Fetch from Binance REST API as backup
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/price', {
        params: { symbol: 'BTCUSDT' },
        timeout: 5000
      });
      
      const price = parseFloat(response.data.price);
      
      if (price > 0) {
        this.lastBinancePrice = price;
        this.priceCache.set('BTC_BINANCE', {
          price,
          timestamp: Date.now(),
          source: 'binance'
        });
        
        console.log(`💰 Initial Binance BTC Price: $${price.toFixed(2)}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching initial Binance price:', error.message);
      } else if (error instanceof Error) {
        console.error('Error fetching initial Binance price:', error.message);
      } else {
        console.error('Error fetching initial Binance price:', String(error));
      }
    }
    
    // Set initial hybrid price
    const hybridPrice = this.calculateHybridPrice();
    if (hybridPrice > 0) {
      this.priceCache.set('BTC', {
        price: hybridPrice,
        timestamp: Date.now(),
        source: 'hybrid'
      });
    }
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
    const hybridPrice = this.calculateHybridPrice();
    
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
    const defaultPrice = { 
      price: this.lastBinancePrice || this.lastPythPrice || 111443.50, 
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
    const btcPrice = this.priceCache.get('BTC');
    const binanceData = this.priceCache.get('BTC_BINANCE');
    const pythData = this.priceCache.get('BTC_PYTH');
    
    return {
      cachedSymbols: Array.from(this.priceCache.keys()),
      lockedPricesCount: this.lockedPrices.size,
      hybridPrice: btcPrice?.price,
      binancePrice: this.lastBinancePrice,
      pythPrice: this.lastPythPrice,
      lastUpdate: btcPrice?.timestamp ? new Date(btcPrice.timestamp).toISOString() : null,
      priceAge: btcPrice ? Date.now() - btcPrice.timestamp : null,
      binanceAge: binanceData ? Date.now() - binanceData.timestamp : null,
      pythAge: pythData ? Date.now() - pythData.timestamp : null,
      confidence: this.calculateConfidence()
    };
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