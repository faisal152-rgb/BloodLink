const express = require('express');
const { getnotifications, addnotification } = require('../controller/notification');
const { userAuth } = require('../middelware/auth');

const notificationRouter = express.Router();

notificationRouter.get('/', userAuth, getnotifications);
notificationRouter.post('/add', userAuth, addnotification);

module.exports = notificationRouter;
