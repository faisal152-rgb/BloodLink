const User = require('../models/User');
const Redis = require('../config/redis');

// Get all users (admin/hospital/bloodbank/donor) - for admin management
async function Getallusers(req, res) {
  try {
    const users = await Redis.get("admin_users");
    if (users) {
      return res.json(JSON.parse(users));
    }
    const admins = await User.find({ role: { $in: ['admin', 'hospital', 'bloodbank', 'donor'] } });
    await Redis.set("admin_users", JSON.stringify(admins));
    res.json(admins.map(a => ({ id: a._id.toString(), name: a.name, email: a.email, role: a.role, status: 'active' })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add or promote admin/user
async function Addadmin(req, res) {
  const { name, email, role, password } = req.body;
  if (!name || !email || !role || !password) {
    return res.status(400).json({ message: "all fields are required" });
  }
  try {
    await Redis.del("admin_users");
    const userExists = await User.findOne({ email });
    if (userExists) {
      if (userExists.role !== (role || 'admin')) {
        userExists.role = role || 'admin';
        await userExists.save();
        await Redis.set("admin_users", JSON.stringify(await User.find({ role: { $in: ['admin', 'hospital', 'bloodbank', 'donor'] } })));
        return res.status(200).json({ id: userExists._id.toString(), name: userExists.name, email: userExists.email, role: userExists.role, status: 'active', message: `Existing user assigned role: ${userExists.role}` });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password: password, role: role || 'admin' });
    res.status(201).json({ id: user._id.toString(), name: user.name, email: user.email, role: user.role, status: 'active' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove user
async function Removeuser(req, res) {
  try {
    const userid = req.params.id;
    const user = await User.findByIdAndDelete(userid);
    if (!user)
      return res.status(404).json({
        message: 'User not found'
      });
    await Redis.del("admin_users");
    res.json({
      message: 'User removed'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update user details
async function Updateuser(req, res) {
  try {
    const { name, email, role } = req.body;
    await Redis.del("admin_users");
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true, runValidators: true }
    );
    if (!user)
      return res.status(404).json({
        message: 'User not found'
      });
    await Redis.set("admin_users", JSON.stringify(await User.find({ role: { $in: ['admin', 'hospital', 'bloodbank', 'donor'] } })));
    return res.status(200).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      status: 'active',
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// WARNING: destructive; clear all users
async function Cleanall(req, res) {
  try {
    await Redis.del("admin_users");
    await User.deleteMany({});
    return res.status(200).json({
      message: 'All users cleared from database'
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { Getallusers, Addadmin, Removeuser, Updateuser, Cleanall };
