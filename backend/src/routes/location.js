const express = require('express');
const { userAuth } = require('../middelware/auth');
const { getlocations, Addnewlocation, deletelocation } = require('../controller/location');


const locationRouter = express.Router();



locationRouter.get('/', userAuth, getlocations);

locationRouter.post('/', userAuth, Addnewlocation);
locationRouter.post('/add', userAuth, Addnewlocation);

locationRouter.delete('/:id', userAuth, deletelocation);
locationRouter.delete('/delete/:id', userAuth, deletelocation);

module.exports = locationRouter;

module.exports = locationRouter;
