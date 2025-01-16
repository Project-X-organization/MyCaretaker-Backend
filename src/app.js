const express = require("express");
const propertyRoutes = require("./routes/propertyRoutes");
const dotenv = require("dotenv");
const passport = require("passport");
const userRoutes = require("./routes/userRoutes");
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
app.use("/api/v1/user", userRoutes);

module.exports = app;
