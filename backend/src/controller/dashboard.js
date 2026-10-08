const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const BloodRequest = require('../models/BloodRequest');

// Get combined dashboard stats
async function getDashboardStats (req, res) {
  try {
    const totalDonors = await Donor.countDocuments({});
    const activeDonors = await Donor.countDocuments({ status: 'approved' });
    const pendingRequests = await BloodRequest.countDocuments({ status: 'pending' });
    const completedRequests = await BloodRequest.countDocuments({ status: 'completed' });
    const emergencyRequests = await BloodRequest.countDocuments({ urgency: 'emergency', status: 'pending' });

    // Mock inventory for now, or you could calculate from donors/requests
    const inventory = [
      { group: 'A+', units: 24, max: 50 },
      { group: 'A-', units: 8, max: 30 },
      { group: 'B+', units: 32, max: 50 },
      { group: 'B-', units: 5, max: 30 },
      { group: 'O+', units: 45, max: 60 },
      { group: 'O-', units: 12, max: 40 },
      { group: 'AB+', units: 18, max: 40 },
      { group: 'AB-', units: 4, max: 20 },
    ];

    return res.status(200).json({
      totalDonors,
      activeDonors,
      pendingRequests,
      completedRequests,
      emergencyRequests,
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Recent donations
async function getRecentDonations (req, res) {
  try {
    const recentRequests = await BloodRequest.find({ status: 'completed' })
      .sort({ updatedAt: -1 })
      .limit(10);
    
    // Transform into recent donation format
    const formatted = recentRequests.map(r => ({
      id: r._id,
      name: r.patient,
      date: r.updatedAt.toISOString().split('T')[0],
      bloodGroup: r.bloodGroup,
      status: r.status
    }));
    
    return res.status(200).json({
       formatted
      });
  } catch (error) {
    return res.status(500).json({ 
      message: error.message 
    });
  }
};

module.exports = {
   getDashboardStats, 
   getRecentDonations 
  };
