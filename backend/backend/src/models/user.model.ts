import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
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
  loginType:string;
  updatedAt: Date;
  bonusTokens: {
    BeTyche: number;
    SOL: number;
    ETH: number;
    RADBRO: number;
  };
  isAmbassador: boolean;
  userName:string;
  password:string;
  resetotpCode:string;
  wallets:string[];
}

// User schema
const userSchema = new Schema<IUser>(
  {

    bonusTokens: {
      BeTyche: { type: Number, default: 0, min: 0 },
      SOL: { type: Number, default: 0, min: 0 },
      ETH: { type: Number, default: 0, min: 0 },
      RADBRO: { type: Number, default: 0, min: 0 }
    },
    isAmbassador: { type: Boolean, default: false },
    walletAddress: {
      type: String,
      unique: true,
      trim: true
    },
     wallets: {
    type: [String],
    default: [],
    trim: true,
    sparse: true  // This allows multiple undefined values
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
    loginType: {
    type: String,
    enum: ['guest', 'registered'],
    required: true,
    default: 'guest'
  },
    userName:{
      type: String,
    },
    password:{
      type: String,
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
    resetotpCode:{
    type:String
  },
    lastActive: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  },
  
);

// Indexes for performance
// userSchema.index({ walletAddress: 1 });
// userSchema.index({ referralCode: 1 });
// userSchema.index({ referredBy: 1 });
// userSchema.index({ lastActive: -1 });

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
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  console.log(this.password);
  console.log(candidatePassword);
  console.log(await bcrypt.compare(candidatePassword, this.password));
  return bcrypt.compare(candidatePassword, this.password);
};
// Export the model
const User =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default User;