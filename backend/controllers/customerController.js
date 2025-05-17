const pool = require('../db');

const getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Customers');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch customers', error: err.message });
  }
};

const addCustomer = async (req, res) => {
  const { user_id, first_name, last_name, email, phone, address } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO Customers (user_id, first_name, last_name, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, first_name, last_name, email, phone, address]
    );
    res.json({ message: 'Customer added successfully', customer_id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add customer', error: err.message });
  }
};

module.exports = { getCustomers, addCustomer };