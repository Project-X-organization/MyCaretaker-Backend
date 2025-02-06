const { check } = require('express-validator');

exports.leaseValidationRules = [
  check('propertyId').notEmpty().withMessage('Property ID is required'),
  check('startDate')
    .notEmpty()
    .withMessage('Lease start date is required'),
  check('endDate').notEmpty().withMessage('Lease end date is required'),
  check('tenantId').notEmpty().withMessage('Tenant ID is required'),
  check('terms').notEmpty().withMessage('Lease terms is required'),
  check('duration').notEmpty().withMessage('Lease duration is required'),
  check('price').notEmpty().withMessage('Lease price is required'),
  check('status').notEmpty().withMessage('Lease status is required'),
];

exports.validateLease = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));
  return res.status(422).json({
    errors: extractedErrors,
  });
};
