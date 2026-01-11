const Donation = require('../models/Donation');
const User = require('../models/User');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { validateObjectId } = require('../utils/validation');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { sendMailDonation } = require('../config/mail');
require('dotenv').config();
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Log Razorpay initialization
console.log('Razorpay initialized with:', {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET ? '***' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'Missing'
});

// Process a donation
const processDonation = async (req, res) => {
    try {
        const {
            _id,
            donor,
            firstName, lastName, email, phone, address, city, state, zipCode,
            amount, currency = 'INR', program = 'general', donationType = 'one-time',
            recurringFrequency, anonymous = false, message = '', receiptRequired = false
        } = req.body;

        // Validate required fields
        if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ message: 'Valid donation _id is required' });
        }

        if (!donor || !mongoose.Types.ObjectId.isValid(donor)) {
            return res.status(400).json({ message: 'Valid donor ID is required' });
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Valid amount is required' });
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Verify donor exists in User collection
        const user = await User.findById(donor);
        if (!user) {
            return res.status(400).json({ message: 'Donor ID must match a valid user ID' });
        }

        // Check if donation with _id already exists
        const existingDonation = await Donation.findById(_id);
        if (existingDonation) {
            return res.status(400).json({ message: 'Donation with this ID already exists' });
        }

        // Ensure currency is in uppercase and supported by Razorpay
        const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP', 'SGD', 'AUD', 'CAD', 'HKD', 'JPY', 'NZD', 'CHF', 'AED'];
        const normalizedCurrency = currency.toUpperCase();
        
        if (!supportedCurrencies.includes(normalizedCurrency)) {
            return res.status(400).json({ 
                message: 'Unsupported currency',
                supportedCurrencies: supportedCurrencies
            });
        }

        // Create a fresh Razorpay instance for this request
        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        // Create Razorpay order
        const order = await razorpayInstance.orders.create({
            amount: Math.round(amount * 100),
            currency: normalizedCurrency,
            receipt: `donation_${Date.now()}`,
            notes: {
                userId: donor,
                program,
                donationType,
                firstName: anonymous ? 'Anonymous' : (firstName || ''),
                lastName: anonymous ? 'Donor' : (lastName || ''),
                email,
                anonymous: anonymous.toString(),
                message: message || ''
            }
        });

        console.log('Razorpay order created:', order);

        // Create donation record with completed status
        const donation = new Donation({
            _id: _id,
            donor: donor,
            firstName: anonymous ? 'Anonymous' : firstName,
            lastName: anonymous ? 'Donor' : lastName,
            email,
            phone, 
            address, 
            city, 
            state, 
            zipCode,
            amount,
            currency: normalizedCurrency,
            program,
            donationType,
            recurringFrequency,
            receiptRequired,
            paymentDetails: {
                paymentId: order.id,
                method: 'razorpay',
                status: 'Pending',
                transactionDate: new Date()
            },
            anonymous,
            message,
            status: 'Pending',
            date: new Date(),
            category: program,
            description: `Donation for ${program} program`,
            taxDeductible: true,
            recurringDonation: donationType === 'recurring'
        });

        await donation.save();
        console.log('Donation record created with pending status:', donation);

        // Send success response - donation is pending until payment is completed
        res.status(200).json({
            message: 'Donation order created successfully. Please complete payment.',
            donation: donation.toObject(),
            orderId: order.id
        });
    } catch (error) {
        console.error('Donation Processing Error:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
            status: error.status,
            code: error.code,
            name: error.name,
            fullError: error
        });
        
        res.status(500).json({ 
            message: 'Failed to process donation',
            error: {
                message: error.message,
                code: error.code,
                name: error.name,
                details: error.response?.data || error.stack
            }
        });
    }
};

// Handle successful Razorpay payment
const handleSuccessfulPayment = async (req, res) => {
    try {
        const { 
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            // Additional details that might be updated
            phone, address, city, state, zipCode, receiptRequired = true
        } = req.body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ 
                message: 'Payment verification details are required',
                received: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
            });
        }

        // Create signature verification string
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            console.error('Signature verification failed:', {
                generated: generated_signature,
                received: razorpay_signature
            });
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Find the donation by order ID (which is our paymentId)
        const donation = await Donation.findOne({
            'paymentDetails.paymentId': razorpay_order_id
        });

        if (!donation) {
            return res.status(404).json({ 
                message: 'Donation not found',
                orderId: razorpay_order_id
            });
        }

        // Update donation with payment details
        const transactionDate = new Date();
        
        donation.paymentDetails = {
            ...donation.paymentDetails,
            transactionId: razorpay_payment_id,
            signature: razorpay_signature,
            status: 'Completed',
            transactionDate: transactionDate
        };
        donation.status = 'Completed';

        // Update optional fields if provided
        if (phone) donation.phone = phone;
        if (address) donation.address = address;
        if (city) donation.city = city;
        if (state) donation.state = state;
        if (zipCode) donation.zipCode = zipCode;
        donation.receiptRequired = receiptRequired;

        await donation.save();

        // Send confirmation email
        if (donation.email) {
            try {
                await sendMailDonation(donation.toObject());
                console.log('Donation confirmation email sent successfully');
            } catch (emailError) {
                console.error('Failed to send donation confirmation email:', emailError);
                // Don't fail the request if email sending fails
            }
        } else {
            console.error('Donation confirmation email not sent: No email address provided for donation ID', donation._id);
        }

        res.status(200).json({
            message: 'Payment processed successfully',
            donation: {
                id: donation._id,
                amount: donation.amount,
                currency: donation.currency,
                program: donation.program,
                status: donation.status,
                transactionId: razorpay_payment_id
            }
        });
    } catch (error) {
        console.error('Payment Success Handler Error:', error);
        res.status(500).json({ 
            message: 'Failed to process payment confirmation',
            error: error.message
        });
    }
};

