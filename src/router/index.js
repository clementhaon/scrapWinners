const Router = require("express").Router();
const prediction = require("../controller/winnersAndWhinners")
const odds = require("../controller/odd");

Router.use("/prediction", prediction);
Router.use("/odds", odds);

module.exports = Router;
