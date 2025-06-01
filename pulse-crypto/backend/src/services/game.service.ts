import { EventEmitter } from 'events';
import crypto from 'crypto';
import Bet, { IBet, BetStatus, BetDirection, BetResult } from '../models/bet.model';
import User from '../models/user.model';
import { getPythPriceManager } from './price.service';
import { getMatchmakingService } from './matchmaking.service';
import { io } from '../index';

interface CreateBetRequest {
  userId: string;
  direction: BetDirection;
  amount: number;
  token: string;
  duration: number;
}

interface GameResult {
  bet: IBet;
  winner: string;
  loser: string;
  winAmount: number;
  fee: number;
}

class GameService extends EventEmitter {
  private readonly FEE_PERCENTAGE = 0.05; // 5% fee
  private readonly MIN_BET_AMOUNTS: Record<string, number> = {
    BeTyche: 100,
    SOL: 0.01,
    ETH: 0.001,
    RADBRO: 1000
  };
  
  private readonly MAX_BET_AMOUNTS: Record<string, number> = {
    BeTyche: 1000000,
    SOL: 100,
    ETH: 10,
    RADBRO: 10000000
  };
  
  private activeGames: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    super();
    console.log('🎯 Game Service initialized');
  }
  
  async createBet(request: CreateBetRequest): Promise<IBet> {
    const { userId, direction, amount, token, duration } = request;
    
    // Validate bet amount
    this.validateBetAmount(amount, token);
    
    // Validate user has sufficient balance
    await this.validateUserBalance(userId, amount, token);
    
    // Generate bet ID
    const betId = this.generateBetId();
    
    // Lock the current price
    const priceManager = getPythPriceManager();
    const lockedPrice = priceManager.lockPrice({
      symbol: 'BTC',
      userId,
      betId
    });
    
    // Create bet record
    const bet = new Bet({
      betId,
      userId,
      direction,
      amount,
      token,
      duration,
      lockedPrice: lockedPrice.price,
      lockedAt: new Date(lockedPrice.timestamp),
      status: BetStatus.PENDING
    });
    
    await bet.save();
    
    console.log(`🎲 Bet created: ${betId} by ${userId}`);
    
    // Emit bet created event
    io.to(`user:${userId}`).emit('bet:created', {
      betId,
      lockedPrice: lockedPrice.price,
      timestamp: lockedPrice.timestamp
    });
    
    return bet;
  }
  
  async startGame(betId: string): Promise<void> {
    const bet = await Bet.findOne({ betId });
    if (!bet || bet.status !== BetStatus.MATCHED) {
      throw new Error('Bet not found or not matched');
    }
    
    // Update status to IN_PROGRESS
    bet.status = BetStatus.IN_PROGRESS;
    await bet.save();
    
    console.log(`🏁 Game started: ${betId}`);
    
    // Notify users
    io.to(`user:${bet.userId}`).emit('game:started', { betId });
    if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
      io.to(`user:${bet.opponentId}`).emit('game:started', { betId });
    }
    
    // Set timer for game completion
    const timer = setTimeout(() => {
      this.completeGame(betId);
    }, bet.duration * 1000);
    
    this.activeGames.set(betId, timer);
    
    // Send countdown updates
    this.sendCountdownUpdates(betId, bet.duration);
  }
  
  private sendCountdownUpdates(betId: string, duration: number) {
    let remaining = duration;
    
    const countdownInterval = setInterval(async () => {
      remaining--;
      
      const bet = await Bet.findOne({ betId });
      if (!bet) {
        clearInterval(countdownInterval);
        return;
      }
      
      // Emit countdown update
      io.to(`user:${bet.userId}`).emit('game:countdown', { 
        betId, 
        remaining 
      });
      
      if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
        io.to(`user:${bet.opponentId}`).emit('game:countdown', { 
          betId, 
          remaining 
        });
      }
      
      if (remaining <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }
  
  async completeGame(betId: string): Promise<GameResult> {
    const bet = await Bet.findOne({ betId });
    if (!bet || bet.status !== BetStatus.IN_PROGRESS) {
      throw new Error('Bet not found or not in progress');
    }
    
    // Get current price
    const priceManager = getPythPriceManager();
    const currentPrice = priceManager.getLatestPrice('BTC');
    
    bet.finalPrice = currentPrice.price;
    bet.finalizedAt = new Date();
    
    // Determine result
    const priceChange = bet.finalPrice - bet.lockedPrice;
    let result: BetResult;
    
    if (priceChange === 0) {
      result = BetResult.DRAW;
    } else if (
      (bet.direction === BetDirection.UP && priceChange > 0) ||
      (bet.direction === BetDirection.DOWN && priceChange < 0)
    ) {
      result = BetResult.WIN;
    } else {
      result = BetResult.LOSS;
    }
    
    bet.result = result;
    bet.status = BetStatus.COMPLETED;
    
    // Calculate payout for winner
    let winAmount = 0;
    let fee = 0;
    
    if (result === BetResult.WIN) {
      // Winner gets their bet + opponent's bet - 5% fee
      const totalPot = bet.amount * 2; // Both bets are same amount
      fee = totalPot * this.FEE_PERCENTAGE;
      winAmount = totalPot - fee;
      bet.payout = winAmount;
      bet.fee = fee;
    } else if (result === BetResult.DRAW) {
      // Both get their bets back (no fee on draws)
      winAmount = bet.amount;
      bet.payout = bet.amount;
      bet.fee = 0;
    } else {
      // Loser gets nothing
      bet.payout = 0;
      bet.fee = 0;
    }
    
    await bet.save();
    
    // Update user balances
    if (result !== BetResult.LOSS) {
      await this.updateUserBalance(bet.userId, winAmount, bet.token, 'add');
    }
    
    // Handle opponent's bet (if P2P)
    if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
      const opponentBet = await Bet.findOne({ 
        userId: bet.opponentId,
        opponentId: bet.userId,
        status: BetStatus.IN_PROGRESS
      });
      
      if (opponentBet) {
        opponentBet.finalPrice = bet.finalPrice;
        opponentBet.finalizedAt = bet.finalizedAt;
        opponentBet.status = BetStatus.COMPLETED;
        
        // Opposite result for opponent
        if (result === BetResult.WIN) {
          opponentBet.result = BetResult.LOSS;
          opponentBet.payout = 0;
          opponentBet.fee = 0;
        } else if (result === BetResult.LOSS) {
          opponentBet.result = BetResult.WIN;
          opponentBet.payout = winAmount;
          opponentBet.fee = fee;
          await this.updateUserBalance(opponentBet.userId, winAmount, opponentBet.token, 'add');
        } else {
          opponentBet.result = BetResult.DRAW;
          opponentBet.payout = opponentBet.amount;
          opponentBet.fee = 0;
          await this.updateUserBalance(opponentBet.userId, opponentBet.amount, opponentBet.token, 'add');
        }
        
        await opponentBet.save();
      }
    }
    
    // Clear active game
    this.activeGames.delete(betId);
    
    // Emit game completed event
    const gameResult: GameResult = {
      bet,
      winner: result === BetResult.WIN ? bet.userId : (bet.opponentId || ''),
      loser: result === BetResult.LOSS ? bet.userId : (bet.opponentId || ''),
      winAmount,
      fee
    };
    
    io.to(`user:${bet.userId}`).emit('game:completed', {
      betId,
      result: bet.result,
      finalPrice: bet.finalPrice,
      payout: bet.payout,
      priceChange: {
        amount: priceChange,
        percentage: ((priceChange / bet.lockedPrice) * 100).toFixed(2)
      }
    });
    
    if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
      const opponentResult = result === BetResult.WIN ? BetResult.LOSS : 
                           result === BetResult.LOSS ? BetResult.WIN : 
                           BetResult.DRAW;
                           
      io.to(`user:${bet.opponentId}`).emit('game:completed', {
        betId: `${bet.opponentId}_${bet.betId}`, // Opponent's bet ID
        result: opponentResult,
        finalPrice: bet.finalPrice,
        payout: opponentResult === BetResult.WIN ? winAmount : 
                opponentResult === BetResult.DRAW ? bet.amount : 0,
        priceChange: {
          amount: priceChange,
          percentage: ((priceChange / bet.lockedPrice) * 100).toFixed(2)
        }
      });
    }
    
    console.log(`🏆 Game completed: ${betId}, Result: ${result}`);
    
    return gameResult;
  }
  
  async cancelBet(betId: string): Promise<void> {
    const bet = await Bet.findOne({ betId });
    if (!bet || bet.status !== BetStatus.PENDING) {
      throw new Error('Bet not found or cannot be cancelled');
    }
    
    bet.status = BetStatus.CANCELLED;
    bet.result = BetResult.CANCELLED;
    await bet.save();
    
    // Remove from matchmaking queue
    const matchmakingService = getMatchmakingService();
    await matchmakingService.removeFromQueue(betId);
    
    // Clear any active timers
    const timer = this.activeGames.get(betId);
    if (timer) {
      clearTimeout(timer);
      this.activeGames.delete(betId);
    }
    
    console.log(`❌ Bet cancelled: ${betId}`);
    
    io.to(`user:${bet.userId}`).emit('bet:cancelled', { betId });
  }
  
  private validateBetAmount(amount: number, token: string): void {
    const minAmount = this.MIN_BET_AMOUNTS[token];
    const maxAmount = this.MAX_BET_AMOUNTS[token];
    
    if (!minAmount || !maxAmount) {
      throw new Error(`Invalid token: ${token}`);
    }
    
    if (amount < minAmount) {
      throw new Error(`Minimum bet for ${token} is ${minAmount}`);
    }
    
    if (amount > maxAmount) {
      throw new Error(`Maximum bet for ${token} is ${maxAmount}`);
    }
  }
  
  private async validateUserBalance(userId: string, amount: number, token: string): Promise<void> {
    const user = await User.findOne({ walletAddress: userId });
    if (!user) {
      throw new Error('User not found');
    }
    
    const balance = user.tokens[token as keyof typeof user.tokens];
    if (balance < amount) {
      throw new Error(`Insufficient ${token} balance`);
    }
  }
  
  private async updateUserBalance(
    userId: string, 
    amount: number, 
    token: string, 
    operation: 'add' | 'subtract'
  ): Promise<void> {
    const user = await User.findOne({ walletAddress: userId });
    if (!user) {
      throw new Error('User not found');
    }
    
    const tokenKey = token as keyof typeof user.tokens;
    if (operation === 'add') {
      user.tokens[tokenKey] += amount;
    } else {
      user.tokens[tokenKey] = Math.max(0, user.tokens[tokenKey] - amount);
    }
    
    await user.save();
  }
  
  private generateBetId(): string {
    return `BET_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }
  
  async getUserBets(userId: string, limit: number = 20): Promise<IBet[]> {
    return await Bet.find({ 
      $or: [{ userId }, { opponentId: userId }] 
    })
    .sort({ createdAt: -1 })
    .limit(limit);
  }
  
  async getActiveBets(): Promise<IBet[]> {
    return await Bet.find({ 
      status: { $in: [BetStatus.PENDING, BetStatus.MATCHED, BetStatus.IN_PROGRESS] }
    })
    .sort({ createdAt: -1 });
  }
}

// Singleton instance
let gameServiceInstance: GameService | null = null;

export const getGameService = (): GameService => {
  if (!gameServiceInstance) {
    gameServiceInstance = new GameService();
  }
  return gameServiceInstance;
};