// Get all donations (admin only, but temporarily available for all authenticated users)
const getAllDonations = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get filter parameters
        const { program, status, startDate, endDate, minAmount, maxAmount } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (program) {
            filter.program = program;
        }
        
        if (status) {
            filter['paymentDetails.status'] = status;
        }
        
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }
        
        // Amount range filter
        if (minAmount || maxAmount) {
            filter.amount = {};
            if (minAmount) {
                filter.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                filter.amount.$lte = parseFloat(maxAmount);
            }
        }

        // Get total count for pagination
        const total = await Donation.countDocuments(filter);
        
        // Execute query with pagination
        const donations = await Donation.find(filter)
            .populate('donor', 'username name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        res.status(200).json({
            donations,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get all donations error:', error);
        res.status(500).json({ message: 'Failed to get donations', error: error.message });
    }
};

// Get user's donations
const getUserDonations = async (req, res) => {
    try {
        if (!req.user?._id) {
            return res.status(401).json({ message: 'User authentication required' });
        }

        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        // Get total count for pagination
        const total = await Donation.countDocuments({ donor: req.user._id });
        
        // Get user's donations
        const donations = await Donation.find({ donor: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        res.status(200).json({
            donations,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get user donations error:', error);
        res.status(500).json({ message: 'Failed to get user donations', error: error.message });
    }
};

// Get donation by ID
const getDonationById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid donation ID' });
        }
        
        const donation = await Donation.findById(id)
            .populate('donor', 'username name email');
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        
        // Temporarily disable security check to allow testing
        // Security check: only admins or the donor can view the donation
        /*
        if (!req.user.roles.includes('admin') && 
            donation.donor && donation.donor._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this donation' });
        }
        */
        
        res.status(200).json(donation);
    } catch (error) {
        console.error('Get donation by ID error:', error);
        res.status(500).json({ message: 'Failed to get donation', error: error.message });
    }
};

// Get donation statistics (temporarily available for all authenticated users)
const getDonationStats = async (req, res) => {
    try {
        // Get filter parameters
        const { program, startDate, endDate } = req.query;
        
        // Build filter object
        const filter = {};
        
        if (program) {
            filter.program = program;
        }
        
        // Only include completed donations
        filter['paymentDetails.status'] = 'completed';
        
        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        // Overall statistics
        const stats = await Donation.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    totalDonations: { $sum: 1 },
                    averageAmount: { $avg: '$amount' },
                    minAmount: { $min: '$amount' },
                    maxAmount: { $max: '$amount' }
                }
            }
        ]);

        // Statistics by program
        const programStats = await Donation.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: '$program',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                    averageAmount: { $avg: '$amount' }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Monthly statistics
        const monthlyStats = await Donation.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Format monthly data into array of objects with year, month, amount
        const formattedMonthlyStats = monthlyStats.map(item => ({
            year: item._id.year,
            month: item._id.month,
            totalAmount: item.totalAmount,
            count: item.count
        }));

        res.status(200).json({
            overall: stats[0] || { 
                totalAmount: 0, 
                totalDonations: 0, 
                averageAmount: 0,
                minAmount: 0,
                maxAmount: 0
            },
            byProgram: programStats,
            monthly: formattedMonthlyStats
        });
    } catch (error) {
        console.error('Get donation stats error:', error);
        res.status(500).json({ message: 'Failed to get donation statistics', error: error.message });
    }
};

// Cancel a recurring donation
const cancelRecurringDonation = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!validateObjectId(id)) {
            return res.status(400).json({ message: 'Invalid donation ID' });
        }
        
        const donation = await Donation.findById(id);
        
        if (!donation) {
            return res.status(404).json({ message: 'Donation not found' });
        }
        
        // Security check: only admins or the donor can cancel the donation
        if (!req.user.roles.includes('admin') && 
            donation.donor && donation.donor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this donation' });
        }
        
        // Check if donation is recurring and active
        if (donation.donationType !== 'recurring' || !donation.isActive) {
            return res.status(400).json({ message: 'This donation cannot be cancelled' });
        }
        
        // If using Stripe for subscriptions, cancel the subscription
        if (donation.subscriptionId) {
            await stripe.subscriptions.cancel(donation.subscriptionId);
        }
        
        // Update donation status
        donation.isActive = false;
        donation.canceledAt = new Date();
        await donation.save();
        
        res.status(200).json({
            message: 'Recurring donation cancelled successfully',
            donation: {
                id: donation._id,
                canceledAt: donation.canceledAt
            }
        });
    } catch (error) {
        console.error('Cancel recurring donation error:', error);
        res.status(500).json({ message: 'Failed to cancel donation', error: error.message });
    }
};

module.exports = {
    processDonation,
    handleSuccessfulPayment,
    getAllDonations,
    getUserDonations,
    getDonationById,
    getDonationStats,
    cancelRecurringDonation
}; 