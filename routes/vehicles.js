const express = require('express');
const Booking = require('../models/Booking');
const { validateVehicle, validateAvailabilityQuery } = require('../middleware/validation');
const { calculateRideDuration, calculateEndTime, checkTimeOverlap } = require('../utils/rideCalculator');
const router = express.Router();
const Vehicle = require('../models/Vehicle');
/**
 * POST /api/vehicles - Add a new vehicle
 */
router.post('/', async (req, res, next) => {
  try {
    const { name, capacity, capacityKg, tyres } = req.body;
    
    // Flexible validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Vehicle name is required'
      });
    }
    
    const finalCapacity = capacityKg || capacity;
    if (!finalCapacity || typeof finalCapacity !== 'number' || finalCapacity < 1) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Capacity is required and must be greater than 0'
      });
    }
    
    if (!tyres || typeof tyres !== 'number' || tyres < 1) {
      return res.status(400).json({
        error: 'Validation error',
        details: 'Number of tyres is required and must be greater than 0'
      });
    }

    const vehicle = new Vehicle({
      name: name.trim(),
      capacityKg: parseInt(finalCapacity),
      tyres: parseInt(tyres)
    });

    const savedVehicle = await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: savedVehicle
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/vehicles/available - Find available vehicles
 */
router.get('/available', validateAvailabilityQuery, async (req, res, next) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    // Calculate ride duration and end time
    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const requestStartTime = new Date(startTime);
    const requestEndTime = calculateEndTime(requestStartTime, estimatedRideDurationHours);

    // Validate start time is in the future
    if (requestStartTime <= new Date()) {
      return res.status(400).json({
        error: 'Invalid start time',
        details: 'Start time must be in the future'
      });
    }

    // Find all vehicles with sufficient capacity
    const suitableVehicles = await Vehicle.find({
      capacityKg: { $gte: parseInt(capacityRequired) },
      isActive: true
    });

    if (suitableVehicles.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No vehicles found with required capacity',
        data: {
          vehicles: [],
          estimatedRideDurationHours
        }
      });
    }

    // Get vehicle IDs
    const vehicleIds = suitableVehicles.map(vehicle => vehicle._id);

    // Find all active bookings that overlap with requested time window
    const overlappingBookings = await Booking.find({
      vehicleId: { $in: vehicleIds },
      status: 'active',
      $or: [
        {
          startTime: { $lt: requestEndTime },
          endTime: { $gt: requestStartTime }
        }
      ]
    }).select('vehicleId');

    // Get set of booked vehicle IDs
    const bookedVehicleIds = new Set(
      overlappingBookings.map(booking => booking.vehicleId.toString())
    );

    // Filter out booked vehicles
    const availableVehicles = suitableVehicles.filter(
      vehicle => !bookedVehicleIds.has(vehicle._id.toString())
    );

    // Add estimated duration to each vehicle
    const vehiclesWithDuration = availableVehicles.map(vehicle => ({
      ...vehicle.toObject(),
      estimatedRideDurationHours
    }));

    res.status(200).json({
      success: true,
      message: `Found ${availableVehicles.length} available vehicles`,
      data: {
        vehicles: vehiclesWithDuration,
        searchParameters: {
          capacityRequired: parseInt(capacityRequired),
          fromPincode,
          toPincode,
          startTime: requestStartTime,
          endTime: requestEndTime,
          estimatedRideDurationHours
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
