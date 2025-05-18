import express from 'express';
import { getOrCreateUser, updateTokenBalances, applyReferralCode } from '../controllers/wallet.controller';

const router = express.Router();

// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to get or create a user by wallet address
router.get('/:walletAddress', asyncHandler(getOrCreateUser));

// Route to update token balances
router.put('/:walletAddress/tokens', asyncHandler(updateTokenBalances));

// Route to apply a referral code
router.post('/:walletAddress/referral', asyncHandler(applyReferralCode));

export default router;