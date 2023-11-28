const Router = require("express").Router();
const prediction = require("../controller/winnersAndWhinners")

Router.use("/prediction", prediction);

module.exports = Router;
