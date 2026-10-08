const express = require('express');
const { userAuth } = require('../middelware/auth');
const adminrouter = express.Router();

const { Getallusers, Addadmin, Removeuser, Updateuser, Cleanall } = require('../controller/admin');

adminrouter.get('/', userAuth, Getallusers);
adminrouter.get('/users/all', userAuth, Getallusers);

adminrouter.post('/', userAuth, Addadmin);
adminrouter.post('/users/add', userAuth, Addadmin);

adminrouter.delete('/:id', userAuth, Removeuser);
adminrouter.delete('/users/remove/:id', userAuth, Removeuser);

adminrouter.put('/:id', userAuth, Updateuser);
adminrouter.put('/users/update/:id', userAuth, Updateuser);

adminrouter.delete('/cleanup/all', userAuth, Cleanall);

module.exports = adminrouter;