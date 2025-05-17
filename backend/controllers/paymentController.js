// controllers/paymentController.js
const pool = require('../db');

const addPaymentMethod = async (req, res) => {
  const { customer_id, payment_method, card_type, last_four, expiry_date } = req.body;

  try {
    // In a real app, you'd get a payment token from a payment processor like Stripe
    const payment_token = `pm_${Math.random().toString(36).substring(2, 15)}`;
    
    const [result] = await pool.query(
      `INSERT INTO customer_payments 
       (customer_id, payment_token, payment_method, card_type, last_four, expiry_date) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [customer_id, payment_token, payment_method, card_type, last_four, expiry_date]
    );

    res.status(201).json({
      message: 'Payment method added successfully',
      payment_id: result.insertId
    });
  } catch (err) {
    console.error('Error adding payment method:', err);
    res.status(500).json({ message: 'Failed to add payment method', error: err.message });
  }
};

const getCustomerPaymentMethods = async (req, res) => {
  const { customer_id } = req.params;

  try {
    const [payments] = await pool.query(
      'SELECT * FROM customer_payments WHERE customer_id = ?',
      [customer_id]
    );

    res.json(payments);
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    res.status(500).json({ message: 'Failed to fetch payment methods', error: err.message });
  }
};

const setDefaultPaymentMethod = async (req, res) => {
  const { customer_id, payment_id } = req.params;

  try {
    await pool.query('BEGIN');

    // First, set all payment methods as non-default for this customer
    await pool.query(
      'UPDATE customer_payments SET is_default = 0 WHERE customer_id = ?',
      [customer_id]
    );

    // Then set the specified one as default
    const [result] = await pool.query(
      'UPDATE customer_payments SET is_default = 1 WHERE id = ? AND customer_id = ?',
      [payment_id, customer_id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Payment method not found or does not belong to customer');
    }

    await pool.query('COMMIT');
    res.json({ message: 'Default payment method updated successfully' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error setting default payment method:', err);
    res.status(500).json({ 
      message: 'Failed to set default payment method', 
      error: err.message 
    });
  }
};

module.exports = {
  addPaymentMethod,
  getCustomerPaymentMethods,
  setDefaultPaymentMethod
};