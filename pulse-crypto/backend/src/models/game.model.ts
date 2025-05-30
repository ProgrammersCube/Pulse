import mongoose, { Document, Schema } from 'mongoose';

// Game status enum
export enum GameStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

// Prediction direction
export enum PredictionDirection {
  UP = 'up',
  DOWN = 'down'
}

// Player interface
interface IPlayer {
  walletAddress: string;
  prediction: PredictionDirection;
  stake: number;
  tokenType: 'BeTyche' | 'SOL' | 'ETH' | 'RADBRO';
  payout?: number;
  isWinner?: boolean;
}

// Game interface
export interface IGame extends Document {
  gameId: string;
  status: GameStatus;
  duration: number; // in seconds (5-60)
  player1: IPlayer;
  player2?: IPlayer;
  isVsBot: boolean;
  startPrice: number;
  endPrice?: number;
  startTime?: Date;
  endTime?: Date;
  lockedPriceId?: string;
  houseFeePercent: number;
  createdAt: Date;
  updatedAt: Date;
}

// Game schema
const gameSchema = new Schema<IGame>(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.PENDING,
      index: true
    },
    duration: {
      type: Number,
      required: true,
      min: 5,
      max: 60
    },
    player1: {
      walletAddress: {
        type: String,
        required: true,
        index: true
      },
      prediction: {
        type: String,
        enum: Object.values(PredictionDirection),
        required: true
      },
      stake: {
        type: Number,
        required: true,
        min: 0
      },
      tokenType: {
        type: String,
        enum: ['BeTyche', 'SOL', 'ETH', 'RADBRO'],
        required: true
      },
      payout: {
        type: Number,
        default: 0
      },
      isWinner: {
        type: Boolean,
        default: false
      }
    },
    player2: {
      walletAddress: {
        type: String,
        index: true
      },
      prediction: {
        type: String,
        enum: Object.values(PredictionDirection)
      },
      stake: {
        type: Number,
        min: 0
      },
      tokenType: {
        type: String,
        enum: ['BeTyche', 'SOL', 'ETH', 'RADBRO']
      },
      payout: {
        type: Number,
        default: 0
      },
      isWinner: {
        type: Boolean,
        default: false
      }
    },
    isVsBot: {
      type: Boolean,
      default: false
    },
    startPrice: {
      type: Number,
      required: true
    },
    endPrice: {
      type: Number
    },
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    lockedPriceId: {
      type: String
    },
    houseFeePercent: {
      type: Number,
      default: 5
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for efficient querying
gameSchema.index({ status: 1, createdAt: -1 });
gameSchema.index({ 'player1.walletAddress': 1, createdAt: -1 });
gameSchema.index({ 'player2.walletAddress': 1, createdAt: -1 });
gameSchema.index({ startTime: 1 });
gameSchema.index({ endTime: 1 });

// Virtual for total pot
gameSchema.virtual('totalPot').get(function() {
  if (this.player2) {
    return this.player1.stake + this.player2.stake;
  }
  return this.player1.stake;
});

// Virtual for house fee
gameSchema.virtual('houseFee').get(function() {
  return this.totalPot * (this.houseFeePercent / 100);
});

// Methods
gameSchema.methods.calculateWinner = function() {
  if (!this.endPrice || !this.startPrice) return null;
  
  const priceChange = this.endPrice - this.startPrice;
  const priceWentUp = priceChange > 0;
  const priceWentDown = priceChange < 0;
  
  // Determine winners
  if (priceWentUp) {
    if (this.player1.prediction === PredictionDirection.UP) {
      this.player1.isWinner = true;
      this.player2 && (this.player2.isWinner = false);
    } else {
      this.player1.isWinner = false;
      this.player2 && (this.player2.isWinner = true);
    }
  } else if (priceWentDown) {
    if (this.player1.prediction === PredictionDirection.DOWN) {
      this.player1.isWinner = true;
      this.player2 && (this.player2.isWinner = false);
    } else {
      this.player1.isWinner = false;
      this.player2 && (this.player2.isWinner = true);
    }
  } else {
    // Price didn't change - both lose (house wins)
    this.player1.isWinner = false;
    this.player2 && (this.player2.isWinner = false);
  }
  
  // Calculate payouts
  const totalPot = this.totalPot;
  const houseFee = this.houseFee;
  const winnerPayout = totalPot - houseFee;
  
  if (this.player1.isWinner) {
    this.player1.payout = winnerPayout;
    this.player2 && (this.player2.payout = 0);
  } else if (this.player2 && this.player2.isWinner) {
    this.player1.payout = 0;
    this.player2.payout = winnerPayout;
  } else {
    // House wins
    this.player1.payout = 0;
    this.player2 && (this.player2.payout = 0);
  }
  
  return {
    winner: this.player1.isWinner ? 'player1' : (this.player2?.isWinner ? 'player2' : 'house'),
    priceChange,
    startPrice: this.startPrice,
    endPrice: this.endPrice
  };
};

gameSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Export the model
export default mongoose.model<IGame>('Game', gameSchema);