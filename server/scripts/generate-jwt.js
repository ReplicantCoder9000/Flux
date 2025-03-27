/**
 * Script to generate a JWT token for testing purposes
 * 
 * Usage: node scripts/generate-jwt.js
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables
const secret = process.env.JWT_SECRET || 'defaultsecretkey';
const expiration = process.env.JWT_EXPIRATION || '2h';

// Create a test user
const testUser = {
  _id: '65f5e1234567890123456789', // Fake MongoDB ObjectId
  username: 'testuser',
  email: 'test@example.com'
};

// Sign the token
const token = jwt.sign(
  { data: testUser },
  secret,
  { expiresIn: expiration }
);

// Output the token
console.log('\n=== JWT Token for Testing ===\n');
console.log(token);
console.log('\n=== Token Details ===\n');
console.log('User:', testUser);
console.log('Expiration:', expiration);
console.log('\n=== Usage ===\n');
console.log('1. Copy this token');
console.log('2. In your browser console, run:');
console.log('   localStorage.setItem("token", "[PASTE_TOKEN_HERE]")');
console.log('3. Refresh the page to be logged in as the test user\n');