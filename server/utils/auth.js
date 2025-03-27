const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get JWT secret and expiration from environment variables
const secret = process.env.JWT_SECRET || 'defaultsecretkey';
const expiration = process.env.JWT_EXPIRATION || '2h';

module.exports = {
  // Function to sign token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
  
  // Middleware for authentication
  authMiddleware: function ({ req }) {
    // Allows token to be sent via req.body, req.query, or headers
    let token = req.body.token || req.query.token || req.headers.authorization;

    // If token is in headers, extract it
    if (req.headers.authorization) {
      token = token.split(' ').pop().trim();
    }

    // If no token, return request object as is
    if (!token) {
      return req;
    }

    try {
      // Verify token and extract user data
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err) {
      console.log('Invalid token:', err.message);
    }

    // Return updated request object
    return req;
  },
  
  // Check if user is authenticated
  isAuthenticated: function (context) {
    if (!context.user) {
      throw new Error('You need to be logged in to perform this action');
    }
    return true;
  }
};