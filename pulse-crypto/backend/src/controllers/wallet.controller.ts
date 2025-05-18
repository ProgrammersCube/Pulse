import { Request, Response } from 'express';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import User, { IUser } from '../models/user.model';
import crypto from 'crypto';

// Custom interface for requests with authenticated users
interface AuthenticatedRequest extends Request {
  user?: {
    isAdmin: boolean;
    [key: string]: any;
  };
}

// Helper function to generate a random referral code
const generateReferralCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

/**
 * Get or create a user and fetch their actual SOL balance from blockchain
 */
export const getOrCreateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
      return;
    }

    // Connect to Solana (using devnet for testing)
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    
    // Find user or create a new one
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      // Generate a unique referral code for new users
      const referralCode = generateReferralCode();
      
      user = new User({
        walletAddress,
        referralCode,
        tokens: {
          BeTyche: 0,  // Default to 0
          SOL: 0,      // Will update from blockchain
          ETH: 0,
          RADBRO: 0
        },
        lastActive: new Date()
      });
    }

    // Get actual SOL balance from blockchain
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await connection.getBalance(publicKey);
      
      // Convert lamports to SOL (1 SOL = 10^9 lamports)
      const solBalance = balance / 1000000000;
      
      // Update the user's SOL balance
      user.tokens.SOL = solBalance;
      
      console.log(`Updated ${walletAddress} SOL balance: ${solBalance}`);
    } catch (blockchainError) {
      console.error('Error fetching SOL balance from blockchain:', blockchainError);
      // Don't fail if blockchain query fails, just keep existing balance
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Send updated user data to frontend
    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        tokens: user.tokens,
        referralCode: user.referralCode,
        referredBy: user.referredBy
      }
    });
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

/**
 * Update token balances
 */
export const updateTokenBalances = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;
    const { tokens } = req.body;

    if (!walletAddress) {
      res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
      return;
    }

    // Find the user
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Update token balances except SOL (which comes from blockchain)
    if (tokens) {
      if (tokens.BeTyche !== undefined) user.tokens.BeTyche = tokens.BeTyche;
      if (tokens.ETH !== undefined) user.tokens.ETH = tokens.ETH;
      if (tokens.RADBRO !== undefined) user.tokens.RADBRO = tokens.RADBRO;
      
      // For SOL, only update if specifically requested and not reading from blockchain
      // This is useful for admin purposes
      if (tokens.SOL !== undefined && req.user && req.user.isAdmin) {
        user.tokens.SOL = tokens.SOL;
      } else {
        // Otherwise, get SOL balance from blockchain
        try {
          const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
          const publicKey = new PublicKey(walletAddress);
          const balance = await connection.getBalance(publicKey);
          user.tokens.SOL = balance / 1000000000;
        } catch (blockchainError) {
          console.error('Error fetching SOL balance from blockchain:', blockchainError);
          // Don't fail if blockchain query fails
        }
      }
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        tokens: user.tokens
      }
    });
  } catch (error) {
    console.error('Error in updateTokenBalances:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

/**
 * Apply referral code
 */
export const applyReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;
    const { referralCode } = req.body;

    if (!walletAddress || !referralCode) {
      res.status(400).json({ 
        success: false,
        message: 'Wallet address and referral code are required' 
      });
      return;
    }

    // Find the user
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if the user already has a referral
    if (user.referredBy) {
      res.status(400).json({
        success: false,
        message: 'User already has applied a referral code'
      });
      return;
    }

    // Find the referrer
    const referrer = await User.findOne({ referralCode });
    
    if (!referrer) {
      res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
      return;
    }

    // Prevent self-referrals
    if (referrer.walletAddress === user.walletAddress) {
      res.status(400).json({
        success: false,
        message: 'Cannot use your own referral code'
      });
      return;
    }

    // Apply the referral
    user.referredBy = referrer.walletAddress;
    
    // Give referral bonus (example: 10 BeTyche)
    // You can make this configurable later through admin settings
    user.tokens.BeTyche += 10;
    
    // Also give the referrer a bonus
    referrer.tokens.BeTyche += 15;
    
    // Save both users
    await Promise.all([user.save(), referrer.save()]);

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully and bonus awarded',
      data: {
        walletAddress: user.walletAddress,
        referredBy: user.referredBy,
        bonusReceived: 10
      }
    });
  } catch (error) {
    console.error('Error in applyReferralCode:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

/**
 * Get user stats (useful for user profile and admin)
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
      return;
    }

    // Find the user
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Get the count of users referred by this user
    const referralCount = await User.countDocuments({ referredBy: walletAddress });

    // TODO: Add additional stats like bets placed, win/loss ratio, etc. once you have those models

    res.status(200).json({
      success: true,
      data: {
        walletAddress: user.walletAddress,
        tokens: user.tokens,
        referralCode: user.referralCode,
        referralStats: {
          totalReferred: referralCount
        },
        lastActive: user.lastActive,
        // Will add more stats here in future milestones
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

/**
 * List referred users (for user profile and ambassador panel)
 */
export const listReferredUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!walletAddress) {
      res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
      return;
    }

    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Find referred users
    const referredUsers = await User
      .find({ referredBy: walletAddress })
      .select('walletAddress lastActive tokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await User.countDocuments({ referredBy: walletAddress });

    res.status(200).json({
      success: true,
      data: {
        referredUsers,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Error in listReferredUsers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};