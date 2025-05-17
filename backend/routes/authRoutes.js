const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const {
  validateSignup,
  validateSignin,
  validateProfileUpdate
} = require('../middleware/validators');

const {
  signup,
  signin,
  getCurrentUser,
  updateProfile,
  logout
} = require('../controllers/authController');

const { authenticate } = require('../middleware/authMiddleware');

// Dynamic rate limiting
const dynamicLimiter = (windowMs = 15 * 60 * 1000, max = 20) => rateLimit({
  windowMs,
  max,
  handler: (req, res) => res.status(429).json({
    error: 'Rate limit exceeded',
    retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
  }),
  skip: req => req.method === 'OPTIONS'
});

// Public routes
router.post('/signup', 
  dynamicLimiter(),
  validateSignup,
  signup
);

router.post('/signin', 
  dynamicLimiter(15 * 60 * 1000, 10),
  validateSignin,
  signin
);

// Protected routes
router.use(authenticate);

router.route('/me')
  .get(getCurrentUser)
  .patch(validateProfileUpdate, updateProfile);

router.post('/logout', logout);

// Error handling
router.use((err, req, res, next) => {
  const status = err.status || 500;
  console.error(`Auth Error:`, err);
  res.status(status).json({
    error: status === 500 ? 'Authentication service error' : err.message
  });
});

module.exports = router;