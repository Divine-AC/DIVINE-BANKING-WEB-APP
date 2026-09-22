const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Helper to reliably get user ID from JWT payload
const getUserId = (req) => req.user?.id || req.user?.userId || req.user?._id;

// POST /api/v1/banking/name-enquiry
exports.nameEnquiry = async (req, res) => {
  try {
    const { accountNumber } = req.body;
    if (!accountNumber) {
      return res.status(400).json({ message: 'Account number is required.' });
    }

    const account = await Account.findOne({ accountNumber }).populate('userId', 'fullName');
    if (!account) {
      return res.status(404).json({ message: 'Recipient account not found.' });
    }

    return res.status(200).json({
      accountNumber: account.accountNumber,
      fullName: account.userId?.fullName || 'Account Holder'
    });
  } catch (error) {
    console.error('Name Enquiry Error:', error);
    return res.status(500).json({ message: 'Name enquiry failed', error: error.message });
  }
};

// POST /api/v1/banking/set-pin
exports.setTransactionPin = async (req, res) => {
  try {
    const { newPin, currentPassword } = req.body;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    if (!newPin || newPin.length !== 4 || isNaN(newPin)) {
      return res.status(400).json({ message: 'PIN must be a 4-digit number.' });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: 'Account password is required.' });
    }

    // Force Mongoose to return the hashed password field
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Incorrect account password.' });
    }

    // Hash and save new PIN
    const salt = await bcrypt.genSalt(10);
    user.pin = await bcrypt.hash(newPin, salt);
    await user.save();

    return res.status(200).json({ message: 'Transaction PIN set successfully.' });
  } catch (error) {
    console.error('Set PIN Error:', error);
    return res.status(500).json({ message: 'Failed to update PIN', error: error.message });
  }
};


// POST /api/v1/banking/transfer
exports.transferFunds = async (req, res) => {
  try {
    const { recipientAccountId, amount, narration, pin } = req.body;
    const transferAmount = Number(amount);
    const userId = getUserId(req);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // PIN check logic (falls back to '1234' if PIN hasn't been configured)
    if (user.pin) {
      const isPinValid = await bcrypt.compare(pin, user.pin);
      if (!isPinValid) {
        return res.status(400).json({ message: 'Invalid Transaction PIN.' });
      }
    } else {
      if (pin !== '1234') {
        return res.status(400).json({ message: 'Invalid Transaction PIN. (Default is 1234)' });
      }
    }

    if (!recipientAccountId || isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ message: 'Invalid transfer amount or account number.' });
    }

    const senderAccount = await Account.findOne({ userId });
    if (!senderAccount) {
      return res.status(404).json({ message: 'Sender account not found.' });
    }

    if (senderAccount.balance < transferAmount) {
      return res.status(400).json({ message: 'Insufficient funds.' });
    }

    if (senderAccount.accountNumber === recipientAccountId) {
      return res.status(400).json({ message: 'Cannot transfer funds to your own account.' });
    }

    const recipientAccount = await Account.findOne({ accountNumber: recipientAccountId });
    if (!recipientAccount) {
      return res.status(404).json({ message: 'Recipient account not found.' });
    }

    // Execute transfer balance changes
    senderAccount.balance -= transferAmount;
    recipientAccount.balance += transferAmount;

    await senderAccount.save();
    await recipientAccount.save();

    const reference = `TX${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    const transaction = new Transaction({
      senderAccountId: senderAccount._id,
      recipientAccountId: recipientAccount.accountNumber,
      type: 'INTRA',
      amount: transferAmount,
      narration: narration || 'Funds Transfer',
      status: 'SUCCESS',
      reference
    });

    await transaction.save();

    return res.status(200).json({
      message: 'Transfer completed successfully',
      newBalance: senderAccount.balance,
      transaction
    });
  } catch (error) {
    console.error('Transfer Error:', error);
    return res.status(500).json({ message: 'Transfer failed', error: error.message });
  }
};

// GET /api/v1/banking/transactions
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const account = await Account.findOne({ userId }).populate('userId', 'fullName');
    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const history = await Transaction.find({
      $or: [
        { senderAccountId: account._id },
        { recipientAccountId: account.accountNumber }
      ]
    })
      .populate({
        path: 'senderAccountId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ createdAt: -1 });

    const recipientAccountNumbers = [...new Set(history.map((tx) => tx.recipientAccountId))];
    const recipientAccounts = await Account.find({ accountNumber: { $in: recipientAccountNumbers } }).populate('userId', 'fullName');

    const recipientMap = {};
    recipientAccounts.forEach((acc) => {
      recipientMap[acc.accountNumber] = acc.userId?.fullName || 'Account Holder';
    });

    const formattedHistory = history.map((tx) => {
      const isDebit = tx.senderAccountId?._id?.toString() === account._id.toString();
      const recipientName = recipientMap[tx.recipientAccountId] || tx.recipientAccountId;
      const senderName = tx.senderAccountId?.userId?.fullName || 'Transfer';

      return {
        _id: tx._id,
        reference: tx.reference,
        amount: tx.amount,
        narration: tx.narration,
        txType: isDebit ? 'DEBIT' : 'CREDIT',
        accountRef: isDebit ? `To: ${recipientName}` : `From: ${senderName}`,
        date: tx.createdAt
      };
    });

    return res.status(200).json({ history: formattedHistory });
  } catch (error) {
    console.error('Get History Error:', error);
    return res.status(500).json({ message: 'Failed to retrieve transactions', error: error.message });
  }
};