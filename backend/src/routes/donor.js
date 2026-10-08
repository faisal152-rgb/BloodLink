const express = require('express');
const donorrouter = express.Router();
const { userAuth } = require('../middelware/auth');

const { Getallusers, Adddonor, Updatedonor, Approvedonor, Blockdonor, Removedonor } = require('../controller/donor');

// GET all donors
donorrouter.get('/', Getallusers);
donorrouter.get('/all', Getallusers);

// POST add donor
donorrouter.post('/', userAuth, Adddonor);
donorrouter.post('/add', userAuth, Adddonor);

// PUT update donor
donorrouter.put('/:id', userAuth, Updatedonor);
donorrouter.put('/update/:id', userAuth, Updatedonor);

// PATCH approve donor
donorrouter.patch('/:id/approve', userAuth, Approvedonor);
donorrouter.patch('/approve/:id', userAuth, Approvedonor);

// PATCH block donor
donorrouter.patch('/:id/block', userAuth, Blockdonor);
donorrouter.patch('/block/:id', userAuth, Blockdonor);

// DELETE remove donor
donorrouter.delete('/:id', userAuth, Removedonor);
donorrouter.delete('/remove/:id', userAuth, Removedonor);

module.exports = donorrouter;