// catagoryController.js 
const pool = require('../db');

const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

module.exports = { getCategories }; 