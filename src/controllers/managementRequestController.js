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
