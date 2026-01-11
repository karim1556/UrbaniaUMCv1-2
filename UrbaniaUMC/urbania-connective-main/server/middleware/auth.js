const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                message: 'Authentication required. Please login.',
                redirectToLogin: true
            });
        }

        // Development bypass: accept the special dev token and map to seeded admin
        if (process.env.NODE_ENV !== 'production' && token === 'dev-token') {
            // Try to find an admin user (seeded admin@example.com)
            const admin = await User.findOne({ email: 'admin@example.com' });
            if (!admin) {
                return res.status(401).json({ message: 'Dev admin not found. Seed admin first.' });
            }
            req.user = admin;
            req.token = token;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({
            message: 'Invalid or expired token. Please login again.',
            redirectToLogin: true
        });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ message: 'User not authenticated' });
            }
            if (!req.user.roles || !roles.some(role => req.user.roles.includes(role))) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }
            next();
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    };
};

const isAdmin = async (req, res, next) => {
    try {
        if (!req.user.roles.includes('admin')) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { auth, checkRole, isAdmin };