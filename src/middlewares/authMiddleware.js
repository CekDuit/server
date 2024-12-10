const { decode } = require('../utils/token');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] 
    ? req.headers['authorization'].split(' ')[1] 
    : null;
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }

    const decoded = decode(token); // Gunakan fungsi decode
    if (!decoded) {
        return res.status(401).send({ message: 'Unauthorized! Token is expired' });
    }

    req.userId = decoded.id; // Simpan ID pengguna dari payload token
    next();
};

module.exports = verifyToken;
