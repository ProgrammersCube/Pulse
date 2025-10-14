import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/admin.model';
import Settings from '../models/settings.model';
import Ambassador from '../models/ambassador.model';
import User from '../models/user.model';
import Bet from '../models/bet.model';
import { stat } from 'fs';
import CryptoJS from "crypto-js";
async function updateSettingss(){
  await Settings.updateOne(
  {},
  {
    $push: {
      walletRotation: {
        publicKey: "0x21312321",
        privateKey: "U2FsdGVkX1+mclFXO9wxJ+jw9Tu3oJGY2/pcSzlJVfw=",
        type: "primary",
        tokens: { BeTyche: 5000, SOL: 2 },

      }
    }
  }
);
}
// updateSettingss()
// Generate JWT token
const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d'
  });
};

// Admin login
// Admin login
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      console.log('Admin login attempt:', username);
      // Find admin
      const admin = await Admin.findOne({ username });
      console.log('Found admin:', admin);
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
      console.log(username)
      console.log('Ambassadar login attempt:', username);
      // Find admin
      const ambassadar = await Ambassador.findOne({ username });
      console.log('Found Ambassadar:', ambassadar);
      if (!ambassadar) {
        res.status(401).json({ success: false, message: 'Invalid  user name' });
        return;
      }
      if(ambassadar?.password!=password)
      {
         res.status(401).json({ success: false, message: 'Invalid  password' });
        return;
      }
      // const isMatch = await ambassadar.comparePasswords(password);
      // if (!isMatch) {
      //   res.status(401).json({ success: false, message: 'Invalid password credentials' });
      //   return;
      // }
      
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
function decryptWalletKey(encrypted:any) {
  const SERVER_SHARED_SECRET = process.env.SHARED_SECRET_For_PRIVATE_KEY;
  const bytes = CryptoJS.AES.decrypt(encrypted, SERVER_SHARED_SECRET || "");
  return bytes.toString(CryptoJS.enc.Utf8);
}
export const updateWalletRotation=async (req:any,res:any)=>{
   try {
    const { privateKey, publicKey, tokens, type } = req.body;

    if (!privateKey || !publicKey || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const privateLKey = decryptWalletKey(privateKey);

    const walletData = {
      publicKey,
      privateKey,
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
    res.status(500).json({ success: false, message: "Server error" });
  }
}
export const getWalletRotationWallets=async(req:any,res:any)=>{
  try{
  const getSettings=await Settings.findOne({})
  const getActiveWallet = await Settings.findOne(
  { walletRotation: { $elemMatch: { active: true, type: 'primary' } } }, // ensure same element
  { 'walletRotation.$': 1 } // return only the matched element in the array
).lean();

  res.status(200).json({ success: true, data: getSettings?.walletRotation,activeWallet:getActiveWallet });  
  }
  catch (error) {
    console.error("Get wallet rotation error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
export const setActiveWallet=async(req:any,res:any)=>{
 try {
    const { walletId,targetType } = req.body;
    console.log(targetType)
    if (!walletId) {
      return res.status(400).json({ success: false, message: "walletId is required" });
    }

    // Find settings document
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ success: false, message: "Settings not found" });
    }

settings.walletRotation = settings.walletRotation.map((wallet: any) => {
  const plainWallet = wallet.toObject?.() || wallet;

  // If we are activating a PRIMARY walletId
  if (plainWallet.type === "primary") {
    console.log(plainWallet._id.toString() === walletId && targetType === "primary")
    return {
      ...plainWallet,
      active: (plainWallet._id.toString() === walletId && targetType === "primary"),
    };
  }

  // If we are activating a FALLBACK walletId
  if (plainWallet.type === "fallback") {
    console.log(plainWallet._id.toString() === walletId && targetType === "fallback")
    return {
      ...plainWallet,
      active: (plainWallet._id.toString() === walletId && targetType === "fallback"),
    };
  }

  // Leave all others untouched
  return plainWallet;
});

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Active wallet updated successfully",
      data: settings.walletRotation
    });
  } catch (error) {
    console.error("setActiveWallet error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }

}
// Update settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;
    const adminId = (req as any).admin.id;
    
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
    const allActiveBets=await Bet.find({status:"IN_PROGRESS"})
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBets,
        activeBets,
        totalAmbassadors,
        revenueStats,
        allActiveBets
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create ambassador
export const createAmbassador = async (req: Request, res: Response): Promise<void> => {
  try {
    const { walletAddress, ambassadorCode, commissionPercentage,username,password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({walletAddress });

    // if (!user) {
    //   res.status(404).json({ success: false, message: 'User not found' });
    //   return;
    // }
    
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
      password
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
    
    // Get user details for referred users
    const ambassadorsWithUserDetails = await Promise.all(
      ambassadors.map(async (ambassador) => {
        const referredUserDetails = await User.find({
          walletAddress: { $in: ambassador.referredUsers }
        }).select('walletAddress lastActive');
        
        return {
          ...ambassador.toObject(),
          referredUserDetails
        };
      })
    );
    
    res.status(200).json({ success: true, data: ambassadorsWithUserDetails });
  } catch (error) {
    console.error('Get ambassadors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
export const ambassadarDassboardStats=async(req:any,res:any)=>{
  try{
    console.log(req.body)
    const { ambassadorId } = req.body;
    console.log(ambassadorId)
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
    const userName=ambassador?.username || "ambassadar123"
    const totalReferalls=ambassador?.referredUsers?.length
    const commisionRate=ambassador?.commissionPercentage
    const totalCommision=(commisionRate/100) * stats[0]?.netLoss
    return res.json({
      id:ambassador?._id,
      userName,
      totalReferalls,
      commisionRate,
      totalCommision,
      totalWins:stats[0]?.totalWins,
      totalLoss:stats[0]?.totalLoss,
      netLoss:stats[0]?.netLoss,
      wagerVolume:stats[0]?.totalWins + stats[0]?.totalLoss,
      referallCode:ambassador?.ambassadorCode
    })

  }
  catch(e)
  {
    console.log(e)
  }
}
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