import express from 'express';
import {
  adminLogin,
  getSettings,
  updateSettings,
  getDashboardStats,
  getPlayerNetProfitability,
  getNetRevenueAnalytics,
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
  getWalletDebug,
  regenerateWalletPrivateKey,
  testPrivateKeyDecryption,
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

// Auth routes
router.post('/login', adminLogin);
router.post("/ambassadar-login",ambassadarLogin)
// Public endpoint (no auth required)
router.get('/settings/public', getPublicSettings);
router.get('/active-wallet-public-key', getCurrentActiveWalletPublicKey);
router.post('/health/jwt-check', checkJWTSecret);
// Protected routes (require admin auth)
//  router.use(adminAuth);
router.post("/get-ambassadar-from-token",ambassadorAuth,(req:any,res:any)=>{
  console.log("api called")
return res.status(200).json({success:true,user:req.ambassador})
})
router.post("/ambassadar-change-password",ambassadorAuth,ambassadarChangePassword)
router.post("/change-ambassadar-payout-wallet",ambassadorAuth,changeAmbassadorPayoutWallet)
router.post("/request-commission-payout",ambassadorAuth,requestCommissionPayout)
router.post("/commission-history",ambassadorAuth,getCommissionHistory)
// Settings
router.get('/settings', getSettings);
router.put('/settings',adminAuth, updateSettings);
router.put('/update-wallet-rotation',adminAuth, updateWalletRotation)
router.get("/settings/get-wallet-rotation",adminAuth,getWalletRotationWallets)
router.put("/settings/setActiveWallet",adminAuth,setActiveWallet)
router.post("/settings/wallet-rotation-toggle-fallback",adminAuth,toggleWalletRotationFallback)
router.get('/treasury/wallet-balances/:walletId', adminAuth, getWalletBalances);
router.get('/treasury/wallet-debug/:walletId', adminAuth, getWalletDebug);
router.put('/treasury/regenerate-private-key/:walletId', adminAuth, regenerateWalletPrivateKey);
router.get('/treasury/test-decryption/:walletId', adminAuth, testPrivateKeyDecryption);

// Dashboard
router.get('/dashboard/stats',adminAuth, getDashboardStats);
router.get('/dashboard/player-profitability', adminAuth, getPlayerNetProfitability);
router.get('/dashboard/net-revenue', adminAuth, getNetRevenueAnalytics);

// Ambassadors
router.post('/ambassadors', createAmbassador);
router.get('/ambassadors', getAmbassadors);
router.put('/ambassadors/:id', adminAuth, updateAmbassador);
router.delete('/ambassadors/:id', adminAuth, deleteAmbassador);
router.post('/ambassadors/:ambassadorId/calculate-earnings', calculateAmbassadorEarnings);
router.post('/ambassadors/dashboard-stats', ambassadarDassboardStats);
router.post('/ambassadors/funnel-analytics', ambassadorAuth, getFunnelAnalytics);
router.get('/pending-payout-requests', adminAuth, getPendingPayoutRequests);
router.get('/approved-payout-requests', adminAuth, getApprovedPayoutRequests);
router.post('/approve-payout-request', adminAuth, approvePayoutRequest);
router.post('/reject-payout-request', adminAuth, rejectPayoutRequest);
router.post('/process-payment', adminAuth, processPayment);
router.get('/profile', adminAuth, getAdminProfile);
router.post('/change-password', adminAuth, changeAdminPassword);
router.get('/dashboard/user-analytics', adminAuth, getUserAnalytics);
router.post('/change-user-password', adminAuth, changeUserPassword);
export default router;