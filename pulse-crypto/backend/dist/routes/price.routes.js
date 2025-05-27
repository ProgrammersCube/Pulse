"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const price_controller_1 = require("../controllers/price.controller");
const router = express_1.default.Router();
// Create a wrapper that properly handles the async controller functions
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Route to get the current price
router.get('/current', asyncHandler(price_controller_1.getCurrentPrice));
// Route to get historical prices
router.get('/historical', asyncHandler(price_controller_1.getHistoricalPrices));
// Route to lock a price for a bet
router.post('/lock', asyncHandler(price_controller_1.lockPrice));
// Route to get a locked price
router.get('/lock/:betId', asyncHandler(price_controller_1.getLockedPrice));
exports.default = router;
