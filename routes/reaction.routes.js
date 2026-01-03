const app = require("express").Router();

const {
  getReactions,
  updateReaction,
} = require("../controllers/reactions.controller");

const { reactionLimiter } = require("../utils");

app
  .route("/:siteId/:week")
  .get(getReactions)
  .post(reactionLimiter, updateReaction);

module.exports = app;
