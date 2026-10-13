const express = require('express');
const {
  getnotifications,
  addnotification,
  deleteNotification,
  deleteAllNotifications,
} = require('../controller/notification');
const { userAuth } = require('../middelware/auth');

const notificationRouter = express.Router();

notificationRouter.get('/', userAuth, getnotifications);
notificationRouter.get('/all', userAuth, getnotifications);
notificationRouter.post('/', userAuth, addnotification);
notificationRouter.post('/add', userAuth, addnotification);
notificationRouter.delete('/all', userAuth, deleteAllNotifications);
notificationRouter.delete('/:id', userAuth, deleteNotification);

module.exports = notificationRouter;
