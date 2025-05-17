const pool = require('../db');

const checkout = async (req, res) => {
  const { customer_id, items } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.query(
      'INSERT INTO Orders (customer_id, total_amount) VALUES (?, ?)',
      [customer_id, items.reduce((total, item) => total + item.price * item.quantity, 0)]
    );

    for (const item of items) {
      await connection.query(
        'INSERT INTO Order_Items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.product_id, item.quantity, item.price]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ message: 'Order placed successfully', order_id: orderResult.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to place order', error: err.message });
  }
};

module.exports = { checkout };