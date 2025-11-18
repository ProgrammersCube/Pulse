import express from 'express';
import {
  adminLogin,
  getSettings,
  updateSettings,
  getDashboardStats,
  getPlayerNetProfitability,
  getNetRevenueAnalytics,
  getPredictionTokenStats,
  createAmbassador,
  getAmbassadors,
  updateAmbassador,
  deleteAmbassador,
  calculateAmbassadorEarnings,
  getPublicSettings,
  ambassadarLogin,
  ambassadarDassboardStats,
  ambassadarChangePassword,
  changeAmbassadorPayoutWallet,
  updateWalletRotation,
  getWalletRotationWallets,
  setActiveWallet,
  toggleWalletRotationFallback,
  getWalletBalances,
  getCurrentActiveWalletPublicKey,
  getFunnelAnalytics,
  requestCommissionPayout,
  getCommissionHistory,
  getPendingPayoutRequests,
  approvePayoutRequest,
  rejectPayoutRequest,
  getApprovedPayoutRequests,
  processPayment,
  getAdminProfile,
  changeAdminPassword,
  getUserAnalytics,
  changeUserPassword,
  checkJWTSecret
} from '../controllers/admin.controller';
import { adminAuth } from '../middleware/adminAuth';
import { ambassadorAuth } from '../middleware/ambassadarauth';
const router = express.Router();

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /api/admin/ambassadar-login:
 *   post:
 *     summary: Ambassador login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 */
router.post("/ambassadar-login",ambassadarLogin)

/**
 * @swagger
 * /api/admin/settings/public:
 *   get:
 *     summary: Get public settings (no auth required)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Public settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 */
router.get('/settings/public', getPublicSettings);

/**
 * @swagger
 * /api/admin/active-wallet-public-key:
 *   get:
 *     summary: Get current active wallet public key (no auth required)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Active wallet public key retrieved successfully
 */
router.get('/active-wallet-public-key', getCurrentActiveWalletPublicKey);

/**
 * @swagger
 * /api/admin/health/jwt-check:
 *   post:
 *     summary: Check JWT secret configuration
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: JWT configuration check result
 */
router.post('/health/jwt-check', checkJWTSecret);
/**
 * @swagger
 * /api/admin/get-ambassadar-from-token:
 *   post:
 *     summary: Get ambassador from token
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ambassador retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/Ambassador'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/get-ambassadar-from-token",ambassadorAuth,(req:any,res:any)=>{
  console.log("api called")
return res.status(200).json({success:true,user:req.ambassador})
})

/**
 * @swagger
 * /api/admin/ambassadar-change-password:
 *   post:
 *     summary: Change ambassador password
 *     tags: [Admin]
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
router.post("/ambassadar-change-password",ambassadorAuth,ambassadarChangePassword)

/**
 * @swagger
 * /api/admin/change-ambassadar-payout-wallet:
 *   post:
 *     summary: Change ambassador payout wallet
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletAddress
 *             properties:
 *               walletAddress:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout wallet updated successfully
 */
router.post("/change-ambassadar-payout-wallet",ambassadorAuth,changeAmbassadorPayoutWallet)

/**
 * @swagger
 * /api/admin/request-commission-payout:
 *   post:
 *     summary: Request commission payout
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payout request created successfully
 */
router.post("/request-commission-payout",ambassadorAuth,requestCommissionPayout)

/**
 * @swagger
 * /api/admin/commission-history:
 *   post:
 *     summary: Get commission history
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Commission history retrieved successfully
 */
router.post("/commission-history",ambassadorAuth,getCommissionHistory)

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Get admin settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/settings', adminAuth, getSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   put:
 *     summary: Update admin settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSettingsRequest'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.put('/settings',adminAuth, updateSettings);

/**
 * @swagger
 * /api/admin/update-wallet-rotation:
 *   put:
 *     summary: Update wallet rotation settings
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet rotation updated successfully
 */
router.put('/update-wallet-rotation',adminAuth, updateWalletRotation)

/**
 * @swagger
 * /api/admin/settings/get-wallet-rotation:
 *   get:
 *     summary: Get wallet rotation wallets
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet rotation wallets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/WalletRotation'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/settings/get-wallet-rotation",adminAuth,getWalletRotationWallets)

/**
 * @swagger
 * /api/admin/settings/setActiveWallet:
 *   put:
 *     summary: Set active wallet
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *             properties:
 *               walletId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Active wallet set successfully
 */
router.put("/settings/setActiveWallet",adminAuth,setActiveWallet)

/**
 * @swagger
 * /api/admin/settings/wallet-rotation-toggle-fallback:
 *   post:
 *     summary: Toggle wallet rotation fallback
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet rotation fallback toggled successfully
 */
router.post("/settings/wallet-rotation-toggle-fallback",adminAuth,toggleWalletRotationFallback)

/**
 * @swagger
 * /api/admin/treasury/wallet-balances/{walletId}:
 *   get:
 *     summary: Get wallet balances
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wallet balances retrieved successfully
 */
