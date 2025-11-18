import express from 'express';
import { getOrCreateUser,resetPassword,verifyResetOtpCode, updateTokenBalances, applyReferralCode,createPulseAccount,pulseLogin,sendResetOtpCode, cleanupUserWallets, getDashboardStats, deleteWallet, addWallet, getBetHistory, getReferralHistory, getDetailedReferralDashboard, changePassword } from '../controllers/wallet.controller';
import { pulseUserAuth } from '../middleware/pulseUserAuth';

const router = express.Router();

// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn: any) => 
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

/**
 * @swagger
 * /api/wallet/{walletAddress}:
 *   post:
 *     summary: Get or create a user by wallet address
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Solana wallet address
 *     responses:
 *       200:
 *         description: User retrieved or created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 */
router.post('/:walletAddress', asyncHandler(getOrCreateUser));

/**
 * @swagger
 * /api/wallet/{walletAddress}/tokens:
 *   put:
 *     summary: Update token balances for a user
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTokenBalancesRequest'
 *     responses:
 *       200:
 *         description: Token balances updated successfully
 */
router.put('/:walletAddress/tokens', asyncHandler(updateTokenBalances));

/**
 * @swagger
 * /api/wallet/{walletAddress}/referral:
 *   post:
 *     summary: Apply a referral code to a user account
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyReferralCodeRequest'
 *     responses:
 *       200:
 *         description: Referral code applied successfully
 */
router.post('/:walletAddress/referral', asyncHandler(applyReferralCode));

/**
 * @swagger
 * /api/wallet/pulse/create-pulse-account:
 *   post:
 *     summary: Create a new Pulse account
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePulseAccountRequest'
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post("/pulse/create-pulse-account",asyncHandler(createPulseAccount))

/**
 * @swagger
 * /api/wallet/pulse/pulse-login:
 *   post:
 *     summary: Login to Pulse account
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
router.post("/pulse/pulse-login",asyncHandler(pulseLogin))

/**
 * @swagger
 * /api/wallet/reset/send-reset-password-otp:
 *   post:
 *     summary: Send OTP code for password reset
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordOTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/reset/send-reset-password-otp",asyncHandler(sendResetOtpCode))

/**
 * @swagger
 * /api/wallet/reset/verify-reset-password-otp:
 *   post:
 *     summary: Verify OTP code for password reset
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyResetOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/reset/verify-reset-password-otp",asyncHandler(verifyResetOtpCode))

/**
 * @swagger
 * /api/wallet/reset/reset-password:
 *   post:
 *     summary: Reset password using verified OTP
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/reset/reset-password",asyncHandler(resetPassword))

/**
 * @swagger
 * /api/wallet/pulse/change-password:
 *   post:
 *     summary: Change password for authenticated user
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
router.post("/pulse/change-password", pulseUserAuth, asyncHandler(changePassword))

/**
 * @swagger
 * /api/wallet/cleanup/wallets:
 *   post:
 *     summary: Cleanup user wallets (admin utility)
 *     tags: [Wallet]
 *     responses:
 *       200:
 *         description: Cleanup completed
 */
router.post("/cleanup/wallets", asyncHandler(cleanupUserWallets));

/**
 * @swagger
 * /api/wallet/dashboard/stats:
 *   get:
 *     summary: Get user dashboard statistics
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 */
router.get("/dashboard/stats", pulseUserAuth, asyncHandler(getDashboardStats));

/**
 * @swagger
 * /api/wallet/bet-history:
 *   get:
 *     summary: Get user bet history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bet history retrieved successfully
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
router.get("/bet-history", pulseUserAuth, asyncHandler(getBetHistory));

/**
 * @swagger
 * /api/wallet/referral-history:
 *   get:
 *     summary: Get user referral history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReferralHistory'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/referral-history", pulseUserAuth, asyncHandler(getReferralHistory));

/**
 * @swagger
 * /api/wallet/wallet/pulse/add-wallet:
 *   post:
 *     summary: Add a wallet to user account
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddWalletRequest'
 *     responses:
 *       200:
 *         description: Wallet added successfully
 */
router.post("/wallet/pulse/add-wallet", pulseUserAuth, asyncHandler(addWallet));

/**
 * @swagger
 * /api/wallet/wallet/{walletAddress}:
 *   delete:
 *     summary: Delete a wallet from user account
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet deleted successfully
 */
router.delete("/wallet/:walletAddress", pulseUserAuth, asyncHandler(deleteWallet));

/**
 * @swagger
 * /api/wallet/Detailed-Referall-Dashboard/{walletAddress}:
 *   get:
 *     summary: Get detailed referral dashboard for a wallet
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Wallet address to get referral dashboard for
 *     responses:
 *       200:
 *         description: Referral dashboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReferralHistory'
 *       404:
 *         description: Wallet not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/Detailed-Referall-Dashboard/:walletAddress", asyncHandler(getDetailedReferralDashboard));

export default router;