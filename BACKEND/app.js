const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const bankingRoutes = require('./routes/bankingRoutes');

const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

connectDB();

// Route Mounts
app.use('/api/v1', authRoutes);
app.use('/api/v1', accountRoutes);
app.use('/api/v1/banking', bankingRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Digital Banking Server active on port ${PORT}`);
});