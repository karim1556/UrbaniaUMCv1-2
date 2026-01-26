const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const donationRoutes = require('./routes/donationRoutes');
const blogRoutes = require('./routes/blogRoutes');
const educationalProgramRoutes = require('./routes/educationalProgramRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const testRoutes = require('./routes/testRoutes');
const contactRoutes = require('./routes/contactRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const userRoutes = require('./routes/userRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const courseRegistrationRoutes = require('./routes/courseRegistrationRoutes');
const servicePostRoutes = require('./routes/servicePostRoutes');
const groqChatRoutes = require('./routes/groqChat');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration - more permissive for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    // Also allow localhost development with any port
    if (!origin || origin.match(/^http:\/\/localhost:[0-9]+$/)) {
      return callback(null, true);
    }

    const allowedOrigins = [
      'http://localhost:8080',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://127.0.0.1:8080',
      'http://127.0.0.1:5173'
    ];

    // Allow the deployed frontend on Vercel
    allowedOrigins.push('https://urbania-um-cv1-2.vercel.app');

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Origin ${origin} not allowed by CORS`);
      callback(null, true); // Still allow in development mode
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/programs', educationalProgramRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/test', testRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/users', userRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/course-registration', courseRegistrationRoutes);
app.use('/api/service-posts', servicePostRoutes);
app.use('/api/groq', groqChatRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Health check for uptime/diagnostics
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}`);
});
