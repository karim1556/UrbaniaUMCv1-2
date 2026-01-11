const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectID
 * @param {string} id - The ID to validate
 * @returns {boolean} - Whether the ID is valid
 */
const validateObjectId = (id) => {
    if (!id) return false;
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
const validateEmail = (email) => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates that a value is not empty
 * @param {any} value - The value to check
 * @returns {boolean} - Whether the value is not empty
 */
const validateRequired = (value) => {
    if (value === undefined || value === null) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    return true;
};

/**
 * Validates a phone number format (basic validation)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
const validatePhone = (phone) => {
    if (!phone) return false;
    const phoneRegex = /^[0-9+\-() ]{7,20}$/;
    return phoneRegex.test(phone);
};

/**
 * Validates a date is in the future
 * @param {Date|string} date - The date to validate
 * @returns {boolean} - Whether the date is in the future
 */
const validateFutureDate = (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    return dateObj > new Date();
};

/**
 * Validates a date is valid
 * @param {Date|string} date - The date to validate
 * @returns {boolean} - Whether the date is valid
 */
const validateDate = (date) => {
    if (!date) return false;
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
};

/**
 * Validates a password meets minimum requirements
 * @param {string} password - The password to validate
 * @returns {boolean} - Whether the password is valid
 */
const validatePassword = (password) => {
    if (!password) return false;
    return password.length >= 6; // Simple validation - minimum 6 characters
};

/**
 * Validates a number is within a given range
 * @param {number} value - The number to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} - Whether the value is within range
 */
const validateRange = (value, min, max) => {
    if (value === undefined || value === null) return false;
    const num = Number(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
};

module.exports = {
    validateObjectId,
    validateEmail,
    validateRequired,
    validatePhone,
    validateFutureDate,
    validateDate,
    validatePassword,
    validateRange
}; 