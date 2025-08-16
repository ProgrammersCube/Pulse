import { Request, Response } from 'express';
import { getGameService } from '../services/game.service';
import { getMatchmakingService } from '../services/matchmaking.service';
import Bet, { BetDirection, BetStatus } from '../models/bet.model';
import { getBlockchainService } from '../services/blockchain.service';
import Settings from '../models/settings.model';

// Create a new bet
export const createBet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, direction, amount, token, duration,transactionSignature } = req.body;
    
    // Validate required fields
    if (!userId || !direction || !amount || !token || !duration) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }
    
    // Validate direction
    if (!Object.values(BetDirection).includes(direction)) {
      res.status(400).json({
        success: false,
        message: 'Invalid direction. Must be UP or DOWN'
      });
      return;
    }
    
    // Validate duration
    if (duration < 10 || duration > 60) {
      res.status(400).json({
        success: false,
        message: 'Duration must be between 10 and 60 seconds'
      });
      return;
    }
    
    const gameService = getGameService();
    try {
      const bet = await gameService.createBet({
        userId,
        direction,
        amount,
        token,
        duration,
        transactionSignature
      });
      res.status(200).json({
        success: true,
        data: bet
      });
    } catch (err: any) {
      // User-action errors (like disabled token, out-of-limit, etc.)
      res.status(400).json({
        success: false,
        message: err.message || 'Bet could not be created. Please check your input.'
      });
    }
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    });
  }
};

// Add this new endpoint in game.controller.ts
export const checkSystemStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const blockchainService = getBlockchainService();
    const houseWalletAddress = process.env.HOUSE_WALLET_ADDRESS;
    
    if (!houseWalletAddress) {
      res.status(500).json({
        success: false,
        message: 'Service configuration error'
      });
      return;
    }
    
    // Check house balances
    const tokens = ['BeTyche', 'SOL', 'RADBRO'];
    const balances: any = {};
    let canBet = true;
    
    for (const token of tokens) {
      const balance = await blockchainService.getRealBalance(houseWalletAddress, token);
      const minRequired = 0.0001; // Minimum amount
      balances[token] = balance;
      
      if (balance < minRequired) {
        canBet = false;
      }
    }
    
    res.status(200).json({
      success: true,
      canBet,
      balances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check system status'
    });
  }
};

// Start matchmaking for a bet
// export const startMatchmaking = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { betId } = req.params;
//     const { userId, direction, amount, token, duration } = req.body;
    
//     const matchmakingService = getMatchmakingService();
//     const matchedBet = await matchmakingService.findMatch({
//       userId,
//       betId,
//       direction,
//       amount,
//       token,
//       duration
//     });
    
//     res.status(200).json({
//       success: true,
//       data: {
//         bet: matchedBet,
//         matched: true,
//         opponent: matchedBet.opponentId,
//         isHouseBot: matchedBet.isHouseBot
//       }
//     });
//   } catch (error) {
//     console.error('Error in matchmaking:', error);
//     res.status(500).json({
//       success: false,
//       message: (error as Error).message
//     });
//   }
// };


