const { validateBooking, validateAvailabilityQuery } = require('./validation');
const httpMocks = require('node-mocks-http');

describe('validateBooking', () => {
  let req, res, next;
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('calls next for valid booking', () => {
    req.body = {
      vehicleId: 'vehicle123',
      customerId: 'customer456',
      fromPincode: '123456',
      toPincode: '654321',
      startTime: new Date().toISOString()
    };
    validateBooking(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for invalid pincode', () => {
    req.body = {
      vehicleId: 'vehicle123',
      customerId: 'customer456',
      fromPincode: 'abc',
      toPincode: '654321',
      startTime: new Date().toISOString()
    };
    validateBooking(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toBe('Validation error');
  });

  it('returns 400 for missing fields', () => {
    req.body = {};
    validateBooking(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toBe('Validation error');
  });
});

describe('validateAvailabilityQuery', () => {
  let req, res, next;
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  it('calls next for valid query', () => {
    req.query = {
      capacityRequired: 10,
      fromPincode: '123456',
      toPincode: '654321',
      startTime: new Date().toISOString()
    };
    validateAvailabilityQuery(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 400 for invalid startTime', () => {
    req.query = {
      capacityRequired: 10,
      fromPincode: '123456',
      toPincode: '654321',
      startTime: 'not-a-date'
    };
    validateAvailabilityQuery(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toBe('Validation error');
  });

  it('returns 400 for missing fields', () => {
    req.query = {};
    validateAvailabilityQuery(req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res._getJSONData().error).toBe('Validation error');
  });
}); 