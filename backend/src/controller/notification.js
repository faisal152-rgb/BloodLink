const Notification = require('../models/Notification');
const Redis = require('../config/redis');

// Get all notifications
async function getnotifications(req, res) {
  const { title } = req.query;
  try {
    if (title) {
      const cachedNotifications = await Redis.get(`notifications:${title}`);
      if (cachedNotifications) {
        return res.status(200).json(JSON.parse(cachedNotifications));
      }
    }
    const notifications = await Notification.find({}).sort({ timestamp: -1 });
    if (title) {
      await Redis.set(`notifications:${title}`, JSON.stringify(notifications));
    }
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create/Send new notification
async function addnotification(req, res) {
  const { title, message } = req.body;
  try {
    if (title) {
      await Redis.del(`notifications:${title}`);
    }
    const notification = await Notification.create({ title, message });
    if (title) {
      await Redis.set(`notifications:${title}`, JSON.stringify(notification));
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getnotifications, addnotification };
