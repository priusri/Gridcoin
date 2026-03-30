const mongoose = require('mongoose');

const energyListingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    energyType: {
      type: String,
      enum: ['solar', 'wind', 'hydro', 'grid', 'renewable', 'fossil'],
      required: true,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    availableQuantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: 'kWh',
    },
    description: String,
    duration: {
      type: String,
      enum: ['spot', 'hourly', 'daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
    },
    maxOrderQuantity: Number,
    location: {
      city: String,
      state: String,
      country: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold', 'expired'],
      default: 'active',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: Number,
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    expiresAt: Date,
  },
  { timestamps: true }
);

energyListingSchema.index({ seller: 1, status: 1 });
energyListingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EnergyListing', energyListingSchema);
