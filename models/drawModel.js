const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const drawModel = new Schema({
    startAt: {
        type: Number,
        required: true,
    },
    endAt:{
        type: Number, // timestamp
        required: true
    },
    category: {
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
    status: {
        type: String,
        enum: ['progress', 'expired']
    }
});

module.exports = mongoose.model('draw',drawModel);