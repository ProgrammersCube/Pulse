import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceRecord extends Document {
  timestamp: Date;
  symbol: string;
  price: number;
  source: string;
}

const PriceRecordSchema: Schema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    required: true,
    default: 'hermes'
  }
});

// Create a compound index for efficient querying
PriceRecordSchema.index({ symbol: 1, timestamp: -1 });

const PriceRecord = mongoose.model<IPriceRecord>('PriceRecord', PriceRecordSchema);

export default PriceRecord;
