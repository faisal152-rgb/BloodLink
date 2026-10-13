const express = require('express');
const { getnotifications, addnotification, dismissWelcomeNotification } = require('../controller/notification');
const { userAuth } = require('../middelware/auth');

const notificationRouter = express.Router();

notificationRouter.get('/', userAuth, getnotifications);
notificationRouter.get('/all', userAuth, getnotifications);
notificationRouter.post('/', userAuth, addnotification);
notificationRouter.post('/add', userAuth, addnotification);
notificationRouter.delete('/:id', userAuth, dismissWelcomeNotification);

module.exports = notificationRouter;
