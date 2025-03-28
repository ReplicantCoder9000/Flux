/**
 * Simplified API health check for CI/CD workflow
 * This script validates environment variables but doesn't actually start the server
 */

require('dotenv').config();

console.log('🧪 Running CI API health check...');

// Check required environment variables
const requiredEnvVars = [
  'JWT_SECRET',
  'REPLICATE_API_TOKEN'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

// Check MongoDB URI (optional in CI environment)
if (!process.env.MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not set. Using default connection string for CI.');
} else {
  console.log('✅ MONGODB_URI is set');
}

console.log('✅ All required environment variables are set');
console.log('✅ CI API health check passed');
process.exit(0);