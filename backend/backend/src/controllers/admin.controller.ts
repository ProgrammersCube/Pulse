import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model';
import Settings from '../models/settings.model';
import Ambassador from '../models/ambassador.model';
import User from '../models/user.model';
import Bet from '../models/bet.model';
import PayoutRequest, { PayoutRequestStatus } from '../models/payoutRequest.model';
import CryptoJS from "crypto-js";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import bcrypt from 'bcryptjs';
const connection = new Connection(clusterApiUrl("mainnet-beta"));
// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string , {
    expiresIn: '7d'
  });
};

// JWT Secret validation endpoint
export const checkJWTSecret = async (req: Request, res: Response): Promise<void> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(503).json({
        success: false,
        message: 'JWT_SECRET not configured in environment variables',
        required: ['JWT_SECRET']
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'JWT_SECRET is properly configured'
    });
  } catch (error) {
    console.error('JWT Secret check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
};

// Admin login
// Admin login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      console.log('Admin login attempt:', username);
      // Find admin
      const admin = await Admin.findOne({ username });
      if (!admin) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }
      
      // Check password
      const isMatch = await admin.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }
      
      // Update last login
      admin.lastLogin = new Date();
      await admin.save();
      
      // Generate token - FIXED: Use proper type assertion
      const token = generateToken((admin as any)._id.toString());
      
      res.status(200).json({
        success: true,
        data: {
          token,
          admin: {
            id: (admin as any)._id,
            username: admin.username,
            email: admin.email,
            role: admin.role
          }
        }
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
 export  const ambassadarLogin=async(req:any,res:any)=>{
try {
      const { username, password } = req.body;
      console.log(username);
      console.log('Ambassadar login attempt:', username);
      // Find admin
      const ambassadar = await Ambassador.findOne({ username });
      console.log('Found Ambassadar:', ambassadar);
      if (!ambassadar) {
        res.status(401).json({ success: false, message: 'Invalid  user name' });
        return;
      }
      const isMatch = await ambassadar.comparePasswords(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid password'});
        return;
      }
      
      // Update last login
      ambassadar.lastLogin = new Date();
      await ambassadar.save();
      
      // Generate token - FIXED: Use proper type assertion
       const token = generateToken((ambassadar as any)._id.toString());
      
      res.status(200).json({
        success: true,
        data: {
           token,
          ambassadar: {
            id: (ambassadar as any)._id,
            username: ambassadar?.username,
            walletAddress: ambassadar?.walletAddress,
            ambassadorCode:ambassadar?.ambassadorCode,
            isActive:ambassadar?.isActive,
          }
        }
      });
    } catch (error) {
      console.error('Ambassadar login error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
 }
  // Get settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({});
    }
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
function decryptWalletKey(encrypted: string): any {
  const SERVER_SHARED_SECRET = process.env.SHARED_SECRET_For_PRIVATE_KEY;
  if (!SERVER_SHARED_SECRET) {
    throw new Error('SHARED_SECRET_For_PRIVATE_KEY not found in environment');
  }
  
  // Validate encrypted input
  if (!encrypted || typeof encrypted !== 'string') {
    throw new Error('Invalid encrypted data format');
  }
  
  // If not encrypted, return as-is
  if (!encrypted.startsWith('U2FsdGVkX1')) {
    return encrypted;
  }
  
  // Decrypt the data
  const bytes = CryptoJS.AES.decrypt(encrypted, SERVER_SHARED_SECRET);
  if (!bytes || bytes.sigBytes <= 0) {
    throw new Error('Decryption failed - no valid data returned');
  }
  
  // Convert to UTF-8 string
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedString) {
    throw new Error('Decryption resulted in empty string');
  }
  
  // Try to parse as JSON if it looks like an array
  if (decryptedString.startsWith('[') && decryptedString.endsWith(']')) {
    try {
      return JSON.parse(decryptedString);
    } catch {
      // If parsing fails, return the string
      return decryptedString;
    }
  }
  
  return decryptedString;
}
export async function isValidSolanaAddress(address: string): Promise<{ isValid: boolean; isInitialized: boolean; error?: string }> {
  try {
    // First, validate the address format
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch (error) {
      return {
        isValid: false,
        isInitialized: false,
        error: "Invalid Solana address format"
      };
    }

    // Check if it's a valid base58 string and correct length
    if (!PublicKey.isOnCurve(pubkey)) {
      return {
        isValid: false,
        isInitialized: false,
        error: "Address is not on the ed25519 curve"
      };
    }

    // Now check if the account is initialized on the blockchain
    try {
      const accountInfo = await connection.getAccountInfo(pubkey);
      console.log('Account info for', address, ':', accountInfo);
      
      return {
        isValid: true,
        isInitialized: accountInfo !== null,
        error: undefined
      };
    } catch (networkError) {
      // If we can't reach the network, the address format is still valid
      console.warn('Network error checking account:', networkError);
      return {
        isValid: true,
        isInitialized: false,
        error: "Could not verify account initialization due to network error"
      };
    }
  } catch (error) {
    return {
      isValid: false,
      isInitialized: false,
      error: error instanceof Error ? error.message : "Unknown validation error"
    };
  }
}
export const updateWalletRotation = async (req: any, res: any) => {
   try {
    const { privateKey, publicKey, tokens, type } = req.body;

    if (!privateKey || !publicKey || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    console.log(publicKey)
    const addressValidation = await isValidSolanaAddress(publicKey);
    
    if (!addressValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid Solana address: ${addressValidation.error}` 
      });
    }
    
    // Log validation results for debugging
    console.log('Address validation results:', {
      address: publicKey,
      isValid: addressValidation.isValid,
      isInitialized: addressValidation.isInitialized,
      error: addressValidation.error
    });
    
    // Note: We accept both initialized and uninitialized valid addresses
    // since new wallets won't be initialized until they receive their first transaction
    console.log('🔑 Adding wallet with:', {
      publicKey: publicKey.substring(0, 20) + '...',
      privateKeyLength: privateKey.length,
      type: type
    });

    // Check if private key is already encrypted (starts with U2FsdGVkX1)
    if (privateKey.startsWith('U2FsdGVkX1')) {
      console.log('⚠️ Private key appears to be already encrypted, attempting to validate...');
      try {
        // Validate decryption works (but don't log the result)
        decryptWalletKey(privateKey);
        console.log('✅ Private key validation successful');
      } catch (decryptError) {
        console.error('❌ Failed to decrypt private key:', decryptError);
        return res.status(400).json({ 
          success: false, 
          message: "Private key appears to be corrupted or encrypted with different key",
          details: decryptError instanceof Error ? decryptError?.message : 'Unknown error'
        });
      }
    } else {
      console.log('✅ Private key is not encrypted, proceeding with encryption...');
      // The private key is not encrypted, so we'll encrypt it before storing
    }

    // Encrypt the private key before storing (if it's not already encrypted)
    let encryptedPrivateKey = privateKey;
    if (!privateKey.startsWith('U2FsdGVkX1')) {
      // Reject plaintext private keys in production
      if (process.env.NODE_ENV === 'production') {
        return res.status(400).json({ 
          success: false, 
          message: 'Plaintext private keys are not allowed in production. Keys must be pre-encrypted with AES-256 (starting with U2FsdGVkX1).' 
        });
      }
      
      try {
        const SERVER_SHARED_SECRET = process.env.SHARED_SECRET_For_PRIVATE_KEY;
        if (!SERVER_SHARED_SECRET) {
          throw new Error('SHARED_SECRET_For_PRIVATE_KEY not found in environment');
        }
        
         encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, SERVER_SHARED_SECRET).toString();
        console.log('✅ Private key encrypted successfully (development mode)');
      } catch (encryptError) {
        console.error('❌ Failed to encrypt private key:', encryptError);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to encrypt private key",
          details: encryptError instanceof Error ? encryptError?.message : 'Unknown error'
        });
      }
    }

    const walletData = {
      publicKey,
      privateKey: encryptedPrivateKey, // Store the encrypted version
      type,
      tokens: tokens || {}, // default empty object
      updatedAt: new Date()
    };

    // Push new wallet into walletRotation array
    const updatedData=await Settings.updateOne(
      {},
      { $push: { walletRotation: walletData } },
      { upsert: true }
    );

    res.status(200).json({ success: true, data: updatedData });
  } catch (error) {
    console.error("Update wallet rotation error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
export const getWalletRotationWallets = async (req: any, res: any) => {
      try {
      const getSettings = await Settings.findOne({});
  let getActiveWallet = await Settings.findOne(
  { walletRotation: { $elemMatch: { active: true, type: getSettings?.walletRotationFallbackEnabled?"fallback":"primary" } } }, // ensure same element
  { 'walletRotation.$': 1 } // return only the matched element in the array
).lean();

  res.status(200).json({ success: true, data: getSettings?.walletRotation,activeWallet:getActiveWallet,fallbackEnabled:getSettings?.walletRotationFallbackEnabled });  
  }
  catch (error) {
    console.error("Get wallet rotation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
export const toggleWalletRotationFallback = async (req: any, res: any) => {
  try {
    const { toggleWallet } = req.body;
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }
    settings.walletRotationFallbackEnabled = toggleWallet;
    const updatedSettings = await settings.save();
    return res.status(200).json({
      success: true,
      message: `Wallet Rotation Fallback ${toggleWallet ? "enabled" : "disabled"} successfully.`,
      data: updatedSettings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const setActiveWallet = async (req: any, res: any) => {
 try {
    const { walletId, targetType } = req.body;
    console.log(targetType);
    if (!walletId) {
      return res.status(400).json({ success: false, message: "walletId is required" });
    }

    // Find settings document
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }

    let newActiveWalletPublicKey = null;

    settings.walletRotation = settings.walletRotation.map((wallet: any) => {
      const plainWallet = wallet.toObject?.() || wallet;

      // Only update wallets of the same targetType
      if (plainWallet.type === targetType) {
        const isBeingActivated = plainWallet._id.toString() === walletId;
        
        // Store the public key of the wallet being activated
        if (isBeingActivated) {
          newActiveWalletPublicKey = plainWallet.publicKey;
        }
        
        return {
          ...plainWallet,
          active: isBeingActivated, // activate only the selected one
        };
      }

      // Leave wallets of other types as they are
      return plainWallet;
    });

    // Update houseWalletAddress to the newly activated wallet's public key
    if (newActiveWalletPublicKey) {
      settings.houseWalletAddress = newActiveWalletPublicKey;
      console.log('🏠 Updated houseWalletAddress to:', newActiveWalletPublicKey);
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message: newActiveWalletPublicKey 
        ? "Active wallet and house wallet address updated successfully" 
        : "Active wallet updated successfully",
      data: {
        walletRotation: settings.walletRotation,
        houseWalletAddress: settings.houseWalletAddress,
        updatedHouseWallet: !!newActiveWalletPublicKey
      }
    });
  } catch (error) {
    console.error("setActiveWallet error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }

}

// Get real blockchain balances for a specific wallet
export const getWalletBalances = async (req: any, res: any) => {
  try {
    const { walletId } = req.params;
    console.log('🔍 Fetching balances for wallet:', walletId);
    
    // Get wallet details from settings
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }
    
    const wallet = settings.walletRotation.find((w: any) => w._id.toString() === walletId);
    if (!wallet) {
      return res.status(404).json({ success: false, message: "Wallet not found" });
    }
    
    console.log('🏦 Wallet found:', {
      publicKey: wallet.publicKey,
      type: wallet.type,
      active: wallet.active,
      privateKeyLength: wallet.privateKey?.length,
      privateKeyStartsWith: wallet.privateKey ? wallet.privateKey.substring(0, 20) + '...' : 'N/A',
      isEncrypted: wallet.privateKey?.startsWith('U2FsdGVkX1')
    });
    
    // Import blockchain service dynamically to avoid circular dependencies
    const { getBlockchainService } = await import('../services/blockchain.service');
    const blockchainService = getBlockchainService();
    
    // For balance checking, we only need the public key - no need to decrypt private key or create keypair
    console.log('🔑 Processing wallet data for balance checking:', {
      publicKey: wallet.publicKey,
      privateKeyLength: wallet.privateKey?.length,
      isEncrypted: wallet.privateKey?.startsWith('U2FsdGVkX1')
    });
    
    // Note: We don't need to decrypt the private key or create a keypair for balance checking
    // The blockchain service can fetch balances using just the public key
    
    // Fetch balances for SOL, BeTyche, and RADBRO
    const balances: Record<string, number> = {};
    const supportedTokens = ['SOL', 'BeTyche', 'RADBRO'];
    
    console.log('💰 Fetching balances for tokens:', supportedTokens);
    
    for (const token of supportedTokens) {
      try {
        console.log(`💰 Checking ${token} balance...`);
        const balance = await blockchainService.getRealBalance(wallet.publicKey, token);
        balances[token] = balance;
        console.log(`✅ ${token} balance:`, balance);
      } catch (error) {
        console.log(`⚠️ Error fetching ${token} balance:`, error instanceof Error ? error.message : 'Unknown error');
        balances[token] = 0; // Set to 0 if token doesn't exist or error
      }
    }
    
    console.log('📊 Final balances:', balances);
    
    res.status(200).json({
      success: true,
      data: {
        walletId,
        publicKey: wallet.publicKey,
        balances,
        lastUpdated: new Date(),
        network: process.env.SOLANA_NETWORK || 'mainnet',
        debug: {
          privateKeyLength: wallet.privateKey?.length,
          isEncrypted: wallet.privateKey?.startsWith('U2FsdGVkX1'),
          privateKeyType: typeof wallet.privateKey
        }
      }
    });
    
  } catch (error) {
    console.error("❌ Get wallet balances error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const adminId = "68a0793568f56141d9d81a86";
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    // Update fields
    Object.assign(settings, updates);
    // Handle wallet rotation if provided
//     if (updates?.walletRotation) {
//       const { publicKey, privateKey,type } = updates?.walletRotation;
//       const decryptedPrivateKey = decryptWalletKey(privateKey);
//         // settings.walletRotation = {
//         //   publicKey,
//         //   privateKey:encryptedPrivateKey,

//         //   updatedAt: new Date()
//         // };
//         await Settings.updateOne(
//   {},
//   {
//     $push: {
//       walletRotation: {
//         publicKey,
//         privateKey: decryptedPrivateKey,
//         type,
//         // tokens: { BeTyche: 5000, SOL: 2 },

//       }
//     }
//   }
// );
//     }
    settings.updatedBy = adminId;
    
    await settings.save();
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalBets, activeBets, totalAmbassadors] = await Promise.all([
      User.countDocuments(),
      Bet.countDocuments(),
      Bet.countDocuments({ status: { $in: ['PENDING', 'MATCHED', 'IN_PROGRESS'] } }),
      Ambassador.countDocuments({ isActive: true })
    ]);
    
    // Get revenue stats
    const revenueStats = await Bet.aggregate([
      { $match: { status: 'COMPLETED' } },
      {
        $group: {
          _id: '$token',
          totalVolume: { $sum: '$amount' },
          totalFees: { $sum: '$fee' },
          totalBets: { $sum: 1 }
        }
      }
    ]);

    // Get total platform fees from all bets
    const totalPlatformFees = await Bet.aggregate([
      {
        $group: {
          _id: null,
          totalFees: { $sum: '$fee' }
        }
      }
    ]);

    const allActiveBets=await Bet.find({status:"IN_PROGRESS"})
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBets,
        activeBets,
        totalAmbassadors,
        revenueStats,
        totalPlatformFees: totalPlatformFees[0]?.totalFees || 0,
        allActiveBets
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get player net profitability
export const getPlayerNetProfitability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timePeriod = 'ALL', limit = 50 } = req.query;
    
    // Calculate date filter based on time period
    let dateFilter = {};
    if (timePeriod !== 'ALL') {
      const now = new Date();
      let startDate = new Date();
      
      switch (timePeriod) {
        case '1D':
          startDate.setDate(now.getDate() - 1);
          break;
        case '1W':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1M':
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          startDate = new Date(0); // All time
      }
      
      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get all users who have placed bets
    const playersWithBets = await Bet.aggregate([
      { $match: { status: 'COMPLETED', ...dateFilter } },
      {
        $group: {
          _id: '$userId',
          totalBets: { $sum: 1 },
          totalWins: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, '$amount', 0] 
            } 
          },
          totalLosses: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, '$amount', 0] 
            } 
          },
          winCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] 
            } 
          },
          lossCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, 1, 0] 
            } 
          },
          totalVolume: { $sum: '$amount' },
          totalFees: { $sum: '$fee' },
          lastBetDate: { $max: '$finalizedAt' }
        }
      },
      {
        $addFields: {
          netPL: { $subtract: ['$totalLosses', '$totalWins'] },
          winRate: {
            $cond: [
              { $gt: ['$totalBets', 0] },
              { $multiply: [{ $divide: ['$winCount', '$totalBets'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'walletAddress',
          as: 'userInfo'
        }
      },
      {
        $unwind: {
          path: '$userInfo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          walletAddress: '$_id',
          username: { 
            $ifNull: [
              '$userInfo.username', 
              { $concat: [{ $substr: ['$_id', 0, 10] }, '...'] }
            ] 
          },
          email: { $ifNull: ['$userInfo.email', ''] },
          loginType: { $ifNull: ['$userInfo.loginType', 'guest'] },
          referredBy: { $ifNull: ['$userInfo.referredBy', ''] },
          createdAt: { $ifNull: ['$userInfo.createdAt', '$lastBetDate'] }
        }
      },
      {
        $project: {
          _id: 0,
          walletAddress: 1,
          username: 1,
          email: 1,
          loginType: 1,
          referredBy: 1,
          totalBets: 1,
          totalWins: 1,
          totalLosses: 1,
          winCount: 1,
          lossCount: 1,
          netPL: 1,
          winRate: 1,
          totalVolume: 1,
          totalFees: 1,
          lastBetDate: 1,
          createdAt: 1
        }
      },
      {
        $sort: { netPL: -1 } // Sort by net P/L (most profitable first)
      },
      {
        $limit: parseInt(limit as string)
      }
    ]);

    // Calculate summary statistics
    const summaryStats = await Bet.aggregate([
      { $match: { status: 'COMPLETED', ...dateFilter } },
      {
        $group: {
          _id: '$userId',
          totalBets: { $sum: 1 },
          totalWins: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, '$amount', 0] 
            } 
          },
          totalLosses: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, '$amount', 0] 
            } 
          },
          winCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] 
            } 
          },
          lossCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          netPL: { $subtract: ['$totalLosses', '$totalWins'] }
        }
      },
      {
        $group: {
          _id: null,
          totalPlayers: { $sum: 1 },
          profitablePlayers: {
            $sum: { $cond: [{ $gte: ['$netPL', 0] }, 1, 0] }
          },
          losingPlayers: {
            $sum: { $cond: [{ $lt: ['$netPL', 0] }, 1, 0] }
          },
          totalNetPL: { $sum: '$netPL' },
          totalBets: { $sum: '$totalBets' },
          totalWins: { $sum: '$winCount' },
          totalLosses: { $sum: '$lossCount' }
        }
      }
    ]);

    const summary = summaryStats[0] || {
      totalPlayers: 0,
      profitablePlayers: 0,
      losingPlayers: 0,
      totalNetPL: 0,
      totalBets: 0,
      totalWins: 0,
      totalLosses: 0
    };

    res.status(200).json({
      success: true,
      message: 'Player net profitability data retrieved successfully',
      data: {
        players: playersWithBets,
        summary: {
          totalPlayers: summary.totalPlayers,
          profitablePlayers: summary.profitablePlayers,
          losingPlayers: summary.losingPlayers,
          totalNetPL: summary.totalNetPL,
          totalBets: summary.totalBets,
          totalWins: summary.totalWins,
          totalLosses: summary.totalLosses,
          overallWinRate: summary.totalBets > 0 ? (summary.totalWins / summary.totalBets * 100).toFixed(1) : 0
        },
        timePeriod,
        limit: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Get player net profitability error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Net Revenue Analytics
export const getNetRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timePeriod = 'ALL' } = req.query;
    
    // Calculate date filter based on time period
    let dateFilter = {};
    const now = new Date();
    
    switch (timePeriod) {
      case '1D':
        dateFilter = { finalizedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '1W':
        dateFilter = { finalizedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '1M':
        dateFilter = { finalizedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case 'ALL':
      default:
        dateFilter = {};
        break;
    }

    // Get revenue analytics for each token
    const revenueAnalytics = await Bet.aggregate([
      { $match: { status: 'COMPLETED', ...dateFilter } },
      {
        $group: {
          _id: '$token',
          totalBets: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          totalWins: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, '$amount', 0] 
            } 
          },
          totalLosses: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, '$amount', 0] 
            } 
          },
          totalFees: { $sum: '$fee' },
          winCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] 
            } 
          },
          lossCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          netRevenue: { $subtract: [{ $add: ['$totalLosses', '$totalFees'] }, '$totalWins'] },
          winRate: {
            $cond: [
              { $gt: ['$totalBets', 0] },
              { $multiply: [{ $divide: ['$winCount', '$totalBets'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          token: '$_id',
          totalBets: 1,
          totalVolume: 1,
          totalWins: 1,
          totalLosses: 1,
          totalFees: 1,
          netRevenue: 1,
          winCount: 1,
          lossCount: 1,
          winRate: { $round: ['$winRate', 2] }
        }
      },
      {
        $sort: { token: 1 }
      }
    ]);

    // Ensure all three tokens are present, even with zero values
    const allTokens = ['SOL', 'BeTyche', 'RADBRO'];
    const tokenMap = new Map();
    
    // Create map from existing data
    revenueAnalytics.forEach(token => {
      tokenMap.set(token.token, token);
    });
    
    // Ensure all tokens are present
    const completeTokenBreakdown = allTokens.map(tokenName => {
      if (tokenMap.has(tokenName)) {
        return tokenMap.get(tokenName);
      } else {
        // Return zero values for missing tokens
        return {
          token: tokenName,
          totalBets: 0,
          totalVolume: 0,
          totalWins: 0,
          totalLosses: 0,
          totalFees: 0,
          netRevenue: 0,
          winCount: 0,
          lossCount: 0,
          winRate: 0
        };
      }
    });

    // Calculate overall totals
    const overallStats = await Bet.aggregate([
      { $match: { status: 'COMPLETED', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          totalWins: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, '$amount', 0] 
            } 
          },
          totalLosses: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, '$amount', 0] 
            } 
          },
          totalFees: { $sum: '$fee' },
          winCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] 
            } 
          },
          lossCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          netRevenue: { $subtract: [{ $add: ['$totalLosses', '$totalFees'] }, '$totalWins'] },
          winRate: {
            $cond: [
              { $gt: ['$totalBets', 0] },
              { $multiply: [{ $divide: ['$winCount', '$totalBets'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalBets: 1,
          totalVolume: 1,
          totalWins: 1,
          totalLosses: 1,
          totalFees: 1,
          netRevenue: 1,
          winCount: 1,
          lossCount: 1,
          winRate: { $round: ['$winRate', 2] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Net revenue analytics retrieved successfully',
      data: {
        tokenBreakdown: completeTokenBreakdown,
        overall: overallStats[0] || {
          totalBets: 0,
          totalVolume: 0,
          totalWins: 0,
          totalLosses: 0,
          totalFees: 0,
          netRevenue: 0,
          winCount: 0,
          lossCount: 0,
          winRate: 0
        },
        timePeriod
      }
    });
  } catch (error) {
    console.error('Get net revenue analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get Prediction Token Stats
export const getPredictionTokenStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { timePeriod = 'ALL' } = req.query;
    
    // Calculate date filter based on time period
    let dateFilter = {};
    const now = new Date();
    
    switch (timePeriod) {
      case '1D':
        dateFilter = { finalizedAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '1W':
        dateFilter = { finalizedAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '1M':
        dateFilter = { finalizedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case 'ALL':
      default:
        dateFilter = {};
        break;
    }

    // Get stats grouped by predictionToken
    const tokenStats = await Bet.aggregate([
      { $match: { status: 'COMPLETED', ...dateFilter } },
      {
        $addFields: {
          predictionToken: {
            $ifNull: ['$predictionToken', 'BTC']
          }
        }
      },
      {
        $group: {
          _id: '$predictionToken',
          totalBets: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          totalWins: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, '$amount', 0] 
            } 
          },
          totalLosses: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, '$amount', 0] 
            } 
          },
          winCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] 
            } 
          },
          lossCount: { 
            $sum: { 
              $cond: [{ $eq: ['$result', 'LOSS'] }, 1, 0] 
            } 
          }
        }
      },
      {
        $addFields: {
          winRate: {
            $cond: [
              { $gt: ['$totalBets', 0] },
              { $multiply: [{ $divide: ['$winCount', '$totalBets'] }, 100] },
              0
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          predictionToken: {
            $ifNull: ['$_id', 'BTC']
          },
          totalBets: 1,
          totalVolume: 1,
          totalWins: 1,
          totalLosses: 1,
          winCount: 1,
          lossCount: 1,
          winRate: { $round: ['$winRate', 2] }
        }
      },
      {
        $sort: { totalVolume: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Prediction token stats retrieved successfully',
      data: {
        tokenStats,
        timePeriod
      }
    });
  } catch (error) {
    console.error('Get prediction token stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create ambassador
export const createAmbassador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, ambassadorCode, commissionPercentage, username, password } = req.body;
  
    // Check if user exists
    let user = await User.findOne({ walletAddress });    
    // Check if already ambassador
    const existing = await Ambassador.findOne({ username });
    if (existing) {
      res.status(400).json({ success: false, message: 'Ambassadar is already created with this username' });
      return;
    }
    
    // Create ambassador
    const ambassador = await Ambassador.create({
      userId:user?user?._id:"",
      username,
      ambassadorCode: ambassadorCode.toUpperCase(),
      commissionPercentage,
      walletAddress,
      password,
      payoutWalletAddress:walletAddress
    });
    
    res.status(201).json({ success: true, data: ambassador });
  } catch (error) {
    console.error('Create ambassador error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all ambassadors
export const getAmbassadors = async (req: Request, res: Response): Promise<void> => {
  try {
    const ambassadors = await Ambassador.find()
      .sort({ createdAt: -1 });
    
    // Get ambassadors with user details and earnings calculations
    const ambassadorsWithDetails = await Promise.all(
      ambassadors.map(async (ambassador) => {
        // Get user details for referred users
        const referredUserDetails = await User.find({
          walletAddress: { $in: ambassador.referredUsers }
        }).select('walletAddress lastActive username email loginType createdAt');
        
        // Get recent 10 LOSS bets from referred users (for display purposes)
        const recentLossBets = await Bet.aggregate([
          {
            $match: {
              userId: { $in: ambassador.referredUsers },
              status: 'COMPLETED',
              result: 'LOSS' // Only losses generate commissions
            }
          },
          {
            $sort: { finalizedAt: -1 } // Sort by most recent first
          },
          {
            $limit: 10 // Limit to 10 most recent bets
          },
          {
            $project: {
              _id: 0,
              betId: '$_id',
              userId: 1,
              amount: 1,
              token: 1,
              finalizedAt: 1,
              formattedDate: {
                $dateToString: {
                  format: '%Y-%m-%d %H:%M',
                  date: '$finalizedAt'
                }
              },
              result: 1
            }
          }
        ]);
        
        // Calculate total losses from ALL completed loss bets (not just recent 10)
        const allLossBetsAggregation = await Bet.aggregate([
          {
            $match: {
              userId: { $in: ambassador.referredUsers },
              status: 'COMPLETED',
              result: 'LOSS'
            }
          },
          {
            $group: {
              _id: null,
              totalLossesGenerated: { $sum: '$amount' }
            }
          }
        ]);
        
        // Calculate total wins from ALL completed win bets
        const allWinBetsAggregation = await Bet.aggregate([
          {
            $match: {
              userId: { $in: ambassador.referredUsers },
              status: 'COMPLETED',
              result: 'WIN'
            }
          },
          {
            $group: {
              _id: null,
              totalWinsGenerated: { $sum: '$amount' }
            }
          }
        ]);
        
        const totalLossesGenerated = allLossBetsAggregation.length > 0 ? allLossBetsAggregation[0].totalLossesGenerated : 0;
        const totalWinsGenerated = allWinBetsAggregation.length > 0 ? allWinBetsAggregation[0].totalWinsGenerated : 0;
        const totalNetLoss = totalLossesGenerated - totalWinsGenerated;
        const totalEarnings = totalNetLoss * (ambassador.commissionPercentage / 100);
        
        // Get total count of all loss bets (not just recent 10)
        const totalLossBets = await Bet.countDocuments({
          userId: { $in: ambassador.referredUsers },
          status: 'COMPLETED',
          result: 'LOSS'
        });
        const pendingCommissions = 0; // No pending commissions for completed bets
        
        // Get total games (wins + losses) for complete picture
        const totalGames = await Bet.countDocuments({
          userId: { $in: ambassador.referredUsers },
          status: 'COMPLETED'
        });
        
        const totalWins = await Bet.countDocuments({
          userId: { $in: ambassador.referredUsers },
          status: 'COMPLETED',
          result: 'WIN'
        });
        
        const totalLosses = await Bet.countDocuments({
          userId: { $in: ambassador.referredUsers },
          status: 'COMPLETED',
          result: 'LOSS'
        });
        
        // Calculate additional statistics
        const totalWagerVolume = await Bet.aggregate([
          {
            $match: {
              userId: { $in: ambassador.referredUsers },
              status: { $in: ['COMPLETED', 'IN_PROGRESS'] }
            }
          },
          {
            $group: {
              _id: null,
              totalVolume: { $sum: '$amount' }
            }
          }
        ]);
        
        const totalVolume = totalWagerVolume.length > 0 ? totalWagerVolume[0].totalVolume : 0;
        
        return {
          ...ambassador.toObject(),
          referredUserDetails,
          recentLossBets,
          totalLossesGenerated,
          totalWinsGenerated,
          totalNetLoss,
          totalEarnings,
          totalLossBets,
          totalGames,
          totalWins,
          totalLosses,
          pendingCommissions,
          totalVolume
        };
      })
    );
    
    res.status(200).json({ success: true, data: ambassadorsWithDetails });
  } catch (error) {
    console.error('Get ambassadors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update ambassador
export const updateAmbassador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { walletAddress, ambassadorCode, commissionPercentage, payoutWalletAddress } = req.body;
    console.log(req.body);
    // Validate required fields
    if (!walletAddress || !ambassadorCode || commissionPercentage === undefined) {
      res.status(400).json({ 
        success: false, 
        message: 'Wallet address, ambassador code, and commission percentage are required' 
      });
      return;
    }

    // Check if ambassador code is unique (excluding current ambassador)
    const existingAmbassador = await Ambassador.findOne({ 
      ambassadorCode: ambassadorCode.toUpperCase(),
      _id: { $ne: id }
    });
    
    if (existingAmbassador) {
      res.status(400).json({ 
        success: false, 
        message: 'Ambassador code already exists' 
      });
      return;
    }

    const updateData: any = {
      walletAddress,
      ambassadorCode: ambassadorCode.toUpperCase(),
      commissionPercentage: parseFloat(commissionPercentage),
      payoutWalletAddress: payoutWalletAddress || ''
    };
    // Update ambassador
    const updatedAmbassador = await Ambassador.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );

    if (!updatedAmbassador) {
      res.status(404).json({ 
        success: false, 
        message: 'Ambassador not found' 
      });
      return;
    }

    res.json({ 
      success: true, 
      message: 'Ambassador updated successfully',
      data: updatedAmbassador
    });
    return;

  } catch (error) {
    console.error('Update ambassador error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
    return;
  }
};

// Delete ambassador
export const deleteAmbassador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if ambassador exists
    const ambassador = await Ambassador.findById(id);
    if (!ambassador) {
      res.status(404).json({ 
        success: false, 
        message: 'Ambassador not found' 
      });
      return;
    }

    // If ambassador has referred users, update their referredBy field to null and isAmbassador to false
    if (ambassador.referredUsers && ambassador.referredUsers.length > 0) {
      try {
        // Update all users who were referred by this ambassador
        await User.updateMany(
          { walletAddress: { $in: ambassador.referredUsers } },
          { 
            $unset: { referredBy: 1 },
            $set: { isAmbassador: false }
          }
        );
        
        console.log(`Updated ${ambassador.referredUsers.length} users to remove referral from ambassador ${ambassador.ambassadorCode} and set isAmbassador to false`);
      } catch (userUpdateError) {
        console.error('Error updating referred users:', userUpdateError);
        // Continue with ambassador deletion even if user update fails
      }
    }

    // Delete ambassador
    await Ambassador.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Ambassador deleted successfully and all associated referrals have been cleared'
    });
    return;

  } catch (error) {
    console.error('Delete ambassador error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
    return;
  }
};

// Change ambassador password
export const ambassadarChangePassword = async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const ambassador = req.ambassador; // From ambassadorAuth middleware
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password and confirm password do not match' 
      });
    }
    
    // Check if new password is at least 6 characters
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }
    const isMatch = await bcrypt.compare(currentPassword, ambassador.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    const generateNewToken = generateToken((ambassador as any)._id.toString());
    ambassador.password = newPassword;
    await ambassador.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' ,
      updatedToken: generateNewToken
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Change ambassador payout wallet address
export const changeAmbassadorPayoutWallet = async (req: any, res: any) => {
  try {
    const { payoutWalletAddress } = req.body;
    const ambassador = req.ambassador; // From ambassadorAuth middleware

    // Validate input
    if (!payoutWalletAddress || payoutWalletAddress.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payout wallet address is required' 
      });
    }

    // Basic wallet address validation (you can enhance this based on your requirements)
    if (payoutWalletAddress.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid wallet address format' 
      });
    }

    // Update the ambassador's payout wallet address
    const updatedAmbassador = await Ambassador.findByIdAndUpdate(
      ambassador._id,
      { payoutWalletAddress: payoutWalletAddress.trim() },
      { new: true }
    );

    if (!updatedAmbassador) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ambassador not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Payout wallet address updated successfully',
      data: {
        payoutWalletAddress: updatedAmbassador.payoutWalletAddress
      }
    });

  } catch (error) {
    console.error('Change payout wallet error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

export const ambassadarDassboardStats = async (req: any, res: any) => {
  try {
    console.log(req.body);
    const { ambassadorId } = req.body;
    console.log(ambassadorId);
    const ambassador = await Ambassador.findById(ambassadorId);
    if (!ambassador) {
      res.status(404).json({ success: false, message: 'Ambassador not found' });
      return;
    }
    // Get all bets from referred users (bets are reffered users with house bot )
    const stats = await Bet.aggregate([
      {
        $match: {
          userId: { $in: ambassador.referredUsers },
          status: 'COMPLETED',
          opponentId: 'HOUSE_BOT'
        }
      },
      {
        $group: {
          _id: null,
          totalWins: {
            $sum: {
              $cond: [
                { $eq: ['$result', 'WIN'] }, // if result is 'WIN'
                '$amount',                  // sum amount
                0                           // else 0
              ]
            }
          },
          totalLoss: {
            $sum: {
              $cond: [
                { $eq: ['$result', 'LOSS'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalWins: 1,
          totalLoss: 1,
          netLoss: { $subtract: ['$totalLoss', '$totalWins'] }
        }
      }
    ]);
    const userName = ambassador?.username || "ambassador123";
    const totalReferrals = ambassador?.referredUsers?.length || 0;
    const commissionRate = ambassador?.commissionPercentage || 0;
    
    // Calculate totals across all users
    const totalWins = stats?.reduce((sum, stat) => sum + (stat.totalWins || 0), 0) || 0;
    const totalLoss = stats?.reduce((sum, stat) => sum + (stat.totalLoss || 0), 0) || 0;
    const netLoss = totalLoss - totalWins;
    const totalCommissions = (commissionRate / 100) * Math.max(0, netLoss); // Only positive net losses generate commissions
    
    // Check if ambassador has any pending payout requests
    const pendingRequest = await PayoutRequest.findOne({
      ambassadorId: ambassador._id,
      status: PayoutRequestStatus.PENDING
    });
    
    // Log for debugging
    console.log('Ambassador stats:', {
      ambassadorId: ambassador?._id,
      walletAddress: ambassador?.walletAddress,
      commissionRate,
      totalWins,
      totalLoss,
      netLoss,
      totalCommissions,
      hasPendingRequest: !!pendingRequest,
      statsLength: stats?.length || 0
    });
    
    return res.json({
      id: ambassador?._id,
      walletAddress: ambassador?.payoutWalletAddress || ambassador?.walletAddress,
      userName,
      totalReferrals,
      commissionRate,
      totalCommissions,
      totalWins,
      totalLoss,
      netLoss,
      wagerVolume: totalWins + totalLoss,
      referralCode: ambassador?.ambassadorCode,
      totalEarnings: ambassador?.totalEarnings || 0,
      hasPendingRequest: !!pendingRequest
    });
  } catch (e) {
    console.log(e);
  }
};

// Handle commission payout request from ambassador
export const requestCommissionPayout = async (req: any, res: any) => {
  try {
    const { ambassadorId, amount, walletAddress } = req.body;

    if (!ambassadorId || !amount || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: ambassadorId, amount, walletAddress' 
      });
    }

    const ambassador = await Ambassador.findById(ambassadorId);
    if (!ambassador) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ambassador not found' 
      });
    }

    // Check if ambassador has set their payout wallet address
    if (!ambassador.payoutWalletAddress || ambassador.payoutWalletAddress.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please set your payout wallet address first' 
      });
    }

    // Check for existing pending request
    const existingRequest = await PayoutRequest.findOne({
      ambassadorId: ambassador._id,
      status: PayoutRequestStatus.PENDING
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending payout request. Please wait for it to be processed.' 
      });
    }

    // Verify the amount matches the ambassador's total commissions
    const stats = await Bet.aggregate([
      {
        $match: {
          userId: { $in: ambassador.referredUsers },
          status: 'COMPLETED',
          opponentId: 'HOUSE_BOT'
        }
      },
      {
        $group: {
          _id: null,
          totalWins: {
            $sum: {
              $cond: [
                { $eq: ['$result', 'WIN'] },
                '$amount',
                0
              ]
            }
          },
          totalLoss: {
            $sum: {
              $cond: [
                { $eq: ['$result', 'LOSS'] },
                '$amount',
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalWins: 1,
          totalLoss: 1,
          netLoss: { $subtract: ['$totalLoss', '$totalWins'] }
        }
      }
    ]);

    const totalWins = stats?.reduce((sum, stat) => sum + (stat.totalWins || 0), 0) || 0;
    const totalLoss = stats?.reduce((sum, stat) => sum + (stat.totalLoss || 0), 0) || 0;
    const netLoss = totalLoss - totalWins;
    const expectedCommissions = (ambassador.commissionPercentage / 100) * Math.max(0, netLoss);

    if (Math.abs(amount - expectedCommissions) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount does not match expected commissions' 
      });
    }

    // Generate unique request ID
    const requestId = `REQ_${Date.now()}_${ambassadorId}`;

    // Create and save payout request to database
    const payoutRequest = new PayoutRequest({
      ambassadorId: ambassador._id,
      amount,
      payoutWalletAddress: ambassador.payoutWalletAddress,
      status: PayoutRequestStatus.PENDING,
      requestedAt: new Date(),
      requestId
    });

    await payoutRequest.save();

    // Log the payout request for admin review
    console.log('Commission Payout Request:', {
      requestId: payoutRequest.requestId,
      ambassadorId: ambassador._id,
      ambassadorUsername: ambassador.username,
      amount,
      payoutWalletAddress: ambassador.payoutWalletAddress,
      expectedCommissions,
      timestamp: new Date().toISOString()
    });

    res.status(200).json({ 
      success: true, 
      message: 'Payout request received and logged for admin review',
      data: {
        requestId: payoutRequest.requestId,
        amount,
        payoutWalletAddress: ambassador.payoutWalletAddress,
        timestamp: payoutRequest.requestedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Commission payout request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing payout request' 
    });
  }
};

// Get commission history for ambassador
export const getCommissionHistory = async (req: any, res: any) => {
  try {
    const { ambassadorId } = req.body;

    if (!ambassadorId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ambassador ID is required' 
      });
    }

    const ambassador = await Ambassador.findById(ambassadorId);
    if (!ambassador) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ambassador not found' 
      });
    }

    // Get all payout requests for this ambassador, sorted by most recent first
    const payoutRequests = await PayoutRequest.find({
      ambassadorId: ambassador._id
    })
    .sort({ requestedAt: -1 })
    .limit(20); // Limit to last 20 requests

    // Format payout requests as commission history
    const commissionHistory = payoutRequests.map(request => ({
      id: request.requestId,
      period: `${new Date(request.requestedAt).toISOString().substring(0, 10)}`,
      netLoss: 0, // We don't have net loss for individual requests
      commissionAmount: request.amount,
      status: request.status === PayoutRequestStatus.PENDING ? 'Pending' : 
              request.status === PayoutRequestStatus.COMPLETED ? 'Paid' : 
              request.status === PayoutRequestStatus.REJECTED ? 'Rejected' : 
              request.status.charAt(0).toUpperCase() + request.status.slice(1),
      requestCount: 1,
      requestedAt: request.requestedAt,
      processedAt: request.processedAt
    }));

    res.status(200).json({ 
      success: true, 
      data: commissionHistory 
    });

  } catch (error) {
    console.error('Get commission history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching commission history' 
    });
  }
};

// Get all pending payout requests for admin dashboard
export const getPendingPayoutRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all pending payout requests with ambassador details
    const pendingRequests = await PayoutRequest.find({
      status: PayoutRequestStatus.PENDING
    })
    .populate('ambassadorId', 'username ambassadorCode commissionPercentage')
    .sort({ requestedAt: -1 })
    .limit(50); // Limit to last 50 pending requests

    // Format the response
    const formattedRequests = pendingRequests.map(request => {
      const ambassador = request.ambassadorId as any;
      return {
        id: request.requestId,
        ambassadorId: request.ambassadorId,
        ambassadorUsername: ambassador?.username || 'Unknown',
        ambassadorCode: ambassador?.ambassadorCode || 'N/A',
        commissionRate: ambassador?.commissionPercentage || 0,
        amount: request.amount,
        payoutWalletAddress: request.payoutWalletAddress,
        requestedAt: request.requestedAt,
        requestId: request.requestId
      };
    });

    res.status(200).json({ 
      success: true, 
      data: formattedRequests 
    });

  } catch (error) {
    console.error('Get pending payout requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching pending payout requests' 
    });
  }
};

// Calculate ambassador earnings
export const calculateAmbassadorEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ambassadorId } = req.params;
    
    const ambassador = await Ambassador.findById(ambassadorId);
    if (!ambassador) {
      res.status(404).json({ success: false, message: 'Ambassador not found' });
      return;
    }
    
    const stats = await Bet.aggregate([
  { 
    $match: {
      userId: { $in: ambassador.referredUsers },
      status: 'COMPLETED',
      opponentId: 'HOUSE_BOT'
    }
  },
  { 
    $group: {
      _id: '$userId',
      totalGames: { $sum: 1 },
      betVolume:   { $sum: '$amount' },
      winsCount:   { $sum: { $cond: [{ $eq: ['$result', 'WIN'] }, 1, 0] } },
      lossesCount: { $sum: { $cond: [{ $eq: ['$result', 'LOSS'] }, 1, 0] } },
      totalWins:   { $sum: { $cond: [{ $eq: ['$result', 'WIN'] }, '$amount', 0] } },
      totalLosses: { $sum: { $cond: [{ $eq: ['$result', 'LOSS'] }, '$amount', 0] } }
    }
  },
  { 
    $project: {
      _id: 0,
      Player: '$_id',
      'Total Games': '$totalGames',
      'Bet Volume': '$betVolume',
      Wins: '$winsCount',
      Losses: '$lossesCount',
      'Net P&L': { $subtract: ['$totalLosses', '$totalWins'] }
    }
  }
]);
  res.status(200).json({ success: true, data: stats });







    // // Calculate earnings
    // const earnings = referredUserBets.map(bet => ({
    //   date: bet.finalizedAt || bet.createdAt,
    //   userId: bet.userId,
    //   userLoss: bet.amount,
    //   amount: bet.amount * (ambassador.commissionPercentage / 100),
    //   token: bet.token
    // }));
    
    // // Update ambassador earnings
    // ambassador.earnings = earnings;
    // ambassador.totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
    // await ambassador.save();
    
    // res.status(200).json({ success: true, data: { ambassador, earnings } });
  } catch (error) {
    console.error('Calculate earnings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get funnel analytics for ambassador
export const getFunnelAnalytics = async (req: any, res: any): Promise<void> => {
  try {
    const { timePeriod = '1W' } = req.body;
    const ambassador = req.ambassador; // From ambassadorAuth middleware
    
    if (!ambassador) {
      res.status(401).json({ success: false, message: 'Ambassador not authenticated' });
      return;
    }

    // Calculate date filter based on time period
    let dateFilter = {};
    const now = new Date();
    
    switch (timePeriod) {
      case '1D':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
        break;
      case '1W':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '1M':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case 'ALL':
      default:
        dateFilter = {};
        break;
    }

    // Step 1: Get total views (total referred users count from ambassador)
    // This should come from a separate tracking system, but for now we'll use referred users count
    const totalViews = await User.countDocuments({ 
      referredBy: ambassador.walletAddress,
      ...dateFilter
    });

    // Step 2: Get signups (referred users who exist in User table)
    const totalSignups = await User.countDocuments({ 
      referredBy: ambassador.walletAddress,
      ...dateFilter
    });

    // Step 3: Get first bets (referred users who have placed at least one bet)
    const usersWithFirstBets = await User.aggregate([
      {
        $match: {
          referredBy: ambassador.walletAddress,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'bets',
          localField: 'walletAddress',
          foreignField: 'userId',
          as: 'bets'
        }
      },
      {
        $match: {
          'bets.0': { $exists: true } // Has at least one bet
        }
      },
      {
        $count: 'firstBets'
      }
    ]);

    // Step 4: Get conversions (referred users who have placed multiple bets)
    const usersWithConversions = await User.aggregate([
      {
        $match: {
          referredBy: ambassador.ambassadorCode,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'bets',
          localField: 'walletAddress',
          foreignField: 'userId',
          as: 'bets'
        }
      },
      {
        $match: {
          $expr: { $gt: [{ $size: '$bets' }, 1] } // Has more than one bet
        }
      },
      {
        $count: 'conversions'
      }
    ]);

    // Step 5: Get total bet volume from referred users
    const betVolumeData = await User.aggregate([
      {
        $match: {
          referredBy: ambassador.walletAddress,
          ...dateFilter
        }
      },
      {
        $lookup: {
          from: 'bets',
          localField: 'walletAddress',
          foreignField: 'userId',
          as: 'bets'
        }
      },
      {
        $group: {
          _id: null,
          totalBetVolume: { $sum: { $sum: '$bets.amount' } }
        }
      }
    ]);

    // Extract counts
    const firstBets = usersWithFirstBets[0]?.firstBets || 0;
    const conversions = usersWithConversions[0]?.conversions || 0;
    const totalBetVolume = betVolumeData[0]?.totalBetVolume || 0;

    res.status(200).json({
      success: true,
      message: 'Funnel analytics retrieved successfully',
      data: {
        views: totalViews,
        signups: totalSignups,
        firstBets: firstBets,
        conversions: conversions,
        totalBetVolume: totalBetVolume,
        timePeriod
      }
    });
  } catch (error) {
    console.error('Get funnel analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Public endpoint to get current settings (for frontend token limits)
export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOne();
    
    if (!settings) {
      res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
      return;
    }
    
    // Return only the necessary data for frontend
    res.status(200).json({
      success: true,
      data: {
        enabledTokens: settings.enabledTokens,
        betLimits: settings.betLimits
      }
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Get active wallet public and private key
export const getActiveWalletKeys = async (): Promise<{
  publicKey: string;
  privateKey: any;
  walletType: string;
  walletId: string;
}> => {
  try {
    // Get settings document
    const settings = await Settings.findOne();
    if (!settings) {
      throw new Error('Settings not found');
    }

    // Check if wallet rotation is enabled and has wallets
    if (!settings.walletRotation || settings.walletRotation.length === 0) {
      throw new Error('No wallets found in rotation');
    }

    // Determine the target type based on fallback setting
    const targetType = settings.walletRotationFallbackEnabled ? 'fallback' : 'primary';
    
    // Find the active wallet of the target type
    const activeWallet = settings.walletRotation.find((wallet: any) => 
      wallet.active === true && wallet.type === targetType
    );

    if (!activeWallet) {
      throw new Error(`No active ${targetType} wallet found`);
    }
    console.log(activeWallet);
    // Decrypt the private key using the existing function
    let decryptedPrivateKey;
    try {
      decryptedPrivateKey = decryptWalletKey(activeWallet.privateKey);
      console.log('🔓 Successfully decrypted private key for active wallet');
    } catch (error) {
      console.error('❌ Failed to decrypt private key:', error);
      throw new Error(`Failed to decrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    // Return the public key and decrypted private key
    return {
      publicKey: activeWallet.publicKey,
      privateKey: decryptedPrivateKey,
      walletType: activeWallet.type,
       walletId: ""
    };

  } catch (error) {
    console.error('❌ Get active wallet keys error:', error);
    throw new Error(`Get active wallet keys failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get current active wallet public key (for frontend use)
export const getCurrentActiveWalletPublicKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const walletKeys = await getActiveWalletKeys();
    
    res.status(200).json({
      success: true,
      data: {
        publicKey: walletKeys.publicKey,
        walletType: walletKeys.walletType
      }
    });
  } catch (error) {
    console.error('❌ Get current active wallet public key error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get active wallet public key'
    });
  }
};



// Reject payout request
export const rejectPayoutRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      res.status(400).json({ 
        success: false, 
        message: 'Request ID is required' 
      });
      return;
    }

    // Find the payout request
    const payoutRequest = await PayoutRequest.findOne({ requestId });
    if (!payoutRequest) {
      res.status(404).json({ 
        success: false, 
        message: 'Payout request not found' 
      });
      return;
    }

    // Check if request is already processed
    if (payoutRequest.status !== PayoutRequestStatus.PENDING) {
      res.status(400).json({ 
        success: false, 
        message: 'Request has already been processed' 
      });
      return;
    }

    // Update the request status to rejected
    payoutRequest.status = PayoutRequestStatus.REJECTED;
    payoutRequest.processedAt = new Date();
    payoutRequest.processedBy = 'admin'; // You can get this from req.admin if needed
    payoutRequest.rejectionReason = 'Rejected by admin'; // You can make this dynamic

    await payoutRequest.save();

    res.status(200).json({ 
      success: true, 
      message: 'Payout request rejected successfully',
      data: {
        requestId: payoutRequest.requestId,
        status: payoutRequest.status,
        processedAt: payoutRequest.processedAt
      }
    });

  } catch (error) {
    console.error('Reject payout request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error rejecting payout request' 
    });
  }
};

// Approve payout request
export const approvePayoutRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;

    if (!requestId) {
      res.status(400).json({ 
        success: false, 
        message: 'Request ID is required' 
      });
      return;
    }

    // Find the payout request
    const payoutRequest = await PayoutRequest.findOne({ requestId });
    if (!payoutRequest) {
      res.status(404).json({ 
        success: false, 
        message: 'Payout request not found' 
      });
      return;
    }

    // Check if request is already processed
    if (payoutRequest.status !== PayoutRequestStatus.PENDING) {
      res.status(400).json({ 
        success: false, 
        message: 'Request has already been processed' 
      });
      return;
    }

    // Update the request status to approved
    payoutRequest.status = PayoutRequestStatus.APPROVED;
    payoutRequest.processedAt = new Date();
    payoutRequest.processedBy = 'admin'; // You can get this from req.admin if needed

    await payoutRequest.save();

    res.status(200).json({ 
      success: true, 
      message: 'Payout request approved successfully',
      data: {
        requestId: payoutRequest.requestId,
        status: payoutRequest.status,
        processedAt: payoutRequest.processedAt
      }
    });

  } catch (error) {
    console.error('Approve payout request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error approving payout request' 
    });
  }
};

// Get all approved payout requests for admin dashboard
export const getApprovedPayoutRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all approved payout requests with ambassador details
    const approvedRequests = await PayoutRequest.find({
      status: PayoutRequestStatus.APPROVED
    })
    .populate('ambassadorId', 'username ambassadorCode commissionPercentage')
    .sort({ processedAt: -1 })
    .limit(50); // Limit to last 50 approved requests

    // Format the response
    const formattedRequests = approvedRequests.map(request => {
      const ambassador = request.ambassadorId as any;
      return {
        id: request.requestId,
        ambassadorId: request.ambassadorId,
        ambassadorUsername: ambassador?.username || 'Unknown',
        ambassadorCode: ambassador?.ambassadorCode || 'N/A',
        commissionRate: ambassador?.commissionPercentage || 0,
        amount: request.amount,
        payoutWalletAddress: request.payoutWalletAddress,
        requestedAt: request.requestedAt,
        processedAt: request.processedAt,
        requestId: request.requestId
      };
    });

    res.status(200).json({ 
      success: true, 
      data: formattedRequests 
    });

  } catch (error) {
    console.error('Get approved payout requests error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching approved payout requests' 
    });
  }
};

// Process payment for approved request
export const processPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      res.status(400).json({ 
        success: false, 
        message: 'Request ID is required' 
      });
      return;
    }

    // Check if ambassador payouts are enabled via environment variable
    const payoutsEnabled = process.env.AMBASSADOR_PAYOUTS_ENABLED === 'true';
    if (!payoutsEnabled) {
      res.status(403).json({
        success: false,
        message: 'Ambassador payouts are currently disabled. Contact system administrator to enable.'
      });
      return;
    }
    // Find the payout request
    const payoutRequest = await PayoutRequest.findOne({ requestId });
    if (!payoutRequest) {
      res.status(404).json({ 
        success: false, 
        message: 'Payout request not found' 
      });
      return;
    }

    // Check if request is approved
    if (payoutRequest?.status !== PayoutRequestStatus.APPROVED) {
      res.status(400).json({ 
        success: false, 
        message: 'Only approved requests can be processed for payment' 
      });
      return;
    }

    // Get the active wallet from wallet rotation
    const settings = await Settings.findOne();
    if (!settings || !settings?.walletRotation || settings?.walletRotation.length === 0) {
      res.status(500).json({ 
        success: false, 
        message: 'No wallet rotation configured' 
      });
      return;
    }

    // Find the active wallet
    const targetType = settings?.walletRotationFallbackEnabled ? 'fallback' : 'primary';
    const activeWallet = settings?.walletRotation.find((wallet: any) => 
      wallet.active === true && wallet.type === targetType
    );

    if (!activeWallet) {
      res.status(500).json({ 
        success: false, 
        message: `No active ${targetType} wallet found` 
      });
      return;
    }
    
    // Import blockchain service
    const { getBlockchainService } = await import('../services/blockchain.service');
    const blockchainService = getBlockchainService();

    // Determine the token to use for payment (default to SOL for now)
    // You can modify this to use a specific token or make it configurable
    const paymentToken = 'SOL';

    // Check wallet balance before attempting transfer
    const walletBalance = await blockchainService.getRealBalance(activeWallet?.publicKey, paymentToken);
    const requiredAmount = payoutRequest?.amount + 0.01; // Add 0.01 SOL for transaction fees
    
    if (walletBalance < requiredAmount) {
      console.error(`❌ Insufficient balance. Wallet has ${walletBalance} ${paymentToken}, needs ${requiredAmount} ${paymentToken}`);
      res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Active wallet has ${walletBalance} ${paymentToken}, needs ${requiredAmount} ${paymentToken} (${payoutRequest.amount} + 0.01 fees)`,
        data: {
          currentBalance: walletBalance,
          requiredAmount: requiredAmount,
          paymentAmount: payoutRequest?.amount,
          feeAmount: 0.01,
          token: paymentToken,
          walletAddress: activeWallet?.publicKey
        }
      });
      return;
    }

    // Execute the blockchain transfer 
    const transferResult = await blockchainService.transferFromHouse(
      payoutRequest?.payoutWalletAddress,
      payoutRequest?.amount,
      paymentToken
    );

    if (!transferResult.success) {
      console.error('❌ Payment transfer failed:', transferResult.error);
      res.status(500).json({ 
        success: false, 
        message: `Payment transfer failed: ${transferResult.error}` 
      });
      return;
    }

    // Update the request status to completed with real transaction hash
    payoutRequest.status = PayoutRequestStatus.COMPLETED;
    payoutRequest.processedAt = new Date();
    payoutRequest.processedBy = (req as any).admin?.username || 'admin';
    payoutRequest.transactionHash = transferResult.signature || `TXN_${Date.now()}_${requestId}`;

    await payoutRequest.save();

    console.log(`✅ Payment processed successfully: ${transferResult.signature}`);

    res.status(200).json({ 
      success: true, 
      message: 'Payment processed successfully',
      data: {
        requestId: payoutRequest.requestId,
        status: payoutRequest.status,
        processedAt: payoutRequest.processedAt,
        transactionHash: payoutRequest.transactionHash,
        amount: payoutRequest.amount,
        token: paymentToken,
        recipientWallet: payoutRequest.payoutWalletAddress,
        fromWallet: activeWallet.publicKey
      }
    });

  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error processing payment' 
    });
  }
};

