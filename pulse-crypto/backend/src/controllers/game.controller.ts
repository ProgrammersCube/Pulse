import { Request, Response } from 'express';
import { getGameService } from '../services/game.service';
import { getMatchmakingService } from '../services/matchmaking.service';
import { BetDirection } from '../models/bet.model';

// Create a new bet
export const createBet = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, direction, amount, token, duration } = req.body;
    
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
    if (duration < 5 || duration > 60) {
      res.status(400).json({
        success: false,
        message: 'Duration must be between 5 and 60 seconds'
      });
      return;
    }
    
    const gameService = getGameService();
    const bet = await gameService.createBet({
      userId,
      direction,
      amount,
      token,
      duration
    });
    
    res.status(200).json({
      success: true,
      data: bet
    });
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};

// Start matchmaking for a bet
export const startMatchmaking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { betId } = req.params;
    const { userId, direction, amount, token, duration } = req.body;
    
    const matchmakingService = getMatchmakingService();
    const matchedBet = await matchmakingService.findMatch({
      userId,
      betId,
      direction,
      amount,
      token,
      duration
    });
    
    res.status(200).json({
      success: true,
      data: {
        bet: matchedBet,
        matched: true,
        opponent: matchedBet.opponentId,
        isHouseBot: matchedBet.isHouseBot
      }
    });
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
    console.error('Error fetching queue status:', error);
    res.status(500).json({
      success: false,
      message: (error as Error).message
    });
  }
};