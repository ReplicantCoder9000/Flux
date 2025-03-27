const { Schema, model } = require('mongoose');

// Image schema definition
const imageSchema = new Schema(
  {
    prompt: {
      type: String,
      required: true,
      trim: true
    },
    style: {
      type: String,
      trim: true,
      default: ''
    },
    imageUrl: {
      type: String,
      required: true
    },
    predictionId: {
      type: String,
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: [
      {
        type: String,
        trim: true
      }
    ],
    isFavorite: {
      type: Boolean,
      default: false
    },
    metadata: {
      width: {
        type: Number
      },
      height: {
        type: Number
      },
      format: {
        type: String
      },
      generationTime: {
        type: Number
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: {
      virtuals: true
    },
    id: false
  }
);

// Virtual for formatted creation date
imageSchema.virtual('createdAtFormatted').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Create Image model
const Image = model('Image', imageSchema);

module.exports = Image;