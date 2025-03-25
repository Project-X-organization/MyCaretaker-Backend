const { check } = require('express-validator');

exports.propertyValidationRules = [
  check('title').notEmpty().withMessage('Title is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('annualRent')
    .isFloat({ gt: 0 })
    .withMessage('AnnualRent must be a positive number'),
  check('otherCharges')
    .isFloat({ gt: 0 })
    .withMessage('OtherCharges must be a positive number'),
  check('propertyType').notEmpty().withMessage('PropertyType is required'),
  check('location').notEmpty().withMessage('Location is required'),
  check('bedrooms')
    .isInt({ gt: 0 })
    .withMessage('Bedrooms must be a positive integer'),
  check('bathrooms')
    .isInt({ gt: 0 })
    .withMessage('Bathrooms must be a positive integer'),
];
