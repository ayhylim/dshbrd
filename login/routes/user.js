const express = require("express");
const router = express.Router();

const {login, register, dashboard, getAllUsers} = require("../controllers/user");
const authMiddleware = require("../middleware/auth");
const authorizeRoles = require("../middleware/role");

router.route("/login").post(login);
router.route("/register").post(register);

// contoh hanya bisa diakses oleh purchasing dan marketing
router.route("/dashboard").get(authMiddleware, authorizeRoles("purchasing", "marketing"), dashboard);

// hanya admin atau purchasing bisa lihat semua user
router.route("/users").get(authMiddleware, authorizeRoles("purchasing"), getAllUsers);

module.exports = router;
