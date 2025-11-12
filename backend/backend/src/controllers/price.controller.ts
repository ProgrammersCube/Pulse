import { Request, Response } from 'express';
import axios from 'axios';
import PriceRecord from '../models/price.model';
import { getPythPriceManager } from '../services/price.service'; // Updated import

// Get current BTC price
export const getCurrentPrice = async (req: Request, res: Response) => {
  try {
    if(!process.env.JWT_SECRET) {
      res.status(401).json({ success: false, message: 'JWT_SECRET must be defined in .env file' });
      return;
    }
    const priceManager = getPythPriceManager(); // Updated function name
    const btcPrice = priceManager.getLatestPrice('BTC');
    
    return res.status(200).json({
      success: true,
      data: {
        symbol: 'BTC',
        price: btcPrice.price,
        timestamp: btcPrice.timestamp
      }
    });
  } catch (error) {
    console.error('Error in getCurrentPrice:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get historical prices
export const getHistoricalPrices = async (req: Request, res: Response) => {
  try {
    const { symbol, timeframe } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Symbol is required'
      });
    }
    
    // Calculate the start time based on the timeframe
    let startTime = new Date();
    switch (timeframe) {
      case '1h':
        startTime.setHours(startTime.getHours() - 1);
        break;
      case '24h':
        startTime.setHours(startTime.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(startTime.getDate() - 7);
        break;
      default:
        // Default to 1 hour
        startTime.setHours(startTime.getHours() - 1);
    }
    
    // Get historical prices
    const prices = await PriceRecord.find({
      symbol: symbol,
      timestamp: { $gte: startTime }
    })
    .sort({ timestamp: 1 })
    .lean();
    
    return res.status(200).json({
      success: true,
      data: prices.map(p => ({
        price: p.price,
        timestamp: p.timestamp
      }))
    });
  } catch (error) {
    console.error('Error in getHistoricalPrices:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Lock price for a bet
export const lockPrice = async (req: Request, res: Response) => {
  try {
    const { symbol, userId, betId } = req.body;
    
    if (!symbol || !userId || !betId) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, userId, and betId are required'
      });
    }
    
    const priceManager = getPythPriceManager(); // Updated function name
    const lockedPrice = priceManager.lockPrice({ symbol, userId, betId });
    
    return res.status(200).json({
      success: true,
      data: lockedPrice
    });
  } catch (error) {
    console.error('Error in lockPrice:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get locked price for a bet
export const getLockedPrice = async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;
    
    if (!betId) {
      return res.status(400).json({
        success: false,
        message: 'Bet ID is required'
      });
    }
    
    const priceManager = getPythPriceManager(); // Updated function name
    const lockedPrice = priceManager.getLockedPrice(betId);
    
    if (!lockedPrice) {
      return res.status(404).json({
        success: false,
        message: 'Locked price not found or expired'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: lockedPrice
    });
  } catch (error) {
    console.error('Error in getLockedPrice:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get price for any token using Pyth feed ID (now uses hybrid oracle)
export const getTokenPriceByFeedId = async (req: Request, res: Response) => {
  try {
    const { pythFeedId, symbol } = req.query;
    
    if (!pythFeedId || typeof pythFeedId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Pyth feed ID is required'
      });
    }

    const priceManager = getPythPriceManager();
    
    // If symbol is provided, try to get from hybrid manager first
    if (symbol && typeof symbol === 'string') {
      const tokenConfig = priceManager.getRegisteredTokens().find(t => t.symbol === symbol.toUpperCase());
      
      if (tokenConfig && tokenConfig.pythFeedId === pythFeedId) {
        // Token is registered, use hybrid price
        const priceData = priceManager.getLatestPrice(symbol.toUpperCase());
        
        if (priceData && priceData.price > 0) {
          return res.status(200).json({
            success: true,
            data: {
              price: priceData.price,
              timestamp: priceData.timestamp,
              symbol: symbol.toUpperCase(),
              source: priceData.source || 'hybrid'
            }
          });
        }
      }
    }
    
    // Fallback: Fetch directly from Pyth API (for unregistered tokens or initial registration)
    const PYTH_API_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
    const response = await axios.get(PYTH_API_URL, {
      params: {
        'ids[]': pythFeedId
      },
      timeout: 5000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PulseCrypto-PythClient/1.0'
      }
    });

    if (response.data && response.data.parsed && Array.isArray(response.data.parsed)) {
      const parsed = response.data.parsed;
      if (parsed.length > 0) {
        const priceData = parsed[0];
        if (priceData && priceData.price) {
          const rawPrice = parseInt(priceData.price.price);
          const exponent = priceData.price.expo;
          const price = rawPrice * Math.pow(10, exponent);
          const publishTime = priceData.price.publish_time * 1000;

          return res.status(200).json({
            success: true,
            data: {
              price,
              timestamp: publishTime,
              symbol: symbol?.toString().toUpperCase() || 'UNKNOWN',
              source: 'pyth'
            }
          });
        }
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Price data not found'
    });
  } catch (error) {
    console.error('Error in getTokenPriceByFeedId:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Verify if a Pyth feed ID is valid
export const verifyPythToken = async (req: Request, res: Response) => {
  try {
    const { symbol, pythFeedId } = req.body;
    
    if (!symbol || !pythFeedId) {
      return res.status(400).json({
        success: false,
        message: 'Symbol and Pyth feed ID are required',
        valid: false
      });
    }

    // Validate feed ID format (should be a hex string, typically 64 characters)
    const feedIdPattern = /^0x[a-fA-F0-9]{64}$/;
    if (!feedIdPattern.test(pythFeedId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Pyth feed ID format. Expected format: 0x followed by 64 hex characters',
        valid: false
      });
    }

    // Call Pyth API to verify the feed ID
    const PYTH_API_URL = 'https://hermes.pyth.network/v2/updates/price/latest';
    
    try {
      const response = await axios.get(PYTH_API_URL, {
        params: {
          'ids[]': pythFeedId
        },
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PulseCrypto-PythClient/1.0'
        }
      });

      if (response.data && response.data.parsed && Array.isArray(response.data.parsed)) {
        const parsed = response.data.parsed;
        
        if (parsed.length > 0) {
          const priceData = parsed[0];
          
          if (priceData && priceData.price) {
            const rawPrice = parseInt(priceData.price.price);
            const exponent = priceData.price.expo;
            const price = rawPrice * Math.pow(10, exponent);
            const publishTime = priceData.price.publish_time * 1000;
            const confidence = parseFloat(priceData.price.conf) * Math.pow(10, exponent);

            const tokenSymbol = symbol.toUpperCase();

            return res.status(200).json({
              success: true,
              valid: true,
              message: `Token ${tokenSymbol} verified successfully on Pyth Network`,
              data: {
                symbol: tokenSymbol,
                pythFeedId: pythFeedId,
                price: price,
                confidence: confidence,
                publishTime: publishTime,
                timestamp: new Date(publishTime).toISOString(),
                exponent: exponent
              }
            });
          }
        }
      }

      // Feed ID exists but no price data available
      return res.status(200).json({
        success: true,
        valid: false,
        message: `Pyth feed ID exists but no price data is currently available`,
        data: {
          symbol: symbol.toUpperCase(),
          pythFeedId: pythFeedId
        }
      });

    } catch (axiosError: any) {
      // Handle specific error cases
      if (axiosError.response) {
        // Pyth API returned an error
        if (axiosError.response.status === 404 || axiosError.response.status === 400) {
          return res.status(200).json({
            success: true,
            valid: false,
            message: `Pyth feed ID not found or invalid`,
            data: {
              symbol: symbol.toUpperCase(),
              pythFeedId: pythFeedId
            }
          });
        }
      }

      // Network or timeout error
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return res.status(500).json({
          success: false,
          valid: false,
          message: 'Timeout while connecting to Pyth Network. Please try again.',
          error: 'Connection timeout'
        });
      }

      throw axiosError;
    }

  } catch (error) {
    console.error('Error in verifyPythToken:', error);
    return res.status(500).json({
      success: false,
      valid: false,
      message: 'Server error while verifying token',
      error: (error as Error).message
    });
  }
};