const app = require("express").Router();

const { getEvents } = require("../controllers/content.controller");

app.route("/:siteId").get(getEvents);

module.exports = app;
