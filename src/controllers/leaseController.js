const { prisma } = require('../utils/prismaUtill');

exports.createLease = async (req, res) => {
  const {
    propertyId,
    leaseStartDate,
    leaseEndDate,
    tenantId,
    leaseAmount,
    paymentFrequency,
    paymentStartDate,
    paymentEndDate,
  } = req.body;
  try {
    const lease = await prisma.lease.create({
      data: {
        propertyId,
        leaseStartDate,
        leaseEndDate,
        tenantId,
        leaseAmount,
        paymentFrequency,
        paymentStartDate,
        paymentEndDate,
      },
    });
    res
      .status(201)
      .json({ message: 'Lease created successfully', data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error creating lease', error: error.message });
  }
};

// GET all leases for a Tenant
exports.getLeases = async (req, res) => {
  try {
    const userId = req.user.id;
    const leases = await prisma.lease.findMany({
      where: {
        tenantId: userId,
      },
    });
    res
      .status(200)
      .json({ message: 'Leases fetched successfully', data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching leases', error: error.message });
  }
};
// GET all leases for a Landlord
exports.getLeases = async (req, res) => {
  try {
    const userId = req.user.id;
    const leases = await prisma.lease.findMany({
      where: {
        landlordId: userId,
      },
    });
    res
      .status(200)
      .json({ message: 'Leases fetched successfully', data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching leases', error: error.message });
  }
};
// GET all leases for a property
exports.getLeases = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const leases = await prisma.lease.findMany({
      where: {
        propertyId,
      },
    });
    res
      .status(200)
      .json({ message: 'Leases fetched successfully', data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching leases', error: error.message });
  }
};

// GET a single lease
exports.getLease = async (req, res) => {
  try {
    const leaseId = req.params.id;
    const lease = await prisma.lease.findUnique({
      where: {
        id: leaseId,
      },
    });
    res
      .status(200)
      .json({ message: 'Lease fetched successfully', data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching lease', error: error.message });
  }
};
// Update a lease
exports.updateLease = async (req, res) => {
  const { id } = req.params;
  const {
    propertyId,
    leaseStartDate,
    leaseEndDate,
    tenantId,
    leaseAmount,
    paymentFrequency,
    paymentStartDate,
    paymentEndDate,
  } = req.body;
  try {
    const lease = await prisma.lease.update({
      where: { id: id },
      data: {
        propertyId,
        leaseStartDate,
        leaseEndDate,
        tenantId,
        leaseAmount,
        paymentFrequency,
        paymentStartDate,
        paymentEndDate,
      },
    });
    res
      .status(200)
      .json({ message: 'Lease updated successfully', data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error updating lease', error: error.message });
  }
};

// Delete a lease
exports.deleteLease = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lease.delete({
      where: { id },
    });
    res.status(200).json({ message: 'Lease deleted successfully' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error deleting lease', error: error.message });
  }
};
