import { Request, Response } from 'express';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress } from '@solana/spl-token';
import User, { IUser } from '../models/user.model';
import Bet from '../models/bet.model';
import { getBlockchainService } from '../services/blockchain.service';
import Settings from '../models/settings.model';
import Ambassador from '../models/ambassador.model';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);
// Utility to generate OTP
const generateOtp = (length: number = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
};
// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string , {
    expiresIn: '7d'
  });
};
// SPL Token Mint Addresses (MAINNET)
const TOKEN_MINTS = {
  BeTyche: 'EydjnYHVeCQGihcvA22vBDCxn5HzBrXoQpP98kL9Koyp', // Full mint address for BeTyche
  RADBRO: '287XY2FcGAE5ty4PZVjg22eqx37sEmzP8jPK3GxFofqB',   // Full mint address for RADBRO
  // Solana USDC mainnet SPL mint (can be overridden via env if needed)
  USDC: process.env.SOLANA_USDC_MAINNET_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
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
    // Most SPL tokens use 9 decimals like SOL, but some (like USDC) use 6
    // We infer decimals from mint when available; default to 9 for safety
    // NOTE: For now, assume 9 decimals; USDC will be handled precisely via backend blockchain.service
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
    const {loginType}=req.body;
    console.log("api callededdeddd ")
    console.log(loginType)
    if (!walletAddress) {
      res.status(400).json({ 
        success: false,
        message: 'Wallet address is required' 
      });
      return;
    }
    const blockchainService = getBlockchainService();
    
    // Find user or create a new one
    let user = await User.findOne({ walletAddress });
    if (!user) {
      // Generate a unique referral code for new users
      const referralCode = generateReferralCode();
      
      user = new User({
        walletAddress,
        // wallets: [walletAddress],
        referralCode,
        loginType,
        tokens: {
          BeTyche: 0,
          SOL: 0,
          ETH: 0,
          RADBRO: 0
        },
        lastActive: new Date()
      });
    }

    // Get REAL balances from blockchain
    try {
      console.log(`🔄 Fetching real blockchain balances for ${walletAddress}...`);
      
      // Get real balances for all supported tokens
      const [solBalance, beTycheBalance, radbroBalance, usdcBalance] = await Promise.all([
        blockchainService.getRealBalance(walletAddress, 'SOL'),
        blockchainService.getRealBalance(walletAddress, 'BeTyche'),
        blockchainService.getRealBalance(walletAddress, 'RADBRO'),
        blockchainService.getRealBalance(walletAddress, 'USDC')
      ]);
      
      user.tokens.SOL = solBalance;
      user.tokens.BeTyche = beTycheBalance;
      user.tokens.RADBRO = radbroBalance;
      user.tokens.USDC = usdcBalance;
      // ETH would need cross-chain integration - keeping at 0 for now
      user.tokens.ETH = 0;
      
      console.log(`✅ Real balances fetched: SOL=${solBalance}, BeTyche=${beTycheBalance}, RADBRO=${radbroBalance}, USDC=${usdcBalance}`);
      
    } catch (blockchainError) {
      console.error(`❌ Error fetching real balances:`, blockchainError);
      // Don't fail if blockchain query fails, just keep existing balance
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Send updated user data to frontend
    res.status(200).json({
      success: true,
      data: {
        loginVia:user?.loginType,
        walletAddress: user.walletAddress,
        tokens: user.tokens,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        realBalances: true // Flag to indicate these are real blockchain balances
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
// Update applyReferralCode function
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

    // Find the user - FIXED: Added user fetch
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Check if the user already has a referral
    if (user?.referredBy) {
      res.status(400).json({
        success: false,
        message: `User already refered by ${user?.referredBy}`
      });
      return;
    }

    // Get settings
    const settings = await Settings.findOne();
    if (!settings?.referralBonus?.enabled) {
      res.status(400).json({
        success: false,
        message: 'Referral program is currently disabled'
      });
      return;
    }

    // Check if it's an ambassador code
    const ambassador = await Ambassador.findOne({ 
      ambassadorCode: referralCode.toUpperCase(),
      isActive: true
    });

    if (ambassador) {
      // Handle ambassador referral
      user.referredBy = ambassador?.walletAddress;
      user.isAmbassador=true
      // Add user to ambassador's referred list
      ambassador.referredUsers.push(user?.walletAddress);
      ambassador.totalReferrals += 1;
      await ambassador.save();
    } else {
      // Regular referral
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
      
      user.referredBy = referrer.walletAddress;
    }

    // Apply bonus based on settings
    const bonusToken = settings.referralBonus.tokenType as keyof typeof user.bonusTokens;
    const refereeBonus = settings.referralBonus.refereeAmount;
    const referrerBonus = settings.referralBonus.referrerAmount;

    // Add to bonus tokens (non-withdrawable) - FIXED: Type-safe indexing
    if (user.bonusTokens && bonusToken in user.bonusTokens) {
      user.bonusTokens[bonusToken] += refereeBonus;
    }
    
    // Also give referrer bonus
    if (!ambassador && user?.referredBy) {
      const referrer = await User.findOne({ walletAddress: user.referredBy });
      if (referrer && referrer.bonusTokens && bonusToken in referrer.bonusTokens) {
        referrer.bonusTokens[bonusToken] += referrerBonus;
        await referrer.save();
      }
    }
    else if(ambassador)
    {
      if (ambassador?.bonusTokens && bonusToken in ambassador?.bonusTokens) {
       ambassador.bonusTokens[bonusToken as keyof typeof ambassador.bonusTokens] += referrerBonus;
        await ambassador.save();
      } 
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Referral code applied successfully',
      data: {
        walletAddress: user.walletAddress,
        referredBy: user.referredBy,
        bonusReceived: refereeBonus,
        bonusToken: bonusToken
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
export const createPulseAccount = async (req: any, res: any) => {
  try {
    const { userName, password, walletAddress,referral } = req.body;
    console.log(referral)
    if (!userName || !password || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if wallet address already exists in any user's wallets array
    const existingUser = await User.findOne({
      wallets: walletAddress
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: `This wallet address already exists in existing user ${existingUser._id}`
      });
    }
    //check  username exists then through error
    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
      return res.status(400).json({ 
        success: false,
        message: `This username already exists in existing user ${existingUsername?._id}`
      });
    }
    // Look for an existing guest with this walletAddress
    let user = await User.findOne({
      loginType: "guest",
      walletAddress
    });

    if (user) {
      // Migrate guest to registered
      user.userName = userName;
      user.password = password;
      user.loginType = "registered";
      user.wallets = [walletAddress];
      if(referral)
      {
        const findReferredByUser=await User.findOne({referralCode:referral?.toUpperCase()})
        if(findReferredByUser)
          user.referredBy=findReferredByUser?.walletAddress
        else
        {
        const findReferredByAmbassadar=await Ambassador.findOne({ambassadorCode:referral?.toUpperCase()})
        user.referredBy=findReferredByAmbassadar?.walletAddress
        user.isAmbassador=true
        findReferredByAmbassadar?.referredUsers.push(user?.walletAddress)
        await findReferredByAmbassadar?.save()

      }
    }
      // user.walletAddress = undefined;  // clear the old field
      await user.save();
      return res.status(200).json({ success: "User upgraded", data: user });
    }

    // If not found, check for an already registered user
    user = await User.findOne({
      loginType: "registered",
      $or: [{ userName }, { wallets: walletAddress }]
    });
    if (user) {
      // Prevent duplicate usernames or reusing wallets
      return res.status(400).json({ error: "Username or wallet Address is  already in use" });
    }

    // Create a new registered user
    const referralCode = generateReferralCode();
    const userCreate = await User.create({
      userName,
      password,
      loginType: "registered",
      referralCode,
      wallets: [walletAddress],
      tokens: { BeTyche: 0, SOL: 0, ETH: 0, RADBRO: 0, USDC: 0 },
      bonusTokens: { BeTyche: 0, SOL: 0, ETH: 0, RADBRO: 0, USDC: 0 },
      isAmbassador: false,
    });

    return res.status(201).json({ success: true, data: userCreate });
  } catch (error) {
    console.error("Create account error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const sendResetOtpCode = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success:false,message: "Username or email is required" });
    }

    // Find user by username or email
    const user = await User.findOne({
      userName:username,
    });

    if (!user) {
      return res.status(404).json({ success:false,message: "User not found" });
    }

    // Generate OTP
    const otp = generateOtp();

    // Save OTP in user schema
    user.resetotpCode = otp;
    // user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins expiry
    const checkuser=await user.save();
    // Email content
    const msg = {
      to: user?.userName,
      from: process.env.SENDGRID_FROM_EMAIL as string, // Verified sender in SendGrid
      subject: "Your Password Reset OTP",
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP code is: <b>${otp}</b></p><p>This code will expire in 10 minutes.</p>`,
    };

    // Send via SendGrid
    await sgMail.send(msg);

    res.status(200).json({ success:true,message: "OTP sent successfully" });
  } catch (error: any) {
    console.error("Error sending OTP:", error?.response?.body || error);
    res.status(500).json({ success:false,message: "Something went wrong while sending OTP" });
  }
};
export const verifyResetOtpCode = async (req: any, res: any) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false,
        message: "Email and OTP are required" 
      });
    }

    // Find user by email
    const user = await User.findOne({ userName: email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // Check OTP
    if (!user.resetotpCode || user.resetotpCode !== otp) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    // ✅ OTP Verified - Don't clear it yet, user needs it for resetPassword
    return res.status(200).json({ 
      success: true,
      message: "OTP verified successfully. You can now reset your password." 
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ 
      success: false,
      message: "Something went wrong" 
    });
  }
};
// Reset password with OTP verification (for forgot password flow)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Email, OTP, and new password are required" 
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "New password and confirm password do not match" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long" 
      });
    }

    // Find user by email
    const user = await User.findOne({ userName: email });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Verify OTP
    if (!user.resetotpCode || user.resetotpCode !== otp) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid or expired OTP" 
      });
    }

    // Update password (pre-save hook will hash it automatically)
    user.password = newPassword;
    user.resetotpCode = undefined; // Clear OTP after successful reset
    await user.save();

    res.status(200).json({ 
      success: true,
      message: "Password reset successfully" 
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ 
      success: false,
      message: "Something went wrong" 
    });
  }
};

// Change password for authenticated users (requires current password)
export const changePassword = async (req: any, res: Response) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user?.id; // From pulseUserAuth middleware

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password, new password, and confirm password are required' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password and confirm password do not match' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if user has a password set
    if (!user.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'No password set for this account' 
      });
    }

    // Verify current password using bcrypt
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Update password (pre-save hook will hash it automatically)
    user.password = newPassword;
    await user.save();

    // Generate new token for security (invalidate old sessions)
    const newToken = generateToken((user as any)._id.toString());

    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};
export const pulseLogin=async(req:any,res:any)=>
{
   try {
        const { userName, password } = req.body;
        const user = await User.findOne({ userName});
        if (!user) {
          res.status(401).json({ success: false, message: 'Invalid username' });
          return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          res.status(401).json({ success: false, message: 'Invalid password' });
          return;
        }
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate token - FIXED: Use proper type assertion
        const token = generateToken((user as any)._id.toString());
        
        res.status(200).json({
          success: true,
          data: {
            token,
            user
          }
        });
      } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
  
}
// export const ambassadarReferredPlayerActivity=async(req:any,res:any)=>{
//   const {walletAddress}=req.params

// }

// ✅ Add cleanup function for existing users with undefined wallets
export const cleanupUserWallets = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🧹 Starting wallet cleanup for users with undefined wallets...');
    
    // Find users with undefined or missing wallets field
    const usersToFix = await User.find({
      $or: [
        { wallets: { $exists: false } },
        { wallets: undefined },
        { wallets: null }
      ]
    });
    
    console.log(`Found ${usersToFix.length} users with wallet issues`);
    
    let fixedCount = 0;
    for (const user of usersToFix) {
      try {
        // Set wallets array based on walletAddress
        user.wallets = [user.walletAddress];
        await user.save();
        fixedCount++;
        console.log(`✅ Fixed user: ${user.walletAddress}`);
      } catch (saveError) {
        console.error(`❌ Failed to fix user ${user.walletAddress}:`, saveError);
      }
    }
    
    res.status(200).json({
      success: true,
      message: `Wallet cleanup completed. Fixed ${fixedCount} users.`,
      data: { fixedCount, totalFound: usersToFix.length }
    });
    
  } catch (error) {
    console.error('Error in cleanupUserWallets:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during cleanup',
      error: (error as Error).message
    });
  }
};

// Dashboard Stats controller
export const getDashboardStats = async (req: any, res: Response): Promise<void> => {
  try {
    const user = req.user; // From pulseUserAuth middleware
    
    if (!user) {
      res.status(401).json({ success: false, message: 'User not authenticated' });
      return;
    }

    const userWalletAddress = user.walletAddress;

    // Calculate Total Bets - count of all bets for this user
    const totalBetsResult = await Bet.countDocuments({ userId: userWalletAddress });
    const totalBets = totalBetsResult;

    // Calculate Total Wins - sum of amounts for COMPLETED bets with WIN result
    const totalWinsResult = await Bet.aggregate([
      { 
        $match: { 
          userId: userWalletAddress,
          status: 'COMPLETED',
          result: 'WIN'
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalWins = totalWinsResult.length > 0 ? totalWinsResult[0].total : 0;

    // Calculate Total Losses - sum of amounts for COMPLETED bets with LOSS result
    const totalLossesResult = await Bet.aggregate([
      { 
        $match: { 
          userId: userWalletAddress,
          status: 'COMPLETED',
          result: 'LOSS'
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalLosses = totalLossesResult.length > 0 ? totalLossesResult[0].total : 0;

    // Calculate Total Net Losses - Total Losses - Total Wins
    const totalNetLosses = totalLosses - totalWins;

    // Calculate Total Referrals - count of users referred by this user
    const totalReferralsResult = await User.countDocuments({ 
      referredBy: userWalletAddress 
    });
    const totalReferrals = totalReferralsResult;

    // Calculate Total Bonus Earned - SOL value from bonusTokens
    const totalBonusEarned = user.bonusTokens?.SOL || 0;

    // Get Referral Code from user
    const referralCode = user.referralCode;

    const dashboardStats = {
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: {
        userId: user._id,
        userName: user.userName || 'PulseUser',
        walletAddress: user.walletAddress,
        wallets: user.wallets || [user.walletAddress],
        referralCode: referralCode,
        totalBets: totalBets,
        totalWins: totalWins,
        totalLosses: totalLosses,
        totalNetLosses: totalNetLosses,
        totalReferrals: totalReferrals,
        totalBonusEarned: totalBonusEarned,
        tokens: user.tokens,
        bonusTokens: user.bonusTokens,
        isAmbassador: user.isAmbassador,
        loginType: user.loginType,
        lastActive: user.lastActive,
        createdAt: user.createdAt
      }
    };

    res.status(200).json(dashboardStats);
    
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete wallet from user's wallets array
export const deleteWallet = async (req: any, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { walletAddress } = req.params;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!walletAddress) {
      res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
      return;
    }

    // Check if the wallet exists in user's wallets array
    const wallets = user.wallets || [];
    const walletIndex = wallets.findIndex((wallet: string) => wallet === walletAddress);

    if (walletIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Wallet address not found in user wallets'
      });
      return;
    }

    // Check if this is the primary wallet (walletAddress field)
    if (user.walletAddress === walletAddress) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete primary wallet address'
      });
      return;
    }

    // Remove the wallet from the wallets array
    wallets.splice(walletIndex, 1);

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { wallets: wallets },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Wallet deleted successfully',
      data: {
        deletedWallet: walletAddress,
        remainingWallets: updatedUser.wallets
      }
    });

  } catch (error) {
    console.error('Error in deleteWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting wallet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add wallet to user's wallets array
export const addWallet = async (req: any, res: Response): Promise<void> => {
  try {
    console.log('=== AddWallet API Called ===');
    const user = req.user;
    const { walletAddress } = req.body;
    console.log('Request body:', req.body);
    console.log('User from middleware:', user ? { id: user._id, walletAddress: user.walletAddress, wallets: user.wallets } : 'No user');
    if (!user) {
      console.log('No user found in request');
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    if (!walletAddress) {
      console.log('No wallet address provided');
      res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
      return;
    }

    console.log('Wallet address to add:', walletAddress);

    // Validate wallet address format (basic validation)
    if (typeof walletAddress !== 'string' || walletAddress.length < 32) {
      console.log('Invalid wallet address format:', walletAddress);
      res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
      return;
    }

    // Check if wallet already exists in user's wallets array
    const wallets = user.wallets || [];
    console.log('Current user wallets:', wallets);
    
    if (wallets.includes(walletAddress)) {
      console.log('Wallet already exists in user wallets');
      res.status(400).json({
        success: false,
        message: 'Wallet address already exists in your wallets'
      });
      return;
    }

    // Check if this is the same as primary wallet
    if (user.walletAddress === walletAddress) {
      console.log('Wallet is same as primary wallet');
      res.status(400).json({
        success: false,
        message: 'This wallet is already your primary wallet'
      });
      return;
    }

    // Check if wallet is already used by another user
    console.log('Checking if wallet exists in other users...');
    const existingUser = await User.findOne({ 
      $or: [
        { walletAddress: walletAddress },
        { wallets: { $in: [walletAddress] } }
      ]
    });

    if (existingUser) {
      console.log('Wallet already exists in another user:', existingUser._id);
      res.status(400).json({
        success: false,
        message: `This wallet address is already associated with another user ${existingUser._id}`
      });
      return;
    }

    // Add the wallet to the wallets array
    wallets.push(walletAddress);

    console.log('Adding wallet:', walletAddress);
    console.log('Updated wallets array:', wallets);
    console.log('User ID:', user._id);

    // Update the user document
    console.log('Updating user document...');
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: { wallets: wallets } },
      { new: true, runValidators: true }
    );

    console.log('Updated user:', updatedUser ? { id: updatedUser._id, wallets: updatedUser.wallets } : 'No user returned');

    if (!updatedUser) {
      console.log('User not found after update');
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log('Wallet added successfully, sending response...');
    res.status(200).json({
      success: true,
      message: 'Wallet added successfully',
      data: {
        addedWallet: walletAddress,
        allWallets: updatedUser.wallets
      }
    });

  } catch (error) {
    console.error('Error in addWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding wallet',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get bet history for authenticated user
export const getBetHistory = async (req: any, res: Response): Promise<void> => {
  try {
    console.log('=== GetBetHistory API Called ===');
    const user = req.user;

    console.log('User from middleware:', user ? { id: user._id, walletAddress: user.walletAddress } : 'No user');

    if (!user) {
      console.log('No user found in request');
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const userWalletAddress = user.walletAddress;
    console.log('Fetching bet history for wallet:', userWalletAddress);

    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('Pagination params:', { page, limit, skip });

    // Fetch bets for the user with pagination
    const bets = await Bet.find({ userId: userWalletAddress })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select('-metadata') // Exclude metadata for cleaner response
      .lean(); // Use lean() for better performance

    console.log('Found bets:', bets.length);

    // Get total count for pagination
    const totalBets = await Bet.countDocuments({ userId: userWalletAddress });
    console.log('Total bets count:', totalBets);

    // Calculate pagination info
    const totalPages = Math.ceil(totalBets / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format the response data
    const formattedBets = bets.map(bet => ({
      id: bet._id,
      betId: bet.betId,
      direction: bet.direction,
      amount: bet.amount,
      token: bet.token,
      duration: bet.duration,
      lockedPrice: bet.lockedPrice,
      finalPrice: bet.finalPrice,
      status: bet.status,
      result: bet.result,
      payout: bet.payout,
      fee: bet.fee,
      isHouseBot: bet.isHouseBot,
      lockedAt: bet.lockedAt,
      finalizedAt: bet.finalizedAt,
      createdAt: bet.createdAt,
      updatedAt: bet.updatedAt,
      // Calculate profit/loss
      profit: bet.result === 'WIN' ? (bet.payout || 0) - bet.amount : 
              bet.result === 'LOSS' ? -bet.amount : 0
    }));

    console.log('Formatted bets:', formattedBets.length);

    res.status(200).json({
      success: true,
      message: 'Bet history retrieved successfully',
      data: {
        bets: formattedBets,
        pagination: {
          currentPage: page,
          totalPages,
          totalBets,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error in getBetHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bet history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get referral history for authenticated user
export const getReferralHistory = async (req: any, res: Response): Promise<void> => {
  try {
    console.log('=== GetReferralHistory API Called ===');
    const user = req.user;

    console.log('User from middleware:', user ? { id: user._id, walletAddress: user.walletAddress } : 'No user');

    if (!user) {
      console.log('No user found in request');
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const userWalletAddress = user.walletAddress;
    console.log('Fetching referral history for wallet:', userWalletAddress);

    // Get query parameters for pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    console.log('Pagination params:', { page, limit, skip });

    // Fetch users who were referred by this user
    const referredUsers = await User.find({ referredBy: userWalletAddress })
      .sort({ createdAt: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select('walletAddress userName createdAt bonusTokens tokens loginType')
      .lean(); // Use lean() for better performance

    console.log('Found referred users:', referredUsers.length);

    // Get total count for pagination
    const totalReferrals = await User.countDocuments({ referredBy: userWalletAddress });
    console.log('Total referrals count:', totalReferrals);

    // Calculate pagination info
    const totalPages = Math.ceil(totalReferrals / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Format the response data with betting statistics
    const formattedReferrals = await Promise.all(referredUsers.map(async (referredUser, index) => {
      // Calculate total bonus earned from all tokens
      const bonusTokens = referredUser.bonusTokens || {};
      const totalBonusEarned = Object.values(bonusTokens).reduce((sum: number, amount: any) => sum + (amount || 0), 0);

      // Determine display name based on login type
      let displayName = 'Anonymous';
      if (referredUser.loginType === 'guest') {
        displayName = 'Guest User';
      } else if (referredUser.userName) {
        displayName = referredUser.userName;
      }

      // Calculate betting statistics for this referred user
      const userWalletAddress = referredUser.walletAddress;
      
      // Total Bets - count of all bets for this user
      const totalBets = await Bet.countDocuments({ userId: userWalletAddress });

      // Total Wins - sum of amounts for COMPLETED bets with WIN result
      const totalWinsResult = await Bet.aggregate([
        { $match: { userId: userWalletAddress, status: 'COMPLETED', result: 'WIN' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalWins = totalWinsResult.length > 0 ? totalWinsResult[0].total : 0;

      // Total Losses - sum of amounts for COMPLETED bets with LOSS result
      const totalLossesResult = await Bet.aggregate([
        { $match: { userId: userWalletAddress, status: 'COMPLETED', result: 'LOSS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const totalLosses = totalLossesResult.length > 0 ? totalLossesResult[0].total : 0;

      // Total Net Loss - Total Losses - Total Wins
      const totalNetLoss = totalLosses - totalWins;

      return {
        id: referredUser._id,
        walletAddress: referredUser.walletAddress,
        userName: displayName,
        loginType: referredUser.loginType,
        bonusEarned: totalBonusEarned,
        bonusTokens: bonusTokens,
        createdAt: referredUser.createdAt,
        // Calculate days since referral
        daysSinceReferral: Math.floor((Date.now() - new Date(referredUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        // Betting statistics
        totalBets: totalBets,
        totalWins: totalWins,
        totalLosses: totalLosses,
        totalNetLoss: totalNetLoss
      };
    }));

    console.log('Formatted referrals:', formattedReferrals.length);

    res.status(200).json({
      success: true,
      message: 'Referral history retrieved successfully',
      data: {
        referrals: formattedReferrals,
        pagination: {
          currentPage: page,
          totalPages,
          totalReferrals,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error in getReferralHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching referral history',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get detailed referral dashboard data for a wallet address
 */
export const getDetailedReferralDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== GetDetailedReferralDashboard API Called ===');
    
    const { walletAddress } = req.params;
    console.log('Wallet address:', walletAddress);

    if (!walletAddress) {
      res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
      return;
    }

    // Find the user by wallet address
    const user = await User.findOne({ walletAddress }).lean() as IUser | null;
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    console.log('User found:', { 
      walletAddress: user.walletAddress, 
      loginType: user.loginType,
      referralCode: user.referralCode 
    });

    // Get total referrals count (users who have this wallet as referredBy)
    const totalReferrals = await User.countDocuments({ referredBy: walletAddress });
    console.log('Total referrals:', totalReferrals);

    // Get bonus tokens object
    const bonusTokens = user.bonusTokens || {
      BeTyche: 0,
      SOL: 0,
      ETH: 0,
      RADBRO: 0,
      USDC: 0
    };

    // Get referral history for registered users
    let referralHistory: any[] = [];
    if (user.loginType === 'registered') {
      const referredUsers = await User.find({ referredBy: walletAddress })
        .sort({ createdAt: -1 })
        .limit(10) // Limit to recent 10 referrals for dashboard
        .select('walletAddress userName createdAt bonusTokens loginType')
        .lean();

      referralHistory = referredUsers.map(referredUser => {
        const bonusTokens = referredUser.bonusTokens || {};
        const totalBonusEarned = Object.values(bonusTokens).reduce((sum: number, amount: any) => sum + (amount || 0), 0);

        let displayName = 'Anonymous';
        if (referredUser.loginType === 'guest') {
          displayName = 'Guest User';
        } else if (referredUser.userName) {
          displayName = referredUser.userName;
        }

        return {
          id: referredUser._id,
          wallet: referredUser.walletAddress,
          userName: displayName,
          date: referredUser.createdAt,
          bonusEarned: totalBonusEarned,
          bonusTokens: bonusTokens,
          loginType: referredUser.loginType
        };
      });
    }

    res.status(200).json({
      success: true,
      message: 'Detailed referral dashboard data retrieved successfully',
      data: {
        totalReferrals,
        bonusTokens,
        loginType: user?.loginType,
        referralCode: user.referralCode,
        referralHistory
      }
    });

  } catch (error) {
    console.error('Error in getDetailedReferralDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching detailed referral dashboard',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};