const { prisma } = require("../utils/prismaUtill");

exports.submitManagementRequest = async (req, res) => {
  try {
    const { propertyId, userId, title, description } = req.body;

    const property = await prisma.property.findUnique({
      where: {
        id: propertyId,
      },
    });
    if (!property) {
      throw new Error("Property not found");
    }
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const managementRequest = await prisma.managementRequest.create({
      data: {
        propertyId,
        userId,
        title,
        description,
      },
    });
    if (!managementRequest) {
      throw new Error("Error creating management request");
    }
    res.status(201).json({
      managementRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating management request",
      error: error.message,
    });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const request = await prisma.managementRequest.findUnique({
      where: {
        id,
      },
    });
    if (!request) throw new Error("Maintenance request not found!");
    const updateRequest = await prisma.managementRequest.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
    if (!updateRequest) throw new Error("Failed to update Maintenance Request");

    res.status(200).json({
      message: "Request Updated",
      request: updateRequest,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Updating the Maintenance request",
      error: error.message,
    });
  }
};

