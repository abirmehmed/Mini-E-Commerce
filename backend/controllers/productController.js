const pool = require('../db');

// Function to fetch all products
const getProducts = async (req, res) => {
  const { category, minPrice, maxPrice, minRating, search } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category_id = ?';
    params.push(category);
  }
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }
  if (minRating) {
    query += ' AND rating >= ?';
    params.push(minRating);
  }
  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }

  try {
    const [rows] = await pool.query(query, params);

    // Convert price and rating to numbers
    const products = rows.map(product => ({
      ...product,
      price: parseFloat(product.price), // Convert price to a number
      rating: parseFloat(product.rating), // Convert rating to a number
    }));

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// Function to fetch a single product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM products WHERE id = ?';
    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Convert price and rating to numbers
    const product = {
      ...rows[0],
      price: parseFloat(rows[0].price), // Convert price to a number
      rating: parseFloat(rows[0].rating), // Convert rating to a number
    };

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message });
  }
};

// Export the functions
module.exports = { getProducts, getProductById };