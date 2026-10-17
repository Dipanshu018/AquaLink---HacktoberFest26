const mongoose = require('mongoose');

const tankerSchema = new mongoose.Schema({
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  area: { type: String, required: true },
  capacityLiters: { type: Number, required: true },
  priceINR: { type: Number, required: true },
  isVerified: { type: Boolean, default: false }, // Requires admin approval
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tanker', tankerSchema);