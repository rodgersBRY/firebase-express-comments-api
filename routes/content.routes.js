const app = require("express").Router();

const { getContent } = require("../controllers/content.controller");

app.route("/:siteId/:weekId").get(getContent);

module.exports = app;
