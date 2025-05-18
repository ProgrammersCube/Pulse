import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  tokens: {
    BeTyche: number;
    SOL: number;
    ETH: number;
    RADBRO: number;
  };
  referralCode: string;
  referredBy: string;
  createdAt: Date;
  lastActive: Date;
}

const UserSchema: Schema = new Schema({
  walletAddress: {
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  tokens: {
    BeTyche: { type: Number, default: 0 },
    SOL: { type: Number, default: 0 },
    ETH: { type: Number, default: 0 },
    RADBRO: { type: Number, default: 0 }
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referredBy: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Generate a unique referral code when a user is created
UserSchema.pre('save', async function(next) {
  if (!this.referralCode) {
    // Generate a random 8-character string
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    this.referralCode = randomCode;
  }
  next();
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
