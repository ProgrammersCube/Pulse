import express from 'express';
import { getOrCreateUser, updateTokenBalances, applyReferralCode,createPulseAccount,pulseLogin } from '../controllers/wallet.controller';

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
// user earnings in this platform
//router.post('/:walletAddress/ambasssadar-refered-player-activity', asyncHandler(ambassadarReferredPlayerActivity));
export default router;