router.get('/treasury/wallet-balances/:walletId', adminAuth, getWalletBalances);

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
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
 *                   $ref: '#/components/schemas/AdminDashboardStats'
 */
router.get('/dashboard/stats',adminAuth, getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/player-profitability:
 *   get:
 *     summary: Get player profitability analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Player profitability data retrieved successfully
 */
router.get('/dashboard/player-profitability', adminAuth, getPlayerNetProfitability);

/**
 * @swagger
 * /api/admin/dashboard/net-revenue:
 *   get:
 *     summary: Get net revenue analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, all]
 *         description: Time period for analytics
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Filter by prediction token
 *     responses:
 *       200:
 *         description: Net revenue analytics retrieved successfully
 */
router.get('/dashboard/net-revenue', adminAuth, getNetRevenueAnalytics);

/**
 * @swagger
 * /api/admin/dashboard/prediction-token-stats:
 *   get:
 *     summary: Get prediction token statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prediction token stats retrieved successfully
 */
router.get('/dashboard/prediction-token-stats', adminAuth, getPredictionTokenStats);

/**
 * @swagger
 * /api/admin/ambassadors:
 *   post:
 *     summary: Create a new ambassador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAmbassadorRequest'
 *     responses:
 *       201:
 *         description: Ambassador created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Ambassador'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/ambassadors', adminAuth, createAmbassador);

/**
 * @swagger
 * /api/admin/ambassadors:
 *   get:
 *     summary: Get all ambassadors
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ambassadors retrieved successfully
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
 *                     $ref: '#/components/schemas/Ambassador'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/ambassadors', getAmbassadors);

/**
 * @swagger
 * /api/admin/ambassadors/{id}:
 *   put:
 *     summary: Update an ambassador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ambassador updated successfully
 */
router.put('/ambassadors/:id', adminAuth, updateAmbassador);

/**
 * @swagger
 * /api/admin/ambassadors/{id}:
 *   delete:
 *     summary: Delete an ambassador
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ambassador deleted successfully
 */
router.delete('/ambassadors/:id', adminAuth, deleteAmbassador);

/**
 * @swagger
 * /api/admin/ambassadors/{ambassadorId}/calculate-earnings:
 *   post:
 *     summary: Calculate ambassador earnings
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: ambassadorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Earnings calculated successfully
 */
router.post('/ambassadors/:ambassadorId/calculate-earnings', calculateAmbassadorEarnings);

/**
 * @swagger
 * /api/admin/ambassadors/dashboard-stats:
 *   post:
 *     summary: Get ambassador dashboard statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Ambassador dashboard stats retrieved successfully
 */
router.post('/ambassadors/dashboard-stats', ambassadarDassboardStats);

/**
 * @swagger
 * /api/admin/ambassadors/funnel-analytics:
 *   post:
 *     summary: Get funnel analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Funnel analytics retrieved successfully
 */
router.post('/ambassadors/funnel-analytics', ambassadorAuth, getFunnelAnalytics);

/**
 * @swagger
 * /api/admin/pending-payout-requests:
 *   get:
 *     summary: Get pending payout requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending payout requests retrieved successfully
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
 *                     $ref: '#/components/schemas/PayoutRequest'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/pending-payout-requests', adminAuth, getPendingPayoutRequests);

/**
 * @swagger
 * /api/admin/approved-payout-requests:
 *   get:
 *     summary: Get approved payout requests
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Approved payout requests retrieved successfully
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
 *                     $ref: '#/components/schemas/PayoutRequest'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/approved-payout-requests', adminAuth, getApprovedPayoutRequests);

/**
 * @swagger
 * /api/admin/approve-payout-request:
 *   post:
 *     summary: Approve a payout request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout request approved successfully
 */
router.post('/approve-payout-request', adminAuth, approvePayoutRequest);

/**
 * @swagger
 * /api/admin/reject-payout-request:
 *   post:
 *     summary: Reject a payout request
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payout request rejected successfully
 */
router.post('/reject-payout-request', adminAuth, rejectPayoutRequest);

/**
 * @swagger
 * /api/admin/process-payment:
 *   post:
 *     summary: Process a payment
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 */
router.post('/process-payment', adminAuth, processPayment);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 */
router.get('/profile', adminAuth, getAdminProfile);

/**
 * @swagger
 * /api/admin/change-password:
 *   post:
 *     summary: Change admin password
 *     tags: [Admin]
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
router.post('/change-password', adminAuth, changeAdminPassword);

/**
 * @swagger
 * /api/admin/dashboard/user-analytics:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 */
router.get('/dashboard/user-analytics', adminAuth, getUserAnalytics);

/**
 * @swagger
 * /api/admin/change-user-password:
 *   post:
 *     summary: Change user password (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User password changed successfully
 */
router.post('/change-user-password', adminAuth, changeUserPassword);
export default router;