const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const numberPurchasedModel = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    drawId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    num: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        enum: ['toncoin', 'usdt', 'notcoin']
    },
    price: {
        type: Number,
        required: true
    },
    usdtPrice: {
        type: Number
    },
    isWinner: {
        type: Boolean
    },
    createdAt: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('number_purchase',numberPurchasedModel);