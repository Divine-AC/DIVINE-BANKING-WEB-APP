const express = require('express');
const router = express.Router();
const bankingController = require('../controllers/bankingController');
const verifyToken = require('../middleware/auth');

// Since app.js already mounts this at /api/v1/banking, use relative paths here:
router.post('/set-pin', verifyToken, bankingController.setTransactionPin);
router.post('/name-enquiry', verifyToken, bankingController.nameEnquiry);
router.post('/transfer', verifyToken, bankingController.transferFunds);
router.get('/transactions', verifyToken, bankingController.getTransactionHistory);

module.exports = router;
