const express = require('express');
const router = express.Router();
const GameSetting = require('../../models/gameSettingModel');

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/user/login
 **/
router.post('/init', async (req, res, next) => {
    const { category, period, break_time, currency, status, price, adminMargin } = req.body;
    try {
        const _oldGameSetting = await GameSetting.findOne({
            category: category,
            currency: currency
        });
        
        if (_oldGameSetting) {
            await GameSetting.updateOne({category, currency}, {
                startAt: new Date().getTime(),
                period: period, // 30 mins
                breakTime: break_time,
                status: status,
                price: price,
                adminMargin: adminMargin
            })
        } else {
            const _gameSetting = new GameSetting({
                category: category,
                startAt: new Date().getTime(),
                period: period, // 30 mins
                breakTime: break_time,
                currency: currency,
                status: status,
                price: price,
                adminMargin: adminMargin
            });
            _gameSetting.save();
        }
        return res.status(200).json({ msg: 'ok' });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
});

router.get('/get-all', async (req, res, next) => {
    try {
        const _gameSettings = await GameSetting.find();
        return res.status(200).json({ games: _gameSettings });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
});

router.get('/get', async (req, res, next) => {
    const { currency } = req.query;
    try {
        const _gameSetting = await GameSetting.findOne({currency});
        return res.status(200).json({ game: _gameSetting });
    } catch (error) {
        return res.status(400).json({ msg: error.message });
    }
});


module.exports = router;
