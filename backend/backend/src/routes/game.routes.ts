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

/**
 * @swagger
 * /api/game/bet:
 *   post:
 *     summary: Create a new bet
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBetRequest'
 *     responses:
 *       200:
 *         description: Bet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Bet'
 *       400:
 *         description: Invalid bet parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/bet', asyncHandler(createBet));

/**
 * @swagger
 * /api/game/bet/validate:
 *   post:
 *     summary: Validate bet before processing
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBetRequest'
 *     responses:
 *       200:
 *         description: Bet validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/bet/validate', asyncHandler(validateBet));

/**
 * @swagger
 * /api/game/bet/{betId}/match:
 *   post:
 *     summary: Start matchmaking for a bet
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bet ID
 *     responses:
 *       200:
 *         description: Match found or queued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 matched:
 *                   type: boolean
 *                 game:
 *                   $ref: '#/components/schemas/Game'
 */
router.post('/bet/:betId/match', asyncHandler(startMatchmaking));

/**
 * @swagger
 * /api/game/bet/{betId}/start:
 *   post:
 *     summary: Start a game after countdown
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game started successfully
 */
router.post('/bet/:betId/start', asyncHandler(startGame));

/**
 * @swagger
 * /api/game/bet/{betId}/cancel:
 *   post:
 *     summary: Cancel a bet
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bet cancelled successfully
 */
router.post('/bet/:betId/cancel', asyncHandler(cancelBet));

/**
 * @swagger
 * /api/game/user/{userId}/bets:
 *   get:
 *     summary: Get user's bet history
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User bets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bet'
 */
router.get('/user/:userId/bets', asyncHandler(getUserBets));

/**
 * @swagger
 * /api/game/active:
 *   get:
 *     summary: Get all active bets (admin)
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Active bets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bet'
 */
router.get('/active', asyncHandler(getActiveBets));

/**
 * @swagger
 * /api/game/queue/status:
 *   get:
 *     summary: Get matchmaking queue status
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: Queue status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/QueueStatus'
 */
router.get('/queue/status', asyncHandler(getQueueStatus));

/**
 * @swagger
 * /api/game/bet/{betId}/complete:
 *   post:
 *     summary: Complete a game and determine winner
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Game completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Game'
 */
router.post('/bet/:betId/complete', asyncHandler(completeGame));

/**
 * @swagger
 * /api/game/bet/{betId}:
 *   get:
 *     summary: Get bet by ID
 *     tags: [Game]
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bet retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Bet'
 */
router.get('/bet/:betId', asyncHandler(getBet));

/**
 * @swagger
 * /api/game/system/status:
 *   get:
 *     summary: Check system status and house wallet balances
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: System status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemStatus'
 */
router.get('/system/status', asyncHandler(checkSystemStatus));

export default router;