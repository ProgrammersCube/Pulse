import mongoose, { Document, Schema } from 'mongoose';

export enum PayoutRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export interface IPayoutRequest extends Document {
  ambassadorId: mongoose.Types.ObjectId;
  amount: number;
  payoutWalletAddress: string;
  status: PayoutRequestStatus;
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: string;
  adminNotes?: string;
  transactionHash?: string;
  rejectionReason?: string;
  requestId: string;
  createdAt: Date;
  updatedAt: Date;
}

const payoutRequestSchema = new Schema<IPayoutRequest>({
  ambassadorId: {
    type: Schema.Types.ObjectId,
    ref: 'Ambassador',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payoutWalletAddress: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: Object.values(PayoutRequestStatus),
    default: PayoutRequestStatus.PENDING,
    index: true
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: String,
    trim: true
  },
  adminNotes: {
    type: String,
    trim: true
  },
  transactionHash: {
    type: String,
    trim: true
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
payoutRequestSchema.index({ ambassadorId: 1, status: 1 });
payoutRequestSchema.index({ status: 1, requestedAt: -1 });
payoutRequestSchema.index({ processedAt: -1 });

export default mongoose.model<IPayoutRequest>('PayoutRequest', payoutRequestSchema);
