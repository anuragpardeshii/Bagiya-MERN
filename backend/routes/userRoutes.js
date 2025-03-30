const express = require("express");
const { getBalance, getUser, updateUser } = require("../controllers/userController");

const router = express.Router();

router.get("/balance/:userId", getBalance);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);

module.exports = router;