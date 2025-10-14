import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
export interface IAmbassador extends Document {
  comparePasswords(candidatePassword: string): Promise<boolean>;
  userId: string;
  username:string;
  password:string;
  walletAddress:string;
  ambassadorCode: string;
  commissionPercentage: number;
  payoutWalletAddress:string;
  totalReferrals: number;
   bonusTokens: {
    BeTyche: number;
    SOL: number;
    ETH: number;
    RADBRO: number;
  };
  totalEarnings: number;
  isActive: boolean;
  referredUsers: string[];
  earnings: {
    date: Date;
    userId: string;
    amount: number;
    token: string;
    userLoss: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin:Date;
  
}

const ambassadorSchema = new Schema<IAmbassador>({
   bonusTokens: {
      BeTyche: { type: Number, default: 0, min: 0 },
      SOL: { type: Number, default: 0, min: 0 },
      ETH: { type: Number, default: 0, min: 0 },
      RADBRO: { type: Number, default: 0, min: 0 }
    },
  userId: {
    type: String,
  },
  username:{
    type:String,
    required: true,
  },
  password:{
    type:String,
  },
  walletAddress:{
    type:String,
    required: true,
  },
  payoutWalletAddress:{
    type:String,
  },
  ambassadorCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    index: true
  },
  commissionPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
    default: 10
  },
  totalReferrals: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  referredUsers: [{
    type: String,
    ref: 'User'
  }],
  earnings: [{
    date: { type: Date, default: Date.now },
    userId: String,
    amount: Number,
    token: String,
    userLoss: Number
  }]
}, {
  timestamps: true
});
// Compare password method
ambassadorSchema.methods.comparePasswords = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};
export default mongoose.model<IAmbassador>('Ambassador', ambassadorSchema);