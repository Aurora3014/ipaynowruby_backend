const express = require('express');
const router = express.Router();
const User = require('../../models/userModel');

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/user/login
 **/
router.post('/login', async (req, res, next) => {
    const { walletAddress, ref } = req.body;

    if (walletAddress.length !== 48) {
        return res.status(400).json({ msg: `Invalid address format` });
    }

    let existingUser;

    try {
        existingUser = await User.findOne({ walletAddress })
    } catch (e) {
        console.log(err);
    }
    if (!existingUser) {
        let createdAt = new Date().getTime();
        try {
            let user = new User({
                createdAt,
                walletAddress,
                rewards: 1
            });

            let referer = null;

            if (ref && ref.length == 48) {
                user = new User({
                    createdAt,
                    walletAddress,
                    referralAddress: ref,
                    rewards: 1
                });
                referer = await User.findOne({walletAddress: referralAddress})
            }
            console.log(user);
            user.save();
            if (referer) {
                // increase rewards of referer
                await User.updateOne({walletAddress: referralAddress}, {
                    rewards: referer.rewards ? referer.rewards + 1 : 1
                });
            }
            return res.status(200).json({ user });
        } catch (error) {
            return res.status(400).json({msg: error.message});
        }
    }
    return res.status(200).json({ user: existingUser });
});


module.exports = router;
