const { JWT_USER_SECRET } = require('../config')
const jwt = require('jsonwebtoken');

function UserMiddleware(req, res, next) {

    try {
        const token = req.headers.token;
        const decoder = jwt.verify(token, JWT_USER_SECRET);
        if (decoder) {
            req.userId = decoder.userId;
            next();
        }
    } catch (e) {
        res.status(403).json({
            msg: "Invalid token",
            error: e.message
        })
    }
}

module.exports = {
    UserMiddleware,
}