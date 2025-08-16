import { EventEmitter } from 'events';
import Bet, { IBet, BetStatus, BetDirection } from '../models/bet.model';
import MatchmakingQueue, { IMatchmakingQueue } from '../models/matchmakingQueue.model';
import User from '../models/user.model';
import { io } from '../index';

interface MatchmakingRequest {
  userId: string;
  betId: string;
  direction: BetDirection;
  amount: number;
  token: string;
  duration: number;
}

class MatchmakingService extends EventEmitter {
  private readonly MATCH_TIMEOUT = 10000; // 10 seconds to find a match
  private readonly HOUSE_BOT_ID = 'HOUSE_BOT';
  
  constructor() {
    super();
    console.log('🎮 Matchmaking Service initialized');
    
    // Clean up expired queue entries periodically
    setInterval(() => this.cleanupExpiredEntries(), 30000);
  }
  
  async findMatch(request: MatchmakingRequest) {
    const { userId, betId, direction, amount, token, duration } = request;
    console.log(request)
    console.log(`🔍 Finding match for user ${userId}, bet ${betId}`);
    
    try {
      console.log("here")
      // First, try to find an opponent with opposite direction
      const oppositeDirection = direction === BetDirection.UP ? BetDirection.DOWN : BetDirection.UP;
      console.log(oppositeDirection)
      //imediate found a match
      const opponent = await Bet.findOne({
        token,
        amount,
        status:"PENDING",
        duration,
        direction: oppositeDirection,
        userId: { $ne: userId }, // Not the same user
      }); // FIFO
      console.log(`opponent is : ${opponent}`)
      if (opponent) {
        // Found a match!
        console.log(`✅ P2P Match found: ${userId} vs ${opponent.userId}`);
        
        // Update both bets
        const [userBet, opponentBet] = await Promise.all([
          Bet.findOneAndUpdate(
            { betId },
            { 
              opponentId: opponent.userId,
              status: BetStatus.MATCHED,
              isHouseBot: false
            },
            { new: true }
          ),
          Bet.findOneAndUpdate(
            { betId: opponent.betId },
            { 
              opponentId: userId,
              status: BetStatus.MATCHED,
              isHouseBot: false
            },
            { new: true }
          )
        ]);
        
        // Notify both users via socket
        io.to(`user:${userId}`).emit('match:found', {
          betId,
          opponent: opponent.userId,
          isHouseBot: false
        });
        
        io.to(`user:${opponent.userId}`).emit('match:found', {
          betId: opponent.betId,
          opponent: userId,
          isHouseBot: false
        });
        
        this.emit('match:created', { 
          bet1: userBet, 
          bet2: opponentBet 
        });
        
        return userBet!;
      }
      else if (!opponent)
      {
        console.log("no opponent found")
        return false
      }
      



      // No immediate match found, add to queue
      // await this.addToQueue(request);
      
      // // Wait for a match or timeout
      // return await this.waitForMatch(betId, userId);
      
    } catch (error) {
      console.error('❌ Matchmaking error:', error);
      throw error;
    }
  }
  
  private async addToQueue(request: MatchmakingRequest): Promise<void> {
    const queueEntry = new MatchmakingQueue({
      ...request,
      expiresAt: new Date(Date.now() + this.MATCH_TIMEOUT)
    });
    
    await queueEntry.save();
    console.log(`📋 Added to matchmaking queue: ${request.betId}`);
    
    // Notify user they're in queue
    io.to(`user:${request.userId}`).emit('match:searching', {
      betId: request.betId,
      timeout: this.MATCH_TIMEOUT
    });
  }
  
  private async waitForMatch(betId: string, userId: string): Promise<IBet> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(async () => {
        // Timeout - match with house bot
        console.log(`⏱️ Match timeout for ${betId}, using house bot`);
        
        try {
          // Remove from queue
          await MatchmakingQueue.deleteOne({ betId });
          
          // Update bet to use house bot
          const bet = await Bet.findOneAndUpdate(
            { betId },
            { 
              opponentId: this.HOUSE_BOT_ID,
              status: BetStatus.MATCHED,
              isHouseBot: true
            },
            { new: true }
          );
          
          if (!bet) {
            throw new Error('Bet not found');
          }
          
          // Notify user
          io.to(`user:${userId}`).emit('match:found', {
            betId,
            opponent: this.HOUSE_BOT_ID,
            isHouseBot: true
          });
          
          this.emit('match:housebot', { bet });
          
          resolve(bet);
        } catch (error) {
          reject(error);
        }
      }, this.MATCH_TIMEOUT);
      
      // Listen for match found event
      const matchHandler = async (data: any) => {
        if (data.betId === betId) {
          clearTimeout(timeout);
          this.off(`match:${betId}`, matchHandler);
          
          const bet = await Bet.findOne({ betId });
          if (bet) {
            resolve(bet);
          } else {
            reject(new Error('Bet not found after match'));
          }
        }
      };
      
      this.on(`match:${betId}`, matchHandler);
    });
  }
  
  async removeFromQueue(betId: string): Promise<void> {
    await MatchmakingQueue.deleteOne({ betId });
    console.log(`🗑️ Removed ${betId} from matchmaking queue`);
  }
  
  private async cleanupExpiredEntries(): Promise<void> {
    const result = await MatchmakingQueue.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    
    if (result.deletedCount > 0) {
      console.log(`🧹 Cleaned up ${result.deletedCount} expired queue entries`);
    }
  }
  
  async getQueueStatus(): Promise<any> {
    const queues = await MatchmakingQueue.aggregate([
      {
        $group: {
          _id: {
            token: '$token',
            direction: '$direction'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    return queues;
  }
}

// Singleton instance
let matchmakingServiceInstance: MatchmakingService | null = null;

export const getMatchmakingService = (): MatchmakingService => {
  if (!matchmakingServiceInstance) {
    matchmakingServiceInstance = new MatchmakingService();
  }
  return matchmakingServiceInstance;
};