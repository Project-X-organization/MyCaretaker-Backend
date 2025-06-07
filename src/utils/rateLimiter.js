const rateLimit = require("express-rate-limit"); 

const adminStatusRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
});

const propertyRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // limit each IP to 20 requests per windowMs
});

const userRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
});

module.exports = {
  adminStatusRateLimiter,
  propertyRateLimiter,
  userRateLimiter,
};