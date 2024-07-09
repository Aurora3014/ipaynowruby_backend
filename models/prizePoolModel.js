const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const prizePoolModel = new Schema({
    drawId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    currency: {
        type: String,
        enum: ['toncoin', 'usdt', 'notcoin']
    },
    qty: {
        type: Number,
        required: true
    },
    usdtQty: {
        type: Number
    },
    winnerId: {
        type: mongoose.Schema.Types.ObjectId
    },
    winnerWallet: {
        type: String
    },
    payout: {
        type: String
    },
    createdAt: {
        type: String,
        required: true
    },
    endAt: {
        type: String,
    }
});

module.exports = mongoose.model('prize_pool', prizePoolModel);