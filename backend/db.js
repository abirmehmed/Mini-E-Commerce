const mysql = require('mysql2/promise');
require('dotenv').config();

// Check if required environment variables are set
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  throw new Error('Database configuration is missing in environment variables');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection
pool.getConnection()
  .then((connection) => {
    console.log('Connected to the database');
    connection.release();
  })
  .catch((err) => {
    console.error('Failed to connect to the database:', err);
    process.exit(1); 
  });

module.exports = pool;