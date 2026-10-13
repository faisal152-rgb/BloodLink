const Notification = require('../models/Notification');
const Redis = require('../config/redis');
const mongoose = require('mongoose');

// Get all notifications
async function getnotifications(req, res) {
  const { title, target } = req.query;
  try {
    const isAdminListingAll = req.user.role === 'admin' && !target;
    const userId = req.user.id || req.user._id;
    const notificationTarget = req.user.role === 'admin' && target
      ? target
      : req.user.role;
    const visibleNotifications = {
      $or: [
        { target: { $in: [notificationTarget, 'all'] } },
        { recipient: userId },
      ],
    };
    const filter = isAdminListingAll
      ? {}
      : {
        $and: [
          visibleNotifications,
          { dismissedBy: { $ne: userId } },
        ],
      };

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

async function deleteNotification(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid notification ID' });
  }

  try {
    const userId = req.user.id || req.user._id;
    const result = await Notification.updateOne(
      {
        _id: req.params.id,
        $or: [
          { recipient: userId },
          {
            recipient: null,
            target: { $in: [req.user.role, 'all'] },
          },
        ],
      },
      { $addToSet: { dismissedBy: userId } }
    );

    if (!result.matchedCount) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function deleteAllNotifications(req, res) {
  try {
    const userId = req.user.id || req.user._id;
    const result = await Notification.updateMany(
      {
        $or: [
          { recipient: userId },
          {
            recipient: null,
            target: { $in: [req.user.role, 'all'] },
          },
        ],
        dismissedBy: { $ne: userId },
      },
      { $addToSet: { dismissedBy: userId } }
    );

    return res.status(200).json({
      success: true,
      deletedCount: result.modifiedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getnotifications,
  addnotification,
  deleteNotification,
  deleteAllNotifications,
};
