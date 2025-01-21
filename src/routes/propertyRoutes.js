const express = require('express');
const {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
} = require('../controllers/propertyController');
const upload = require('../middlewares/multer');
const authenticate = require('../middlewares/authenticate');

const { propertyValidationRules } = require('../validators/propertyValidator');
const validateRequest = require('../middlewares/validateRequest');

const propertyRoute = express.Router();

propertyRoute.post(
  '/',
  authenticate,
  upload.array('images', 5),
  propertyValidationRules,
  validateRequest,
  createProperty
);

propertyRoute.get('/', getProperties);

propertyRoute.get('/:id', getProperty);

propertyRoute.patch(
  '/:id',
  authenticate,
  upload.array('images', 5),
  propertyValidationRules,
  updateProperty
);

propertyRoute.delete('/:id', authenticate, deleteProperty);

module.exports = propertyRoute;
