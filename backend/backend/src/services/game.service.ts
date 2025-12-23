import { EventEmitter } from 'events';
import crypto from 'crypto';
import Bet, { IBet, BetStatus, BetDirection, BetResult } from '../models/bet.model';
import User from '../models/user.model';
import { getPythPriceManager } from './price.service';
import { getMatchmakingService } from './matchmaking.service';
import { getBlockchainService } from './blockchain.service';
import { io } from '../index';
import Settings from '../models/settings.model';
import { getActiveWalletKeys } from '../controllers/admin.controller';

interface CreateBetRequest {
  userId: string;
  direction: BetDirection;
  amount: number;
  token: string;
  predictionToken: string;
  duration: number;
  transactionSignature?: string; // For SPL token transfers
}

interface GameResult {
  bet: IBet;
  winner: string;
  loser: string;
  winAmount: number;
  fee: number;
}

class GameService extends EventEmitter {
  // private activeGames: Map<string, NodeJS.Timeout> = new Map();
  private completionLocks: Map<string, boolean> = new Map(); // Add this line

  private readonly MIN_BET_AMOUNTS: Record<string, number> = {
    BeTyche: 100,
    SOL: 0.00001,
    ETH: 0.001,
    RADBRO: 100,
    USDC: 0.01
  };

  // Helper method to get current house wallet address
  private async getHouseWalletAddress(): Promise<string> {
    const walletKeys = await getActiveWalletKeys();
    return walletKeys.publicKey;
  }

  // Helper method to get house fee percentage from settings
  private async getHouseFeePercentage(): Promise<number> {
    try {
      const settings = await Settings.findOne();
      if (settings && settings.houseFeePercentage !== undefined) {
        // Convert percentage to decimal (e.g., 5% -> 0.05)
        return settings.houseFeePercentage / 100;
      }
    } catch (error) {
      console.error('Error fetching house fee percentage from settings:', error);
    }
    
    // Fallback to default 5% fee if settings not found or error occurs
    console.log('Using fallback house fee percentage: 5%');
    return 0.05;
  }
  
  private readonly MAX_BET_AMOUNTS: Record<string, number> = {
    BeTyche: 1000000,
    SOL: 100,
    ETH: 10,
    RADBRO: 10000000,
    USDC: 10000
  };
  
  private activeGames: Map<string, NodeJS.Timeout> = new Map();
  private blockchainService = getBlockchainService();
  
