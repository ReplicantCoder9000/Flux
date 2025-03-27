const { gql } = require('apollo-server-express');

const typeDefs = gql`
  # User type
  type User {
    _id: ID!
    username: String!
    email: String!
    images: [Image]
    imageCount: Int
    favoritePrompts: [String]
    preferences: UserPreferences
    createdAt: String
  }

  # User preferences type
  type UserPreferences {
    defaultStyle: String
    theme: String
  }

  # Image type
  type Image {
    _id: ID!
    prompt: String!
    style: String
    imageUrl: String!
    predictionId: String!
    user: User!
    tags: [String]
    isFavorite: Boolean
    metadata: ImageMetadata
    createdAt: String
    createdAtFormatted: String
  }

  # Image metadata type
  type ImageMetadata {
    width: Int
    height: Int
    format: String
    generationTime: Float
  }

  # Auth type for login/signup responses
  type Auth {
    token: ID!
    user: User
  }

  # Image generation response type
  type ImageGenerationResponse {
    predictionId: String!
    status: String!
    imageUrl: String
  }

  # Input for user preferences
  input UserPreferencesInput {
    defaultStyle: String
    theme: String
  }

  # Input for image generation
  input GenerateImageInput {
    prompt: String!
    style: String
  }

  # Input for image metadata
  input ImageMetadataInput {
    width: Int
    height: Int
    format: String
    generationTime: Float
  }

  # Queries
  type Query {
    # Get current user
    me: User
    # Get all users
    users: [User]
    # Get user by ID
    user(userId: ID!): User
    # Get all images
    images: [Image]
    # Get images by user ID
    userImages(userId: ID): [Image]
    # Get image by ID
    image(imageId: ID!): Image
    # Get favorite images
    favoriteImages: [Image]
    # Check prediction status
    checkPredictionStatus(predictionId: String!): ImageGenerationResponse
  }

  # Mutations
  type Mutation {
    # User authentication
    login(email: String!, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    
    # User management
    updateUser(username: String, email: String): User
    updatePassword(currentPassword: String!, newPassword: String!): User
    updatePreferences(preferences: UserPreferencesInput!): User
    addFavoritePrompt(prompt: String!): User
    removeFavoritePrompt(prompt: String!): User
    
    # Image generation and management
    generateImage(input: GenerateImageInput!): ImageGenerationResponse
    saveImage(
      prompt: String!
      style: String
      imageUrl: String!
      predictionId: String!
      tags: [String]
      metadata: ImageMetadataInput
    ): Image
    updateImage(
      imageId: ID!
      prompt: String
      style: String
      tags: [String]
      isFavorite: Boolean
    ): Image
    deleteImage(imageId: ID!): Boolean
    toggleFavoriteImage(imageId: ID!): Image
  }
`;

module.exports = typeDefs;