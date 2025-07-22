const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
    trim: true,
    maxlength: [100, 'Vehicle name cannot exceed 100 characters']
  },
  capacityKg: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1 kg']
  },
  tyres: {
    type: Number,
    required: [true, 'Number of tyres is required'],
    min: [1, 'Number of tyres must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient capacity-based queries
vehicleSchema.index({ capacityKg: 1, isActive: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
