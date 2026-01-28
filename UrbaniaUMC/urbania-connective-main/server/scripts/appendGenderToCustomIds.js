#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  try {
    await connectDB();

    console.log('Searching for users with gender but missing gender token in customId...');

    const users = await User.find({
      gender: { $in: ['M', 'F', 'm', 'f'] },
      customId: { $not: /[MF]$/i }
    });

    console.log(`Found ${users.length} users to update`);

    let updated = 0;

    for (const u of users) {
      const g = String(u.gender || '').trim().toUpperCase();
      const genderToken = g.startsWith('M') ? 'M' : (g.startsWith('F') ? 'F' : (g.charAt(0) || ''));
      if (!genderToken) continue;

      let base = String(u.customId || '').trim();
      if (!base) continue;

      let candidate = `${base}${genderToken}`;
      let suffix = 1;
      while (await User.findOne({ customId: candidate })) {
        candidate = `${base}${genderToken}${suffix}`;
        suffix++;
      }

      u.customId = candidate;
      await u.save();
      console.log(`Updated user ${u._id} -> ${candidate}`);
      updated++;
    }

    console.log(`Completed. ${updated} users updated.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

run();
