// Test for auth utility functions
import { formatCurrency, formatDate, getRiskColor, getInvestmentTypeLabel } from '../../utils/auth';

describe('Auth Utils', () => {
  describe('formatCurrency', () => {
    it('formats number to INR currency', () => {
      expect(formatCurrency(10000)).toBe('₹10,000');
      expect(formatCurrency(100000)).toBe('₹1,00,000');
    });
  });

  describe('formatDate', () => {
    it('formats date to readable string', () => {
      const date = new Date('2024-01-15');
      const formatted = formatDate(date);
      expect(formatted).toContain('Jan');
      expect(formatted).toContain('2024');
    });
  });

  describe('getRiskColor', () => {
    it('returns correct color for low risk', () => {
      expect(getRiskColor('low')).toContain('green');
    });

    it('returns correct color for moderate risk', () => {
      expect(getRiskColor('moderate')).toContain('yellow');
    });

    it('returns correct color for high risk', () => {
      expect(getRiskColor('high')).toContain('red');
    });
  });

  describe('getInvestmentTypeLabel', () => {
    it('returns correct label for bond', () => {
      expect(getInvestmentTypeLabel('bond')).toBe('Bond');
    });

    it('returns correct label for fd', () => {
      expect(getInvestmentTypeLabel('fd')).toBe('Fixed Deposit');
    });

    it('returns correct label for mf', () => {
      expect(getInvestmentTypeLabel('mf')).toBe('Mutual Fund');
    });

    it('returns correct label for etf', () => {
      expect(getInvestmentTypeLabel('etf')).toBe('ETF');
    });
  });
});
