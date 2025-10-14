import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';

// Import all models
import User from '../models/user.model';
import Bet from '../models/bet.model';
import Ambassador from '../models/ambassador.model';
import Settings from '../models/settings.model';
import Admin from '../models/admin.model';
import MatchmakingQueue from '../models/matchmakingQueue.model';
import PriceRecord from '../models/price.model';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const resetDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse';
    console.log('🔗 Connecting to:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Show current data counts
    console.log('\n📊 Current Database Status:');
    console.log('------------------------');
    const counts = await Promise.all([
      User.countDocuments(),
      Bet.countDocuments(),
      Ambassador.countDocuments(),
      Admin.countDocuments(),
      PriceRecord.countDocuments()
    ]);
    
    console.log(`Users: ${counts[0]}`);
    console.log(`Bets: ${counts[1]}`);
    console.log(`Ambassadors: ${counts[2]}`);
    console.log(`Admins: ${counts[3]}`);
    console.log(`Price Records: ${counts[4]}`);
    
    const answer = await question('\n⚠️  Are you sure you want to DELETE ALL DATA? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Reset cancelled');
      process.exit(0);
    }
    
    const keepAdmin = await question('\n👤 Keep admin accounts? (yes/no): ');
    
    console.log('\n🗑️  Deleting data...');
    
    // Delete collections
    await Promise.all([
      User.deleteMany({}),
      Bet.deleteMany({}),
      Ambassador.deleteMany({}),
      MatchmakingQueue.deleteMany({}),
      PriceRecord.deleteMany({}),
      Settings.deleteMany({})
    ]);
    
    if (keepAdmin.toLowerCase() !== 'yes') {
      await Admin.deleteMany({});
      console.log('✅ Admin accounts deleted');
    } else {
      console.log('👤 Admin accounts preserved');
    }
    
    // Create default settings
    await Settings.create({
      enabledTokens: {
        BeTyche: true,
        SOL: true,
        ETH: false,
        RADBRO: true
      },
      referralBonus: {
        enabled: true,
        tokenType: 'BeTyche',
        referrerAmount: 1000,
        refereeAmount: 1000,
        isWithdrawable: false
      },
      betLimits: {
        BeTyche: { min: 100, max: 1000000 },
        SOL: { min: 0.00001, max: 100 },
        ETH: { min: 0.001, max: 10 },
        RADBRO: { min: 100, max: 10000000 }
      },
      houseWalletAddress: process.env.HOUSE_WALLET_ADDRESS,
      houseFeePercentage: 5,
      giveaway: {
        enabled: false,
        tokenType: 'BeTyche',
        amount: 100,
        frequency: 'daily'
      }
    });
    
    // Create default admin if needed
    if (keepAdmin.toLowerCase() !== 'yes') {
      await Admin.create({
        username: 'admin',
        password: 'admin123',
        email: 'admin@pulse.game',
        role: 'super_admin',
        isActive: true
      });
      console.log('\n✅ Default admin created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    }
    
    console.log('\n✅ Database reset complete!');
    console.log('✅ Default settings created');
    
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    rl.close();
    process.exit(1);
  }
};

resetDatabase();