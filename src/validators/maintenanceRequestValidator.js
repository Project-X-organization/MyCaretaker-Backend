const { check } = require("express-validator");

exports.submit_Maintenance_Request_Validator = [
  check("propertyId")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("PropertyId Required!"),
  check("userId")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("User id is Required!"),
  check("title").trim().notEmpty().isString().withMessage("Title is required!"),
  check("description")
    .trim()
    .notEmpty()
    .isString()
    .withMessage("Description is Required!"),
];
