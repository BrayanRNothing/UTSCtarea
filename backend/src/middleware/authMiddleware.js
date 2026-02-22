const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/auth');

exports.verifyToken = (req, res, next) => {
    // 1. Intentar leer desde cookie HttpOnly (más seguro)
    // 2. Fallback: header Authorization: Bearer <token>
    const tokenFromCookie = req.cookies?.auth_token;
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];

    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Se requiere autenticación.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

