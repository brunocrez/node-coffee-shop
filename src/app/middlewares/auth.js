const jwt = require('jsonwebtoken');
const { SECRET } = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const accessToken = req.headers['x-access-token'];
    
    if (!accessToken) {
        return res.status(401).send({ message: 'No Token Provided.' });
    }

    jwt.verify(accessToken, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Token Invalid.' });
        }

        req.userId = decoded.id;

        return next();
    });
};