const express = require("express");
const router = express.Router();
const { createSession, getUserSessions } = require("../controllers/sessionController");

// Create a new session
router.post("/create", createSession);

// Get all sessions for a user
router.get("/user/:userId", getUserSessions);

module.exports = router;
