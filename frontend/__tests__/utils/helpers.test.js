// Test for helper utility functions
import {
  calculateReturns,
  calculateMaturityValue,
  isValidEmail,
  isStrongPassword,
  formatNumber,
  getStatusColor,
  calculatePercentage,
  truncateText,
  sortByKey,
  filterBySearch,
} from '../../utils/helpers';

describe('Helper Utils', () => {
  describe('calculateReturns', () => {
    it('calculates returns correctly', () => {
      expect(calculateReturns(10000, 10, 12)).toBe(1000);
      expect(calculateReturns(50000, 8, 24)).toBe(8000);
    });
  });

  describe('calculateMaturityValue', () => {
    it('calculates maturity value correctly', () => {
      expect(calculateMaturityValue(10000, 10, 12)).toBe(11000);
      expect(calculateMaturityValue(50000, 8, 24)).toBe(58000);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.in')).toBe(true);
    });

    it('invalidates incorrect email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('validates strong password', () => {
      expect(isStrongPassword('Strong@Pass123')).toBe(true);
      expect(isStrongPassword('Test@1234')).toBe(true);
    });

    it('invalidates weak password', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('NoSpecial123')).toBe(false);
      expect(isStrongPassword('nouppercas3@')).toBe(false);
    });
  });

  describe('formatNumber', () => {
    it('formats number with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(100)).toBe('100');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct color for active', () => {
      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800');
    });

    it('returns correct color for matured', () => {
      expect(getStatusColor('matured')).toBe('bg-blue-100 text-blue-800');
    });

    it('returns correct color for cancelled', () => {
      expect(getStatusColor('cancelled')).toBe('bg-gray-100 text-gray-800');
    });

    it('returns default color for unknown', () => {
      expect(getStatusColor('unknown')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('calculatePercentage', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe('25.00');
      expect(calculatePercentage(1, 3)).toBe('33.33');
    });

    it('handles zero total', () => {
      expect(calculatePercentage(10, 0)).toBe(0);
    });
  });

  describe('truncateText', () => {
    it('truncates long text', () => {
      expect(truncateText('This is a long text', 10)).toBe('This is a ...');
    });

    it('does not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('sortByKey', () => {
    const data = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    it('sorts ascending by default', () => {
      const sorted = sortByKey(data, 'name');
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[2].name).toBe('Charlie');
    });

    it('sorts descending', () => {
      const sorted = sortByKey(data, 'age', 'desc');
      expect(sorted[0].age).toBe(35);
      expect(sorted[2].age).toBe(25);
    });
  });

  describe('filterBySearch', () => {
    const data = [
      { name: 'Apple', category: 'Fruit' },
      { name: 'Banana', category: 'Fruit' },
      { name: 'Carrot', category: 'Vegetable' },
    ];

    it('filters by search term', () => {
      const filtered = filterBySearch(data, 'app', ['name']);
      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Apple');
    });

    it('filters by multiple keys', () => {
      const filtered = filterBySearch(data, 'fruit', ['name', 'category']);
      expect(filtered.length).toBe(2);
    });

    it('returns empty array when no match', () => {
      const filtered = filterBySearch(data, 'xyz', ['name']);
      expect(filtered.length).toBe(0);
    });
  });
});
