const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for write operations (POST) - 20 requests per 15 minutes
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "Too many requests. Please slow down and try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for comments - 10 comments per hour
const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error:
      "You have posted too many comments. Please wait before posting again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use userId from request body for more accurate limiting
  keyGenerator: (req) => {
    return req.body.uid || ipKeyGenerator(req);
  },
});

// Reaction limiter - 30 reactions per 15 minutes
const reactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: "Too many reaction updates. Please wait a moment.",
  },
  keyGenerator: (req) => {
    return req.body.userId || ipKeyGenerator(req);
  },
});

module.exports = {
  commentLimiter,
  generalLimiter,
  reactionLimiter,
  strictLimiter,
};
