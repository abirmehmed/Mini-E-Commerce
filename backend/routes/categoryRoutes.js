// categoryRoutes.js
const express = require('express');
const { getCategories } = require('../controllers/categoryController'); // Import the function

const router = express.Router();

// Use '/' instead of '/categories'
router.get('/', getCategories); // This will handle GET requests to /api/categories

module.exports = router;