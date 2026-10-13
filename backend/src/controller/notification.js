const Notification = require('../models/Notification');
const mongoose = require('mongoose');

const getUserId = (req) => new mongoose.Types.ObjectId(req.user.id || req.user._id);

const getVisibleNotificationsFilter = (user, userId) => {
  if (user.role === 'admin') {
    return {};
  }

  return {
    $or: [
      { target: { $in: [user.role, 'all'] } },
      { recipient: userId },
    ],
  };
};

// Get all notifications
async function getnotifications(req, res) {
  const { target } = req.query;
  try {
    const isAdminListingAll = req.user.role === 'admin' && !target;
    const userId = getUserId(req);
    const notificationTarget = req.user.role === 'admin' && target
      ? target
      : req.user.role;
    const visibilityFilter = isAdminListingAll
      ? {}
      : getVisibleNotificationsFilter({ ...req.user, role: notificationTarget }, userId);
    const filter = {
      $and: [
        visibilityFilter,
        { dismissedBy: { $ne: userId } },
      ],
    };

    const notifications = await Notification.find(filter).sort({ timestamp: -1, createdAt: -1 });
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

    const notification = await Notification.create({
      title: title?.trim() || 'Broadcast Announcement',
      message: message.trim(),
      target: target || 'all',
      status: status || 'sent',
      timestamp: new Date()
    });

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
    const userId = getUserId(req);
    const visibilityFilter = getVisibleNotificationsFilter(req.user, userId);
    const result = await Notification.updateOne({
      _id: req.params.id,
      ...visibilityFilter,
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
    const userId = getUserId(req);
    const visibilityFilter = getVisibleNotificationsFilter(req.user, userId);
    const result = await Notification.updateMany(
      {
        ...visibilityFilter,
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
