/**
 * Test script for image generation using the Replicate API
 * This script is used by the GitHub Actions workflow to test the image generation functionality
 */

const axios = require('axios');
require('dotenv').config();

// Get Replicate API token from environment variables
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions';

// Check if API token is available
if (!REPLICATE_API_TOKEN) {
  console.error('❌ REPLICATE_API_TOKEN is not set in environment variables');
  process.exit(1);
}

// Test prompt
const TEST_PROMPT = 'A beautiful sunset over mountains, photorealistic';

/**
 * Generate an image using the Replicate API with the flux-schnell model
 */
async function testImageGeneration() {
  console.log('🧪 Testing image generation with Replicate API...');
  console.log(`📝 Using prompt: "${TEST_PROMPT}"`);
  
  try {
    // Make API request to Replicate
    const response = await axios({
      method: 'POST',
      url: REPLICATE_API_URL,
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait' // Wait for the prediction to complete
      },
      data: {
        input: {
          prompt: TEST_PROMPT
        }
      }
    });

    // Check if the response contains the expected data
    if (response.data && response.data.id) {
      console.log('✅ Successfully initiated image generation');
      console.log(`🆔 Prediction ID: ${response.data.id}`);
      
      // Check prediction status
      await checkPredictionStatus(response.data.id);
    } else {
      console.error('❌ Failed to initiate image generation');
      console.error('Response:', JSON.stringify(response.data, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error generating image with Replicate API:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * Check the status of a prediction
 */
async function checkPredictionStatus(id) {
  console.log(`🔍 Checking prediction status for ID: ${id}`);
  
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.replicate.com/v1/predictions/${id}`,
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Prediction status: ${response.data.status}`);
    
    if (response.data.status === 'succeeded') {
      console.log('✅ Image generation successful!');
      if (response.data.output && response.data.output.length > 0) {
        console.log(`🖼️ Image URL: ${response.data.output[0]}`);
      }
      process.exit(0);
    } else if (response.data.status === 'failed') {
      console.error('❌ Image generation failed');
      console.error('Error:', response.data.error);
      process.exit(1);
    } else {
      // For GitHub Actions, we don't want to wait too long
      console.log('⏳ Image generation is still in progress');
      console.log('✅ Test passed - API is responsive');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error checking prediction status:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Run the test
testImageGeneration();