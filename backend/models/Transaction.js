const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  endpointId: String,
  threatType: String,
  severity: String,
  action: String,
  details: mongoose.Schema.Types.Mixed, // To store all flexible transaction data
  riskScore: Number,
  ipAddress: String,
  location: String,
  isFlagged: Boolean
});

module.exports = mongoose.model('Transaction', transactionSchema);
