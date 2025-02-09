const express = require('express');
const leaseController = require('../controllers/leaseController');
const authenticate = require('../middlewares/authenticate');
const validateRequest = require('../middlewares/validateRequest');
const { leaseValidationRules } = require('../validators/leaseValidator');

const leaseRoute = express.Router();

leaseRoute.post(
  '/',
  authenticate,
  leaseValidationRules,
  validateRequest,
  leaseController.createLease
);

leaseRoute.get('/', authenticate, leaseController.getLeases);

leaseRoute.get('/:id', authenticate, leaseController.getLease);

// get lease for landlord
// leaseRoute.get('/landlord', authenticate, leaseController.getLeasesForLandlord);

// get lease for tenant
// leaseRoute.get('/tenant', authenticate, leaseController.getLeasesForTenant);

// get lease for property
// leaseRoute.get(
//   '/property/:id',
//   authenticate,
//   leaseController.getLeasesForProperty
// );

// update lease
leaseRoute.patch(
  '/:id',
  authenticate,
  leaseValidationRules,
  validateRequest,
  leaseController.updateLease
);

// delete lease
leaseRoute.delete('/:id', authenticate, leaseController.deleteLease);

module.exports = leaseRoute;
