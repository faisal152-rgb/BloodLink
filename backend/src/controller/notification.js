const Notification = require('../models/Notification');
const Redis = require('../config/redis');

// Get all notifications
async function getnotifications(req, res) {
  const { title, target } = req.query;
  try {
    const isAdminListingAll = req.user.role === 'admin' && !target;
    const publicNotifications = target && target !== 'all'
      ? { target: { $in: [target, 'all'] } }
      : { target: 'all' };
    const filter = isAdminListingAll
      ? {}
      : { $or: [publicNotifications, { recipient: req.user.id || req.user._id }] };

    if (title && Redis && isAdminListingAll) {
      try {
        const cachedNotifications = await Redis.get(`notifications:${title}`);
        if (cachedNotifications) {
          return res.status(200).json(JSON.parse(cachedNotifications));
        }
      } catch (redisErr) {
        console.warn("Redis get warning:", redisErr.message);
      }
    }

    const notifications = await Notification.find(filter).sort({ timestamp: -1, createdAt: -1 });

    if (title && Redis && isAdminListingAll) {
      try {
        await Redis.set(`notifications:${title}`, JSON.stringify(notifications));
      } catch (redisErr) {
        console.warn("Redis set warning:", redisErr.message);
      }
    }
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create/Send new notification
async function addnotification(req, res) {
  const { title, message, target = 'all', status = 'sent' } = req.body;
  try {
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Notification message is required' });
    }

    if (title && Redis) {
      try {
        await Redis.del(`notifications:${title}`);
      } catch (redisErr) {
        console.warn("Redis del warning:", redisErr.message);
      }
    }

    const notification = await Notification.create({
      title: title?.trim() || 'Broadcast Announcement',
      message: message.trim(),
      target: target || 'all',
      status: status || 'sent',
      timestamp: new Date()
    });

    if (title && Redis) {
      try {
        await Redis.set(`notifications:${title}`, JSON.stringify(notification));
      } catch (redisErr) {
        console.warn("Redis set warning:", redisErr.message);
      }
    }
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getnotifications, addnotification };
