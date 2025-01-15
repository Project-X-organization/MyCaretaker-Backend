const express = require('express');
const propertyRoutes = require('./routes/propertyRoutes');
const dotenv = require('dotenv');

// Load env variables
dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/api/v1/properties', propertyRoutes);

module.exports = app;
