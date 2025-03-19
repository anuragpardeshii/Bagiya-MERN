const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Signup Controller
const signup = async (req, res) => {
  try {
    const { name, username, phone, email, password } = req.body;

    // Validate required fields
    if (!name || !username || !phone || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists (by email OR username)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or Username already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const newUser = new User({
      name,
      username,
      phone,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login Controller
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Store user session
    req.session.user = { id: user._id, name: user.name, email: user.email };

    res.cookie("auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({ message: "Login successful", user: req.session.user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Check Authentication Controller
const checkAuth = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json(req.session.user);
};

// Logout Controller
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid", { path: "/" }); // Adjust the cookie name if necessary
    return res.json({ message: "Logout successful" });
  });
};

module.exports = { signup, login, checkAuth, logout };
