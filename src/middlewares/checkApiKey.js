const dotenv = require("dotenv");

dotenv.config();

exports.check_api_key = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  req.user = req.user || {};

  console.log(req.headers)
  if (!apiKey ) {
    return res.status(401).json({ message: "api key not found" });
  }
  if (apiKey === process.env.ADMIN_API_KEY) {
    console.log(req.user);
    req.user.role = "admin";
  } else if (apiKey === process.env.USER_API_KEY) {
    req.user.role = "user";
  } else if (apiKey === process.env.AGENT_API_KEY) {
    req.user.role = "agent";
  } else {
    return res.status(401).json({ message: "Unauthorized or invalid Api key!" });
  }

  next();
};
const verifyRole = (role, apiKeyEnvVar) => {
  return (req, res, next) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ message: "API key not found" });
    }

    if (apiKey === process.env[apiKeyEnvVar]) {
      req.user = req.user || {};
      req.user.role = role;
      return next();
    }

    return res.status(401).json({ message: "Unauthorized or invalid Api key!" });
  };
};

exports.ADMIN_KEY = verifyRole("admin", "ADMIN_API_KEY");
exports.USER_KEY = verifyRole("tenant", "USER_API_KEY");
exports.AGENT_KEY = verifyRole("agent", "AGENT_API_KEY");
