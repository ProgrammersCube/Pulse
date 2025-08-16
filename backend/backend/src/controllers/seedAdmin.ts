import mongoose from 'mongoose';
import Admin from '../models/admin.model';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    const MONGODB_URI = "mongodb://mongo:aHiCVKRjWXKFkJZwWUGHHKNIRtOVcoYT@tramway.proxy.rlwy.net:18728";

    await mongoose.connect(MONGODB_URI);
    
    // Create default admin
    const admin = await Admin.create({
      username: 'admins',
      password: 'admin123',  // Change this!
      email: 'admin2@pulse.game',
      role: 'super_admin'
    });
    
    console.log('Admin created:', admin.username);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedAdmin();