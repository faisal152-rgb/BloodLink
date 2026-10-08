const Location = require('../models/Location');
const Redis = require('../config/redis');

// Get all locations
async function getlocations(req, res) {
  try {
    const cached = await Redis.get('locations:all');
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }
    const locations = await Location.find({});
    await Redis.set('locations:all', JSON.stringify(locations));
    res.status(200).json({ success: true, data: locations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new location
async function Addnewlocation(req, res) {
  const { city } = req.body;
  try {
    await Redis.del(`location:${city}`);
    await Redis.del('locations:all');
    const location = await Location.create({ city });
    await Redis.set(`location:${city}`, JSON.stringify(location));
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete location
async function deletelocation(req, res) {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: 'Location not found' });
    await Redis.del(`location:${location.city}`);
    await Redis.del('locations:all');
    res.status(200).json({ success: true, message: 'Location removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getlocations, Addnewlocation, deletelocation };
