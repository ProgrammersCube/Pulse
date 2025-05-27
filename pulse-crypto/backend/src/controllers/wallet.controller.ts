import { Request, Response } from 'express';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import User, { IUser } from '../models/user.model';
import crypto from 'crypto';

// SPL Token Mint Addresses (MAINNET)
const TOKEN_MINTS = {
  BeTyche: 'EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp', // Full mint address for BeTyche
  RADBRO: '287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB'    // You need to provide the full RADBRO mint address
};

// Custom interface for requests with authenticated users
interface AuthenticatedRequest extends Request {
  user?: {
    isAdmin: boolean;
    [key: string]: any;
  };
}

// Helper function to get Solana connection
const getSolanaConnection = (): Connection => {
  // Use environment variables for configuration
  const network = process.env.SOLANA_NETWORK || 'mainnet-beta';
  const customRpcUrl = process.env.SOLANA_RPC_URL;
  
  // Use custom RPC URL if provided, otherwise use cluster URL
  const connectionUrl = customRpcUrl || clusterApiUrl(network as any);
  
  console.log(`Connecting to Solana ${network} at: ${connectionUrl}`);
  
  return new Connection(connectionUrl, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000
  });
};

// Helper function to generate a random referral code
const generateReferralCode = (): string => {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};

// Helper function to get SPL token balance
const getSPLTokenBalance = async (
  connection: Connection, 
  walletAddress: string, 
  mintAddress: string
): Promise<number> => {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Get the associated token account address
    const tokenAccountAddress = await getAssociatedTokenAddress(
      mintPublicKey,
      walletPublicKey
    );
    
    // Get the token account info
    const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);
    
    if (!tokenAccountInfo) {
      console.log(`No token account found for mint ${mintAddress}`);
      return 0;
    }
    
    // Get the token account data
    const tokenAccount = await getAccount(connection, tokenAccountAddress);
    
    // Convert from smallest unit to regular unit
    // Most SPL tokens use 9 decimals like SOL
    const balance = Number(tokenAccount.amount) / Math.pow(10, 9);
    
    return balance;
  } catch (error) {
    console.error(`Error fetching SPL token balance for ${mintAddress}:`, error);
    return 0;
  }
};

/**
 * Get or create a user and fetch their actual token balances from blockchain
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

    // Connect to Solana using environment configuration
    const connection = getSolanaConnection();
    
    // Find user or create a new one
    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      // Generate a unique referral code for new users
      const referralCode = generateReferralCode();
      
      user = new User({
        walletAddress,
        referralCode,
        tokens: {
          BeTyche: 0,
          SOL: 0,
          ETH: 0,
          RADBRO: 0
        },
        lastActive: new Date()
      });
    }

    // Get actual balances from blockchain
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      user.tokens.SOL = solBalance / 1000000000;
      
      // Get BeTyche balance
      if (TOKEN_MINTS.BeTyche) {
        const beTycheBalance = await getSPLTokenBalance(connection, walletAddress, TOKEN_MINTS.BeTyche);
        user.tokens.BeTyche = beTycheBalance;
        console.log(`BeTyche balance: ${beTycheBalance}`);
      }
      
      // Get RADBRO balance
      if (TOKEN_MINTS.RADBRO) {
        const radbroBalance = await getSPLTokenBalance(connection, walletAddress, TOKEN_MINTS.RADBRO);
        user.tokens.RADBRO = radbroBalance;
        console.log(`RADBRO balance: ${radbroBalance}`);
      }
      
      // ETH would need to be handled differently (cross-chain)
      // For now, keeping it at 0 or manual update
      
      console.log(`Updated ${walletAddress} balances from ${process.env.SOLANA_NETWORK || 'mainnet-beta'}`);
    } catch (blockchainError) {
      console.error(`Error fetching balances from ${process.env.SOLANA_NETWORK || 'mainnet-beta'}:`, blockchainError);
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

    // Update token balances
    if (tokens) {
      // For admin manual updates
      if (req.user && req.user.isAdmin) {
        if (tokens.BeTyche !== undefined) user.tokens.BeTyche = tokens.BeTyche;
        if (tokens.SOL !== undefined) user.tokens.SOL = tokens.SOL;
        if (tokens.ETH !== undefined) user.tokens.ETH = tokens.ETH;
        if (tokens.RADBRO !== undefined) user.tokens.RADBRO = tokens.RADBRO;
      } else {
        // For regular users, only update ETH (non-blockchain)
        if (tokens.ETH !== undefined) user.tokens.ETH = tokens.ETH;
        
        // Fetch current blockchain balances for SOL, BeTyche, and RADBRO
        try {
          const connection = getSolanaConnection();
          const publicKey = new PublicKey(walletAddress);
          
          // Update SOL
          const solBalance = await connection.getBalance(publicKey);
          user.tokens.SOL = solBalance / 1000000000;
          
          // Update BeTyche
          if (TOKEN_MINTS.BeTyche) {
            user.tokens.BeTyche = await getSPLTokenBalance(connection, walletAddress, TOKEN_MINTS.BeTyche);
          }
          
          // Update RADBRO
          if (TOKEN_MINTS.RADBRO) {
            user.tokens.RADBRO = await getSPLTokenBalance(connection, walletAddress, TOKEN_MINTS.RADBRO);
          }
        } catch (blockchainError) {
          console.error('Error fetching balances from blockchain:', blockchainError);
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
    
    // Give referral bonus (1,000 BeTyche per signup as per client's note)
    // Note: This is database balance, not blockchain balance
    // You might want to handle this differently for actual token distribution
    user.tokens.BeTyche += 1000;
    
    // Also give the referrer a bonus (1,000 BeTyche)
    referrer.tokens.BeTyche += 1000;
    
    // Save both users
    await Promise.all([user.save(), referrer.save()]);

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully and bonus awarded',
      data: {
        walletAddress: user.walletAddress,
        referredBy: user.referredBy,
        bonusReceived: 1000
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