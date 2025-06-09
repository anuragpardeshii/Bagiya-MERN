const User = require("../models/User");
const Transaction = require("../models/transaction");

const rewardUser = async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({ 
        success: false,
        message: "User ID and amount are required" 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Ensure wallet exists
    if (!user.wallet) {
      user.wallet = { balance: 0, transactions: [] };
    }

    // Create transaction
    const transaction = new Transaction({
      user: user._id,
      amount: amount,
      type: 'earn',
      description: 'Reward earned'
    });
    await transaction.save();

    // Update user wallet
    user.wallet.balance += amount;
    if (!user.wallet.transactions) {
      user.wallet.transactions = [];
    }
    user.wallet.transactions.push(transaction._id);
    await user.save();

    res.json({
      success: true,
      message: "Coins rewarded successfully",
      balance: user.wallet.balance,
      transaction: transaction
    });
  } catch (error) {
    console.error("Error in rewardUser:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

const spendCoins = async (req, res) => {
  const { userId, amount, type } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ 
      success: false,
      message: "User ID and amount are required" 
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0"
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (!user.wallet || user.wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient balance" 
      });
    }

    // Create transaction
    const transaction = new Transaction({
      user: user._id,
      amount: -amount,
      type: 'spend',
      description: type || 'Coin spend'
    });
    await transaction.save();

    // Update user wallet
    user.wallet.balance -= amount;
    if (type === 'TREE_PLANTING') {
      user.wallet.trees = (user.wallet.trees || 0) + 1;
    }
    
    if (!user.wallet.transactions) {
      user.wallet.transactions = [];
    }
    user.wallet.transactions.push(transaction._id);
    await user.save();

    res.json({
      success: true,
      balance: user.wallet.balance,
      trees: user.wallet.trees,
      transaction: transaction
    });
  } catch (error) {
    console.error("Error in spendCoins:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const transactions = await Transaction.find({ user: userId }).populate('user', 'name email');
    
    if (!transactions) {
      return res.status(404).json({ success: false, message: "No transactions found" });
    }

    res.json({
      success: true,
      transactions: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { rewardUser, spendCoins, getTransactions };
