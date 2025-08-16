import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://creative-communication-production.up.railway.app/';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// // Game Service
// const gameService = {
//   // Create a new bet
//   createBet: async (betData:any) => {
//     try {
//       const response = await api.post('/api/game/bet', betData);
//       return response.data;
//     } catch (error) {
//       console.error('Error creating bet:', error);
//       throw error;
//     }
//   },

//   // Start matchmaking
//   startMatchmaking: async (betId:any, matchData:any) => {
//     try {
//       const response = await api.post(`/api/game/bet/${betId}/match`, matchData);
//       return response.data;
//     } catch (error) {
//       console.error('Error in matchmaking:', error);
//       throw error;
//     }
//   },

//   // Start game after countdown
//   startGame: async (betId) => {
//     try {
//       const response = await api.post(`/api/game/bet/${betId}/start`);
//       return response.data;
//     } catch (error) {
//       console.error('Error starting game:', error);
//       throw error;
//     }
//   },

//   // Cancel a bet
//   cancelBet: async (betId) => {
//     try {
//       const response = await api.post(`/api/game/bet/${betId}/cancel`);
//       return response.data;
//     } catch (error) {
//       console.error('Error cancelling bet:', error);
//       throw error;
//     }
//   },

//   // Get user's bet history
//   getUserBets: async (userId, limit = 20) => {
//     try {
//       const response = await api.get(`/api/game/user/${userId}/bets`, {
//         params: { limit }
//       });
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching user bets:', error);
//       throw error;
//     }
//   },

