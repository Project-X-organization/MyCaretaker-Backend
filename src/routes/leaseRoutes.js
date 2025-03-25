const express = require('express');
const leaseController = require('../controllers/leaseController');
const authenticate = require('../middlewares/authenticate');
const validateRequest = require('../middlewares/validateRequest');
const { leaseValidationRules } = require('../validators/leaseValidator');
const upload = require('../middlewares/multer');

const leaseRoute = express.Router();

leaseRoute.post(
  '/',
  authenticate,
  leaseValidationRules,
  validateRequest,
  leaseController.createLease
);

// get all leases
leaseRoute.get('/', authenticate, leaseController.getAllLeases);

leaseRoute.get('/tenant', authenticate, leaseController.getLeasesForTenant);

leaseRoute.get('/:id', authenticate, leaseController.getSingleLease);

// get lease for landlord
leaseRoute.get('/landlord', authenticate, leaseController.getLeasesForLandlord);

// upload rent receipt
leaseRoute.patch('/upload-receipt/:id',   upload.single('receipt'),authenticate, leaseController.uploadReceipt);

// update lease status
leaseRoute.patch(
  '/status/:id',
  authenticate,
  leaseController.updateLeaseStatus
);

// get lease for property
leaseRoute.get(
  '/property/:id',
  authenticate,
  leaseController.getLeasesForProperty
);

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
