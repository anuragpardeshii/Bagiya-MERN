const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes.js");
const transactionRoutes = require("./routes/transactionRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const morgan = require('morgan');
const sessionRoutes = require("./routes/sessionRoutes.js");
const challengesRoutes = require("./routes/challenges.js");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
const corsOptions = {
  origin: "http://localhost:5173", // Allow requests from frontend
  credentials: true, // Allow cookies & authentication headers
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan('dev')); 

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key_here", // Provide a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      cookie: { secure: false, httpOnly: true },
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/challenges", challengesRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