//   // Get queue status
//   getQueueStatus: async () => {
//     try {
//       const response = await api.get('/api/game/queue/status');
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching queue status:', error);
//       throw error;
//     }
//   }
// };
//updated gameService
const gameService = {
  // Create a new bet
  createBet: async (betData:any) => {
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
      console.log("match making api called")
      const response = await api.post(`/api/game/bet/${betId}/match`, matchData);
      return response.data;
    } catch (error) {
      console.error('Error in matchmaking:', error);
      throw error;
    }
  },

  // Start game after countdown
  startGame: async (betId:any) => {
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
  },

  // Get bet status
  getBetStatus: async (betId) => {
    try {
      console.log(`🔄 Fetching status for bet ${betId}...`);
      const response = await api.get(`/api/game/bet/${betId}`);
      console.log('✅ Bet status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting bet status:', error);
      // Return a default status object if the bet is not found
      if (error.response && error.response.status === 404) {
        console.log('Bet not found, returning default status');
        return { 
          success: true, 
          data: { 
            betId,
            status: 'NOT_FOUND',
            error: 'Bet not found'
          } 
        };
      }
      throw error;
    }
  },

  // Complete a game
  completeGame: async (betId, bet) => {
    try {
      console.log(`🔄 Completing game ${betId}...`);
      
      // First, check if bet is already completed to avoid the error
      try {
        const statusResponse = await gameService.getBetStatus(betId);
        if (statusResponse.data?.status === 'COMPLETED') {
          console.log('✅ Bet already completed, returning existing result');
          // Return existing completed data if available
          const existingBet = statusResponse.data;
          return {
            success: true,
            data: {
              betId: existingBet.betId,
              result: existingBet.result,
              finalPrice: existingBet.finalPrice,
              lockedPrice: existingBet.lockedPrice,
              payout: existingBet.payout || 0,
              fee: existingBet.fee || 0,
              amount: existingBet.amount,
              balanceChange: existingBet.balanceChange || 0,
              realWalletUpdate: true,
              transactionSignature: existingBet.transactionSignature || '',
              winner: existingBet.winner,
              loser: existingBet.loser,
              timestamp: existingBet.timestamp || new Date().toISOString(),
              priceChange: {
                amount: (existingBet.finalPrice || 0) - (existingBet.lockedPrice || 0),
                percentage: existingBet.lockedPrice ? 
                  (((existingBet.finalPrice || 0) - (existingBet.lockedPrice || 0)) / (existingBet.lockedPrice || 1) * 100).toFixed(2) : 
                  '0.00',
                direction: (existingBet.finalPrice || 0) >= (existingBet.lockedPrice || 0) ? 'UP' : 'DOWN'
              }
            }
          };
        }
      } catch (statusError) {
        console.log('Could not check bet status, proceeding with completion...', statusError.message);
      }
      
      // Try to complete the game
      const response = await api.post(`/api/game/bet/${betId}/complete`);
      console.log('✅ Game completion response:', response.data);
      
      // Parse the actual backend response structure
      const responseData = response.data;
      if (!responseData || !responseData.success || !responseData.data) {
        console.error('Invalid response format from server:', responseData);
        throw new Error('Invalid response from server');
      }
      
      const { bet: betData, winner, loser, winAmount = 0, fee = 0 } = responseData.data;
      console.log('📊 Game result from backend:', responseData.data);
      
      if (!betData) {
        console.error('No bet data in response:', responseData);
        throw new Error('No bet data received');
      }
      
      // Extract prices with proper fallbacks
      const lockedPrice = parseFloat(betData.lockedPrice || bet?.lockedPrice || 0);
      const finalPrice = parseFloat(betData.finalPrice || bet?.lockedPrice || 0);
      
      // Calculate price change with safety checks
      const priceChange = parseFloat((finalPrice - lockedPrice).toFixed(8));
      const priceChangePercent = lockedPrice !== 0 
        ? ((priceChange / lockedPrice) * 100).toFixed(2)
        : '0.00';
      
      // Determine user's result using the backend winner/loser data
      const userId = bet?.userId || '';
      const isWinner = winner === userId;
      const isLoser = loser === userId;
      
      let result = 'DRAW';
      if (isWinner) {
        result = 'WIN';
        console.log('🎉 User won the game!');
      } else if (isLoser) {
        result = 'LOSS';
        console.log('😢 User lost the game');
      } else {
        console.log('🤝 Game ended in a draw');
      }
      
      // Calculate balance change based on result
      const betAmount = parseFloat(bet?.amount || betData.amount || 0);
      const payout = parseFloat(winAmount || betData.payout || 0);
      const feeAmount = parseFloat(fee || betData.fee || 0);
      
      let balanceChange = 0;
      if (isWinner) {
        // User won: get payout minus fee
        balanceChange = payout;
      } else if (isLoser) {
        // User lost: lose the bet amount
        balanceChange = -betAmount;
      } else {
        // Draw: no change (bet returned)
        balanceChange = 0;
      }
      
      // Get transaction signatures
      const payoutTransferSignature = betData.metadata?.payoutTransferSignature || '';
      const transferToHouseSignature = betData.metadata?.transferToHouseSignature || '';
      const transactionSignature = payoutTransferSignature || transferToHouseSignature || '';
      
      // Format the game result for the UI
      const uiGameResult = {
        betId: betData.betId || betId,
        result: result,
        finalPrice: finalPrice,
        lockedPrice: lockedPrice,
        priceChange: {
          amount: priceChange,
          percentage: priceChangePercent,
          direction: priceChange >= 0 ? 'UP' : 'DOWN'
        },
        payout: payout,
        fee: feeAmount,
        amount: betAmount,
        balanceChange: balanceChange,
        realWalletUpdate: true,
        transactionSignature: transactionSignature,
        payoutTransferSignature: payoutTransferSignature,
        transferToHouseSignature: transferToHouseSignature,
        winner: winner || null,
        loser: loser || null,
        timestamp: betData.finalizedAt || new Date().toISOString(),
        // Include additional bet data for debugging
        betData: {
          direction: betData.direction,
          amount: betData.amount,
          token: betData.token,
          duration: betData.duration,
          status: betData.status,
          result: betData.result,
          isHouseBot: betData.isHouseBot
        }
      };
      
      console.log('📊 Formatted UI game result:', uiGameResult);
      return { success: true, data: uiGameResult };
      
    } catch (error) {
      console.error('❌ Error completing game:', error);
      
      // Check if this is a "Bet not found or not in progress" error
      const isBetNotFound = error.response?.data?.error?.includes('Bet not found') || 
                          error.response?.data?.error?.includes('not in progress') ||
                          error.message?.includes('Bet not found');
      
      if (isBetNotFound) {
        console.log('Bet already completed or not found, checking user bets...');
        try {
          // Try to get the latest bet status from user's bet history
          const response = await gameService.getUserBets(bet?.userId, 10);
          if (response.success && response.data) {
            const completedBet = response.data.find(b => b.betId === betId && b.status === 'COMPLETED');
            
            if (completedBet) {
              console.log('Found completed bet in user history:', completedBet);
              
              // Calculate balance change for completed bet
              const isUserWinner = completedBet.result === 'WIN';
              const isUserLoser = completedBet.result === 'LOSS';
              
              let balanceChange = 0;
              if (isUserWinner) {
                balanceChange = completedBet.payout || 0;
              } else if (isUserLoser) {
                balanceChange = -(completedBet.amount || 0);
              }
              
              return {
                success: true,
                data: {
                  betId: completedBet.betId,
                  result: completedBet.result,
                  finalPrice: completedBet.finalPrice || bet?.lockedPrice || 0,
                  lockedPrice: completedBet.lockedPrice || bet?.lockedPrice || 0,
                  priceChange: {
                    amount: (completedBet.finalPrice || 0) - (completedBet.lockedPrice || 0),
                    percentage: completedBet.lockedPrice ? 
                      (((completedBet.finalPrice || 0) - (completedBet.lockedPrice || 0)) / completedBet.lockedPrice * 100).toFixed(2) : 
                      '0.00',
                    direction: (completedBet.finalPrice || 0) >= (completedBet.lockedPrice || 0) ? 'UP' : 'DOWN'
                  },
                  payout: completedBet.payout || 0,
                  fee: completedBet.fee || 0,
                  amount: completedBet.amount || bet?.amount || 0,
                  balanceChange: balanceChange,
                  realWalletUpdate: true,
                  transactionSignature: completedBet.transactionSignature || '',
                  winner: completedBet.winner,
                  loser: completedBet.loser,
                  timestamp: completedBet.finalizedAt || new Date().toISOString()
                }
              };
            }
          }
        } catch (statusError) {
          console.error('Error getting user bets:', statusError);
        }
      }
      
      // Fallback to default error response
      const finalPrice = bet?.lockedPrice || 0;
      const priceChange = 0;
      const priceChangePercent = '0.00';
      
      return {
        success: false,
        data: {
          betId: betId,
          result: 'DRAW',
          finalPrice: finalPrice,
          lockedPrice: bet?.lockedPrice || 0,
          priceChange: {
            amount: priceChange,
            percentage: priceChangePercent,
            direction: 'NONE'
          },
          payout: 0,
          fee: 0,
          amount: bet?.amount || 0,
          balanceChange: 0,
          realWalletUpdate: false,
          transactionSignature: '',
          winner: null,
          loser: null,
          timestamp: new Date().toISOString()
        },
        error: isBetNotFound 
          ? 'This game has already been completed. Showing latest result.' 
          : 'Failed to complete game. Please try again.'
      };
    }
  },

  // Validate bet before processing
  validateBet: async (token, amount) => {
    try {
      console.log(`🔍 Validating bet: ${amount} ${token}`);
      const response = await api.post('/api/game/bet/validate', { token, amount });
      console.log('✅ Bet validation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error validating bet:', error);
      throw error;
    }
  },

  // ... existing methods ...
};
export default gameService;