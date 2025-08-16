import mongoose from 'mongoose';
import Admin from '../models/admin.model';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    const MONGODB_URI = "mongodb://mongo:aHiCVKRjWXKFkJZwWUGHHKNIRtOVcoYT@tramway.proxy.rlwy.net:18728";
    console.log('Connecting to:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all admins
    const admins = await Admin.find({});
    console.log('Total admins found:', admins.length);
    
    admins.forEach(admin => {
      console.log('Admin:', {
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        _id: admin._id
      });
    });
    
    // Try to find specific admin
    const adminByUsername = await Admin.findOne({ username: 'admins' });
    console.log('Found admin by username "admins":', adminByUsername);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkAdmin();