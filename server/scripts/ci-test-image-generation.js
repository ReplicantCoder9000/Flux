/**
 * Simplified test script for CI/CD workflow
 * This script checks if the REPLICATE_API_TOKEN is set but doesn't make actual API calls
 */

require('dotenv').config();

// Get Replicate API token from environment variables
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;

console.log('🧪 Running CI test for image generation...');

// Check if API token is available
if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN is not set in environment variables');
  process.exit(1);
}

// Validate token format (Replicate tokens typically start with "r8_")
if (!REPLICATE_API_TOKEN.startsWith('r8_')) {
  console.error('❌ REPLICATE_API_TOKEN does not appear to be in the correct format');
  console.error('Expected format: r8_XXXXXXXXXX');
  process.exit(1);
}

console.log('✅ REPLICATE_API_TOKEN is set and appears to be in the correct format');
console.log('✅ CI test for image generation passed');
process.exit(0);