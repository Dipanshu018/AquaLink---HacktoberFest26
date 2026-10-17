const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // NEW
  password: { type: String, required: true },            // NEW
  phone: { type: String, required: true },
  area: { type: String, required: true },
  waterType: { type: String, default: 'Drinking / RO' },
  licenseNumber: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Supplier', supplierSchema);