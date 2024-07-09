const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminModel = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    adminWallet:{
        type: String,
        required: true,
        unique: true
    },
    
});

module.exports = mongoose.model('admin', adminModel);