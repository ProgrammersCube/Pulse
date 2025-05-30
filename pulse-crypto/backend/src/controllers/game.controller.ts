import { Request, Response } from 'express';
import Game, { IGame, GameStatus, PredictionDirection } from '../models/game.model';
import User from '../models/user.model';
import { getPythPriceManager } from '../services/price.service';
import { v4 as uuidv4 } from 'uuid';

// Treasury wallet address (configured by admin)
const TREASURY_WALLET = process.env.TREASURY_WALLET || 'TREASURY_WALLET_ADDRESS';

// Create a new game
export const createGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, prediction, stake, tokenType, duration } = req.body;
    
    // Validate inputs
    if (!walletAddress || !prediction || !stake || !tokenType || !duration) {
      res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
      return;
    }
    
    // Validate prediction
    if (!Object.values(PredictionDirection).includes(prediction)) {
      res.status(400).json({
        success: false,
        message: 'Invalid prediction direction'
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
    
    // Check user exists and has sufficient balance
    const user = await User.findOne({ walletAddress });
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }
    
    // Check token balance
    const userBalance = user.tokens[tokenType as keyof typeof user.tokens];
    if (userBalance < stake) {
      res.status(400).json({
        success: false,
        message: 'Insufficient token balance'
      });
      return;
    }
    
    // Get current BTC price
    const priceManager = getPythPriceManager();
    const currentPrice = priceManager.getLatestPrice('BTC');
    
    // Create game ID
    const gameId = `game_${uuidv4()}`;
    
    // Create new game
    const game = new Game({
      gameId,
      status: GameStatus.PENDING,
      duration,
      player1: {
        walletAddress,
        prediction,
        stake,
        tokenType
      },
      startPrice: currentPrice.price,
      houseFeePercent: 5
    });
    
    await game.save();
    
    // Try to find a match
    const matched = await findMatch(game);
    
    if (matched) {
      res.status(201).json({
        success: true,
        message: 'Game created and matched!',
        data: game
      });
    } else {
      // Set timeout to match with bot after 3 seconds
      setTimeout(async () => {
        await matchWithBot(game);
      }, 3000);
      
      res.status(201).json({
        success: true,
        message: 'Game created, waiting for match...',
        data: game
      });
    }
  } catch (error) {
    console.error('Error in createGame:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Find a match for the game
async function findMatch(game: IGame): Promise<boolean> {
  try {
    // Find pending games with opposite predictions
    const oppositeDirection = game.player1.prediction === PredictionDirection.UP 
      ? PredictionDirection.DOWN 
      : PredictionDirection.UP;
    
    const matchingGame = await Game.findOne({
      status: GameStatus.PENDING,
      'player1.prediction': oppositeDirection,
      'player1.tokenType': game.player1.tokenType,
      'player1.stake': game.player1.stake,
      duration: game.duration,
      gameId: { $ne: game.gameId }
    }).sort({ createdAt: 1 });
    
    if (matchingGame) {
      // Match found! Update both games
      game.player2 = {
        walletAddress: matchingGame.player1.walletAddress,
        prediction: matchingGame.player1.prediction,
        stake: matchingGame.player1.stake,
        tokenType: matchingGame.player1.tokenType
      };
      game.status = GameStatus.MATCHED;
      
      // Delete the matched game and update this one
      await matchingGame.deleteOne();
      await game.save();
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error finding match:', error);
    return false;
  }
}

// Match with bot if no player found
async function matchWithBot(game: IGame): Promise<void> {
  try {
    const gameDoc = await Game.findById(game._id);
    if (!gameDoc || gameDoc.status !== GameStatus.PENDING) {
      return;
    }
    
    // Create bot player with opposite prediction
    const oppositeDirection = gameDoc.player1.prediction === PredictionDirection.UP 
      ? PredictionDirection.DOWN 
      : PredictionDirection.UP;
    
    gameDoc.player2 = {
      walletAddress: TREASURY_WALLET,
      prediction: oppositeDirection,
      stake: gameDoc.player1.stake,
      tokenType: gameDoc.player1.tokenType
    };
    gameDoc.isVsBot = true;
    gameDoc.status = GameStatus.MATCHED;
    
    await gameDoc.save();
  } catch (error) {
    console.error('Error matching with bot:', error);
  }
}

// Start a game
export const startGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findOne({ gameId });
    if (!game) {
      res.status(404).json({
        success: false,
        message: 'Game not found'
      });
      return;
    }
    
    if (game.status !== GameStatus.MATCHED) {
      res.status(400).json({
        success: false,
        message: 'Game not ready to start'
      });
      return;
    }
    
    // Lock the current price
    const priceManager = getPythPriceManager();
    const lockedPrice = priceManager.lockPrice({
      symbol: 'BTC',
      userId: game.player1.walletAddress,
      betId: game.gameId
    });
    
    // Update game with start info
    game.status = GameStatus.IN_PROGRESS;
    game.startTime = new Date();
    game.startPrice = lockedPrice.price;
    game.lockedPriceId = game.gameId;
    
    await game.save();
    
    // Schedule game end
    setTimeout(async () => {
      await endGame(game.gameId);
    }, game.duration * 1000);
    
    res.status(200).json({
      success: true,
      message: 'Game started!',
      data: game
    });
  } catch (error) {
    console.error('Error in startGame:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// End a game and calculate results
async function endGame(gameId: string): Promise<void> {
  try {
    const game = await Game.findOne({ gameId });
    if (!game || game.status !== GameStatus.IN_PROGRESS) {
      return;
    }
    
    // Get final price
    const priceManager = getPythPriceManager();
    const finalPrice = priceManager.getLatestPrice('BTC');
    
    // Update game with end info
    game.endTime = new Date();
    game.endPrice = finalPrice.price;
    game.status = GameStatus.COMPLETED;
    
    // Calculate winner and payouts
    const result = game.calculateWinner();
    
    // Update user balances
    await updateUserBalances(game);
    
    await game.save();
    
    console.log(`Game ${gameId} ended. Winner: ${result.winner}`);
  } catch (error) {
    console.error('Error ending game:', error);
  }
}

// Update user balances after game
async function updateUserBalances(game: IGame): Promise<void> {
  try {
    // Deduct stakes from both players
    const player1 = await User.findOne({ walletAddress: game.player1.walletAddress });
    if (player1) {
      const tokenKey = game.player1.tokenType as keyof typeof player1.tokens;
      player1.tokens[tokenKey] -= game.player1.stake;
      
      // Add payout if winner
      if (game.player1.isWinner && game.player1.payout) {
        player1.tokens[tokenKey] += game.player1.payout;
      }
      
      await player1.save();
    }
    
    // Handle player 2 (if not bot)
    if (game.player2 && !game.isVsBot) {
      const player2 = await User.findOne({ walletAddress: game.player2.walletAddress });
      if (player2) {
        const tokenKey = game.player2.tokenType as keyof typeof player2.tokens;
        player2.tokens[tokenKey] -= game.player2.stake;
        
        // Add payout if winner
        if (game.player2.isWinner && game.player2.payout) {
          player2.tokens[tokenKey] += game.player2.payout;
        }
        
        await player2.save();
      }
    }
  } catch (error) {
    console.error('Error updating user balances:', error);
  }
}

// Get game by ID
export const getGame = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gameId } = req.params;
    
    const game = await Game.findOne({ gameId });
    if (!game) {
      res.status(404).json({
        success: false,
        message: 'Game not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error('Error in getGame:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get user's game history
export const getUserGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query: any = {
      $or: [
        { 'player1.walletAddress': walletAddress },
        { 'player2.walletAddress': walletAddress }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    const games = await Game
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Game.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        games,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error in getUserGames:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get pending games (for matchmaking display)
export const getPendingGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tokenType, stake } = req.query;
    
    const query: any = { status: GameStatus.PENDING };
    
    if (tokenType) {
      query['player1.tokenType'] = tokenType;
    }
    
    if (stake) {
      query['player1.stake'] = parseFloat(stake as string);
    }
    
    const games = await Game
      .find(query)
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error('Error in getPendingGames:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};