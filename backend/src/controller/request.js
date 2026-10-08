const BloodRequest = require('../models/BloodRequest');
const Redis = require('../config/redis');

// Get requests with optional filters
async function getrequests(req, res) {
  const { hospital, patient, status } = req.query;
  const filter = {};
  if (hospital) filter.hospital = hospital;
  if (patient) filter.patient = new RegExp(patient, 'i');
  if (status) filter.status = status;

  try {
    const requests = await BloodRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add new request
async function Addnewrequest(req, res) {
  const { patient, bloodGroup, urgency, units, hospital, contact, location, notes, date } = req.body;
  if (!patient || !bloodGroup || !urgency || !units || !hospital || !contact || !location || !notes || !date) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  try {
    await Redis.del(`requests:${bloodGroup}`);
    const request = await BloodRequest.create({ patient, bloodGroup, urgency, units, hospital, contact, location, notes, date });
    await Redis.set(`requests:${bloodGroup}`, JSON.stringify(request));
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update request details (not just status)
async function updaterequest(req, res) {
  try {
    const { bloodGroup } = req.body;
    await Redis.del(`requests:${bloodGroup}`);
    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updatedRequest) return res.status(404).json({ success: false, message: 'Request not found for ID: ' + req.params.id });
    await Redis.set(`requests:${bloodGroup}`, JSON.stringify(updatedRequest));
    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update request status
async function updaterequeststatus(req, res) {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status is required' });
  }
  try {
    await Redis.del(`requests:${status}`);
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    request.status = status;
    const updatedRequest = await request.save();
    await Redis.set(`requests:${status}`, JSON.stringify(updatedRequest));
    res.status(200).json({ success: true, data: updatedRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete request
async function deletereview(req, res) {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, message: 'Request removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getrequests,
  Addnewrequest,
  updaterequest,
  updaterequeststatus,
  deletereview
};
