const express = require('express');
const router = express();
const Admin = require('../../models/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Draw = require('../../models/drawModel');
const NumberPurchase = require('../../models/numberPurchasedModel');
const GameSetting = require('../../models/gameSettingModel');
const User = require('../../models/userModel');
const Prize = require('../../models/prizePoolModel');
const AdminProfit = require('../../models/adminProfitModel');

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/dashboard/users
 **/
router.post('/users', async (req, res) => {
    const users = await User.find();
    return res.status(200).json({ users });
});

router.get('/referrals', async (req, res) => {
    try {
        const { wallet } = req.query;
        const user = await User.findOne({walletAddress: wallet});
        const referrals = await User.find({ referralAddress: wallet});
        return res.status(200).json({ referrals: referrals, rewards: user.rewards });    
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

router.get('/numbers', async (req, res) => {
    try {
        const { wallet } = req.query;
        let user = await User.findOne({ walletAddress: wallet});
        const numbers = await NumberPurchase.where({ userId: user._id }).sort({createdAt: 'desc'});
        return res.status(200).json({ numbers })
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

router.get('/prizes', async (req, res) => {
    try {
        const { wallet } = req.query;
        const prizes = await Prize.where({ winnerWallet: wallet }).sort({endAt: 'desc'});
        return res.status(200).json({ prizes })
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

router.post('/draws', async (req, res) => {
    try {
        let draws = await Draw.where({ currency: 'toncoin', category: 'number'}).sort({ endAt: 'desc' }).limit(100); // for now use only toncoin
        for (let i = 0; i < draws.length; i++) {
            let _prize = await Prize.findOne({ drawId: draws[i]._id });
            let _adminProfit = await AdminProfit.findOne({ drawId: draws[i]._id });
            draws[i] = {
                _id: draws[i]._id, 
                startAt: draws[i].startAt, 
                endAt: draws[i].endAt, 
                currency: draws[i].currency,
                price: draws[i].price,
                status: draws[i].status,
                prize: _prize, 
                adminProfit: _adminProfit 
            };
        }
        return res.status(200).json({ draws });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

/**
 * @method POST
 * @access public
 * @description: Set payout to a specific draw's prize
 * @endpoint /api/v1/dashboard/payout
 */
router.post('/payout', async (req, res) => {
    const { drawId, payout } = req.body;
    try {
        let prize = await Prize.updateOne({ drawId }, { payout });
        return res.status(200).json({ prize });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
})


router.get('/draw', async (req, res) => {
    try {
        const { drawId } = req.query;
        const numbers = await NumberPurchase.find({ drawId });
        const prize = await Prize.findOne({ drawId });
        const users = await User.find();
        return res.status(200).json({ numbers, prize, users });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

router.get('/game_settings', async (req, res) => {
    try {
        const settings = await GameSetting.find({category: req.query.category});
        return res.status(200).json({ settings });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

/**
 * @method POST
 * @endpoint /api/v1/dashboard/game_setting
 */
router.post('/game_setting', async (req, res) => {
    try {
        const {id, period, breakTime, price, margin, status} = req.body;
        const setting = await GameSetting.updateOne({_id: id}, {
            period: parseInt(period) * 60000,
            breakTime: parseInt(breakTime) * 60000,
            price: price,
            adminMargin: margin,// percentage
            status: status ? 'enabled' : 'disabled'
        });
        return res.status(200).json({ setting });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

/** 
 * @method GET
 * @endpoint /api/v1/dashboard/profile 
**/
router.get('/profile', async (req, res) => {
    try {
        let profile = await Admin.findOne({_id: req.user.userId});
        return res.status(200).json({ profile });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});


/** 
 * @method POST
 * @endpoint /api/v1/dashboard/profile 
**/
router.post('/profile', async (req, res) => {
    try {
        const { email, password, new_password, adminWallet } = req.body;
        let admin = await Admin.findOne({ _id: req.user.userId });
        if (!bcrypt.compareSync(password, admin.password)) {
            return res.status(200).json({ msg: 'Password incorrect' });
        }
        let profile = admin;
        if (new_password) {
            let hashedPwd = bcrypt.hashSync(new_password, 10);
            profile = await Admin.updateOne({_id: req.user.userId}, {
                email,
                password: hashedPwd,
                adminWallet: adminWallet
            });
        } else {
            profile = await Admin.updateOne({_id: req.user.userId}, {
                email,
                password: hashedPwd,
                adminWallet: adminWallet
            });
        }
        return res.status(200).json({ profile });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }
});

module.exports = router;
