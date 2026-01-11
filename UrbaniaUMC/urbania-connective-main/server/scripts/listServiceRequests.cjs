const mongoose = require('mongoose');
require('dotenv').config();
const ServiceRequest = require('../models/ServiceRequest');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for listing service requests');

    const total = await ServiceRequest.countDocuments({});
    console.log('Total service requests:', total);

    const latest = await ServiceRequest.find({}).sort({ createdAt: -1 }).limit(10).lean();
    console.log('Latest 10 service requests:');
    latest.forEach((r, i) => {
      console.log(i+1, r._id.toString(), r.firstName, r.lastName, r.email, r.serviceType, r.requestTitle, 'createdAt:', r.createdAt);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error listing service requests:', err);
    process.exit(1);
  }
})();
