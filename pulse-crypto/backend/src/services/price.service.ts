import axios from 'axios';
import PriceRecord from '../models/price.model';

// Price cache interface
interface PriceCache {
  price: number;
  timestamp: number;
}

// Price manager class with rate limit handling
class PriceManager {
  private priceCache: Map<string, PriceCache>;
  private updateInterval: NodeJS.Timeout | null;
  private lastRequestTime: number = 0;
  private retryDelay: number = 0;
  private isRateLimited: boolean = false;
  private useBackupPrice: boolean = false;
  
  constructor() {
    this.priceCache = new Map();
    this.updateInterval = null;
    
    // Initialize with default BTC price
    this.priceCache.set('BTC', {
      price: 62500,
      timestamp: Date.now()
    });
    
    // Start price update loop
    this.startPriceUpdates();
  }
  
  // Start the price update loop
  private startPriceUpdates() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(async () => {
      try {
        // Check if we're still in the rate limit cooldown period
        if (this.isRateLimited) {
          const currentTime = Date.now();
          if (currentTime - this.lastRequestTime < this.retryDelay) {
            console.log(`Rate limited. Waiting ${Math.ceil((this.retryDelay - (currentTime - this.lastRequestTime))/1000)}s before retry`);
            return;
          }
          this.isRateLimited = false;
        }
        
        // Fetch BTC price from API
        await this.fetchBTCPrice();
      } catch (error) {
        console.error('Error updating price:', error);
      }
    }, 5000); // Update every 5 seconds
  }
  
  // Stop the price update loop
  public stopPriceUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
  
  // Fetch BTC price from CoinGecko API with rate limit handling
  private async fetchBTCPrice() {
    try {
      this.lastRequestTime = Date.now();
      
      // Alternate between APIs if we've had rate limit issues
      if (this.useBackupPrice) {
        return await this.fetchBTCPriceBackup();
      }
      
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'bitcoin',
          vs_currencies: 'usd',
          include_last_updated_at: true
        },
        timeout: 5000 // 5 second timeout
      });
      
      if (response.data && response.data.bitcoin) {
        const price = response.data.bitcoin.usd;
        const timestamp = response.data.bitcoin.last_updated_at * 1000 || Date.now();
        
        // Update the cache
        this.priceCache.set('BTC', { price, timestamp });
        
        // Store in database every minute
        if (Date.now() % 60000 < 5000) {
          this.savePriceToDatabase('BTC', price, timestamp);
        }
        
        // Reset backup flag on success
        this.useBackupPrice = false;
        
        return { price, timestamp };
      }
      
      throw new Error('Invalid response from CoinGecko API');
    } catch (error: any) {
      // Handle rate limit error (HTTP 429)
      if (error.response && error.response.status === 429) {
        console.log('Rate limited by CoinGecko API');
        
        // Get retry delay from header or use default (60 seconds)
        const retryAfter = error.response.headers['retry-after'];
        this.retryDelay = (retryAfter ? parseInt(retryAfter) : 60) * 1000;
        this.isRateLimited = true;
        
        // Switch to backup price source for next attempt
        this.useBackupPrice = true;
        
        // Return cached price
        return this.getLatestPrice('BTC');
      }
      
      console.error('Error fetching BTC price from CoinGecko:', error);
      
      // Try backup on any error
      this.useBackupPrice = true;
      
      // Return from cache
      return this.getLatestPrice('BTC');
    }
  }
  
  // Backup price source
  private async fetchBTCPriceBackup() {
    try {
      // Using CryptoCompare as a backup API
      const response = await axios.get('https://min-api.cryptocompare.com/data/price', {
        params: {
          fsym: 'BTC',
          tsyms: 'USD'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.USD) {
        const price = response.data.USD;
        const timestamp = Date.now();
        
        // Update the cache
        this.priceCache.set('BTC', { price, timestamp });
        
        // Store in database every minute
        if (Date.now() % 60000 < 5000) {
          this.savePriceToDatabase('BTC', price, timestamp);
        }
        
        console.log('Using backup price source:', price);
        return { price, timestamp };
      }
      
      throw new Error('Invalid response from backup API');
    } catch (error) {
      console.error('Error fetching BTC price from backup source:', error);
      return this.getLatestPrice('BTC');
    }
  }
  
  // Generate synthetic price data when API fails
  private generateSyntheticPrice() {
    const currentPrice = this.priceCache.get('BTC');
    if (!currentPrice) {
      return { price: 62500, timestamp: Date.now() };
    }
    
    // Create small random movement from last price (±0.5%)
    const randomChange = (Math.random() - 0.5) * 0.01 * currentPrice.price;
    const newPrice = Math.max(1, currentPrice.price + randomChange);
    
    return {
      price: newPrice,
      timestamp: Date.now()
    };
  }
  
  // Save price to database
  private async savePriceToDatabase(symbol: string, price: number, timestamp: number) {
    try {
      const priceRecord = new PriceRecord({
        timestamp: new Date(timestamp),
        symbol,
        price,
        source: this.useBackupPrice ? 'cryptocompare' : 'coingecko'
      });
      
      await priceRecord.save();
    } catch (error) {
      console.error('Error saving price to database:', error);
    }
  }
  
  // Get the latest price for a symbol
  public getLatestPrice(symbol: string): PriceCache {
    // Get from cache
    const cachedPrice = this.priceCache.get(symbol);
    
    // If we have cached price
    if (cachedPrice) {
      // If the cache is recent (less than 3 minutes old), return it directly
      if (Date.now() - cachedPrice.timestamp < 180000) {
        return cachedPrice;
      }
      
      // If price is stale but not too old, trigger a fetch but return what we have
      if (Date.now() - cachedPrice.timestamp < 3600000) { // Less than 1 hour old
        // Don't await - just trigger background update
        if (!this.isRateLimited) {
          this.fetchBTCPrice();
        }
        return cachedPrice;
      }
      
      // If very stale, generate synthetic movement and return it
      const syntheticPrice = this.generateSyntheticPrice();
      this.priceCache.set(symbol, syntheticPrice);
      
      // Trigger a real update if not rate limited
      if (!this.isRateLimited) {
        this.fetchBTCPrice();
      }
      
      return syntheticPrice;
    }
    
    // If we don't have a price, return a default and trigger a fetch
    const defaultPrice = { price: 62500, timestamp: Date.now() };
    this.priceCache.set(symbol, defaultPrice);
    
    if (!this.isRateLimited) {
      this.fetchBTCPrice();
    }
    
    return defaultPrice;
  }
}

// Singleton instance
let priceManagerInstance: PriceManager | null = null;

// Get or create the price manager
export const getPriceManager = (): PriceManager => {
  if (!priceManagerInstance) {
    priceManagerInstance = new PriceManager();
  }
  return priceManagerInstance;
};

// Clean up on process exit
process.on('SIGINT', () => {
  if (priceManagerInstance) {
    priceManagerInstance.stopPriceUpdates();
  }
  process.exit(0);
});