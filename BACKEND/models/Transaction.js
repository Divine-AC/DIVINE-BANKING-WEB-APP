const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    senderAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    recipientAccountId: { type: String, required: true },
    type: { type: String, enum: ['INTRA', 'INTER'], default: 'INTRA' },
    amount: { type: Number, required: true },
    narration: { type: String, default: 'Funds Transfer' },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'SUCCESS' },
    reference: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
