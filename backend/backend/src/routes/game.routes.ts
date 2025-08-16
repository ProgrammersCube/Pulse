import express from 'express';
import {
  createBet,
  startMatchmaking,
  startGame,
  cancelBet,
  getUserBets,
  getActiveBets,
  getQueueStatus,
  completeGame,
  getBet,
  checkSystemStatus,
  validateBet
} from '../controllers/game.controller';

const router = express.Router();

// Async handler wrapper
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Create a new bet
router.post('/bet', asyncHandler(createBet));

// Validate bet before processing
router.post('/bet/validate', asyncHandler(validateBet));

// Start matchmaking for a bet .. this route is use to return a match for a given bet
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

// Complete a game
router.post('/bet/:betId/complete', asyncHandler(completeGame));

// Get bet by ID to show on frontend after game end
router.get('/bet/:betId', asyncHandler(getBet));

router.get('/system/status', asyncHandler(checkSystemStatus));


export default router;