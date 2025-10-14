import express from 'express';
import { getOrCreateUser,resetPassword,verifyResetOtpCode, updateTokenBalances, applyReferralCode,createPulseAccount,pulseLogin,sendResetOtpCode, cleanupUserWallets, getDashboardStats, deleteWallet, addWallet, getBetHistory, getReferralHistory, getDetailedReferralDashboard, changePassword } from '../controllers/wallet.controller';
import { pulseUserAuth } from '../middleware/pulseUserAuth';

const router = express.Router();

// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to get or create a user by wallet address
router.post('/:walletAddress', asyncHandler(getOrCreateUser));
// Route to update token balances
router.put('/:walletAddress/tokens', asyncHandler(updateTokenBalances));
// Route to apply a referral code
router.post('/:walletAddress/referral', asyncHandler(applyReferralCode));
//create pulse account
router.post("/pulse/create-pulse-account",asyncHandler(createPulseAccount))
router.post("/pulse/pulse-login",asyncHandler(pulseLogin))
// Forgot password flow (OTP-based)
router.post("/reset/send-reset-password-otp",asyncHandler(sendResetOtpCode))
router.post("/reset/verify-reset-password-otp",asyncHandler(verifyResetOtpCode))
router.post("/reset/reset-password",asyncHandler(resetPassword))
// Change password for authenticated users (requires current password)
router.post("/pulse/change-password", pulseUserAuth, asyncHandler(changePassword))
// ✅ Add cleanup route for fixing existing users with wallet issues
router.post("/cleanup/wallets", asyncHandler(cleanupUserWallets));
// Dashboard Stats route with authentication
router.get("/dashboard/stats", pulseUserAuth, asyncHandler(getDashboardStats));
// Bet History route with authentication
router.get("/bet-history", pulseUserAuth, asyncHandler(getBetHistory));
// Referral History route with authentication
router.get("/referral-history", pulseUserAuth, asyncHandler(getReferralHistory));
// Add wallet route with authentication
router.post("/wallet/pulse/add-wallet", pulseUserAuth, asyncHandler(addWallet));
// Delete wallet route with authentication
router.delete("/wallet/:walletAddress", pulseUserAuth, asyncHandler(deleteWallet));
// Detailed Referral Dashboard route
router.get("/Detailed-Referall-Dashboard/:walletAddress", asyncHandler(getDetailedReferralDashboard));
// user earnings in this platform
//router.post('/:walletAddress/ambasssadar-refered-player-activity', asyncHandler(ambassadarReferredPlayerActivity));
export default router;