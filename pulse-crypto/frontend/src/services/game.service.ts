import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Game Service
const gameService = {
  // Create a new bet
  createBet: async (betData) => {
    try {
      const response = await api.post('/api/game/bet', betData);
      return response.data;
    } catch (error) {
      console.error('Error creating bet:', error);
      throw error;
    }
  },

  // Start matchmaking
  startMatchmaking: async (betId, matchData) => {
    try {
      const response = await api.post(`/api/game/bet/${betId}/match`, matchData);
      return response.data;
    } catch (error) {
      console.error('Error in matchmaking:', error);
      throw error;
    }
  },

  // Start game after countdown
  startGame: async (betId) => {
    try {
      const response = await api.post(`/api/game/bet/${betId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  },

  // Cancel a bet
  cancelBet: async (betId) => {
    try {
      const response = await api.post(`/api/game/bet/${betId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling bet:', error);
      throw error;
    }
  },

  // Get user's bet history
  getUserBets: async (userId, limit = 20) => {
    try {
      const response = await api.get(`/api/game/user/${userId}/bets`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user bets:', error);
      throw error;
    }
  },

  // Get queue status
  getQueueStatus: async () => {
    try {
      const response = await api.get('/api/game/queue/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching queue status:', error);
      throw error;
    }
  }
};

export default gameService;