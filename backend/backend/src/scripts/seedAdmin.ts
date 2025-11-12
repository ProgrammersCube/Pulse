import mongoose from 'mongoose';
import Admin from '../models/admin.model';
import dotenv from 'dotenv';
import Settings from "../models/settings.model"
dotenv.config();
console.log(process.env.MONGODB_URI!)
export const seedAdmin = async () => {
  try {
    // await mongoose.connect(process.env.MONGODB_URI!);
    
    // Create default admin
    const admin = await Admin.create({
      username: 'admin',
      password: 'admin123',  // Change this!
      email: 'admin@pulse.game',
      role: 'super_admin'
    });
    
    console.log('Admin created:', admin.username);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}; 
export const createSettings=async()=>{
  const defaultPredictionTokens = [
    { name: 'BTC', default: false, active: false },
    { name: 'ETH', default: false, active: false },
    { name: 'SOL', default: false, active: false },
    { name: 'DOGE', default: false, active: false },
    { name: 'AVAX', default: false, active: false },
    { name: 'LINK', default: false, active: false },
    { name: 'XRP', default: false, active: false },
    { name: 'MATIC', default: false, active: false },
    { name: 'TON', default: false, active: false },
    { name: 'BNB', default: false, active: false }
  ];
  
  const settings = await Settings.create({
    predictionTokens: defaultPredictionTokens
  });
  
  console.log('Settings created with predictionTokens:', settings.predictionTokens);
  return settings;
}
// seedAdmin();