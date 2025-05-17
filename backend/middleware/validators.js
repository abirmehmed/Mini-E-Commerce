// middleware/validators.js
const { body, validationResult } = require('express-validator');

// SIGNUP VALIDATOR
const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// SIGNIN VALIDATOR
const validateSignin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// PROFILE UPDATE VALIDATOR
const validateProfileUpdate = [
  body('fullName').optional().trim(),
  body('streetAddress').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zipCode').optional().isPostalCode('any'),
  body('phone').optional().isMobilePhone(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// REFRESH TOKEN VALIDATOR
const validateRefresh = [
  body('refreshToken').notEmpty().isJWT(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validateSignup,
  validateSignin,
  validateProfileUpdate,
  validateRefresh
};