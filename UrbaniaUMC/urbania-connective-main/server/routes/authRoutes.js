const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    getProfile,
    forgotPassword,
    resetPassword,
    adminLogin
} = require('../controller/authController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Set up rate limiters
const registerLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // allow 100 requests per minute
  message: "Too many registration attempts, please try again later"
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login attempts per 15 minutes
  message: {
    message: 'Too many login attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post('/register', registerLimiter, register);
router.post('/admin-register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/admin-login', adminLogin);

// Protected routes
router.get('/profile', auth, getProfile);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router; 