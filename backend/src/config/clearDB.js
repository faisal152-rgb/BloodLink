const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to Database. Deleting all users...');
    const result = await User.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} users.`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to database or deleting users:', err);
    process.exit(1);
  });
