const { AuthenticationError } = require('apollo-server-express');
const { User, Image } = require('../models');
const { signToken, isAuthenticated } = require('../utils/auth');
const { generateImage, checkPredictionStatus } = require('../utils/replicateApi');

const resolvers = {
  Query: {
    // Get current user
    me: async (_, __, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate('images');
      }
      throw new AuthenticationError('You need to be logged in!');
    },
    
    // Get all users
    users: async () => {
      return User.find().populate('images');
    },
    
    // Get user by ID
    user: async (_, { userId }) => {
      return User.findOne({ _id: userId }).populate('images');
    },
    
    // Get all images
    images: async () => {
      return Image.find().sort({ createdAt: -1 }).populate('user');
    },
    
    // Get images by user ID
    userImages: async (_, { userId }, context) => {
      const userIdToUse = userId || (context.user ? context.user._id : null);
      
      if (!userIdToUse) {
        throw new AuthenticationError('User ID is required');
      }
      
      return Image.find({ user: userIdToUse })
        .sort({ createdAt: -1 })
        .populate('user');
    },
    
    // Get image by ID
    image: async (_, { imageId }) => {
      return Image.findOne({ _id: imageId }).populate('user');
    },
    
    // Get favorite images
    favoriteImages: async (_, __, context) => {
      isAuthenticated(context);
      
      return Image.find({
        user: context.user._id,
        isFavorite: true
      })
        .sort({ createdAt: -1 })
        .populate('user');
    },
    
    // Check prediction status
    checkPredictionStatus: async (_, { predictionId }) => {
      const prediction = await checkPredictionStatus(predictionId);
      
      return {
        predictionId: prediction.id,
        status: prediction.status,
        imageUrl: prediction.output ? prediction.output[0] : null
      };
    }
  },
  
  Mutation: {
    // User authentication
    login: async (_, { email, password }) => {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        throw new AuthenticationError('Incorrect email or password');
      }
      
      // Check password
      const correctPassword = await user.isCorrectPassword(password);
      
      if (!correctPassword) {
        throw new AuthenticationError('Incorrect email or password');
      }
      
      // Sign token and return
      const token = signToken(user);
      return { token, user };
    },
    
    addUser: async (_, { username, email, password }) => {
      // Create user
      const user = await User.create({ username, email, password });
      
      // Sign token and return
      const token = signToken(user);
      return { token, user };
    },
    
    // User management
    updateUser: async (_, args, context) => {
      isAuthenticated(context);
      
      return User.findByIdAndUpdate(
        context.user._id,
        { ...args },
        { new: true, runValidators: true }
      );
    },
    
    updatePassword: async (_, { currentPassword, newPassword }, context) => {
      isAuthenticated(context);
      
      // Get user with password
      const user = await User.findById(context.user._id);
      
      // Verify current password
      const correctPassword = await user.isCorrectPassword(currentPassword);
      
      if (!correctPassword) {
        throw new AuthenticationError('Incorrect current password');
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      return user;
    },
    
    updatePreferences: async (_, { preferences }, context) => {
      isAuthenticated(context);
      
      return User.findByIdAndUpdate(
        context.user._id,
        { preferences },
        { new: true, runValidators: true }
      );
    },
    
    addFavoritePrompt: async (_, { prompt }, context) => {
      isAuthenticated(context);
      
      return User.findByIdAndUpdate(
        context.user._id,
        { $addToSet: { favoritePrompts: prompt } },
        { new: true }
      );
    },
    
    removeFavoritePrompt: async (_, { prompt }, context) => {
      isAuthenticated(context);
      
      return User.findByIdAndUpdate(
        context.user._id,
        { $pull: { favoritePrompts: prompt } },
        { new: true }
      );
    },
    
    // Image generation and management
    generateImage: async (_, { input }, context) => {
      isAuthenticated(context);
      
      const result = await generateImage(input);
      
      return {
        predictionId: result.id,
        status: result.status,
        imageUrl: result.output ? result.output[0] : null
      };
    },
    
    saveImage: async (_, imageData, context) => {
      isAuthenticated(context);
      
      const image = await Image.create({
        ...imageData,
        user: context.user._id
      });
      
      // Add image to user's images array
      await User.findByIdAndUpdate(
        context.user._id,
        { $push: { images: image._id } }
      );
      
      return image.populate('user');
    },
    
    updateImage: async (_, { imageId, ...updates }, context) => {
      isAuthenticated(context);
      
      // Find image and check ownership
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      if (image.user.toString() !== context.user._id) {
        throw new AuthenticationError('You can only update your own images');
      }
      
      // Update image
      return Image.findByIdAndUpdate(
        imageId,
        { ...updates },
        { new: true, runValidators: true }
      ).populate('user');
    },
    
    deleteImage: async (_, { imageId }, context) => {
      isAuthenticated(context);
      
      // Find image and check ownership
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      if (image.user.toString() !== context.user._id) {
        throw new AuthenticationError('You can only delete your own images');
      }
      
      // Delete image
      await Image.findByIdAndDelete(imageId);
      
      // Remove image from user's images array
      await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { images: imageId } }
      );
      
      return true;
    },
    
    toggleFavoriteImage: async (_, { imageId }, context) => {
      isAuthenticated(context);
      
      // Find image and check ownership
      const image = await Image.findById(imageId);
      
      if (!image) {
        throw new Error('Image not found');
      }
      
      if (image.user.toString() !== context.user._id) {
        throw new AuthenticationError('You can only favorite your own images');
      }
      
      // Toggle favorite status
      image.isFavorite = !image.isFavorite;
      await image.save();
      
      return image.populate('user');
    }
  }
};

module.exports = resolvers;