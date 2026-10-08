const Donor = require('../models/Donor');
const Redis = require('../config/redis');

// Get all donors
async function Getallusers(req, res) {
  try {
    const cachedDonors = await Redis.get('alldonors');
    if (cachedDonors) {
      return res.json(JSON.parse(cachedDonors));
    }
    const donorDocs = await Donor.find({});
    const donors = donorDocs.map(d => {
      return {
        id: (d._id || d.id)?.toString(),
        name: d.name,
        email: d.email,
        bloodGroup: d.bloodGroup,
        location: d.location,
        contact: d.contact,
        type: d.type,
        urgency: d.urgency,
        units: d.units,
        status: d.status,
      };
    });
    await Redis.set('alldonors', JSON.stringify(donors));
    return res.status(200).json(donors);
  } catch (error) {
    console.error("Getallusers error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// Add new donor
async function Adddonor(req, res) {
  const { name, bloodGroup, location, contact, type, urgency, units } = req.body;
  if (!name || !bloodGroup || !location || !contact || !type || !urgency || !units) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existsdonar = await Donor.findOne({ name, contact });
    if (existsdonar) {
      return res.status(400).json({
        message: 'Donor already exists'
      });
    }
    const user = await Donor.create({ name, bloodGroup, location, contact, type, urgency, units });
    // Invalidate the all-donors list cache so next GET fetches fresh data
    await Redis.del('alldonors');
    return res.status(201).json({
      user,
      message: 'Donor added successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update donor details
async function Updatedonor(req, res) {
  try {
    const updatedDonor = await Donor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedDonor) return res.status(404).json({ message: 'Donor not found' });
    return res.status(200).json({ updatedDonor, message: 'Donor updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Approve donor
async function Approvedonor(req, res) {
  try {
    const donorId = req.params.id;
    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    donor.status = 'approved';
    const updatedDonor = await donor.save();
    return res.status(200).json({ updatedDonor, message: 'Donor approved successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Block donor
async function Blockdonor(req, res) {
  try {
    const donorId = req.params.id;
    const donor = await Donor.findById(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    donor.status = 'blocked';
    const updatedDonor = await donor.save();
    return res.status(200).json({ updatedDonor, message: 'Donor blocked successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Delete donor
async function Removedonor(req, res) {
  try {
    const donorId = req.params.id;
    const donor = await Donor.findByIdAndDelete(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });
    return res.status(200).json({ message: 'Donor removed' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { Getallusers, Adddonor, Updatedonor, Approvedonor, Blockdonor, Removedonor };
