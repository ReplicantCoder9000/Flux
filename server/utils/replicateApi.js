const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get Replicate API token from environment variables
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions';

// Check if API token is available
if (!REPLICATE_API_TOKEN) {
  console.warn('⚠️ REPLICATE_API_TOKEN is not set in environment variables');
}

/**
 * Generate an image using the Replicate API with the flux-schnell model
 * @param {Object} options - Options for image generation
 * @param {string} options.prompt - Text prompt for image generation
 * @param {string} [options.style] - Optional style parameter
 * @returns {Promise<Object>} - Generated image data
 */
const generateImage = async ({ prompt, style = '' }) => {
  try {
    // Combine prompt with style if provided
    const fullPrompt = style ? `${prompt}, ${style}` : prompt;
    
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
          prompt: fullPrompt
        }
      }
    });

    // Return the response data
    return response.data;
  } catch (error) {
    console.error('Error generating image with Replicate API:', error.response?.data || error.message);
    throw new Error('Failed to generate image. Please try again later.');
  }
};

/**
 * Check the status of a prediction
 * @param {string} id - Prediction ID
 * @returns {Promise<Object>} - Prediction status data
 */
const checkPredictionStatus = async (id) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `https://api.replicate.com/v1/predictions/${id}`,
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error checking prediction status:', error.response?.data || error.message);
    throw new Error('Failed to check prediction status.');
  }
};

module.exports = {
  generateImage,
  checkPredictionStatus
};