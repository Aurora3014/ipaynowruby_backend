const express = require('express');
const router = express.Router();
const Draw = require('../../models/drawModel');
const NumberPurchase = require('../../models/numberPurchasedModel');
const GameSetting = require('../../models/gameSettingModel');
const User = require('../../models/userModel');
const Prize = require('../../models/prizePoolModel');

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/draw/get
 **/
router.post('/get', async (req, res, next) => {
    const { currency, category } = req.body;
    try {
        const _latestDraw = await Draw.where({
            currency,
            category
        }).sort({ startAt: 'desc' }).limit(1);
        let now = Date.now();
        let lastDraw = _latestDraw[0];
        if (lastDraw) {
            let gameSetting = await GameSetting.findOne({ category: 'number', currency: lastDraw.currency });
            if(lastDraw.startAt <= now && now < lastDraw.endAt + gameSetting.breakTime) {
                return res.status(200).json({ draw: _latestDraw[0] });
            }
        }
        return res.status(200).json({ msg: 'Game has paused. Please check again later' });
    } catch (error) {
        return res.status(200).json({ msg: error.message });
    }

});

/** 
 * @method GET
 * @access public
 * @endpoint /api/v1/draw/lucky
 **/
router.get('/lucky', async (req, res, next) => {
    const { drawId } = req.query;
    try {
        let draw = await Draw.findOne({ _id: drawId });
        let now = new Date().getTime();
        let gameSetting = await GameSetting.findOne({ currency: draw.currency, category: 'number' });
        let numbersPurchase = await NumberPurchase.find({ drawId });
        if (numbersPurchase.length == 0) {
            return res.status(200).json({ msg: 'No winner. New game starting soon.', nextGameTime: gameSetting.breakTime + now });
        }
        let numbers = numbersPurchase.map((np) => np.num);
        
        if (draw.status == 'progress') {
            return res.status(200).json({ msg: 'Lucky draw did not get started', nextGameTime: gameSetting.breakTime + now});
        }
        let numberPurchase = await NumberPurchase.findOne({ drawId, isWinner: true });
        if (!numberPurchase) {
            return res.status(200).json({ msg: 'No winner chosen', nextGameTime: gameSetting.breakTime + now});
        }
        let winner = await User.findOne({ _id: numberPurchase.userId });
        if (!winner) {
            return res.status(200).json({ msg: 'No user exist', nextGameTime: gameSetting.breakTime + now });
        }
        let luckyNum = numberPurchase.num;
        let luckyIndex = numbers.indexOf(luckyNum);
        
        await Prize.updateOne({ drawId, currency: draw.currency }, { winnerId: winner._id, winnerWallet: winner.walletAddress, endAt: now });
        return res.status(200).json({ numbers, luckyNo: luckyIndex, winner: winner.walletAddress, nextGameTime: gameSetting.breakTime + now });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
});

/**
 * @method GET
 * @access public
 * @endpoint /api/v1/draw/next
 **/
router.get('/next', async (req, res, next) => {
    const { coin } = req.query;
    let gameSetting = await GameSetting.findOne({ category: 'number', currency: coin });
    let lastDraws = await Draw.where({ currency: coin, category: 'number' }).sort({ startAt: 'desc' }).limit(1);
    if (lastDraws.length == 0 || !gameSetting) {
        return res.status(200).json({ msg: 'no draws for ' + coin });
    }
    let nextDraw = lastDraws[0].endAt + gameSetting.breakTime;
    return res.status(200).json({ nextDraw: nextDraw });
})

/**
 * @method GET
 * @access public
 * @endpoing /api/v1/draw/numbers
 */
router.get('/numbers', async (req, res, next) => {
    const { drawId } = req.query;
    let numbersPurchase = await NumberPurchase.find({ drawId });
    let numbers = numbersPurchase.map((np) => np.num);
    return res.status(200).json({ numbers });
})


module.exports = router;
