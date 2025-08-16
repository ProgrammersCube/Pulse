import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://creative-communication-production.up.railway.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get current BTC price
export const getBTCPrice = async () => {
  try {
    const response = await api.get('/api/price/current');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    throw error;
  }
};

// Get historical BTC prices
export const getHistoricalPrices = async (timeframe: string = '1h') => {
  try {
    const response = await api.get('/api/price/historical', {
      params: {
        symbol: 'BTC',
        timeframe
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching historical prices:', error);
    throw error;
  }
};
