const express = require('express');
const router = express.Router();
const NumberPurchased = require('../../models/numberPurchasedModel');
const PrizePool = require('../../models/prizePoolModel');
const GameSetting = require('../../models/gameSettingModel');
const AdminProfit = require('../../models/adminProfitModel');

/**
 * @method GET
 * @access public
 * @endpoint /api/v1/prize/get
 **/
router.get('/get', async (req, res, next) => {
    const { drawId } = req.query;
    try {
        const prize = await PrizePool.findOne({ drawId });
        return res.status(200).json({ prize });    
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
})

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/prize/add
 **/
router.post('/add', async (req, res, next) => {
    const { drawId, currency, price, userId, numbers } = req.body;
    try {
        let gameSetting = await GameSetting.findOne({
            category: 'number',
            currency
        });
        if (!gameSetting) {
            return res.status(400).json({ msg: 'Game setting is not set'});
        }
        let adminMargin = gameSetting.adminMargin / 100;
        // number purchased update
        let createdAt = new Date().getTime();
        for (let i = 0; i < numbers.length; i++) {
            let newPurchase = new NumberPurchased({
                userId,
                drawId,
                num: numbers[i],
                currency,
                price,
                createdAt
            });
            newPurchase.save();
        }

        // prize
        let totalQty = numbers.length * price;
        // TODO : usdtQty
        let prizePool = await PrizePool.findOne({ drawId });
        if (prizePool) {
            await PrizePool.updateOne({ drawId }, {
                qty: prizePool.qty + totalQty * (1 - adminMargin),
            })
        } else {
            prizePool = new PrizePool({
                drawId,
                currency,
                qty: totalQty * (1 - adminMargin),
                createdAt
            });
            prizePool.save();
        }
        // admin profilt update
        let adminProfit = await AdminProfit.findOne({
            drawId: drawId,
            currency: currency
        });
        if (adminProfit) {
            await AdminProfit.updateOne({ drawId, currency}, {
                qty: adminProfit.qty + totalQty * adminMargin
            });
        } else {
            adminProfit = new AdminProfit({
                drawId,
                currency,
                qty: totalQty * adminMargin,
                // usdtQty: 0
            });
            adminProfit.save();
        }
        return res.status(200).json({ prize: prizePool });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
});


module.exports = router;
