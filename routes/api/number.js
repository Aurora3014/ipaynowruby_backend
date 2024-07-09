const express = require('express');
const router = express.Router();
const NumberPurchased = require('../../models/numberPurchasedModel');

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/user/login
 **/
router.post('/check', async (req, res, next) => {
    const { numbers, currency, drawId } = req.body;

    let existingNums = [];
    for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];
        const _numberPurchased = await NumberPurchased.findOne({
            num: number,
            currency,
            drawId
        });
        if (_numberPurchased) {
            existingNums.push(number);
        }
    }
    
    if (existingNums.length > 0) {
        return res.status(200).json({ exist: true, numbers: existingNums });
    } else {
        return res.status(200).json({ exist: false });
    }
});

router.get('/get', async (req, res, next) => {
    try {
        const { userId } = req.query;
        const purchases = await NumberPurchased.where({ userId: userId }).sort({ createdAt: 'desc' }).limit(100);
        return res.status(200).json({ purchases });    
    } catch (error) {
        console.log('error number.js 32 -----', error.message)
        return res.status(400).json({ msg: error.message });
    }
});


module.exports = router;
