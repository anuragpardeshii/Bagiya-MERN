const express = require("express");
const { signup, login, checkAuth, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/check-auth", checkAuth);
router.post("/logout", logout);

module.exports = router;