// Get current admin profile
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).admin?._id; // From adminAuth middleware
    
    if (!adminId) {
      res.status(401).json({ 
        success: false, 
        message: 'Admin not authenticated' 
      });
      return;
    }

    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
      return;
    }

    res.status(200).json({ 
      success: true, 
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching admin profile' 
    });
  }
};

// Change admin password
export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = (req as any).admin?._id; // From adminAuth middleware
    if (!adminId) {
      res.status(401).json({ 
        success: false, 
        message: 'Admin not authenticated' 
      });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
      return;
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(404).json({ 
        success: false, 
        message: 'Admin not found' 
      });
      return;
    }

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
      return;
    }

    // Update password
    admin.password = newPassword;
    await admin.save();


    // Generate new token after password change
    const newToken = generateToken((admin as any)._id.toString());

    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully',
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error changing password' 
    });
  }
};

// Get user analytics data
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filter = 'all', limit = 100 } = req.query;
    
    // Base pipeline for user analytics
    let matchStage: any = {};
    let sortStage: any = { totalVolume: -1 }; // Default sort by volume
    
    // Apply filters
    switch (filter) {
      case 'high-volume':
        matchStage = { totalVolume: { $gte: 100 } }; // Users with volume >= 100
        sortStage = { totalVolume: -1 };
        break;
      case 'top-referrers':
        matchStage = { referredUsersCount: { $gte: 1 } }; // Users who have referred others
        sortStage = { referredUsersCount: -1 };
        break;
      default:
        sortStage = { totalVolume: -1 };
    }

    // Get user analytics with bet data
    const userAnalytics = await User.aggregate([
      {
        $lookup: {
          from: 'bets',
          localField: 'walletAddress',
          foreignField: 'userId',
          as: 'bets'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'referredBy',
          foreignField: 'ambassadorCode',
          as: 'referrerInfo'
        }
      },
      {
        $addFields: {
          // Calculate bet statistics
          totalGames: { $size: '$bets' },
          completedBets: {
            $filter: {
              input: '$bets',
              cond: { $eq: ['$$this.status', 'COMPLETED'] }
            }
          }
        }
      },
      {
        $addFields: {
          // Calculate wins, losses, and volume from completed bets
          wins: {
            $size: {
              $filter: {
                input: '$completedBets',
                cond: { $eq: ['$$this.result', 'WIN'] }
              }
            }
          },
          losses: {
            $size: {
              $filter: {
                input: '$completedBets',
                cond: { $eq: ['$$this.result', 'LOSS'] }
              }
            }
          },
          totalVolume: {
            $reduce: {
              input: '$completedBets',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          },
          winAmount: {
            $reduce: {
              input: {
                $filter: {
                  input: '$completedBets',
                  cond: { $eq: ['$$this.result', 'WIN'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          },
          lossAmount: {
            $reduce: {
              input: {
                $filter: {
                  input: '$completedBets',
                  cond: { $eq: ['$$this.result', 'LOSS'] }
                }
              },
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          }
        }
      },
      {
        $addFields: {
          netPL: { $subtract: ['$winAmount', '$lossAmount'] },
          referrer: { $arrayElemAt: ['$referrerInfo.walletAddress', 0] },
          referredUsersCount: {
            $cond: {
              if: { $isArray: '$referredUsers' },
              then: { $size: '$referredUsers' },
              else: 0
            }
          }
        }
      },
      {
        $match: matchStage // Only apply filter, not the totalGames condition
      },
      {
        $project: {
          walletAddress: 1,
          userName: 1,
          email: 1,
          firstName: 1,
          lastName: 1,
          phoneNumber: 1,
          loginType: 1,
          isActive: 1,
          createdAt: 1,
          lastActive: 1,
          referredBy: 1,
          referredUsers: 1,
          totalGames: 1,
          totalVolume: { $round: ['$totalVolume', 2] },
          wins: 1,
          losses: 1,
          netPL: { $round: ['$netPL', 2] },
          referrer: 1,
          referredUsersCount: 1,
          joinDate: '$createdAt'
        }
      },
      {
        $sort: sortStage
      },
      {
        $limit: parseInt(limit as string)
      }
    ]);

    // Get summary statistics
    const summaryStats = await User.aggregate([
      {
        $lookup: {
          from: 'bets',
          localField: 'walletAddress',
          foreignField: 'userId',
          as: 'bets'
        }
      },
      {
        $addFields: {
          totalGames: { $size: '$bets' },
          completedBets: {
            $filter: {
              input: '$bets',
              cond: { $eq: ['$$this.status', 'COMPLETED'] }
            }
          }
        }
      },
      {
        $addFields: {
          totalVolume: {
            $reduce: {
              input: '$completedBets',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.amount'] }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalVolume: { $sum: '$totalVolume' },
          averageGamesPerUser: { $avg: '$totalGames' },
          highVolumeUsers: {
            $sum: { $cond: [{ $gte: ['$totalVolume', 100] }, 1, 0] }
          },
          usersWithReferrals: {
            $sum: {
              $cond: [
                { $and: [{ $isArray: '$referredUsers' }, { $gt: [{ $size: '$referredUsers' }, 0] }] },
                1,
                0
              ]
            }
          },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          usersWithGames: {
            $sum: { $cond: [{ $gt: ['$totalGames', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const summary = summaryStats[0] || {
      totalUsers: 0,
      totalVolume: 0,
      averageGamesPerUser: 0,
      highVolumeUsers: 0,
      usersWithReferrals: 0,
      activeUsers: 0,
      usersWithGames: 0
    };

    res.status(200).json({
      success: true,
      message: 'User analytics data retrieved successfully',
      data: userAnalytics,
      summary: {
        totalUsers: summary.totalUsers,
        totalVolume: Math.round(summary.totalVolume * 100) / 100,
        averageGamesPerUser: Math.round(summary.averageGamesPerUser * 100) / 100,
        highVolumeUsers: summary.highVolumeUsers,
        usersWithReferrals: summary.usersWithReferrals,
        activeUsers: summary.activeUsers,
        usersWithGames: summary.usersWithGames,
        filter,
        limit: parseInt(limit as string)
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change user password
export const changeUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, newPassword } = req.body;
    
    if (!walletAddress || !newPassword) {
      res.status(400).json({ 
        success: false, 
        message: 'Wallet address and new password are required' 
      });
      return;
    }
    
    if (newPassword.length < 6) {
      res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
      return;
    }
    
    // Find user by wallet address
    const user = await User.findOne({ walletAddress });
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
      return;
    }
    
    // Check if user is registered (has loginType 'registered')
    if (user.loginType !== 'registered') {
      res.status(400).json({ 
        success: false, 
        message: 'Only registered users can have their passwords changed' 
      });
      return;
    }
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
      data: {
        walletAddress: user.walletAddress,
        userName: user.userName,
        loginType: user.loginType
      }
    });
  } catch (error) {
    console.error('Change user password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error changing password' 
    });
  }
};

// getActiveWalletKeys()