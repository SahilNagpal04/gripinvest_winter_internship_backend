// Test for auth utility functions
import { 
  formatCurrency, 
  formatDate, 
  getRiskColor, 
  getInvestmentTypeLabel,
  saveAuth,
  getToken,
  getUser,
  isAuthenticated,
  isAdmin,
  logout
} from '../../utils/auth';

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn((token) => ({
    exp: Date.now() / 1000 + 3600,
    userId: '1',
    email: 'test@example.com'
  }))
}));

describe('Auth Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('formatCurrency', () => {
    it('formats number to INR currency', () => {
      expect(formatCurrency(10000)).toBe('₹10,000');
      expect(formatCurrency(100000)).toBe('₹1,00,000');
      expect(formatCurrency(0)).toBe('₹0');
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

    it('returns default color for unknown risk', () => {
      expect(getRiskColor('unknown')).toContain('gray');
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

    it('returns correct label for other', () => {
      expect(getInvestmentTypeLabel('other')).toBe('Other');
    });

    it('returns input for unknown type', () => {
      expect(getInvestmentTypeLabel('unknown')).toBe('unknown');
    });
  });

  describe('saveAuth', () => {
    it('saves token and user to localStorage', () => {
      const token = 'test-token';
      const user = { id: 1, email: 'test@example.com' };
      
      saveAuth(token, user);
      
      expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(user));
    });
  });

  describe('getToken', () => {
    it('returns token from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      expect(getToken()).toBe('test-token');
    });

    it('returns null when no token', () => {
      expect(getToken()).toBeNull();
    });
  });

  describe('getUser', () => {
    it('returns user from localStorage', () => {
      const user = { id: 1, email: 'test@example.com' };
      localStorage.setItem('user', JSON.stringify(user));
      
      expect(getUser()).toEqual(user);
    });

    it('returns null when no user', () => {
      expect(getUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('returns true when valid token exists', () => {
      localStorage.setItem('token', 'valid-token');
      expect(isAuthenticated()).toBe(true);
    });

    it('returns false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true when user is admin', () => {
      localStorage.setItem('user', JSON.stringify({ is_admin: true }));
      expect(isAdmin()).toBe(true);
    });

    it('returns true when user is admin (number)', () => {
      localStorage.setItem('user', JSON.stringify({ is_admin: 1 }));
      expect(isAdmin()).toBe(true);
    });

    it('returns false when user is not admin', () => {
      localStorage.setItem('user', JSON.stringify({ is_admin: false }));
      expect(isAdmin()).toBe(false);
    });

    it('returns false when no user', () => {
      expect(isAdmin()).toBe(false);
    });
  });

  describe('logout', () => {
    it('clears localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));
      
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
      
      logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });
});
