import mongoose, { Document, Schema } from 'mongoose';
import { BetDirection } from './bet.model';

export interface IMatchmakingQueue extends Document {
  userId: string;
  betId: string;
  direction: BetDirection;
  amount: number;
  token: string;
  duration: number;
  createdAt: Date;
  expiresAt: Date;
}

const matchmakingQueueSchema = new Schema<IMatchmakingQueue>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  betId: {
    type: String,
    required: true,
    unique: true
  },
  direction: {
    type: String,
    enum: Object.values(BetDirection),
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  duration: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
});

// Compound index for matchmaking
matchmakingQueueSchema.index({ 
  token: 1, 
  amount: 1, 
  direction: 1, 
  createdAt: -1 
});

// TTL index to auto-remove expired entries
matchmakingQueueSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IMatchmakingQueue>('MatchmakingQueue', matchmakingQueueSchema);