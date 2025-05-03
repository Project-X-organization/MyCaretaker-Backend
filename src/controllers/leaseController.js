const { prisma } = require("../utils/prismaUtill");
const cloudinary = require("../config/cloudinary");
const path = require("path");

exports.createLease = async (req, res) => {
  const {
    propertyId,
    leaseStartDate,
    leaseEndDate,
    userId,
    leaseAmount,
    paymentFrequency,
    paymentMethod,
    paymentDate,
    references,
    occupation,
    company,
    address,
    yearsWorked,
    otherIncomeSource,
  } = req.body;
  try {
    const lease = await prisma.leaseAgreement.create({
      data: {
        startDate: new Date(leaseStartDate),
        endDate: new Date(leaseEndDate),
        paymentFrequency,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        price: parseFloat(leaseAmount),

        // Adding references
        references: {
          create: references.map((ref) => ({
            name: ref.name,
            relationship: ref.relationship,
            phoneNumber: ref.phoneNumber,
          })),
        },

        // Adding employment details
        employment: {
          create: {
            occupation,
            company,
            address,
            yearsWorked: parseInt(yearsWorked),
            otherIncomeSource,
          },
        },

        // Connect the lease to the property
        property: {
          connect: {
            id: propertyId,
          },
        },

        // Connect the lease to the user
        user: {
          connect: {
            id: userId,
          },
        },

        // Connect the lease to the agent
        agent: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    res
      .status(201)
      .json({ message: "Lease created successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating lease", error: error.message });
  }
};

// GET all leases for a user
exports.getLeasesForuser = async (req, res) => {
  try {
    const userId = req.user.id;
    const leases = await prisma.leaseAgreement.findMany({
      where: {
        userId: userId,
      },
      include: {
        references: true,
        employment: true,
        property: true,
        agent: true,
      },
    });
    res
      .status(200)
      .json({ message: "Leases fetched successfully", data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leases", error: error.message });
  }
};
// GET all leases for a agent
exports.getLeasesForagent = async (req, res) => {
  try {
    const userId = req.user.id;
    const leases = await prisma.leaseAgreement.findMany({
      where: {
        agentId: userId,
      },
      include: {
        references: true,
        employment: true,
        property: true,
        user: true,
      },
    });
    res
      .status(200)
      .json({ message: "Leases fetched successfully", data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leases", error: error.message });
  }
};
// GET all leases for a property
exports.getLeasesForProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const leases = await prisma.leaseAgreement.findMany({
      where: {
        propertyId,
      },
      include: {
        references: true,
        employment: true,
        user: true,
        agent: true,
      },
    });
    res
      .status(200)
      .json({ message: "Leases fetched successfully", data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leases", error: error.message });
  }
};

// GET a single lease
exports.getSingleLease = async (req, res) => {
  try {
    const leaseId = req.params.id;
    const lease = await prisma.leaseAgreement.findUnique({
      where: {
        id: leaseId,
      },
      include: {
        references: true,
        employment: true,
        property: true,
        user: true,
        agent: true,
      },
    });
    res
      .status(200)
      .json({ message: "Lease fetched successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching lease", error: error.message });
  }
};
// Update a lease
exports.updateLease = async (req, res) => {
  const { id } = req.params;
  const {
    propertyId,
    leaseStartDate,
    leaseEndDate,
    userId,
    leaseAmount,
    paymentFrequency,
    paymentDate,
    references,
    occupation,
    company,
    address,
    yearsWorked,
    otherIncomeSource,
  } = req.body;
  try {
    // check if lease exists
    const existingLease = await prisma.lease.findUnique({
      where: { id },
    });
    if (!existingLease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    const lease = await prisma.leaseAgreement.update({
      where: { id },
      data: {
        propertyId,
        leaseStartDate:
          new Date(leaseStartDate) || existingLease.leaseStartDate,
        leaseEndDate: new Date(leaseEndDate) || existingLease.leaseEndDate,
        userId,
        leaseAmount: parseFloat(leaseAmount) || existingLease.leaseAmount,
        paymentFrequency,
        paymentDate: new Date(paymentDate) || existingLease.paymentDate,

        // Update references (delete old ones and create new ones)
        references: {
          deleteMany: {}, // Remove all existing references
          create: references.map((ref) => ({
            name: ref.name,
            relationship: ref.relationship,
            phoneNumber: ref.phoneNumber,
          })),
        },

        // Update employment details
        employment: {
          upsert: {
            create: {
              occupation,
              company,
              address,
              yearsWorked: parseInt(yearsWorked),
              otherIncomeSource,
            },
            update: {
              occupation,
              company,
              address,
              yearsWorked: parseInt(yearsWorked),
              otherIncomeSource,
            },
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: "Lease updated successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating lease", error: error.message });
  }
};

// Delete a lease
exports.deleteLease = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.lease.delete({
      where: { id },
    });
    res.status(200).json({ message: "Lease deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting lease", error: error.message });
  }
};

// GET all leases
exports.getAllLeases = async (req, res) => {
  try {
    const leases = await prisma.leaseAgreement.findMany({
      include: {
        references: true,
        employment: true,
        property: true,
        user: true,
        agent: true,
      },
    });
    res
      .status(200)
      .json({ message: "Leases fetched successfully", data: leases });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leases", error: error.message });
  }
};

// update lease status
exports.updateLeaseStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    // check if lease exists
    const existingLease = await prisma.leaseAgreement.findUnique({
      where: { id },
    });

    if (!existingLease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    if (existingLease.paymentStatus !== "PAID") {
      return res.status(400).json({ message: "Lease payment not completed" });
    }

    const lease = await prisma.leaseAgreement.update({
      where: { id },
      data: {
        status,
      },
    });
    res
      .status(200)
      .json({ message: "Lease status updated successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating lease status", error: error.message });
  }
};

// upload rent payment receipt image
exports.uploadReceipt = async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body;
  // image upload for the receipt
  try {
    // image upload
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert file buffer to base64 string
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "receipts", // Optional: Add folder for better organization
    });

    const lease = await prisma.leaseAgreement.update({
      where: { id },
      data: {
        receipt: result.secure_url,
        paymentMethod,
      },
    });
    res
      .status(200)
      .json({ message: "Receipt uploaded successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error uploading receipt", error: error.message });
  }
};
