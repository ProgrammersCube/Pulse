import mongoose, { Document, Int32, Schema } from 'mongoose';
export interface IWalletRotation {
  publicKey: string;
  privateKey: string;
  type: 'primary' | 'fallback';
  tokens: Record<string, number>; // you can adjust type if tokens needs stricter typing
  active:boolean;
}
export interface ISettings extends Document {
  // Token Settings
  enabledTokens: {
    BeTyche: boolean;
    SOL: boolean;
    ETH: boolean;
    RADBRO: boolean;
  };
  
  // Prediction Tokens Configuration
  predictionTokens: Array<{
    name: string;
    pythFeedId?: string; // Pyth Network price feed ID/alias
    default: boolean;
    active: boolean;
  }>;
  
  // Referral Bonus Settings
  referralBonus: {
    enabled: boolean;
    tokenType: string;
    referrerAmount: number;
    refereeAmount: number;
    isWithdrawable: boolean;
  };
  
  // Bet Limits per Token
  betLimits: {
    BeTyche: { min: number; max: number };
    SOL: { min: number; max: number };
    ETH: { min: number; max: number };
    RADBRO: { min: number; max: number };
  };
  bettingMode: string;
  enableHouseBotFallback: boolean;
  houseBotFallbackTimeout: number
  enableMatchmaking: boolean
  // House Settings
  houseWalletAddress: string;
  houseFeePercentage: number;
  
  // Giveaway Settings
  giveaway: {
    enabled: boolean;
    tokenType: string;
    amount: number;
    frequency: 'daily' | 'weekly' | 'monthly' | 'once';
  };
  walletRotationFallbackEnabled:boolean;
  // New Wallet Rotation
  walletRotation: IWalletRotation[];
  updatedAt: Date;
  updatedBy?: string;
}
const walletRotationSchema = new Schema<IWalletRotation>({
  publicKey: { type: String, required: true },
  privateKey: { type: String, required: true },
  type: { type: String, enum: ['primary', 'fallback'], required: false,default:"primary" },
  tokens: { type: Schema.Types.Mixed, default: {} }, // flexible tokens object
  active:{type:Boolean,required: true,default:false},
});
const settingsSchema = new Schema<ISettings>({
  enabledTokens: {
    BeTyche: { type: Boolean, default: true },
    SOL: { type: Boolean, default: true },
    ETH: { type: Boolean, default: false },
    RADBRO: { type: Boolean, default: true }
  },
  
  predictionTokens: {
    type: [
      new Schema(
        {
          name: { type: String, required: true },
          pythFeedId: { type: String, required: false },
          default: { type: Boolean, default: false },
          active: { type: Boolean, default: false }
        },
        { _id: false }
      )
    ],
    default: function() {
      return [
        { name: 'BTC', pythFeedId: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', default: false, active: false },
        { name: 'ETH', pythFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', default: false, active: false },
        { name: 'SOL', default: false, active: false },
        { name: 'DOGE', default: false, active: false },
        { name: 'AVAX', default: false, active: false },
        { name: 'LINK', default: false, active: false },
        { name: 'XRP', default: false, active: false },
        { name: 'MATIC', default: false, active: false },
        { name: 'TON', default: false, active: false },
        { name: 'BNB', default: false, active: false }
      ];
    }
  },
  
  referralBonus: {
    enabled: { type: Boolean, default: true },
    tokenType: { type: String, default: 'BeTyche' },
    referrerAmount: { type: Number, default: 1000 },
    refereeAmount: { type: Number, default: 1000 },
    isWithdrawable: { type: Boolean, default: false }
  },
  
  betLimits: {
    BeTyche: {
      min: { type: Number, default: 100 },
      max: { type: Number, default: 1000000 }
    },
    SOL: {
      min: { type: Number, default: 0.00001 },
      max: { type: Number, default: 100 }
    },
    ETH: {
      min: { type: Number, default: 0.001 },
      max: { type: Number, default: 10 }
    },
    RADBRO: {
      min: { type: Number, default: 100 },
      max: { type: Number, default: 10000000 }
    }
  },
  bettingMode:{
    type: String,
    default:"house-bot"
  },
  enableHouseBotFallback:{
     type: Boolean,
    default:true
  },
  houseBotFallbackTimeout: {
  type:Number,
   default:10
  },
  enableMatchmaking: {
    type:Boolean,
    default:true
  },
  houseWalletAddress: {
    type: String,
    default: process.env.HOUSE_WALLET_ADDRESS
  },
  
  houseFeePercentage: {
    type: Number,
    default: 5,
    min: 0,
    max: 50
  },
  
  giveaway: {
    enabled: { type: Boolean, default: false },
    tokenType: { type: String, default: 'BeTyche' },
    amount: { type: Number, default: 100 },
    frequency: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'once'],
      default: 'daily'
    }
  },
  walletRotationFallbackEnabled:{
    type:Boolean,
    default:false
  },
  walletRotation: { type: [walletRotationSchema], default: [] },
  updatedBy: String
}, {
  timestamps: true
});

export default mongoose.model<ISettings>('Settings', settingsSchema);