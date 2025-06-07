const express = require("express");
const propertyController = require("../controllers/propertyController");
const upload = require("../middlewares/multer");
const authenticate = require("../middlewares/authenticate");
const { authorize } = require("../middlewares/authorize");

const { propertyValidationRules } = require("../validators/propertyValidator");
const validateRequest = require("../middlewares/validateRequest");

// test this
const passport = require("passport");
require("../utils/passport");
const api_key = require("../middlewares/checkApiKey");

const propertyRoute = express.Router();

propertyRoute.use(api_key.check_api_key);

// public routes (for users / guests)
propertyRoute.get(
  "/",
  api_key.USER_KEY,

  // passport.authenticate("jwt", { session: false }),
  propertyController.getProperties
);
propertyRoute.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  propertyController.getProperty
);

// AGENT ROUTES (must be authenticated and have 'agent' role)
propertyRoute.post(
  "/",
  // authenticate,
  // authorize("agent"),
  passport.authenticate("jwt", { session: false}),
  // upload.array("images", 7),
  propertyValidationRules,
  validateRequest,
  propertyController.createProperty
);

propertyRoute.patch(
  "/:id",
  authenticate,
  authorize("agent"),
  upload.array("images", 5),
  propertyValidationRules,
  propertyController.updateProperty
);

// ADMIN ROUTES (must be authenticated and have 'admin' role)

propertyRoute.delete(
  "/:id",
  authenticate,
  authorize("agent", "admin"),
  propertyController.deleteProperty
);

const rateLimit = require("express-rate-limit");

const adminStatusRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
});

propertyRoute.patch(
  "/admin/:id/status",
  adminStatusRateLimiter,
  authenticate,
  authorize("admin"),
  propertyController.changePropertyStatus
);

module.exports = propertyRoute;