  constructor() {
    super();
    console.log('🎯 Game Service initialized with blockchain integration');
  }
  
  
  // In game.service.ts - Update the createBet method
async createBet(request: CreateBetRequest): Promise<IBet> {
  const { userId, direction, amount, token, predictionToken, duration, transactionSignature } = request;
  const blockchainService = getBlockchainService();
  const settings = await Settings.findOne();
  if (!settings) {
    throw new Error('System configuration error');
  }

  // Check if token is enabled
  if (!settings.enabledTokens[request.token as keyof typeof settings.enabledTokens]) {
    throw new Error(`${request.token} is currently disabled for betting`);
  }

  // Use dynamic bet limits
  const limits = settings.betLimits[request.token as keyof typeof settings.betLimits];
  if (request.amount < limits.min || request.amount > limits.max) {
    throw new Error(`Bet amount must be between ${limits.min} and ${limits.max} ${request.token}`);
  }

  // Log what we received
  console.log('📥 Received bet request:', {
    userId,
    direction,
    amount,
    token,
    predictionToken,
    duration,
    transactionSignature: transactionSignature ? 'PROVIDED' : 'MISSING'
  });
  
  // Check transaction signature
  if (!transactionSignature) {
    throw new Error('Transaction signature is required');
  }

  console.log(`🔍 Verifying transaction: ${transactionSignature}`);
  
  // Strict transaction verification with all security checks
  const verificationResult = await this.blockchainService.verifyTransaction(
    transactionSignature,
    userId, // expected sender
    amount, // expected amount
    token   // expected token
  );
  
  if (!verificationResult.valid) {
    throw new Error(verificationResult.error || 'Transaction verification failed');
  }
  
  console.log('✅ Transaction verified - all security checks passed');
  
  // CHECK ALL HOUSE BALANCES FIRST
  const houseWalletAddress = await this.getHouseWalletAddress();
  
  // Check ALL token balances
  // TODO: Remove this after testing
  const tokens = ['SOL'];
  // const tokens = ['BeTyche', 'SOL', 'RADBRO'];
  const insufficientTokens: string[] = [];
  let balanceReport = '📊 HOUSE BALANCE REPORT:\n\n';
  
  for (const checkToken of tokens) {
    const balance = await blockchainService.getRealBalance(houseWalletAddress, checkToken);
    const minRequired = this.MIN_BET_AMOUNTS[checkToken] * 2; // Minimum required for any bet
    
    balanceReport += `${checkToken}: ${balance.toFixed(4)} (Min needed: ${minRequired})\n`;
    
    if (balance < minRequired) {
      insufficientTokens.push(checkToken);
    }
  }
  
  // If ANY token has insufficient balance, block ALL betting
  if (insufficientTokens.length > 0) {
    console.log(`❌ House has insufficient balance for tokens: ${insufficientTokens.join(', ')}`);
    throw new Error(`INSUFFICIENT HOUSE BALANCE\n\n${balanceReport}\nInsufficient tokens: ${insufficientTokens.join(', ')}\n\nThe house needs to maintain minimum balance for ALL tokens to ensure fair gameplay.\n\nBetting is temporarily disabled. Please contact admin or try again later.`);
  }
  
  // Now check for the SPECIFIC bet amount
  const houseBalance = await blockchainService.getRealBalance(houseWalletAddress, token);
  const requiredAmount = amount * 2;
  
  if (houseBalance < requiredAmount) {
    console.log(`❌ House insufficient ${token} for this bet: ${houseBalance} < ${requiredAmount}`);
    throw new Error(`INSUFFICIENT HOUSE BALANCE FOR THIS BET\n\n${balanceReport}\n\nYour bet requires: ${requiredAmount.toFixed(4)} ${token}\nHouse has: ${houseBalance.toFixed(4)} ${token}\n\nPlease try a smaller amount.`);
  }
  
  console.log(`✅ All house balances OK for betting`);
  
  // Validate bet amount
  this.validateBetAmount(amount, token);
  
  // Skip user balance validation since they already sent the transaction
  // await this.validateRealUserBalance(userId, amount, token);
  
  // Generate bet ID
  const betId = this.generateBetId();
  
  console.log(`Transaction already completed: ${amount} ${token} from ${userId} to house`);
  console.log(`Transaction signature: ${transactionSignature}`);
  
  // Lock the current price for the prediction token
  const priceManager = getPythPriceManager();
  const lockedPrice = priceManager.lockPrice({
    symbol: predictionToken || 'BTC', // Default to BTC if not provided
    userId,
    betId
  });
  
  // Create bet record with transaction signature
  const bet = new Bet({
    betId,
    userId,
    direction,
    amount,
    token,
    predictionToken: predictionToken || 'BTC', // Default to BTC if not provided
    duration,
    lockedPrice: lockedPrice.price,
    lockedAt: new Date(lockedPrice.timestamp),
    status: BetStatus.PENDING,
    // Store transaction signature for audit trail
    metadata: {
      transferToHouseSignature: transactionSignature
    }
  });
  
  await bet.save();
  
  // Link transaction signature to betId for audit trail
  await blockchainService.updateTransactionBetId(transactionSignature, betId);
  
  // Update database balance to reflect blockchain transfer
  await this.syncDatabaseBalance(userId, token);
  
  console.log(`Bet created with REAL blockchain transfer: ${betId}`);
  
  // Emit bet created event
  io.to(`user:${userId}`).emit('bet:created', {
    betId,
    lockedPrice: lockedPrice.price,
    timestamp: lockedPrice.timestamp,
    amountDeducted: amount,
    token: token,
    transactionSignature: transactionSignature,
    blockchainTransfer: true
  });
  
  return bet;
}

  
async completeGame(betId: string): Promise<GameResult> {
  // CRITICAL: Lock to prevent multiple completions - use a separate Map for locks
  const lockKey = `completing_${betId}`;
  
  // Create a separate locks map if it doesn't exist
  if (!this.completionLocks) {
    this.completionLocks = new Map<string, boolean>();
  }
  
  if (this.completionLocks.has(lockKey)) {
            console.log('Game completion already in progress for:', betId);
    return {} as GameResult; // Return empty result instead of throwing
  }
  this.completionLocks.set(lockKey, true);
  
  try {
    const bet = await Bet.findOne({ betId });
    if (!bet) {
      console.error('Bet not found');
      return {} as GameResult;
    }
    
    // Check if bet is not in progress
    if (bet.status !== BetStatus.IN_PROGRESS) {
      if (bet.status === BetStatus.COMPLETED) {
        console.log('Bet already completed:', betId);
        
        // Return the existing completed game result
        return {
          bet,
          winner: bet.result === BetResult.WIN ? bet.userId : (bet.opponentId || ''),
          loser: bet.result === BetResult.LOSS ? bet.userId : (bet.opponentId || ''),
          winAmount: bet.payout || 0,
          fee: bet.fee || 0
        } as GameResult;
      }
      
      console.error('Bet not in progress, status:', bet.status);
      return {} as GameResult;
    }
    
    // TRIPLE CHECK: Ensure no payout has been processed
    if (bet.metadata?.payoutTransferSignature) {
              console.log('Payout already processed for bet:', betId);
      
      // Return the existing result
      return {
        bet,
        winner: bet.result === BetResult.WIN ? bet.userId : (bet.opponentId || ''),
        loser: bet.result === BetResult.LOSS ? bet.userId : (bet.opponentId || ''),
        winAmount: bet.payout || 0,
        fee: bet.fee || 0
      } as GameResult;
    }
    
    // Get current price for the prediction token
    const priceManager = getPythPriceManager();
    const predictionToken = bet.predictionToken || 'BTC'; // Default to BTC if not set
    const currentPrice = priceManager.getLatestPrice(predictionToken);
    
    bet.finalPrice = currentPrice.price;
    
    console.log(`📊 Final price fetched for ${predictionToken}: ${currentPrice.price}`);
    bet.finalizedAt = new Date();
    
    // Determine result FIRST
    const priceChange = bet.finalPrice - bet.lockedPrice;
    console.log(`📊 Price change calculation for ${predictionToken}:
      - Locked Price: ${bet.lockedPrice}
      - Final Price: ${bet.finalPrice}
      - Change: ${priceChange}
      - Direction: ${bet.direction}
    `);
    
    let result: BetResult; 
    if (Math.abs(priceChange) < 0.01) { // Consider very small changes as draw
      result = BetResult.DRAW;
      console.log('Result: DRAW (price change too small)');
    } else if (
      (bet.direction === BetDirection.UP && priceChange > 0) ||
      (bet.direction === BetDirection.DOWN && priceChange < 0)
    ) {
      result = BetResult.WIN;
      console.log('Result: WIN');
    } else {
      result = BetResult.LOSS;
      console.log('Result: LOSS');
    }
    
    // NOW check house balance AFTER determining result
    let houseHasInsufficientBalance = false;
    if (result !== BetResult.LOSS) { // Only check if user might win or draw
      try {
        const houseWalletAddress = await this.getHouseWalletAddress();
        const houseBalance = await this.blockchainService.getRealBalance(
          houseWalletAddress,
          bet.token
        );
        
        const requiredAmount = result === BetResult.WIN ? bet.amount * 2 * 0.95 : bet.amount;
        if (houseBalance < requiredAmount) {
          houseHasInsufficientBalance = true;
          console.log(`House has insufficient balance: ${houseBalance} < ${requiredAmount}`);
        }
      } catch (error) {
        console.error('Error checking house balance:', error);
      }
    }
    
    bet.result = result;
    bet.status = BetStatus.COMPLETED;
    
    // Calculate payout and execute REAL blockchain transfers
    let winAmount = 0;
    let fee = 0;
    let transferSignature = '';
    
    if (result === BetResult.WIN) {
      // Winner gets their bet + opponent's bet - dynamic fee
      const totalPot = bet.amount * 2;
      const feePercentage = await this.getHouseFeePercentage();
      fee = parseFloat((totalPot * feePercentage).toFixed(8)); // Ensure precision
      winAmount = parseFloat((totalPot - fee).toFixed(8)); // Ensure precision
      bet.payout = winAmount;
      bet.fee = fee;
      
              console.log(`Exact payout calculation:
          - Bet amount: ${bet.amount}
          - Total pot: ${totalPot}
          - Fee (${(feePercentage * 100).toFixed(1)}%): ${fee}
          - Win amount: ${winAmount}
          - Token: ${bet.token}
        `);
      
      // EXECUTE REAL BLOCKCHAIN TRANSFER FROM HOUSE TO USER
      try {
        const transferResult = await this.blockchainService.transferFromHouse(
          bet.userId, 
          winAmount, 
          bet.token
        );
        
        if (transferResult.success) {
          transferSignature = transferResult.signature || '';
          console.log(`REAL WIN PAYOUT: ${winAmount} ${bet.token} transferred to ${bet.userId}`);
                      console.log(`Payout signature: ${transferSignature}`);
        } else {
          console.error(`❌ Failed to transfer winnings: ${transferResult.error}`);
          // Still record the win, but flag the transfer issue
          bet.metadata = { 
            ...bet.metadata, 
            payoutTransferFailed: true,
            payoutTransferError: transferResult.error
          };
        }
      } catch (error) {
        console.error('Error processing win payout:', error);
        bet.metadata = { 
          ...bet.metadata, 
          payoutTransferFailed: true,
          payoutTransferError: 'Transfer failed'
        };
      }
      
    } else if (result === BetResult.DRAW) {
      // Return bet amount to user (no fee on draws)
      winAmount = bet.amount;
      bet.payout = bet.amount;
      bet.fee = 0;
      
      // EXECUTE REAL BLOCKCHAIN REFUND FROM HOUSE TO USER
      try {
        const transferResult = await this.blockchainService.transferFromHouse(
          bet.userId, 
          bet.amount, 
          bet.token
        );
        
        if (transferResult.success) {
          transferSignature = transferResult.signature || '';
          console.log(`🤝 REAL DRAW REFUND: ${bet.amount} ${bet.token} refunded to ${bet.userId}`);
          console.log(`Refund signature: ${transferSignature}`);
        } else {
          console.error(`❌ Failed to refund draw: ${transferResult.error}`);
          bet.metadata = { 
            ...bet.metadata, 
            refundTransferFailed: true,
            refundTransferError: transferResult.error
          };
        }
      } catch (error) {
        console.error('Error processing draw refund:', error);
        bet.metadata = { 
          ...bet.metadata, 
          refundTransferFailed: true,
          refundTransferError: 'Refund failed'
        };
      }
      
    } else {
      // User loses - house keeps the tokens (already transferred to house)
      bet.payout = 0;
      bet.fee = 0;
      console.log(`😔 REAL LOSS: ${bet.userId} lost ${bet.amount} ${bet.token} (kept by house)`);
    }
    
    // Store transaction signatures
    if (transferSignature) {
      bet.metadata = { 
        ...bet.metadata, 
        payoutTransferSignature: transferSignature,
        // payoutTimestamp: new Date().toISOString()
      };
    }
    
    // ATOMIC SAVE - Save bet with completed status
    await bet.save();
    
    // Handle opponent's bet (if P2P)
    if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
      try {
        await this.handleOpponentResult(bet, result, winAmount, fee);
      } catch (error) {
        console.error('Error handling opponent result:', error);
      }
    }
    
    // Sync database balances with blockchain
    try {
      await this.syncDatabaseBalance(bet.userId, bet.token);
      if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
        await this.syncDatabaseBalance(bet.opponentId, bet.token);
      }
    } catch (error) {
      console.error('Error syncing balances:', error);
    }
    
