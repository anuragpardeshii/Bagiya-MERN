const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

// Get all challenges for the user
router.get('/', async (req, res) => {
  try {
    // Remove the user-specific filter to show all challenges
    const challenges = await Challenge.find();
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Redeem a challenge
router.post('/redeem/:id', async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    if (challenge.isRedeemed) {
      return res.status(400).json({ success: false, message: 'Challenge already redeemed' });
    }

    challenge.isRedeemed = true;
    await challenge.save();

    res.json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;