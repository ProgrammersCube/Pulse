import express from 'express';
import { 
  getCurrentPrice, 
  getHistoricalPrices, 
  lockPrice, 
  getLockedPrice 
} from '../controllers/price.controller';

const router = express.Router();

// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to get the current price
router.get('/current', asyncHandler(getCurrentPrice));

// Route to get historical prices
router.get('/historical', asyncHandler(getHistoricalPrices));

// Route to lock a price for a bet
router.post('/lock', asyncHandler(lockPrice));

// Route to get a locked price
router.get('/lock/:betId', asyncHandler(getLockedPrice));

export default router;