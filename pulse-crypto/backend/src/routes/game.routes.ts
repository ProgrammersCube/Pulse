import express from 'express';
import { 
  createGame, 
  startGame, 
  getGame, 
  getUserGames, 
  getPendingGames 
} from '../controllers/game.controller';

const router = express.Router();

// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Create a new game
router.post('/create', asyncHandler(createGame));

// Start a game (after countdown)
router.post('/:gameId/start', asyncHandler(startGame));

// Get game details
router.get('/:gameId', asyncHandler(getGame));

// Get user's game history
router.get('/user/:walletAddress', asyncHandler(getUserGames));

// Get pending games for matchmaking
router.get('/pending/list', asyncHandler(getPendingGames));

export default router;