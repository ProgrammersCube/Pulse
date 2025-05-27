import mongoose, { Document, Schema } from 'mongoose';

// Token balance interface
interface ITokens {
  BeTyche: number;
  SOL: number;
  ETH: number;
  RADBRO: number;
}

// User interface
export interface IUser extends Document {
  walletAddress: string;
  tokens: ITokens;
  referralCode: string;
  referredBy?: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    tokens: {
      BeTyche: {
        type: Number,
        default: 0,
        min: 0
      },
      SOL: {
        type: Number,
        default: 0,
        min: 0
      },
      ETH: {
        type: Number,
        default: 0,
        min: 0
      },
      RADBRO: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true
    },
    referredBy: {
      type: String,
      default: null,
      index: true
    },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Indexes for performance
userSchema.index({ walletAddress: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ referredBy: 1 });
userSchema.index({ lastActive: -1 });

// Virtual for total token value (you can adjust the conversion rates)
userSchema.virtual('totalValue').get(function() {
  // Example conversion rates to USD (you would fetch these from an API)
  const rates = {
    BeTyche: 0.01, // Example rate
    SOL: 100,      // Example rate
    ETH: 2000,     // Example rate
    RADBRO: 0.005  // Example rate
  };
  
  return (
    this.tokens.BeTyche * rates.BeTyche +
    this.tokens.SOL * rates.SOL +
    this.tokens.ETH * rates.ETH +
    this.tokens.RADBRO * rates.RADBRO
  );
});

// Methods
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Export the model
export default mongoose.model<IUser>('User', userSchema);