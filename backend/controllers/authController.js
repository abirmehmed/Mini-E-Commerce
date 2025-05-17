// controllers/authController.js
const db = require('../db');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');

// Helper function to safely format user data
const formatUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  streetAddress: user.streetAddress,
  city: user.city,
  state: user.state,
  zipCode: user.zipCode,
  phone: user.phone,
  role: user.role,
  createdAt: user.created_at
});

module.exports = {
  signup: async (req, res) => {  
    try {
      const { email, password, fullName, streetAddress, city, state, zipCode, phone } = req.body;

const [result] = await db.execute(
  'INSERT INTO users (email, password, fullName, streetAddress, city, state, zipCode, phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  [email, hashedPassword, fullName, streetAddress, city, state, zipCode, phone]
);
      
      const token = generateToken({ userId: result.insertId });
      res.status(201).json({ 
        token, 
        user: formatUserResponse({ 
          id: result.insertId, 
          email,
          fullName,
          created_at: new Date() 
        }) 
      });
    } catch (error) {
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  signin: async (req, res) => {
    try {
      const { email, password } = req.body;
      const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      
      const user = users[0];
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = generateToken({ userId: user.id });
      res.json({
        token,
        user: formatUserResponse(user)
      });
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  },

  getCurrentUser: async (req, res) => {
    try {
      const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!users.length) return res.status(404).json({ error: 'User not found' });
      
      res.json({ 
        user: formatUserResponse(users[0]) 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const [existing] = await db.execute('SELECT 1 FROM users WHERE id = ?', [req.user.id]);
      if (!existing.length) return res.status(404).json({ error: 'User not found' });

      const { fullName, streetAddress, city, state, zipCode, phone } = req.body;
      await db.execute(
        'UPDATE users SET fullName = ?, streetAddress = ?, city = ?, state = ?, zipCode = ?, phone = ? WHERE id = ?',
        [fullName, streetAddress, city, state, zipCode, phone, req.user.id]
      );
      
      // Return updated user data
      const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);
      res.json({ 
        message: 'Profile updated successfully',
        user: formatUserResponse(users[0])
      });
    } catch (error) {
      res.status(500).json({ error: 'Update failed' });
    }
  },

  logout: async (req, res) => {
    res.json({ message: 'Logged out successfully' });
  }
};