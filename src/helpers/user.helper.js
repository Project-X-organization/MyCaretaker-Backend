const { connect } = require("../app");
const { prisma } = require("../utils/prismaUtill");

exports.applyForProperty = async (propertyId, userId) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  console.log(property);
  if (!property) {
    throw new Error("Property not found");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const application = await prisma.application.create({
    data: {
      propertyId: propertyId,
      userId: userId,
    },
  });

  return application;
};

exports.getPropertyApplications = async (propertyId) => {
  const applications = await prisma.application.findMany({
    where: {
      propertyId,
    },
    include: {
      User: true,
    },
  });

  return applications;
};

exports.allApplications = async () => {
  const applications = await prisma.application.findMany({
    include: {
      User: true,
      Property: true,
    },
  });
  return applications;
};

exports.acceptOrRejectApplication = async (applicationId, status) => {
  const application = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: status,
    },
  });
  return application;
};
