// routes/userRoutes.js
const express = require('express');
const { getUserProfile, getUserOrders } = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware'); 

const router = express.Router();

// Protected routes
router.get('/:userId', authenticate, getUserProfile);
router.get('/:userId/orders', authenticate, getUserOrders);

module.exports = router;