const express = require("express");
const { leaseRateLimiter } = require("../utils/rateLimiter");
const leaseController = require("../controllers/leaseController");
const authenticate = require("../middlewares/authenticate");
const validateRequest = require("../middlewares/validateRequest");
const {
  validateLease,
  leaseValidationRules,
} = require("../validators/leaseValidator");
const upload = require("../middlewares/multer");

const passport = require("passport");
require("../utils/passport");
const api_key = require("../middlewares/checkApiKey");

const leaseRoute = express.Router();

leaseRoute.use(api_key.check_api_key);

leaseRoute.post(
  "/",
  authenticate,
  leaseRateLimiter,
  leaseValidationRules,
  validateRequest,
  leaseController.createLease
);

// get all leases
leaseRoute.get("/", authenticate, leaseRateLimiter, leaseController.getLeases);

leaseRoute.get(
  "/:id",
  authenticate,
  leaseRateLimiter,
  leaseController.getSingleLease
);

// upload rent receipt
leaseRoute.patch(
  "/upload-receipt/:id",
  api_key.USER_KEY,
  authenticate,
  leaseRateLimiter,
  upload.single("receipt"),
  leaseController.uploadReceipt
);

// update lease status
leaseRoute.patch(
  "/status/:id",
  api_key.ADMIN_KEY,
  leaseController.changeLeaseStatus
);

// renew lease
leaseRoute.patch("/renew/:id", api_key.ADMIN_KEY, leaseController.renewLease);

// update lease
leaseRoute.patch(
  "/:id",
  api_key.ADMIN_KEY || api_key.AGENT_KEY,
  leaseValidationRules,
  validateRequest,
  leaseController.updateLease
);

leaseRoute.delete(
  "/:id",
  leaseRateLimiter,
  api_key.ADMIN_KEY,
  authenticate,
  leaseController.deleteLease
);

module.exports = leaseRoute;
