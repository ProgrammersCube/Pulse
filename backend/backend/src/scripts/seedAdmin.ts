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
    console.log('Admin created:', admin.password);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}; 
export const createSettings=async()=>{
  const settings=await Settings.create({})
}
// seedAdmin();