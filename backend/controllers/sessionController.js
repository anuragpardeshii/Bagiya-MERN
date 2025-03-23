const Session = require("../models/session");

// Create a new session record
const createSession = async (req, res) => {
  try {
    const { userId, sessionTime, sessionSuccess, startTime, endTime } = req.body;

    if (!userId || !sessionTime || sessionSuccess === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const session = new Session({
      userId,
      sessionTime,
      sessionSuccess,
      startTime,
      endTime,
    });

    await session.save();
    res.status(201).json({ message: "Session recorded successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Error recording session", error: error.message });
  }
};

// Get session history for a user
const getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Session.find({ userId }).sort({ startTime: -1 });

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching sessions", error: error.message });
  }
};

module.exports = { createSession, getUserSessions };
