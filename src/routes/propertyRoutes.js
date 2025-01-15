const express = require('express');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const upload = require('../middlewares/multer');

const { propertyValidationRules } = require('../validators/propertyValidator');
const validateRequest = require('../middlewares/validateRequest');

const propertyRoute = express.Router();

propertyRoute.post(
  '/',
  upload.array('images', 5),
  propertyValidationRules,
  validateRequest,
  createProperty
);

propertyRoute.get('/', getProperties);

propertyRoute.get('/:id', getProperty);

propertyRoute.patch(
  '/:id',
  upload.array('images', 5),
  propertyValidationRules,
  updateProperty
);

propertyRoute.delete('/:id', deleteProperty);

module.exports = propertyRoute;
