"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_controller_1 = require("../controllers/wallet.controller");
const router = express_1.default.Router();
// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Route to get or create a user by wallet address
router.get('/:walletAddress', asyncHandler(wallet_controller_1.getOrCreateUser));
// Route to update token balances
router.put('/:walletAddress/tokens', asyncHandler(wallet_controller_1.updateTokenBalances));
// Route to apply a referral code
router.post('/:walletAddress/referral', asyncHandler(wallet_controller_1.applyReferralCode));
exports.default = router;
