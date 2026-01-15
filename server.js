const express = require("express");
const logger = require("morgan");
const cors = require("cors");
require("dotenv").config();

const commentsRoutes = require("./routes/comment.routes");
const reactionRoutes = require("./routes/reaction.routes");
const contentRoutes = require("./routes/content.routes");

const app = express();

app.use(cors()).use(logger("dev")).use(express.json());

app
  .use("/v1/comments", commentsRoutes)
  .use("/v1/reactions", reactionRoutes)
  .use("/v1/content", contentRoutes);

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
