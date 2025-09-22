const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get token from headers
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split('')[1]; // Format: "Bearer <toktn>"

    if (!token) {
        return res.status(401).json({ message: 'No token provided, authorization denied '});
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user unfo to request 
        req.user = decoded;
        next(); // continue to the next middleware or controller
    } catch (err) {
        return res.status(403).json({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;