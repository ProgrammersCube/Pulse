// models/predictionModel.js
const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    stake: { type: Number, required: true },
    direction: { type: String, enum: ['up', 'down'], required: true },
    status: { type: String, enum: ['pending', 'won', 'lost'], default: 'pending' },
    userId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;
