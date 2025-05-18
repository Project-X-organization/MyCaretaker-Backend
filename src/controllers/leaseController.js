const { prisma } = require("../utils/prismaUtill");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const { stat } = require("fs");

exports.createLease = async (req, res) => {
  const {
    propertyId,
    leaseStartDate,
    leaseEndDate,
    // userId,
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
    terms,
  } = req.body;
  try {
    const userId = req.user.id;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        agentId: true, // or whatever the field is
      },
    });

    if (!property || !property.agentId) {
      throw new Error("No agent associated with this property");
    }

    const agentId = property.agentId;

    // check to see if the property is already leased
    const existingLease = await prisma.leaseAgreement.findFirst({
      where: {
        propertyId, 
        status: "approved",
        OR: [
          {
            startDate: {
              lte: new Date("2026-03-31T00:00:00.000Z"),
            },
          },
          {
            endDate: {
              gte: new Date("2025-04-01T00:00:00.000Z"),
            },
          },
        ],
      },
    });

    if (existingLease) {
      throw new Error("Property is already leased");
    }

    // Ensure references are properly structured
    const formattedReferences = references.map((ref) => ({
      name: ref.name,
      relationship: ref.relationship,
      phoneNumber: ref.phoneNumber,
    }));
    const lease = await prisma.leaseAgreement.create({
      data: {
        startDate: new Date(leaseStartDate),
        endDate: new Date(leaseEndDate),
        paymentFrequency,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        price: parseFloat(leaseAmount),
        terms,

        // Adding references
        references: {
          create: formattedReferences,
        },

        // Adding employment details
        EmploymentDetails: {
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
        Agent: {
          connect: {
            id: agentId
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

// GET Leases
exports.getLeases = async (req, res) => {
  try {
    const {
      search,
      sortBy = "createdAt",
      sortOrder = "asc",
      status,
      propertyId,
      userId,
      agentId,
    } = req.query;
    const role = req.user.role;
    const currentUserId = req.user.id;

    // List of valid fields to sort by
    const validSortFields = [
      "price",
      "startDate",
      "endDate",
      "createdAt",
      "updatedAt",
      "paymentStatus",
    ];
    if (!validSortFields.includes(sortBy)) {
      return res
        .status(400)
        .json({ message: `'${sortBy}' is not a valid sort field` });
    }

    const where = {};

    if (search) {
      where.OR = [
        { terms: { contains: search, mode: "insensitive" } },
        { paymentMethod: { contains: search, mode: "insensitive" } },
      ];
    }

    // Apply role-based filtering
    if (role === "admin") {
      // admin can see all leases
      if (status) {
        where.status = status;
      }
    } else if (role === "agent") {
      // agent case lease associated with their property
      where.agentId = currentUserId;
      if (status) {
        where.status = status;
      }
    } else {
      // Regular user can only see their own leases
      where.userId = currentUserId;
      // where.status = "approved";
    }

  

    // Apply additional filters if provided
    if (propertyId) {
      where.propertyId = propertyId;
    }

    if (userId) {
      where.userId = userId;
    }
    if (agentId) {
      where.agentId = agentId;
    }

    // Fetch leases with filtering and sorting
    const leases = await prisma.leaseAgreement.findMany({
      where, //filtering conditoins
      orderBy: {
        [sortBy]: sortOrder.toLowerCase(), //Sorting field
      },
      include: {
        references: true,
        employmentDetails: true,
        property: {
          select: {
            title: true,
            price: true,
            location: true,
            propertyType: true,
            description: true,
          }
        },
        user: {
          select: {
            username: true,
            email: true,
            phoneNumber: true,
          }
        },
        agent: {
          select: {
            username: true,
            email: true,
            phoneNumber: true,
          }
        },
      },
    });

    //count of lease
    const result = leases.length;

    res.status(200).json({
      message: "Leases retrieved successfully",
      result: result,
      data: leases,
    });
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
        employmentDetails: true,
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

    // set isDeleted to true
    await prisma.lease.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });
    res.status(200).json({ message: "Lease deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting lease", error: error.message });
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

exports.changeLeaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, rejectionReason } = req.body;
    status = status.toLowerCase();
    // const lease = await prisma.leaseAgreement.update({
    //   where: { id },
    //   data: {
    //     status,
    //   },
    // });

    // check if status is rejected add rejectionReason and rejectionDate
    if (status === "rejected") {
      where.rejectionReason = req.body.rejectionReason;
      where.rejectionDate = new Date();
    }

    const lease = await prisma.leaseAgreement.update({
      where: { id },
      data: {
        status,
        rejectionReason: req.body.rejectionReason,
        rejectionDate: new Date(),
      },
    });

    // update the property if the lease is approved

    res
      .status(200)
      .json({ message: "Lease status updated successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating lease status", error: error.message });
  }
};

// renew lease
exports.renewLease = async (req, res) => {
  const { id } = req.params;
  const { leaseStartDate, leaseEndDate, paymentFrequency, paymentMethod, terms, price,  } = req.body;
  try {
    // check if lease exists
    const existingLease = await prisma.leaseAgreement.findUnique({
      where: { id },
      include: {
        property: true,
        user: true,
        agent: true,
      },
    });

    if (!existingLease) {
      return res.status(404).json({ message: "Lease not found" });
    }

    // update old lease to expired
    await prisma.leaseAgreement.update({
      where: { id },
      data: {
        status: "expired",
      },
    });

    // create new lease
    const lease = await prisma.leaseAgreement.create({
      data: {
        paymentFrequency: paymentFrequency,
        paymentMethod: paymentMethod,
        terms: terms,
        price: parseFloat(price),
        employmentDetails: {
          connect: {
            id: existingLease.employmentDetailsId,
          },
        },
        user: { connect: { id: existingLease.userId } },
        property: { connect: { id: existingLease.propertyId } },
        agent: { connect: { id: existingLease.agentId } },
        startDate: new Date(leaseStartDate),
        endDate: new Date(leaseEndDate),
      },
    });

    res
      .status(200)
      .json({ message: "Lease renewed successfully", data: lease });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error renewing lease", error: error.message });
  }
};
