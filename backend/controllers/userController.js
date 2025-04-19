const mongoose = require("mongoose");
const User = require("../models/User");

const getBalance = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return both balance and trees count
    res.json({ 
      success: true, 
      balance: user.wallet.balance,
      trees: user.wallet.trees || 0 // Include trees count, default to 0 if not present
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Using select('+password') to include password field if it's set to select: false in the schema
    // Using populate to get any referenced data if needed
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return all user data
    res.json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
    try {
      const { userId } = req.params;
      const { username, name, email, phone, bio, dob } = req.body;
  
      // Required fields validation
      if (!username || !name || !email) {
        return res.status(400).json({
          message: "Username, Name, and Email are required fields",
        });
      }
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { username, name, email, phone, bio, dob },
        { new: true, runValidators: true }
      );
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  };
  

module.exports = { getBalance, getUser, updateUser };
