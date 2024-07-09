const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminProfitModel = new Schema({
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
});

module.exports = mongoose.model('admin_profit', adminProfitModel);