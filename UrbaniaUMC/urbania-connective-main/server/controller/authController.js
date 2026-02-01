const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { sendMail, sendMailContact, sendMailResetPassword } = require("../config/mail")
// Register new user
const register = async (req, res) => {
    try {
        const { firstName, middleName, lastName, mobile, email, password, isAdmin, buildingName, wing, flatNo, birthdate, occupationProfile, occupationType, occupationDescription, workplaceAddress, forumContribution, residenceType, gender } = req.body;

        // Validation
        if (!firstName || !lastName || !mobile || !email || !password) {
            return res.status(400).json({ message: 'First name, last name, mobile, email, and password are required' });
        }
        if (!isAdmin) {
            if (!buildingName || !wing || !flatNo) {
                return res.status(400).json({ message: 'Building name, wing, and flat number are required' });
            }
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email is already registered' });
            }
            return res.status(400).json({ message: 'Mobile number is already taken' });
        }

        // Require gender for all registrations

        // Require gender for all registrations and normalize to 'M' or 'F' only
        let genderToken = '';
        if (!gender) {
            return res.status(400).json({ message: 'Gender is required (M or F)' });
        }
        const g = String(gender).trim().toUpperCase();
        if (g.startsWith('M')) genderToken = 'M';
        else if (g.startsWith('F')) genderToken = 'F';
        else {
            return res.status(400).json({ message: 'Gender must be M or F' });
        }
        // Log the received gender value for debugging
        console.log('Received gender:', gender);
        // Log the generated gender token
        console.log('Generated gender token:', genderToken);

        // Generate customId: 'R' (for Rustomjee) + first 2 letters of next word in buildingName (if present, uppercase) + wing (uppercase) + flatNo + first 2 digits of mobile + gender token (M/F)
        let buildingCode = 'R';
        const buildingWords = (buildingName || '').trim().split(/\s+/);
        if (buildingWords.length > 1 && buildingWords[1].length >= 2) {
            buildingCode += buildingWords[1].substring(0, 2).toUpperCase();
        } else if (buildingWords[0] && buildingWords[0].length >= 2) {
            buildingCode += buildingWords[0].substring(0, 2).toUpperCase();
        }
        const wingCode = (wing || '').toUpperCase();
        const flatCode = flatNo || '';
        const mobileCode = (mobile || '').substring(0, 2);
        // Always append gender token (M/F) at the end
        let customId = `${buildingCode}${wingCode}${flatCode}${mobileCode}${genderToken}`;
        console.log('Generated customId:', customId);

        // Ensure uniqueness (append a number if needed)
        let uniqueCustomId = customId;
        let suffix = 1;
        while (await User.findOne({ customId: uniqueCustomId })) {
            uniqueCustomId = `${customId}${suffix}`;
            suffix++;
        }
        customId = uniqueCustomId;

        // Log the generated customId before checking uniqueness
        console.log('Generated customId before uniqueness check:', customId);

        // Log the final unique customId
        console.log('Final unique customId:', customId);

        // Compose occupationProfile (backwards-compatible)
        const composedOccupation = occupationType ? `${occupationType}${occupationDescription ? ' - ' + occupationDescription : ''}` : (occupationDescription || occupationProfile || '');

        // Create new user (store normalized gender token)
        console.log('Register: creating user with gender token:', genderToken);
        const user = new User({
            firstName,
            middleName,
            lastName,
            mobile,
            email,
            password,
            buildingName,
            wing,
            flatNo,
            birthdate,
            occupationProfile: composedOccupation,
            workplaceAddress,
            gender: genderToken,
            forumContribution,
            residenceType,
            roles: isAdmin ? ['user', 'admin'] : ['user'],
            status: isAdmin ? 'approved' : 'pending',
            customId
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Registration successful:', { userId: user._id, email: user.email, roles: user.roles, customId: user.customId, gender: user.gender });

        // Send credentials email BEFORE response (required for Render free tier)
        // Email has timeout protection so it won't hang forever
        try {
            const fullName = `${firstName} ${lastName}`;
            const { sendCredentialsEmail } = require('../config/mail');
            await sendCredentialsEmail(email, fullName, user.customId, password);
            console.log('Credentials email sent successfully to:', email);
        } catch (emailError) {
            console.error('Failed to send credentials email:', emailError);
            // Continue with response even if email fails
        }

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                middleName: user.middleName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                buildingName: user.buildingName,
                wing: user.wing,
                flatNo: user.flatNo,
                birthdate: user.birthdate,
                occupationProfile: user.occupationProfile,
                workplaceAddress: user.workplaceAddress,
                gender: user.gender,
                forumContribution: user.forumContribution,
                residenceType: user.residenceType,
                roles: user.roles,
                customId: user.customId
            },
            admin: isAdmin ? {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                isActive: true
            } : null
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user', error: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });

        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found', { email });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch', { email });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (user.status !== 'approved') {
            return res.status(403).json({
                success: false,
                message: 'Your account is not approved yet. Please wait for admin approval.'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful:', { userId: user._id, email: user.email, roles: user.roles });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                roles: user.roles
            },
            admin: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                isActive: true
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        // Default: return the user document
        // Return single user object (family model removed)
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Request password reset
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Save reset token to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        await sendMailResetPassword(
            user.email,
            user.firstName || 'User',
            resetLink
        );

        res.status(200).json({
            message: 'Password reset instructions sent to your email'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            message: 'Error processing password reset request',
            error: error.message
        });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by id and token
        const user = await User.findOne({
            _id: decoded.userId,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Password reset token is invalid or has expired'
            });
        }

        // Set the new password (will be hashed by the User model's pre-save middleware)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            message: 'Error resetting password',
            error: error.message
        });
    }
};



// Login user
const adminLogin = async (req, res) => {
    try {
        console.log('Login attempt:', { email: req.body.email });

        const { email, password } = req.body;

        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('Login failed: User not found', { email });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch', { email });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user has admin role
        const isAdmin = user.roles.includes('admin');
        if (!isAdmin) {
            console.log('Login failed: Not an admin user', { email });
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Admin access required'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Login successful:', { userId: user._id, email: user.email, roles: user.roles });

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                roles: user.roles
            },
            admin: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                mobile: user.mobile,
                email: user.email,
                isActive: true
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};


module.exports = {
    register,
    adminLogin,
    getProfile,
    forgotPassword,
    resetPassword,
    login
};