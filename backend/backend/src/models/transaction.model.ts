import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  signature: string;
  sender: string;
  recipient: string;
  amount: number;
  token: string;
  betId?: string;
  usedAt: Date;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  signature: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  betId: {
    type: String,
    index: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster signature lookups
transactionSchema.index({ signature: 1 });
transactionSchema.index({ betId: 1 });

export default mongoose.model<ITransaction>('Transaction', transactionSchema);

