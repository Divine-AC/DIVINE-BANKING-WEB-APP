const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const verifyToken = require('../middleware/auth');

// Path becomes: http://localhost:2000/api/v1/accounts/balance
router.get('/accounts/balance', verifyToken, accountController.getBalance);
router.post('/accounts', verifyToken, accountController.createAccount);
router.get('/accounts', verifyToken, accountController.getAllAccounts);

module.exports = router;
