const express = require('express');
const { addToCart } = require('../controllers/cartController');

const router = express.Router();

router.post('/cart', addToCart);

module.exports = router;