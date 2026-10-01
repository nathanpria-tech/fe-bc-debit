const express = require("express");
const router = express.Router();

const { register, login, getProfile, logout } = require("../controller/AuthController");
const authMiddleware = require("../middleware/AuthMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getProfile);
router.post("/logout", authMiddleware, logout);

module.exports = router;
