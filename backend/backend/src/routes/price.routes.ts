import express from 'express';
import { 
  getCurrentPrice, 
  getHistoricalPrices, 
  lockPrice, 
  getLockedPrice,
  getTokenPriceByFeedId,
  verifyPythToken
} from '../controllers/price.controller';

const router = express.Router();

// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * @swagger
 * /api/price/current:
 *   get:
 *     summary: Get current price for a token
 *     tags: [Price]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *           enum: [BTC, ETH, SOL, DOGE, AVAX, LINK, XRP, MATIC, TON, BNB]
 *         description: Token symbol (defaults to BTC)
 *     responses:
 *       200:
 *         description: Current price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Price'
 */
router.get('/current', asyncHandler(getCurrentPrice));

/**
 * @swagger
 * /api/price/historical:
 *   get:
 *     summary: Get historical prices for a token
 *     tags: [Price]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *           enum: [BTC, ETH, SOL, DOGE, AVAX, LINK, XRP, MATIC, TON, BNB]
 *         description: Token symbol
 *       - in: query
 *         name: hours
 *         schema:
 *           type: number
 *         description: Number of hours to look back (default 24)
 *     responses:
 *       200:
 *         description: Historical prices retrieved successfully
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
 *                     $ref: '#/components/schemas/Price'
 */
router.get('/historical', asyncHandler(getHistoricalPrices));

/**
 * @swagger
 * /api/price/token:
 *   get:
 *     summary: Get token price by Pyth Network feed ID
 *     tags: [Price]
 *     parameters:
 *       - in: query
 *         name: feedId
 *         required: true
 *         schema:
 *           type: string
 *         description: Pyth Network feed ID
 *     responses:
 *       200:
 *         description: Token price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 price:
 *                   type: number
 */
router.get('/token', asyncHandler(getTokenPriceByFeedId));

/**
 * @swagger
 * /api/price/lock:
 *   post:
 *     summary: Lock a price for a bet
 *     tags: [Price]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LockPriceRequest'
 *     responses:
 *       200:
 *         description: Price locked successfully
 */
router.post('/lock', asyncHandler(lockPrice));

/**
 * @swagger
 * /api/price/lock/{betId}:
 *   get:
 *     summary: Get locked price for a bet
 *     tags: [Price]
 *     parameters:
 *       - in: path
 *         name: betId
 *         required: true
 *         schema:
 *           type: string
 *         description: Bet ID
 *     responses:
 *       200:
 *         description: Locked price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 price:
 *                   type: number
 */
router.get('/lock/:betId', asyncHandler(getLockedPrice));

/**
 * @swagger
 * /api/price/verify:
 *   post:
 *     summary: Verify Pyth Network token feed ID
 *     tags: [Price]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPythTokenRequest'
 *     responses:
 *       200:
 *         description: Token verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 price:
 *                   type: number
 *                 message:
 *                   type: string
 */
router.post('/verify', asyncHandler(verifyPythToken));

export default router;