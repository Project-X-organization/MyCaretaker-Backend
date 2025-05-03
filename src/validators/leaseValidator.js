const { check } = require('express-validator');

exports.leaseValidationRules = [
  check('propertyId').notEmpty().withMessage('Property ID is required'),
  check('leaseStartDate')
    .notEmpty()
    .withMessage('Lease start date is required'),
  check('leaseEndDate').notEmpty().withMessage('Lease end date is required'),
  check('userId').notEmpty().withMessage('user ID is required'),

  check('leaseAmount').notEmpty().withMessage('Lease amount is required'),
  check('paymentFrequency')
    .notEmpty()
    .withMessage('Payment frequency is required'),
  check('paymentDate').notEmpty().withMessage('Payment date is required'),
  check('references').notEmpty().withMessage('References is required'),
  check('occupation').notEmpty().withMessage('Occupation is required'),
  check('company').notEmpty().withMessage('Company is required'),
  check('address').notEmpty().withMessage('Address is required'),
  check('yearsWorked').notEmpty().withMessage('Years worked is required'),
  check('otherIncomeSource')
    .notEmpty()
    .withMessage('Other income source is required'),
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
