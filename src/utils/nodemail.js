const nodemailer = require("nodemailer")

exports.sendEmail = async (to, template) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: template.subject,
    html: template.html,
  });
};


