const { calculateRideDuration, calculateEndTime, checkTimeOverlap } = require('./rideCalculator');

describe('calculateRideDuration', () => {
  it('calculates correct duration for valid pincodes', () => {
    expect(calculateRideDuration('560001', '560011')).toBe(10);
    expect(calculateRideDuration('100000', '100024')).toBe(24);
    expect(calculateRideDuration('100000', '100001')).toBe(1);
    expect(calculateRideDuration('100000', '100010')).toBe(10);
  });

  it('returns minimum duration of 1 hour for same pincode', () => {
    expect(calculateRideDuration('123456', '123456')).toBe(1);
  });

  it('throws error for invalid pincodes', () => {
    expect(() => calculateRideDuration('abc', '123456')).toThrow('Invalid pincode format');
    expect(() => calculateRideDuration('123456', 'xyz')).toThrow('Invalid pincode format');
  });
});

describe('calculateEndTime', () => {
  it('calculates correct end time', () => {
    const start = new Date('2024-01-01T10:00:00Z');
    const end = calculateEndTime(start, 5);
    expect(end.getUTCHours()).toBe(15);
    expect(end.getUTCDate()).toBe(1);
  });

  it('handles day rollover', () => {
    const start = new Date('2024-01-01T22:00:00Z');
    const end = calculateEndTime(start, 3);
    expect(end.getUTCHours()).toBe(1);
    expect(end.getUTCDate()).toBe(2);
  });
});

describe('checkTimeOverlap', () => {
  it('returns true for overlapping ranges', () => {
    const s1 = new Date('2024-01-01T10:00:00Z');
    const e1 = new Date('2024-01-01T12:00:00Z');
    const s2 = new Date('2024-01-01T11:00:00Z');
    const e2 = new Date('2024-01-01T13:00:00Z');
    expect(checkTimeOverlap(s1, e1, s2, e2)).toBe(true);
  });

  it('returns false for non-overlapping ranges', () => {
    const s1 = new Date('2024-01-01T10:00:00Z');
    const e1 = new Date('2024-01-01T12:00:00Z');
    const s2 = new Date('2024-01-01T12:00:00Z');
    const e2 = new Date('2024-01-01T14:00:00Z');
    expect(checkTimeOverlap(s1, e1, s2, e2)).toBe(false);
  });

  it('returns true for exact overlap at start', () => {
    const s1 = new Date('2024-01-01T10:00:00Z');
    const e1 = new Date('2024-01-01T12:00:00Z');
    const s2 = new Date('2024-01-01T10:00:00Z');
    const e2 = new Date('2024-01-01T11:00:00Z');
    expect(checkTimeOverlap(s1, e1, s2, e2)).toBe(true);
  });
}); 