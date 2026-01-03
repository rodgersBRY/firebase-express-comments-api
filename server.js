const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const commentsRoutes = require("./routes/comment.routes");
const reactionRoutes = require("./routes/reaction.routes");
const { generalLimiter } = require("./utils");

const app = express();

app.use(cors()).use(logger("dev")).use(express.json());

app
  .use("/api/comments/", commentsRoutes)
  .use("/api/reactions/", reactionRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "server is running" });
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
