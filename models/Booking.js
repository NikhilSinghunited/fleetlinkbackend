const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle ID is required']
  },
  customerId: {
    type: String,
    required: [true, 'Customer ID is required'],
    trim: true
  },
  fromPincode: {
    type: String,
    required: [true, 'From pincode is required'],
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
  },
  toPincode: {
    type: String,
    required: [true, 'To pincode is required'],
    match: [/^[0-9]{6}$/, 'Please provide a valid 6-digit pincode']
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  estimatedRideDurationHours: {
    type: Number,
    required: true,
    min: [0, 'Duration cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound index for efficient availability queries
bookingSchema.index({ 
  vehicleId: 1, 
  startTime: 1, 
  endTime: 1,
  status: 1 
});

// Index for time-based queries
bookingSchema.index({ startTime: 1, endTime: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
