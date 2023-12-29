const Router = require("express").Router();
const prediction = require("../controller/winnersAndWhinners");
const odds = require("../controller/odd");
const result = require('../controller/result');
const eventsDate = require('../controller/events-date');

Router.use("/prediction", prediction);
Router.use("/odds", odds);
Router.use('/result', result);
Router.use('/date', eventsDate);

module.exports = Router;
