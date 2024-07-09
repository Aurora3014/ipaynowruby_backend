const Draw = require('./models/drawModel');
const NumberPurchase = require('./models/numberPurchasedModel');
const GameSetting = require('./models/gameSettingModel');
const User = require('./models/userModel');
const Prize = require('./models/prizePoolModel');

const doLuckyDraw = async (category, currency) => {
    let draws = await Draw.where({ category, currency }).sort({ endAt: 'desc'}).limit(1);
    if (draws.length == 0) return;
    let draw = draws[0];
    let drawId = draw._id;
    let now = new Date().getTime();
    if (now >= draw.endAt && draw.status == 'progress') {
        let numbersPurchase = await NumberPurchase.find({ drawId });
        if (numbersPurchase.length == 0) {
            return;
        }
        let numbers = numbersPurchase.map((np) => np.num);
        let luckyIndex = Math.floor(numbers.length * Math.random());
        await NumberPurchase.updateOne({ drawId, num: numbers[luckyIndex] }, {
            isWinner: true
        });
        await Draw.updateOne({ _id: drawId }, { endAt: now, status: 'expired' });
        let numberPurchase = await NumberPurchase.findOne({ drawId, num: numbers[luckyIndex] });
        let winner = await User.findOne({ _id: numberPurchase.userId });
        if (winner) {
            await Prize.updateOne({ drawId, currency: draw.currency }, { winnerId: winner._id, winnerWallet: winner.walletAddress });
        }
    }
}

module.exports = { doLuckyDraw };