const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const { validateBooking } = require('../middleware/validation');
const { calculateRideDuration, calculateEndTime } = require('../utils/rideCalculator');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

/**
 * POST /api/bookings - Create a new booking
 */
router.post('/', validateBooking, async (req, res, next) => {
  try {
    const { vehicleId, customerId, fromPincode, toPincode, startTime } = req.body;

    // Calculate ride duration and end time
    const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
    const bookingStartTime = new Date(startTime);
    const bookingEndTime = calculateEndTime(bookingStartTime, estimatedRideDurationHours);

    // Validate start time is in the future
    if (bookingStartTime <= new Date()) {
      throw new Error('Start time must be in the future');
    }

    // Verify vehicle exists and is active
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      isActive: true
    });

    if (!vehicle) {
      const error = new Error('Vehicle not found or inactive');
      error.statusCode = 404;
      throw error;
    }

    // Check for conflicting bookings
    const conflictingBookings = await Booking.find({
      vehicleId: vehicleId,
      status: 'active',
      $or: [
        {
          startTime: { $lt: bookingEndTime },
          endTime: { $gt: bookingStartTime }
        }
      ]
    });

    if (conflictingBookings.length > 0) {
      const error = new Error('Vehicle is already booked for the specified time slot');
      error.statusCode = 409;
      throw error;
    }

    // Create new booking
    const booking = new Booking({
      vehicleId,
      customerId,
      fromPincode,
      toPincode,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      estimatedRideDurationHours,
      status: 'active'
    });

    const savedBooking = await booking.save();
    await savedBooking.populate('vehicleId', 'name capacityKg tyres');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: savedBooking
    });

  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
        details: error.statusCode === 409 ? 'Please search for availability again' : null
      });
    }
    next(error);
  }
});

/**
 * GET /api/bookings - Get all bookings (optional endpoint for testing)
 */
router.get('/', async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicleId', 'name capacityKg tyres')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
