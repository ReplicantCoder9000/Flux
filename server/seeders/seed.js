const db = require('../config/connection');
const { User, Image } = require('../models');
const bcrypt = require('bcrypt');

db.once('open', async () => {
  try {
    // Clean existing data
    await User.deleteMany({});
    await Image.deleteMany({});

    console.log('🧹 Database cleaned');

    // Create users
    const users = await User.create([
      {
        username: 'testuser1',
        email: 'testuser1@example.com',
        password: 'password123',
        favoritePrompts: [
          'a beautiful sunset over mountains',
          'futuristic cityscape with flying cars'
        ],
        preferences: {
          defaultStyle: 'photorealistic, detailed',
          theme: 'dark'
        }
      },
      {
        username: 'testuser2',
        email: 'testuser2@example.com',
        password: 'password123',
        favoritePrompts: [
          'underwater scene with colorful fish',
          'space station orbiting Earth'
        ],
        preferences: {
          defaultStyle: 'anime style, vibrant colors',
          theme: 'light'
        }
      }
    ]);

    console.log('👤 Users seeded');

    // Create sample images
    const images = await Image.create([
      {
        prompt: 'a beautiful sunset over mountains',
        style: 'photorealistic, detailed',
        imageUrl: 'https://replicate.delivery/pbxt/JzRtEXFJkwvyAJEFYGQNLKYGRwNLNGSJOPbtNfEJyxrYHdnRA/out-0.png',
        predictionId: 'sample-prediction-id-1',
        user: users[0]._id,
        tags: ['nature', 'sunset', 'mountains'],
        isFavorite: true,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'png',
          generationTime: 5.2
        }
      },
      {
        prompt: 'futuristic cityscape with flying cars',
        style: 'photorealistic, detailed',
        imageUrl: 'https://replicate.delivery/pbxt/JzRtEXFJkwvyAJEFYGQNLKYGRwNLNGSJOPbtNfEJyxrYHdnRA/out-1.png',
        predictionId: 'sample-prediction-id-2',
        user: users[0]._id,
        tags: ['future', 'city', 'scifi'],
        isFavorite: false,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'png',
          generationTime: 6.1
        }
      },
      {
        prompt: 'underwater scene with colorful fish',
        style: 'anime style, vibrant colors',
        imageUrl: 'https://replicate.delivery/pbxt/JzRtEXFJkwvyAJEFYGQNLKYGRwNLNGSJOPbtNfEJyxrYHdnRA/out-2.png',
        predictionId: 'sample-prediction-id-3',
        user: users[1]._id,
        tags: ['ocean', 'fish', 'underwater'],
        isFavorite: true,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'png',
          generationTime: 5.8
        }
      }
    ]);

    console.log('🖼️ Images seeded');

    // Update users with images
    await User.findByIdAndUpdate(
      users[0]._id,
      { $push: { images: { $each: [images[0]._id, images[1]._id] } } }
    );

    await User.findByIdAndUpdate(
      users[1]._id,
      { $push: { images: images[2]._id } }
    );

    console.log('🔄 User-image relationships updated');
    console.log('🌱 Seeding complete!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  }
});