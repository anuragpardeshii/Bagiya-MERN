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

        res.json({ success: true, balance: user.wallet.balance });
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

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { name, username, phone, email, bio, dob, profilePicture } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name;
        user.username = username;
        user.phone = phone;
        user.email = email;
        user.bio = bio;
        user.dob = dob;

        if (profilePicture) {
            user.profilePicture = profilePicture;
        }

        await user.save();
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: error.message });
    }
};


module.exports = { getBalance, getUser, updateUser };
