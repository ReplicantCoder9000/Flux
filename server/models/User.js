const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

// User schema definition
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/.+@.+\..+/, 'Must use a valid email address']
    },
    password: {
      type: String,
      required: true,
      minlength: 8
    },
    images: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Image'
      }
    ],
    favoritePrompts: [
      {
        type: String,
        trim: true
      }
    ],
    preferences: {
      defaultStyle: {
        type: String,
        default: ''
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: {
      virtuals: true,
      // Don't include password in JSON responses
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      }
    },
    id: false
  }
);

// Virtual property for image count
userSchema.virtual('imageCount').get(function () {
  return this.images.length;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Method to compare password for login
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Create User model
const User = model('User', userSchema);

module.exports = User;