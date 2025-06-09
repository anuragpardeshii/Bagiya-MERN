const express = require("express");
const { rewardUser, spendCoins, getTransactions } = require("../controllers/transactionController");

const router = express.Router();

router.post("/reward", rewardUser);
router.post("/spend", spendCoins);
router.get("/:userId", getTransactions);

module.exports = router;
