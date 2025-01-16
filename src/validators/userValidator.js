const { check } = require("express-validator");

exports.userValidationRules = [
  check("username").notEmpty().withMessage("Username is Required").isString(),
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email"),
  check("password")
    .notEmpty()
    .withMessage("password is required")
    .isStrongPassword()
    .withMessage("Must be a strong password"),
  check("phoneNumber")
    .notEmpty()
    .withMessage("Phone Number is required")
    .isMobilePhone("any")
    .withMessage("Must be a valid phoneNumber"),
];

exports.loginValidationRule = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid Email"),
  check("password").notEmpty().withMessage("Password is required"),
];

exports.verificationRules = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid Email"),
  check("otp").notEmpty().withMessage("otp is required"),
];
