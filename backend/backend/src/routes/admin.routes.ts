import express from 'express';
import {
  adminLogin,
  getSettings,
  updateSettings,
  getDashboardStats,
  createAmbassador,
  getAmbassadors,
  calculateAmbassadorEarnings,
  getPublicSettings,
  ambassadarLogin,
  ambassadarDassboardStats,
  updateWalletRotation,
  getWalletRotationWallets,
  setActiveWallet
} from '../controllers/admin.controller';
import { adminAuth } from '../middleware/adminAuth';

const router = express.Router();

// Auth routes
router.post('/login', adminLogin);
router.post("/ambassadar-login",ambassadarLogin)
// Public endpoint (no auth required)
router.get('/settings/public', getPublicSettings);

// Protected routes (require admin auth)
// router.use(adminAuth);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.put('/update-wallet-rotation', updateWalletRotation)
router.get("/settings/get-wallet-rotation",getWalletRotationWallets)
router.put("/settings/setActiveWallet",setActiveWallet)
// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Ambassadors
router.post('/ambassadors', createAmbassador);
router.get('/ambassadors', getAmbassadors);
router.post('/ambassadors/:ambassadorId/calculate-earnings', calculateAmbassadorEarnings);
router.post('/ambassadors/dashboard-stats', ambassadarDassboardStats);
export default router;