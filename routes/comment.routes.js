const app = require("express").Router();

const {
  newComment,
  getComments,
} = require("../controllers/comments.controller");

const { commentLimiter } = require("../utils/rateLimiter");

app.route("/:siteId/:week").get(getComments).post(commentLimiter, newComment);

module.exports = app;