    // Clear active game
    this.activeGames.delete(betId);
    
    // Emit game completed event with blockchain info
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
      balanceChange: result === BetResult.WIN ? winAmount : 
                    result === BetResult.DRAW ? 0 : 
                    -bet.amount,
      blockchainTransfer: true,
      transactionSignature: transferSignature,
      realWalletUpdate: true,
      houseInsufficientBalance: houseHasInsufficientBalance,
      priceChange: {
        amount: priceChange,
        percentage: ((priceChange / bet.lockedPrice) * 100).toFixed(2),
        direction: priceChange >= 0 ? 'UP' : 'DOWN'
      },





      // 🔽 ADD THESE FIELDS 🔽

  // core bet info UI relies on
  userId: bet.userId,
  opponentId: bet.opponentId || 'HOUSE_BOT',
  amount: bet.amount,
  token: bet.token,
  lockedPrice: bet.lockedPrice,
  fee: bet.fee || 0,

  // explicit signatures for the blockchain section
  transferToHouseSignature:
    bet.metadata?.transferToHouseSignature || transferSignature || '',
  payoutTransferSignature:
    bet.metadata?.payoutTransferSignature || '',

  // winner/loser used for "Match Result" text
  winner: bet.result === BetResult.WIN ? bet.userId : (bet.opponentId || 'HOUSE_BOT'),
  loser:  bet.result === BetResult.WIN ? (bet.opponentId || 'HOUSE_BOT') : bet.userId,

