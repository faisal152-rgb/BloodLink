const express = require("express");
const { getrequests, Addnewrequest, updaterequest, updaterequeststatus, deletereview } = require("../controller/request");
const { userAuth } = require("../middelware/auth");


const requestrouter = express.Router();



requestrouter.get("/", userAuth, getrequests);
requestrouter.post("/", userAuth, Addnewrequest);
requestrouter.patch("/:id", userAuth, updaterequest);
requestrouter.patch("/:id/status", userAuth, updaterequeststatus);
requestrouter.delete("/:id", userAuth, deletereview);


module.exports = requestrouter;
