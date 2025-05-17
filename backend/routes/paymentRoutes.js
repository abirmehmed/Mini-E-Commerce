// routes/paymentRoutes.js
const express = require('express');
const {
  addPaymentMethod,
  getCustomerPaymentMethods,
  setDefaultPaymentMethod
} = require('../controllers/paymentController');

const router = express.Router();

// Add a new payment method
router.post('/', addPaymentMethod);

// Get all payment methods for a customer
router.get('/customer/:customer_id', getCustomerPaymentMethods);

// Set default payment method
router.patch('/:payment_id/set-default/customer/:customer_id', setDefaultPaymentMethod);

module.exports = router;