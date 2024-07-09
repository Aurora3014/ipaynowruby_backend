const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token ==null) {
        return res.sendStatus(401);
    } // if there isn't any token

    jwt.verify(token, 'ipaynow_secret', (err, user) => {
        if(err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = authMiddleware;