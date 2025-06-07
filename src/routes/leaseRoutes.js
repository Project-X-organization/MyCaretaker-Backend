const express = require("express");
const rateLimit = require("express-rate-limit");
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
  leaseValidationRules,
  validateRequest,
  leaseController.createLease
);

// get all leases
leaseRoute.get("/", authenticate, leaseController.getLeases);

leaseRoute.get("/:id", authenticate, leaseController.getSingleLease);

// upload rent receipt
leaseRoute.patch(
  "/upload-receipt/:id",
  api_key.USER_KEY,
  authenticate,
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
leaseRoute.patch(
  "/renew/:id",
  api_key.ADMIN_KEY,
  leaseController.renewLease
);

// update lease
leaseRoute.patch(
  "/:id",
  api_key.ADMIN_KEY || api_key.AGENT_KEY,
  leaseValidationRules,
  validateRequest,
  leaseController.updateLease
);

// delete lease
const deleteLeaseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // max 10 requests per windowMs
});

leaseRoute.delete("/:id", deleteLeaseLimiter, api_key.ADMIN_KEY, authenticate, leaseController.deleteLease);

module.exports = leaseRoute;
