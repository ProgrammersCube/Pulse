import { Request, Response } from 'express';
import PriceRecord from '../models/price.model';
import { getPriceManager } from '../services/price.service';

// Get current BTC price
export const getCurrentPrice = async (req: Request, res: Response) => {
  try {
    const priceManager = getPriceManager();
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
