const bcrypt = require("bcryptjs");

module.exports = {
  encryptData: async function (data) {
    try {
      if (typeof data !== "string") {
        throw new Error("Wrong data type");
      }
      const salt = await bcrypt.genSalt();
      return bcrypt.hash(data, salt);
    } catch (error) {
      throw error;
    }
  },
  verifyData: async function (data, encryptedData) {
    try {
      if (typeof data !== "string") {
        throw new Error("Wrong data type");
      }

      return bcrypt.compare(data, encryptedData);
    } catch (error) {
      throw error;
    }
  },
};