  // optional but useful
  status: bet.status,
  timestamp: bet.finalizedAt || new Date().toISOString(),
  metadata: bet.metadata || {}
    });
    
    console.log(`🏆 Game completed with REAL blockchain transfers: ${betId}, Result: ${result}`);
    
    return gameResult;
    
  } catch (error) {
    console.error('Error in completeGame:', error);
    // Return empty result on error
    return {} as GameResult;
  } finally {
    // Always cleanup the lock
    this.completionLocks.delete(lockKey);
  }
}  
  private async handleOpponentResult(bet: IBet, result: BetResult, winAmount: number, fee: number) {
    const opponentBet = await Bet.findOne({ 
      userId: bet.opponentId,
      opponentId: bet.userId,
      status: BetStatus.IN_PROGRESS
    });
    
    if (!opponentBet) return;
    
    opponentBet.finalPrice = bet.finalPrice;
    opponentBet.finalizedAt = bet.finalizedAt;
    opponentBet.status = BetStatus.COMPLETED;
    
    let opponentTransferSignature = '';
    
    // Opposite result for opponent
    if (result === BetResult.WIN) {
      opponentBet.result = BetResult.LOSS;
      opponentBet.payout = 0;
      opponentBet.fee = 0;
      // Opponent loses (house keeps their tokens)
      
    } else if (result === BetResult.LOSS) {
      opponentBet.result = BetResult.WIN;
      opponentBet.payout = winAmount;
      opponentBet.fee = fee;
      
      // REAL BLOCKCHAIN TRANSFER TO OPPONENT
      const transferResult = await this.blockchainService.transferFromHouse(
        opponentBet.userId, 
        winAmount, 
        opponentBet.token
      );
      
      if (transferResult.success) {
        opponentTransferSignature = transferResult.signature || '';
        console.log(`OPPONENT WIN: ${winAmount} ${opponentBet.token} transferred to ${opponentBet.userId}`);
      }
      
    } else {
      opponentBet.result = BetResult.DRAW;
      opponentBet.payout = opponentBet.amount;
      opponentBet.fee = 0;
      
      // REAL BLOCKCHAIN REFUND TO OPPONENT
      const transferResult = await this.blockchainService.transferFromHouse(
        opponentBet.userId, 
        opponentBet.amount, 
        opponentBet.token
      );
      
      if (transferResult.success) {
        opponentTransferSignature = transferResult.signature || '';
        console.log(`🤝 OPPONENT DRAW: ${opponentBet.amount} ${opponentBet.token} refunded to ${opponentBet.userId}`);
      }
    }
    
    if (opponentTransferSignature) {
      opponentBet.metadata = { 
        ...opponentBet.metadata, 
        payoutTransferSignature: opponentTransferSignature
      };
    }
    
    await opponentBet.save();
    
    // Emit to opponent
    const opponentResult = result === BetResult.WIN ? BetResult.LOSS : 
                         result === BetResult.LOSS ? BetResult.WIN : 
                         BetResult.DRAW;
                         
    io.to(`user:${opponentBet.userId}`).emit('game:completed', {
      betId: opponentBet.betId,
      result: opponentResult,
      finalPrice: bet.finalPrice,
      payout: opponentBet.payout,
      balanceChange: opponentResult === BetResult.WIN ? winAmount : 
                    opponentResult === BetResult.DRAW ? 0 : 
                    -opponentBet.amount,
      blockchainTransfer: true,
      transactionSignature: opponentTransferSignature,
      realWalletUpdate: true,
      priceChange: {
        amount: bet.finalPrice! - bet.lockedPrice,
        percentage: (((bet.finalPrice! - bet.lockedPrice) / bet.lockedPrice) * 100).toFixed(2)
      }
    });
  }
  
  async cancelBet(betId: string): Promise<void> {
    const bet = await Bet.findOne({ betId });
    if (!bet || bet.status !== BetStatus.PENDING) {
      throw new Error('Bet not found or cannot be cancelled');
    }
    
    bet.status = BetStatus.CANCELLED;
    bet.result = BetResult.CANCELLED;
    
    // EXECUTE REAL BLOCKCHAIN REFUND FROM HOUSE TO USER
    const transferResult = await this.blockchainService.transferFromHouse(
      bet.userId, 
      bet.amount, 
      bet.token
    );
    
    let transferSignature = '';
    if (transferResult.success) {
      transferSignature = transferResult.signature || '';
      console.log(`❌ REAL REFUND: ${bet.amount} ${bet.token} refunded to ${bet.userId} for cancelled bet`);
              console.log(`Refund signature: ${transferSignature}`);
    } else {
      console.error(`❌ Failed to refund cancelled bet: ${transferResult.error}`);
      bet.metadata = { 
        ...bet.metadata, 
        refundTransferFailed: true,
        refundTransferError: transferResult.error
      };
    }
    
    if (transferSignature) {
      bet.metadata = { 
        ...bet.metadata, 
        refundTransferSignature: transferSignature
      };
    }
    
    await bet.save();
    
    // Sync database balance
    await this.syncDatabaseBalance(bet.userId, bet.token);
    
    // Remove from matchmaking queue
    const matchmakingService = getMatchmakingService();
    await matchmakingService.removeFromQueue(betId);
    
    // Clear any active timers
    const timer = this.activeGames.get(betId);
    if (timer) {
      clearTimeout(timer);
      this.activeGames.delete(betId);
    }
    
    io.to(`user:${bet.userId}`).emit('bet:cancelled', { 
      betId,
      refunded: bet.amount,
      token: bet.token,
      blockchainTransfer: true,
      transactionSignature: transferSignature,
      realWalletUpdate: true
    });
  }
  
  // Sync database balance with real blockchain balance
  private async syncDatabaseBalance(userId: string, token: string): Promise<void> {
    try {
      const realBalance = await this.blockchainService.getRealBalance(userId, token);
      
      const user = await User.findOne({ walletAddress: userId });
      if (user) {
        const oldBalance = user.tokens[token as keyof typeof user.tokens];
        user.tokens[token as keyof typeof user.tokens] = realBalance;
        await user.save();
        
        console.log(`🔄 Balance synced for ${userId} ${token}: ${oldBalance} → ${realBalance}`);
        
        // Emit balance update to user
        io.to(`user:${userId}`).emit('balance:updated', {
          token,
          oldBalance,
          newBalance: realBalance,
          synced: true
        });
      }
    } catch (error) {
      console.error(`❌ Failed to sync balance for ${userId} ${token}:`, error);
    }
  }
  
  private async validateRealUserBalance(userId: string, amount: number, token: string): Promise<void> {
    const realBalance = await this.blockchainService.getRealBalance(userId, token);
    
    if (realBalance < amount) {
      throw new Error(`Insufficient REAL ${token} balance. Available: ${realBalance}, Required: ${amount}`);
    }
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

  // Add this method to your existing GameService class
async startGame(betId: string): Promise<void> {
  const bet = await Bet.findOne({ betId });
  if (!bet || bet.status !== BetStatus.MATCHED) {
    throw new Error('Bet not found or not matched');
  }
  
  // Update status to IN_PROGRESS
  bet.status = BetStatus.IN_PROGRESS;
  await bet.save();
  
  console.log(`🏁 Game started: ${betId} - Duration: ${bet.duration}s`);
  
  // Notify users
  io.to(`user:${bet.userId}`).emit('game:started', { 
    betId,
    duration: bet.duration 
  });
  
  if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
    io.to(`user:${bet.opponentId}`).emit('game:started', { 
      betId,
      duration: bet.duration 
    });
  }
  
  // Set timer for game completion
  const timer = setTimeout(() => {
    this.completeGame(betId);
  }, bet.duration * 1000);
  
  this.activeGames.set(betId, timer);
  
  // Send countdown updates
  this.sendCountdownUpdates(betId, bet.duration);
}

