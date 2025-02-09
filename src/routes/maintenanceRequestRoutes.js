const { Router } = require("express");
const passport = require("passport");
require("../utils/passport");
const managementRequest = require("../controllers/managementRequestController");
const route = Router();

route.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  managementRequest.submitManagementRequest
);
route.patch(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  managementRequest.updateRequestStatus
);

route.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  managementRequest.reviewAllRequests
);
module.exports = route;
