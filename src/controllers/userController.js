const { prisma } = require("../utils/prismaUtill");
const { encryptData } = require("../utils/bcrypt");
const { generateOTP } = require("../utils/generateOtp");
const { sendEmail } = require("../utils/nodemail");
const jwt = require("jsonwebtoken");
const {
  applyForProperty,
  getPropertyApplications,
  allApplications,
  acceptOrRejectApplication,
} = require("../helpers/user.helper");
const roleModels = {
admin:  prisma.admin,
user: prisma.user,
agent:prisma.agent
}
exports.registerUser = async (req, res) => {
  const { username, email, password, phoneNumber } = req.body;
  const { role } = req.user;
  try {


    const model = roleModels[role]
    const isRegisterAlready = await model.findUnique({
      where: {
        email,
      },
    });

    if (!model) {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    if (isRegisterAlready) {
      return res.status(409).json({ message: "Email already registered." });
    }
    const hashedPassword = await encryptData(password);
    const verificationOtp = generateOTP();
    const verificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
const data = {
  
    username,
    email,
    password: hashedPassword,
    phoneNumber,
    verificationOtp,
    verificationOtpExpires,
    
  
}
   
    const user = await model.create({

      data
    });
    await sendEmail(
      email,
      "Verify your email",
      `Your verification code is: ${verificationOtp}`
    );
    delete user.password
    res.status(201).json({ message: ` ${role} registered successfully`,user });
  } catch (error) {
    
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  const role = req.user.role
  try {
    const model = roleModels[role]
    const user = await model.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.verificationOtp !== otp) {
     
      return res.status(400).json({ message: "Invalid OTP." });
    }
    if (user.verificationOtpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP has expired. Please request a new one." });
    }
    await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationOtp: null,
        verificationOtpExpires: null,
      },
    });
    // token
    const token = jwt.sign({ id: user.id , roles:req.user.role}, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ message: "Email verified successfully.", token });
  } catch (error) {
    
    res.status(500).json({ message: "Error verifying email." });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  const role = req.user.role
  
  try {
    const model = roleModels[role]
    const user = await model.findUnique({ 
      where: {
       email,
       
      } 
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    await prisma.user.update({
      where: { email },
      data: {
        verificationOtp: otp,
        verificationOtpExpires: otpExpires,
      },
    });
    await sendEmail(
      email,
      "New Verification OTP",
      `Your new OTP is: ${otp}. It will expire in 15 minutes.`
    );
    res.json({
      message: "New OTP sent. Please verify your email within 15 minutes.",
    });
  } catch (error) {
    
    res.status(500).json({ message: "Error resending OTP." });
  }
};

exports.loginUser = async (req, res) => {
  try {
    
    const token = jwt.sign({ id: req.user.id, roles:req.user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    delete req.user.password
    res.json({message:"user successfully logged in",user:req.user, token });
  } catch (error) {
    
    res.status(500).json({ message: "Error logging in user." });
  }
};

// For social login
exports.socialLogin = async (req, res) => {
  const { user, roles } = req.user;
  const token = jwt.sign(
    { id: user.id, email: user.email, roles },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  if (!user) {
    res.redirect("/login");
  }
  res.json({
    message: "Authentication successful!",
    token,
    user,
  });
};

exports.userProfile = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving user profile." });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    if (!users) {
      return res.status(404).json({ message: "No users found." });
    }
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users." });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = await prisma.user.update({
      where: {
        id,
      },
      data,
    });
    res.status(200).json({
      message: "User data updated!",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error Updating Users." });
  }
};

exports.deleteUser = async (req,res) =>{
  try {
    const {id} = req.params;
    const user = await prisma.user.delete({
      where:{
        id
      }
    })
    res.status(200).json({
      message: "User Succesfully deleted!",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting User." });
  }
}

exports.submitApplication = async (req, res) => {
  try {
    const { propertyId, landlordId, userId } = req.body;
    const application = await applyForProperty(propertyId, landlordId, userId);
    res.status(201).json({
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    
    res
      .status(500)
      .json({ message: "Error submitting application", error: error.message });
  }
};

exports.singlePropertyApplication = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const application = await getPropertyApplications(propertyId);
    res.status(200).json({
      message: "Application retrieved successfully",
      data: application,
    });
  } catch (error) {
    
    res
      .status(500)
      .json({ message: "Error retrieving application", error: error.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const applications = await allApplications();
    res.status(200).json({
      message: "Applications retrieved successfully",
      data: applications,
    });
  } catch (error) {
    
    res
      .status(500)
      .json({ message: "Error retrieving applications", error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const applcation = await acceptOrRejectApplication(applicationId, status);
    res.status(200).json({
      message: `Application status updated successfully`,
      data: applcation,
    });
  } catch (error) {
    
    res.status(500).json({
      message: "Error updating application status",
      error: error.message,
    });
  }
};
