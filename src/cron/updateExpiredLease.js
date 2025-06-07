const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { sendEmail } = require('../utils/nodemail');
const { getEmailTemplate } = require('../utils/emailTemplate');

const { getUserById } = require('../controllers/userController');
const { getPropertyById } = require('../controllers/propertyController');
// const { getLeaseById } = require('../controllers/leaseController');

// Function to update expired leases
const updateExpiredLeases = async () => {
  const expiredLeases = await prisma.leaseAgreement.findMany({
    where: {
      endDate: {
        lt: new Date(),
      },
      status: 'active',
    },
  });

  for (const lease of expiredLeases) {
    await prisma.leaseAgreement.update({
      where: { id: lease.id },
      data: { status: 'expired' },
    });

    // Send email notification to user
    const user = await getUserById(lease.userId);
    const property = await getPropertyById(lease.propertyId);
    const emailTemplate = getEmailTemplate('leaseExpired', { user, property });
    await sendEmail(user.email, emailTemplate);
  }
};

// Schedule the task to run daily
cron.schedule('0 0 * * *', updateExpiredLeases);
