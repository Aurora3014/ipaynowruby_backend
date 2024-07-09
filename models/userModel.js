const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userModel = new Schema({
    telegramId: { // telegram id
        type: String,
        // unique: true
    },
    fullName: {
        type: String
    },
    walletAddress:{
        type: String,
        required: true,
        unique: true
    },
    referralAddress: {
        type: String
    },
    rewards: {
        type: Number
    },
    createdAt: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('user', userModel);