// Start matchmaking for a bet
export const startMatchmaking = async (req: Request, res: Response) => {
  try {
    const { betId } = req.params;
    const { userId, direction, amount, token, duration } = req.body;
    
    const matchmakingService = getMatchmakingService();
    const matchRequest={userId,direction,amount,token,duration,betId}
    const findOpponentMatch=await matchmakingService.findMatch(matchRequest)
    console.log(findOpponentMatch)
    if(!findOpponentMatch)
    {
      console.log("come here")
      console.log(betId)
       // Directly match with house bot
  const bet = await Bet.findOne({ betId });
if (!bet) throw new Error('Bet not found');
bet.opponentId = 'HOUSE_BOT';
bet.status = BetStatus.MATCHED;
bet.isHouseBot = true;
await bet.save();

    return res.status(200).json({
      success: true,
      data: {
        bet: bet,
        matched: true,
        opponent: 'HOUSE_BOT',
        isHouseBot: true
      }
    });
    }

  } catch (error) {
    console.error('Error in matchmaking:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};
// Start a game after countdown
export const startGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { betId } = req.params;
    
    const gameService = getGameService();
    await gameService.startGame(betId);
    
    res.status(200).json({
      success: true,
      message: 'Game started'
    });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

// Cancel a bet
export const cancelBet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { betId } = req.params;
    
    const gameService = getGameService();
    await gameService.cancelBet(betId);
    
    res.status(200).json({
      success: true,
      message: 'Bet cancelled'
    });
  } catch (error) {
    console.error('Error cancelling bet:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

// Get user's bet history
export const getUserBets = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = '20' } = req.query;
    
    const gameService = getGameService();
    const bets = await gameService.getUserBets(userId, parseInt(limit as string));
    
    res.status(200).json({
      success: true,
      data: bets
    });
  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

// Get active bets (admin endpoint)
export const getActiveBets = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameService = getGameService();
    const bets = await gameService.getActiveBets();
    
    res.status(200).json({
      success: true,
      data: bets
    });
  } catch (error) {
    console.error('Error fetching active bets:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

// Get matchmaking queue status
export const getQueueStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const matchmakingService = getMatchmakingService();
    const status = await matchmakingService.getQueueStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status'
    });
  }
};

// Get bet by ID
export const getBet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { betId } = req.params;
    
    const gameService = getGameService();
    const bet = await Bet.findOne({ betId });
    
    if (!bet) {
      res.status(404).json({
        success: false,
        message: 'Bet not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: bet
    });
  } catch (error) {
    console.error('Error getting bet:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

// Complete a game
export const completeGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { betId } = req.params;
    
    if (!betId) {
      res.status(400).json({
        success: false,
        message: 'Bet ID is required'
      });
      return;
    }
    
    const gameService = getGameService();
    const result = await gameService.completeGame(betId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error completing game:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete game'
    });
  }
};

// Add this new endpoint in game.controller.ts
export const validateBet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, amount } = req.body;
    
    // Validate required fields
    if (!token || !amount) {
      res.status(400).json({
        success: false,
        message: 'Token and amount are required'
      });
      return;
    }
    
    // Get settings
    const settings = await Settings.findOne();
    if (!settings) {
      res.status(500).json({
        success: false,
        message: 'System configuration error'
      });
      return;
    }
    
    // Check if token is enabled
    if (!settings.enabledTokens[token as keyof typeof settings.enabledTokens]) {
      res.status(400).json({
        success: false,
        message: `${token} is currently disabled for betting`
      });
      return;
    }
    
    // Check bet limits
    const limits = settings.betLimits[token as keyof typeof settings.betLimits];
    if (amount < limits.min || amount > limits.max) {
      res.status(400).json({
        success: false,
        message: `Bet amount must be between ${limits.min} and ${limits.max} ${token}`
      });
      return;
    }
    
    // Check house balance
    const blockchainService = getBlockchainService();
    const houseWalletAddress = process.env.HOUSE_WALLET_ADDRESS;
    
    if (!houseWalletAddress) {
      res.status(500).json({
        success: false,
        message: 'Service configuration error'
      });
      return;
    }
    
    const houseBalance = await blockchainService.getRealBalance(houseWalletAddress, token);
    const requiredAmount = amount * 2; // House needs 2x the bet amount
    
    if (houseBalance < requiredAmount) {
      res.status(400).json({
        success: false,
        message: `Insufficient house balance for this bet. House has ${houseBalance.toFixed(4)} ${token}, but ${requiredAmount.toFixed(4)} ${token} is required.`
      });
      return;
    }
    
    // All validations passed
    res.status(200).json({
      success: true,
      message: 'Bet validation passed',
      data: {
        token,
        amount,
        limits,
        houseBalance: houseBalance.toFixed(4)
      }
    });
    
  } catch (error) {
    console.error('Error validating bet:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bet validation'
    });
  }
};