// Add this helper method too
private sendCountdownUpdates(betId: string, duration: number) {
  let remaining = duration;
  
  const countdownInterval = setInterval(async () => {
    const bet = await Bet.findOne({ betId });
    if (!bet || bet.status !== BetStatus.IN_PROGRESS) {
      clearInterval(countdownInterval);
      return;
    }
    
    // Emit countdown update
    io.to(`user:${bet.userId}`).emit('game:countdown', { 
      betId, 
      remaining,
      duration: bet.duration
    });
    
    if (bet.opponentId && bet.opponentId !== 'HOUSE_BOT') {
      io.to(`user:${bet.opponentId}`).emit('game:countdown', { 
        betId, 
        remaining,
        duration: bet.duration
      });
    }
    
    remaining--;
    
    if (remaining < 0) {
      clearInterval(countdownInterval);
    }
  }, 1000);
}
  
  // Additional methods for blockchain integration
  async getHouseBalance(token: string): Promise<number> {
    try {
      const houseWalletAddress = await this.getHouseWalletAddress();
      return await this.blockchainService.getRealBalance(houseWalletAddress, token);
    } catch (error) {
      console.error('Failed to get house wallet address:', error);
      return 0;
    }
  }
  
  async syncAllUserBalances(): Promise<void> {
    console.log('🔄 Syncing all user balances with blockchain...');
    
    const users = await User.find({});
    const tokens = ['BeTyche', 'SOL', 'RADBRO'];
    
    for (const user of users) {
      for (const token of tokens) {
        try {
          await this.syncDatabaseBalance(user.walletAddress, token);
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Failed to sync ${user.walletAddress} ${token}:`, error);
        }
      }
    }
    
    console.log('✅ Balance sync completed');
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