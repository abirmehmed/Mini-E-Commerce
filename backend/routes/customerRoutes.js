const express = require('express');
const { getCustomers, addCustomer } = require('../controllers/customerController');

const router = express.Router();

router.get('/customers', getCustomers);
router.post('/customers', addCustomer);

module.exports = router;