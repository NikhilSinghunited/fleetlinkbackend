/**
 * Calculate estimated ride duration based on pincodes
 * Note: This is a highly simplified placeholder logic for demonstration purposes.
 * In a real-world application, you would use actual distance/route calculation APIs.
 * 
 * @param {string} fromPincode - Starting pincode
 * @param {string} toPincode - Destination pincode
 * @returns {number} Estimated ride duration in hours
 */
const calculateRideDuration = (fromPincode, toPincode) => {
  try {
    const fromCode = parseInt(fromPincode);
    const toCode = parseInt(toPincode);
    
    if (isNaN(fromCode) || isNaN(toCode)) {
      throw new Error('Invalid pincode format');
    }
    
    // Simplified formula: absolute difference mod 24
    const duration = Math.abs(toCode - fromCode) % 24;
    
    // Ensure minimum duration of 1 hour for any trip
    return Math.max(duration, 1);
  } catch (error) {
    throw new Error('Error calculating ride duration: ' + error.message);
  }
};

/**
 * Calculate end time based on start time and duration
 * @param {Date} startTime - Start time of the booking
 * @param {number} durationHours - Duration in hours
 * @returns {Date} End time
 */
const calculateEndTime = (startTime, durationHours) => {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + durationHours);
  return endTime;
};

/**
 * Check if two time ranges overlap
 * @param {Date} start1 - Start time of first range
 * @param {Date} end1 - End time of first range
 * @param {Date} start2 - Start time of second range
 * @param {Date} end2 - End time of second range
 * @returns {boolean} True if ranges overlap
 */
const checkTimeOverlap = (start1, end1, start2, end2) => {
  return start1 < end2 && start2 < end1;
};

module.exports = {
  calculateRideDuration,
  calculateEndTime,
  checkTimeOverlap
};
