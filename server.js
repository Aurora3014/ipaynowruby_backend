const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const nodeSchedule = require('node-schedule');
const GameSetting = require('./models/gameSettingModel');
const Draw = require('./models/drawModel');
const { doLuckyDraw } = require('./cronjob');
const authMiddleware = require('./middleware/auth.middleware');

// exclusing dotenv config from production
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

require("./config/db");

// CORS Middleware
app.use(cors());

// express middleware handling the body parsing 
app.use(express.json());

// express middleware handling the form parsing
app.use(express.urlencoded({extended: false}));

// middleware for handling sample api routes
app.use('/api/v1/users', require('./routes/api/users'));

// game setting
app.use('/api/v1/game', require('./routes/api/game_setting'));

// number routes
app.use('/api/v1/number', require('./routes/api/number'));

// draw routes
app.use('/api/v1/draw', require('./routes/api/draw'));

// language files
app.use('/langs', express.static(path.join(__dirname, 'langs')));

// app.use('/api/v1/admin', require('./routes/api/admin'));

// prize pool and number purchased routes
app.use('/api/v1/prize', require('./routes/api/prize'));

// get admin setting routes
app.use('/api/v1/admin', require('./routes/api/admin'));

app.use('/api/v1/dashboard', authMiddleware, require('./routes/api/dashboard'));

app.use('/tonconnect-manifest.json', express.static(path.join(__dirname, 'tonconnect-manifest.json')));
// create static assets from react code for production only
if (process.env.NODE_ENV === 'production') {
    app.use(express.static( 'client/dist' ));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
    });
}

const gameControlJob = nodeSchedule.scheduleJob('*/1 * * * *', async() => {
    if (process.env.DRAW_RUN == 'false') return;
    let _numberGameSettings = await GameSetting.find({category: 'number', status: 'enabled'});
    // let _numberGameSettings = await GameSetting.find({category: 'number'});
    console.log('gameControlJob running');
    for (let i = 0; i < _numberGameSettings.length; i++) {
        let gs = _numberGameSettings[i];
        let _now = new Date().getTime();
        if (_now < gs.startAt) {
            continue;
        } else {
            let _lastDraws = await Draw.where({
                category: 'number',
                currency: gs.currency
            }).sort({startAt: 'desc'}).limit();
            if (_lastDraws.length == 0) {
                console.log('creating first draw');
                // create new draw
                const draw = new Draw({
                    startAt: _now,
                    endAt: _now + gs.period,
                    category: 'number',
                    currency: gs.currency,
                    status: 'progress',
                    price: gs.price
                });
                draw.save();
            } else {
                let _lastDraw = _lastDraws[0];
                if (_now < _lastDraw.endAt + gs.breakTime - 60000) {
                    continue;
                } else {
                    console.log('creating new draw');
                    // create new draw
                    const draw = new Draw({
                        startAt: _now,
                        endAt: _now + gs.period,
                        category: 'number',
                        currency: gs.currency,
                        status: 'progress',
                        price: gs.price
                    });
                    draw.save();
                }
            }
        }
    }
})

const luckyJob = nodeSchedule.scheduleJob('*/30 * * * * *', async() => {
    if (process.env.DRAW_RUN == 'false') return;
    let _numberGameSettings = await GameSetting.find({category: 'number'});
    console.log('gameControlJob running');
    for (let i = 0; i < _numberGameSettings.length; i++) {
        let gs = _numberGameSettings[i];
        let _now = new Date().getTime();
        if (_now < gs.startAt) {
            continue;
        } else {
            await doLuckyDraw('number', gs.currency);
        }
    }
})

// use port from environment variables for production
const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server running on port ${PORT}`);
})
