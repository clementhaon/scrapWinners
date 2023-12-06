const Router = require("express").Router();
const prediction = require("../controller/winnersAndWhinners")
const odds = require("../controller/odd");
const result = require('../controller/result')

Router.use("/prediction", prediction);
Router.use("/odds", odds);
Router.use('/result', result);

module.exports = Router;
