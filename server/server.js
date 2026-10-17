const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const cors = require('cors');
const Tanker = require('./models/Tanker');
require('dotenv').config();

// Import Database Models
const Supplier = require('./models/Supplier');
const Booking = require('./models/Booking');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB!'))
  .catch((err) => console.error('MongoDB connection error:', err));


// ==========================================
// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// SIGNUP (Handles both Customers and Suppliers)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { role, name, email, password, ...otherData } = req.body;
    
    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === 'supplier') {
      const newSupplier = new Supplier({ 
        name, email, password: hashedPassword, ...otherData, isVerified: false 
      });
      await newSupplier.save();
      return res.status(201).json({ message: 'Supplier registered. Pending verification.' });
    } else {
      const newUser = new User({ 
        name, email, password: hashedPassword, defaultArea: otherData.defaultArea 
      });
      await newUser.save();
      return res.status(201).json({ message: 'Customer registered successfully.' });
    }
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or invalid data.' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check which database collection to search based on the role they select
    const account = role === 'supplier' 
      ? await Supplier.findOne({ email }) 
      : await User.findOne({ email });

    if (!account) return res.status(404).json({ error: 'Account not found.' });

    // Verify password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    // Generate login token
    const token = jwt.sign({ id: account._id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    
    res.json({ token, role, name: account.name, id: account._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// API ROUTES
// GET A SUPPLIER'S OWN TANKERS
app.get('/api/tankers/supplier/:id', async (req, res) => {
  try {
    const tankers = await Tanker.find({ supplierId: req.params.id });
    res.json(tankers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET A SUPPLIER'S CUSTOMER ORDERS
app.get('/api/bookings/supplier/:id', async (req, res) => {
  try {
    const bookings = await Booking.find({ supplierId: req.params.id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ==========================================

// 1. REGISTER A SUPPLIER (Customer/Admin portal)
app.post('/api/suppliers', async (req, res) => {
  try {
    const newSupplier = new Supplier({ ...req.body, isVerified: false });
    await newSupplier.save();
    res.status(201).json({ message: 'Supplier registered successfully. Pending verification.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADD A NEW TANKER (Supplier Dashboard)
// GET VERIFIED TANKERS (With Filtering for Customers)
app.get('/api/tankers', async (req, res) => {
  try {
    const { area, minCapacity, maxPrice } = req.query;
    let query = { isVerified: true };

    // Apply filters if the user provides them
    if (area) query.area = { $regex: area, $options: 'i' }; // Case-insensitive search
    if (minCapacity) query.capacityLiters = { $gte: Number(minCapacity) };
    if (maxPrice) query.priceINR = { $lte: Number(maxPrice) };

    const tankers = await Tanker.find(query).sort({ priceINR: 1 });
    res.json(tankers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL VERIFIED TANKERS (Homepage)
// ADD A NEW TANKER (Supplier Dashboard)
app.post('/api/tankers', async (req, res) => {
  try {
    const newTanker = new Tanker(req.body);
    await newTanker.save();
    res.status(201).json({ message: 'Tanker added! Pending verification.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// 2. SEARCH VERIFIED SUPPLIERS (Customer App)
app.get('/api/suppliers', async (req, res) => {
  try {
    const { area, minCapacity, maxPrice } = req.query;
    let query = { isVerified: true }; // Only show approved suppliers

    if (area) query.area = { $regex: area,$options: 'i' }; // Case-insensitive search
    if (minCapacity) query.capacityLiters = { $gte: Number(minCapacity) };
    if (maxPrice) query.priceINR = { $lte: Number(maxPrice) };

    const suppliers = await Supplier.find(query).sort({ rating: -1, priceINR: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CREATE A NEW BOOKING (Customer App)
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    const savedBooking = await newBooking.save();
    res.status(201).json({ message: 'Booking created successfully', bookingId: savedBooking._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. UPDATE BOOKING STATUS (Supplier Dashboard)
app.patch('/api/bookings/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );
    res.json(updatedBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});