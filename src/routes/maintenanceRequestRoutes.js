const { Router } = require("express");

const managementRequest = require("../controllers/managementRequestController");
const route = Router();

route.post("/", managementRequest.submitManagementRequest);

module.exports = route;
