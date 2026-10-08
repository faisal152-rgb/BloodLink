const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to Database. Dropping entire database...');
    await mongoose.connection.db.dropDatabase();
    console.log('Database dropped successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error connecting to database or dropping database:', err);
    process.exit(1);
  });