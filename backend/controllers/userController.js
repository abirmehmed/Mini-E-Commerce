// controllers/userController.js
const pool = require('../db');

const getUserProfile = async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT id, email, fullName, streetAddress, city, zipCode, state, phone FROM users WHERE id = ?',
      [req.params.userId]
    );
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user[0]);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at 
       FROM orders o
       WHERE o.customer_id = ? 
       ORDER BY o.created_at DESC`,
      [req.params.userId]
    );
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user orders', error: err.message });
  }
};

module.exports = {
  getUserProfile,
  getUserOrders
};