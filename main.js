const crypto = require ("node:crypto")
const  randSecretKey = crypto.randomBytes(20).toString("hex")

console.log(randSecretKey)