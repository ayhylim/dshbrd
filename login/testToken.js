// test-token.js
const jwt = require("jsonwebtoken");

const token = jwt.sign(
    {
        id: "69016b88c5a790a8ae3986e3",
        name: "kris dua",
        role: "warehouse"
    },
    process.env.JWT_SECRET || "your_secret_key",
    {expiresIn: "30d"}
);

console.log("Generated Token:", token);

const decoded = jwt.decode(token);
console.log("Decoded:", decoded);
