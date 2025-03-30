const express = require("express");
const router = express.Router();
const Session = require("../models/session")
const {
  createSession,
  getUserSessions,
} = require("../controllers/sessionController");

// Create a new session
router.post("/create", createSession);

// Get all sessions for a user
router.get("/user/:userId", getUserSessions);

// Get monthly sessions for a user
router.get("/user/:userId/monthly", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);

    const sessions = await Session.find({
      userId,
      endTime: { $gte: twelveMonthsAgo },
    }).sort({ endTime: 1 });

    const currentMonth = new Date().getMonth();
    const months = Array.from({ length: 12 }, (_, i) => {
      const monthIndex = (currentMonth + 1 + i) % 12;
      return new Date(2024, monthIndex, 1).toLocaleString('default', { month: 'long' });
    });

    const monthlyData = months.reduce((acc, month) => {
      acc[month] = { timeInvested: 0, successfulSessions: 0 };
      return acc;
    }, {});

    sessions.forEach(session => {
      const monthName = new Date(session.endTime).toLocaleString('default', { month: 'long' });
      if (monthlyData[monthName] && session.sessionSuccess) {
        monthlyData[monthName].timeInvested += session.sessionTime || 0;
        monthlyData[monthName].successfulSessions += 1;
      }
    });

    const orderedData = months.map(month => ({
      month,
      timeInvested: monthlyData[month].timeInvested
    }));

    res.json(orderedData);
  } catch (error) {
    console.error("Error fetching monthly sessions:", error);
    res.status(500).json({ error: "Failed to fetch monthly sessions" });
  }
});

// Get weekly sessions for a user
router.get("/user/:userId/weekly", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + (startOfWeek.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const sessions = await Session.find({
      userId,
      endTime: { $gte: startOfWeek },
    }).sort({ endTime: 1 });

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dailyData = days.reduce((acc, day) => {
      acc[day] = { timeInvested: 0, successfulSessions: 0 };
      return acc;
    }, {});

    sessions.forEach(session => {
      const dayIndex = new Date(session.endTime).getDay();
      const dayName = days[dayIndex === 0 ? 6 : dayIndex - 1];
      if (session.sessionSuccess) {
        dailyData[dayName].timeInvested += session.sessionTime || 0;
        dailyData[dayName].successfulSessions += 1;
      }
    });

    const orderedData = days.map(day => ({
      day,
      timeInvested: dailyData[day].timeInvested
    }));

    res.json(orderedData);
  } catch (error) {
    console.error("Error fetching weekly sessions:", error);
    res.status(500).json({ error: "Failed to fetch weekly sessions" });
  }
});

// Get hourly sessions for a user
router.get("/user/:userId/hourly", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const sessions = await Session.find({
      userId,
      endTime: { $gte: last24Hours },
    }).sort({ endTime: 1 });

    const hourlyData = Array.from({ length: 24 }, (_, index) => ({
      hour: index,
      timeInvested: 0,
      successfulSessions: 0
    }));

    sessions.forEach(session => {
      if (session.sessionSuccess && session.endTime) {
        const sessionHour = new Date(session.endTime).getHours();
        hourlyData[sessionHour].timeInvested += session.sessionTime || 0;
        hourlyData[sessionHour].successfulSessions += 1;
      }
    });

    res.json(hourlyData);
  } catch (error) {
    console.error("Error fetching hourly sessions:", error);
    res.status(500).json({ error: "Failed to fetch hourly sessions" });
  }
});

module.exports = router;
