const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const usersData = [
      {
        name: "System Admin",
        email: "faisalabbas9121@gmail.com",
        password: "faisalabbas2133#",
        role: "admin",
        phone: "9876543210",
        Verified: true,
        provider: "local"
      },
      {
        name: "Dr. Sharma",
        email: "hospital@cityhospital.com",
        password: "faisalabbas2133#",
        role: "hospital",
        hospitalName: "City General Hospital",
        phone: "9876543211",
        Verified: true,
        provider: "local"
      },
      {
        name: "Red Cross Blood Bank",
        email: "info@redcrossblood.org",
        password: "faisalabbas2133#",
        role: "bloodbank",
        phone: "9876543212",
        Verified: true,
        provider: "local"
      }
    ];

    for (const u of usersData) {
      const existingUser = await User.findOne({ email: u.email });
      if (existingUser) {
        console.log(`User ${u.email} already exists. Skipping.`);
      } else {
        await User.create(u);
        console.log(`Created user: ${u.email} (${u.role})`);
      }
    }

    console.log("Done inserting users!");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting users:", error);
    process.exit(1);
  }
};

seedUsers();

