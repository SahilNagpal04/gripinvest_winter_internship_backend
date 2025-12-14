// Test for API utility
import axios from 'axios';
import { authAPI, productsAPI, investmentsAPI, logsAPI } from '../../utils/api';

jest.mock('axios');

describe('API Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('authAPI', () => {
    it('exports all auth methods', () => {
      expect(authAPI.signup).toBeDefined();
      expect(authAPI.login).toBeDefined();
      expect(authAPI.getProfile).toBeDefined();
      expect(authAPI.updateProfile).toBeDefined();
      expect(authAPI.checkPassword).toBeDefined();
      expect(authAPI.requestPasswordReset).toBeDefined();
      expect(authAPI.resetPassword).toBeDefined();
    });
  });

  describe('productsAPI', () => {
    it('exports all products methods', () => {
      expect(productsAPI.getAll).toBeDefined();
      expect(productsAPI.getById).toBeDefined();
      expect(productsAPI.getTop).toBeDefined();
      expect(productsAPI.getRecommended).toBeDefined();
      expect(productsAPI.create).toBeDefined();
      expect(productsAPI.update).toBeDefined();
      expect(productsAPI.delete).toBeDefined();
    });
  });

  describe('investmentsAPI', () => {
    it('exports all investments methods', () => {
      expect(investmentsAPI.create).toBeDefined();
      expect(investmentsAPI.getPortfolio).toBeDefined();
      expect(investmentsAPI.getSummary).toBeDefined();
      expect(investmentsAPI.getById).toBeDefined();
      expect(investmentsAPI.cancel).toBeDefined();
    });
  });

  describe('logsAPI', () => {
    it('exports all logs methods', () => {
      expect(logsAPI.getMy).toBeDefined();
      expect(logsAPI.getMyErrors).toBeDefined();
      expect(logsAPI.getByDateRange).toBeDefined();
      expect(logsAPI.getAll).toBeDefined();
      expect(logsAPI.getByUserId).toBeDefined();
      expect(logsAPI.getByEmail).toBeDefined();
    });
  });
});
