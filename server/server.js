// Flux Image Generator API Server
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

// Set up CORS with options
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  formatError: (err) => {
    // Log server-side errors to the console
    if (err.originalError) {
      console.error(err);
    }
    return err;
  },
});

// Start Apollo Server and apply middleware
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });

  // If in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    // Handle API routes only, no static file serving
    app.get('*', (req, res) => {
      res.status(404).json({ message: 'API endpoint not found' });
    });
  }

  // Start server after database connection
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🚀 API server running on port ${PORT}!`);
      console.log(`🌍 GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize server
startApolloServer();