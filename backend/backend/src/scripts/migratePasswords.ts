// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin.model';
import Ambassador from '../models/ambassador.model';
import User from '../models/user.model';

/**
 * Migration Script: Re-hash Legacy Passwords
 * 
 * This script checks all passwords in Admin, Ambassador, and User collections.
 * Any password that doesn't start with $2 (bcrypt prefix) will be re-hashed.
 * 
 * Usage: npx ts-node src/scripts/migratePasswords.ts
 */

const MONGODB_URI = process.env.MONGODB_URI || '';
async function migratePasswords() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to database');

    let totalMigrated = 0;

    // Migrate Admin passwords
    console.log('\n📋 Checking Admin collection...');
    const admins = await Admin.find({});
    let adminMigrated = 0;
    
    for (const admin of admins) {
        console.log(`checking admin: ${admin.username}`);
      if (admin.password && !admin.password.startsWith('$2')) {
        console.log(`  → Migrating Admin: ${admin.username}`);
        // Mark password as modified to trigger pre-save hook
        admin.markModified('password');
        await admin.save();
        adminMigrated++;
      }
    }
    console.log(`✓ Admin: ${adminMigrated}/${admins.length} passwords migrated`);
    totalMigrated += adminMigrated;

    // Migrate Ambassador passwords
    console.log('\n📋 Checking Ambassador collection...');
    const ambassadors = await Ambassador.find({});
    let ambassadorMigrated = 0;
    
    for (const ambassador of ambassadors) {
        console.log(`checking ambassador: ${ambassador.username}`);
      if (ambassador.password && !ambassador.password.startsWith('$2')) {
        console.log(`  → Migrating Ambassador: ${ambassador.username}`);
        ambassador.markModified('password');
        await ambassador.save();
        ambassadorMigrated++;
      }
    }
    console.log(`✓ Ambassador: ${ambassadorMigrated}/${ambassadors.length} passwords migrated`);
    totalMigrated += ambassadorMigrated;

    // Migrate User passwords
    console.log('\n📋 Checking User collection...');
    const users = await User.find({ password: { $exists: true, $ne: null } });
    let userMigrated = 0;
    
    for (const user of users) {
        console.log(`checking user: ${user.userName || user.walletAddress}`);
      if (user.password && !user.password.startsWith('$2')) {
        console.log(`  → Migrating User: ${user.userName || user.walletAddress}`);
        user.markModified('password');
        await user.save();
        userMigrated++;
      }
    }
    console.log(`✓ User: ${userMigrated}/${users.length} passwords migrated`);
    totalMigrated += userMigrated;

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`✓ Migration completed successfully!`);
    console.log(`  Total passwords migrated: ${totalMigrated}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
    process.exit(0);
  }
}

// Run migration
migratePasswords();

