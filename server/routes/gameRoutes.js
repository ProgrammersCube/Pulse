// routes/gameRoutes.js
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Route to start a new prediction
router.post('/start', gameController.startPrediction);

// Route to get predictions by userId
router.get('/user/:userId', gameController.getUserPredictions);

module.exports = router;
