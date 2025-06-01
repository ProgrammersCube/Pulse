import express from 'express';
import {
  createBet,
  startMatchmaking,
  startGame,
  cancelBet,
  getUserBets,
  getActiveBets,
  getQueueStatus
} from '../controllers/game.controller';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Create a new bet
router.post('/bet', asyncHandler(createBet));

// Start matchmaking for a bet
router.post('/bet/:betId/match', asyncHandler(startMatchmaking));

// Start a game after countdown
router.post('/bet/:betId/start', asyncHandler(startGame));

// Cancel a bet
router.post('/bet/:betId/cancel', asyncHandler(cancelBet));

// Get user's bet history
router.get('/user/:userId/bets', asyncHandler(getUserBets));

// Get active bets (admin)
router.get('/active', asyncHandler(getActiveBets));

// Get matchmaking queue status
router.get('/queue/status', asyncHandler(getQueueStatus));

export default router;