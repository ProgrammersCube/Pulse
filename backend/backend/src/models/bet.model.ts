import mongoose, { Document, Schema } from 'mongoose';

export enum BetDirection {
  UP = 'UP',
  DOWN = 'DOWN'
}

export enum BetStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

export enum BetResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
  DRAW = 'DRAW', // For exact same price
  CANCELLED = 'CANCELLED'
}

export interface IBet extends Document {
  betId: string;
  userId: string; // wallet address
  opponentId?: string; // wallet address or 'HOUSE_BOT'
  direction: BetDirection;
  amount: number;
  token: string; // BeTyche, SOL, ETH, RADBRO
  duration: number; // in seconds (5-60)
  lockedPrice: number;
  lockedAt: Date;
  finalPrice?: number;
  finalizedAt?: Date;
  status: BetStatus;
  result?: BetResult;
  payout?: number; // amount after 5% fee
  fee?: number;
  isHouseBot: boolean;
  metadata?: {
    transferToHouseSignature?: string;
    payoutTransferSignature?: string;
    refundTransferSignature?: string;
    payoutTransferFailed?: boolean;
    refundTransferFailed?: boolean;
    payoutTransferError?: string;
    refundTransferError?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const betSchema = new Schema<IBet>({
  betId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  opponentId: {
    type: String,
    default: null,
    index: true
  },
  direction: {
    type: String,
    enum: Object.values(BetDirection),
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  token: {
    type: String,
    required: true,
    enum: ['BeTyche', 'SOL', 'ETH', 'RADBRO']
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 60
  },
  lockedPrice: {
    type: Number,
    required: true
  },
  lockedAt: {
    type: Date,
    required: true
  },
  finalPrice: {
    type: Number,
    default: null
  },
  finalizedAt: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: Object.values(BetStatus),
    default: BetStatus.PENDING,
    index: true
  },
  result: {
    type: String,
    enum: Object.values(BetResult),
    default: null
  },
  payout: {
    type: Number,
    default: null
  },
  fee: {
    type: Number,
    default: null
  },
  isHouseBot: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
  
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for efficient querying
betSchema.index({ userId: 1, status: 1 });
betSchema.index({ status: 1, direction: 1 });
betSchema.index({ createdAt: -1 });
betSchema.index({ status: 1, token: 1, amount: 1 }); // For matchmaking

export default mongoose.model<IBet>('Bet', betSchema);