const express = require('express');
const { Getinventory, Updateinventory } = require('../controller/inventory');
const { userAuth } = require('../middelware/auth');


const inventoryRouter = express.Router();



inventoryRouter.get('/', userAuth, Getinventory);
inventoryRouter.put('/update', userAuth, Updateinventory);
inventoryRouter.put('/:group', userAuth, Updateinventory);

module.exports = inventoryRouter;
