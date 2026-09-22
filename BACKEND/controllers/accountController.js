const Account = require('../models/Account');
const User = require('../models/User');

// POST /api/v1/accounts - Create bank account pre-funded with ₦15,000
exports.createAccount = async (req, res) => {
  try {
    const { userId } = req.body;

    // Check user verification status
    const user = await User.findById(userId);
    if (!user || !user.isOnboarded) {
      return res.status(400).json({ message: 'User must complete BVN/NIN onboarding first.' });
    }

    // Enforce 1 account limit per customer
    const existing = await Account.findOne({ userId });
    if (existing) {
      return res.status(400).json({ message: 'Account creation limit reached (Max 1 account per user).' });
    }

    // Generate random 10-digit account number
    const accountNumber = '01' + Math.floor(10000000 + Math.random() * 90000000);

    const account = new Account({
      userId,
      accountNumber,
      balance: 15000 // Pre-funded with N15,000
    });

    await account.save();
    res.status(201).json({ message: 'Account created and pre-funded with ₦15,000', account });
  } catch (error) {
    res.status(500).json({ message: 'Account creation error', error: error.message });
  }
};

// GET /api/v1/accounts/balance - Return active user's balance
// GET /api/v1/accounts/balance - Return authenticated user's balance

exports.getBalance = async (req, res) => {
  try {
    let account = await Account.findOne({ userId: req.user.id });

    // Auto-create pre-funded account if none exists
    if (!account) {
      const accountNumber = '01' + Math.floor(10000000 + Math.random() * 90000000);
      account = new Account({
        userId: req.user.id,
        accountNumber,
        balance: 15000
      });
      await account.save();
    }

    return res.status(200).json({
      accountNumber: account.accountNumber,
      balance: account.balance
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


exports.getAllAccounts = async (req, res) => {
  try {
    const accounts = await Account.find();
    return res.status(200).json({ accounts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
