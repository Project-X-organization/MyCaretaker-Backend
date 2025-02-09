const express = require("express");
const propertyRoutes = require("./routes/propertyRoutes");
const leaseRoutes = require("./routes/leaseRoutes");
const dotenv = require("dotenv");
const passport = require("passport");
const userRoutes = require("./routes/userRoutes");
const maintenanceRoutes = require("./routes/maintenanceRequestRoutes");
const morgan = require("morgan");
// Load env variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(passport.initialize());
// Routes
app.use(morgan("dev")); // logging middleware
// Property routes
app.use("/api/v1/properties", propertyRoutes);
// Lease routes
app.use("/api/v1/leases", leaseRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/maintenance-request",maintenanceRoutes);
// app.use((error, req, res) => {
//     console.error(error.statusCode)
//   res.status(error.statusCode || 500).json({
//     message: error.message,
//     error: req.app.get("env") === "development" ? error : {},
//   });
// });

module.exports = app;
