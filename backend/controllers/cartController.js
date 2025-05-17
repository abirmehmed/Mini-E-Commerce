let cart = [];

const addToCart = (req, res) => {
  const { product_id, quantity } = req.body;
  const product = { product_id, quantity };
  cart.push(product);
  res.json({ message: 'Product added to cart', cart });
};

module.exports = { addToCart };