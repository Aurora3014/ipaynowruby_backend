const express = require('express');
const router = express.Router();
const Admin = require('../../models/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Draw = require('../../models/drawModel');
const NumberPurchase = require('../../models/numberPurchasedModel');
const GameSetting = require('../../models/gameSettingModel');
const User = require('../../models/userModel');
const Prize = require('../../models/prizePoolModel');
const { authMiddleware } = require('../../middleware/auth.middleware');

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/admin/init
 **/
router.post('/init', async (req, res, next) => {
    const { email, password, phone, wallet } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const admin = new Admin({
        email: email,
        password: hash,
        phone: phone,
        adminWallet: wallet
    })
    try {
        admin.save();
        return res.status(200).json({ admin });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
});

router.get('/wallet', async (req, res, next) => {
    const admin = await Admin.findOne();
    if (admin) {
        return res.status(200).json({ wallet: admin.adminWallet });
    } else {
        return res.status(400).json({ msg: 'No admin config' });
    }
})

/**
 * @method POST
 * @access public
 * @endpoint /api/v1/admin/login
 **/
router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
        return res.status(200).json({ msg: 'Invalid Email'});
    }
    const hashedPwd = admin.password;
    if (bcrypt.compareSync(password, hashedPwd)) {
        const token = jwt.sign({ userId: admin._id }, 'ipaynow_secret', {
            expiresIn: "1d"
        });
        return res.status(200).json({ token });
    } else {
        return res.status(200).json({ msg: 'Incorrect password'});
    }
});

/**
 * @method GET
 * @access public
 * @endpoint /api/v1/admin/validate_token
 */

router.get('/validate_token', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token ==null) {
        return res.status(200).json({msg: 'No header'});
    } // if there isn't any token

    jwt.verify(token, 'ipaynow_secret', (err, user) => {
        if(err) return res.status(200).json({msg: err.message});
        return res.status(200).json({valid: true});
    });
});

router.post('/users', async (req, res) => {
    const users = await User.find();
    return res.status(200).json({ users });
});

module.exports = router;
