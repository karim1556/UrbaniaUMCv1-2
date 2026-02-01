const { Resend } = require('resend');
require('dotenv').config();
const { getEventRegistrationReceiptHtml, getDonationReceiptHtml } = require('../utils/emailTemplates');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// The "from" address - must be verified in Resend dashboard or use onboarding@resend.dev for testing
const getFromAddress = () => {
  return process.env.RESEND_FROM_EMAIL || 'Urbania Connective <onboarding@resend.dev>';
};

const verifyConnection = async () => {
  const hasApiKey = !!process.env.RESEND_API_KEY;
  console.log('📧 Email config check:', {
    RESEND_API_KEY: hasApiKey ? 'SET' : 'MISSING',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'Using default test address'
  });

  if (!hasApiKey) {
    console.error('⚠️ RESEND_API_KEY MISSING - emails will not be sent!');
    return false;
  }

  console.log('✅ Resend API configured');
  return true;
};

const sendMail = async (email, subject, html) => {
  console.log('📧 Attempting to send email to:', email);

  try {
    const { data, error } = await resend.emails.send({
      from: getFromAddress(),
      to: [email],
      subject: subject,
      html: html
    });

    if (error) {
      console.error('❌ EMAIL SEND FAILED:', {
        to: email,
        subject: subject,
        error: error
      });
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to ${email}`, { id: data?.id });
    return data;
  } catch (error) {
    console.error('❌ EMAIL SEND FAILED:', {
      to: email,
      subject: subject,
      errorMessage: error.message
    });
    throw error;
  }
};

const sendMailContact = async (email, name, phoneNo, subject, message) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'admin@example.com';
  const emailSubject = `Contact Form Submission: ${subject}`;
  const html = `
    <h1>New Contact Form Submission</h1>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phoneNo}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;
  await sendMail(adminEmail, emailSubject, html); // sending to admin

  const userSubject = "We've received your message";
  const userHtml = `
    <h1>Thank you for contacting us, ${name}!</h1>
    <p>We have received your message and will get back to you shortly.</p>
    <p>Here's a copy of your message:</p>
    <blockquote>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${message}</p>
    </blockquote>
  `;
  await sendMail(email, userSubject, userHtml); // sending confirmation to user
};

const sendMailResetPassword = async (email, username, resetLink) => {
  const subject = 'Password Reset Request';
  const html = `
    <h1>Password Reset</h1>
    <p>Hello ${username},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetLink}">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendMail(email, subject, html);
};

const sendCredentialsEmail = async (email, fullName, customId, password) => {
  const subject = 'Welcome to Urbania Connective — your account details';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="color: #0b4a6f;">Hello ${fullName},</h2>
      <p>Welcome to <strong>Urbania Connective</strong> — we're excited to have you join our community!</p>
      <p>Below are your account details to sign in:</p>
      <table style="border-collapse: collapse; margin: 8px 0;">
        <tr><td style="padding:4px 8px"><strong>User ID:</strong></td><td style="padding:4px 8px">${customId}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Email:</strong></td><td style="padding:4px 8px">${email}</td></tr>
        <tr><td style="padding:4px 8px"><strong>Password:</strong></td><td style="padding:4px 8px">${password}</td></tr>
      </table>
      <p>To sign in, visit: <a href="${frontendUrl}" target="_blank">${frontendUrl}</a></p>
      <p>For security, please change your password after your first login. If you didn't request this account, please contact our support team.</p>
      <p style="margin-top:16px">Warm regards,<br/><strong>Urbania Connective Team</strong></p>
    </div>
  `;
  await sendMail(email, subject, html);
};

const sendMailDonation = async (donation) => {
  const subject = 'Thank you for your donation!';
  const html = getDonationReceiptHtml({
    donorName: donation.firstName + ' ' + donation.lastName,
    email: donation.email,
    phone: donation.phone,
    amount: donation.amount,
    currency: donation.currency,
    date: donation.date || donation.createdAt,
    paymentMethod: donation.paymentDetails?.method,
    donationType: donation.donationType,
    program: donation.program,
    receiptId: donation._id,
    message: donation.message,
    address: donation.address,
    city: donation.city,
    state: donation.state,
    zipCode: donation.zipCode
  });
  await sendMail(donation.email, subject, html);
};

const sendMailEventRegistration = async (email, user, event, registration) => {
  const subject = `Event Registration Confirmation: ${event.title}`;
  const html = getEventRegistrationReceiptHtml({ user, event, registration });
  await sendMail(email, subject, html);
};

const sendMailEducationRegistration = async (email, name, courseTitle) => {
  const subject = `Confirmation for Your Course Registration: ${courseTitle}`;
  const html = `
    <h1>Thank you for registering, ${name}!</h1>
    <p>You have successfully registered for the course: <strong>${courseTitle}</strong>.</p>
    <p>We will contact you shortly with more details.</p>
    <p>The Urbania Connective Team</p>
  `;
  await sendMail(email, subject, html);
};

// Inform family member that an account was created for them (without sending passwords)
const sendAccountCreatedNotice = async (email, fullName, customId, ownerEmail) => {
  const subject = 'An account was created for you on Urbania Connective';
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2 style="color: #0b4a6f;">Hello ${fullName || ''},</h2>
      <p>An account has been created for you on <strong>Urbania Connective</strong> by <strong>${ownerEmail}</strong>.</p>
      <p>Your User ID: <strong>${customId}</strong></p>
      <p>To sign in, visit: <a href="${frontendUrl}" target="_blank">${frontendUrl}</a></p>
      <p>Note: This account has the same password as the account owner. If you don't have that password, please use the "Forgot password" link on the sign-in page to set a password for your account.</p>
      <p style="margin-top:16px">Regards,<br/><strong>Urbania Connective Team</strong></p>
    </div>
  `;
  await sendMail(email, subject, html);
};

module.exports = {
  sendMail,
  sendMailContact,
  sendMailResetPassword,
  sendMailDonation,
  sendMailEventRegistration,
  sendMailEducationRegistration,
  verifyConnection,
  sendAccountCreatedNotice,
  sendCredentialsEmail
};