const Joi = require('joi');

const validateVehicle = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().max(100),
    // Accept both 'capacity' and 'capacityKg'
    capacity: Joi.number().min(1),
    capacityKg: Joi.number().min(1),
    tyres: Joi.number().required().min(1)
  }).or('capacity', 'capacityKg'); // Require at least one of these

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  
  // Map capacity to capacityKg if needed
  if (req.body.capacity && !req.body.capacityKg) {
    req.body.capacityKg = req.body.capacity;
    delete req.body.capacity;
  }
  
  next();
};

const validateAvailabilityQuery = (req, res, next) => {
  const schema = Joi.object({
    capacityRequired: Joi.number().required().min(1),
    fromPincode: Joi.string().required().pattern(/^[0-9]{6}$/),
    toPincode: Joi.string().required().pattern(/^[0-9]{6}$/),
    startTime: Joi.string().required().isoDate()
  });

  const { error } = schema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

const validateBooking = (req, res, next) => {
  const schema = Joi.object({
    vehicleId: Joi.string().required(),
    customerId: Joi.string().required().trim(),
    fromPincode: Joi.string().required().pattern(/^[0-9]{6}$/),
    toPincode: Joi.string().required().pattern(/^[0-9]{6}$/),
    startTime: Joi.string().required().isoDate()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateVehicle,
  validateAvailabilityQuery,
  validateBooking
};
