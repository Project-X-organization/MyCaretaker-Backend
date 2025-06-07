const { verify } = require("jsonwebtoken");
const { verifyEmail } = require("../controllers/userController");

exports.getEmailTemplate = (type, data) => {
  const templates = {
    leaseExpired: {
      subject: 'Lease Agreement Expired',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Lease Agreement Expired</h2>
          <p>Dear ${data.user.username},</p>
          <p>Your lease agreement for the following property has expired:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
            <p><strong>Property:</strong> ${data.property.title}</p>
            <p><strong>Location:</strong> ${data.property.location}</p>
          </div>
          <p>Please contact your agent or property manager to discuss renewal options or move-out procedures.</p>
          <p>Thank you for choosing RentEase.</p>
          <p>Best regards,<br>The RentEase Team</p>
        </div>
      `,
    },

    leaseApproved: {
      subject: 'Lease Agreement Approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Lease Agreement Approved</h2>
          <p>Dear ${data.user.username},</p>
          <p>Your lease agreement for the following property has been approved:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
            <p><strong>Property:</strong> ${data.property.title}</p>
            <p><strong>Location:</strong> ${data.property.location}</p>
            <p><strong>Lease Start Date:</strong> ${new Date(data.lease.startDate).toLocaleDateString()}</p>
            <p><strong>Lease End Date:</strong> ${new Date(data.lease.endDate).toLocaleDateString()}</p>
          </div>
          <p>Please ensure all necessary payments are made according to the lease agreement.</p>
          <p>Thank you for choosing RentEase.</p>
          <p>Best regards,<br>The RentEase Team</p>
        </div>
      `,
    },

    leaseRejected: {
      subject: 'Lease Agreement Rejected',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Lease Agreement Rejected</h2>
          <p>Dear ${data.user.username},</p>
          <p>Unfortunately, your lease agreement for the following property has been rejected:</p>
          <div style="background-color: #f5f5f5; padding: 15px; margin: 15px 0;">
            <p><strong>Property:</strong> ${data.property.title}</p>
            <p><strong>Location:</strong> ${data.property.location}</p>
            ${data.lease.rejectionReason ? `<p><strong>Reason:</strong> ${data.lease.rejectionReason}</p>` : ''}
          </div>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you for your interest in RentEase.</p>
          <p>Best regards,<br>The RentEase Team</p>
        </div>
      `,
    },

    verifyEmail: {
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Dear ${data.user.username},</p>
          <p>Please click the link below to verify your email address:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email/${data.token}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none;">Verify Email</a>
          <p>If you did not create an account, please ignore this email.</p>
          <p>Thank you for choosing RentEase.</p>
          <p>Best regards,<br>The RentEase Team</p>
        </div>
      `,
    },
  };

  return templates[type] || null;
};