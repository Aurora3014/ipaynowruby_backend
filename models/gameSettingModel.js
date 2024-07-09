const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const gameSettingModel = new Schema({
    category: {
        type: String,
        required: true
    },
    startAt:{
        type: Number,
        required: true,
    },
    period: {
        type: Number, // by ms
        required: true
    },
    breakTime: {
        type: Number, // by ms
        required: true
    },
    status: {
        type: String, // enabled or stopped
        enum: ['enabled', 'disabled']
    },
    currency: {
        type: String,
        enum: ['toncoin', 'usdt', 'notcoin']
    },
    price: {
        type: Number,
        required: true
    },
    adminMargin: {
        type: Number, // i.e 20 for 20%
        required: true,
    }
});

module.exports = mongoose.model('game_setting', gameSettingModel);