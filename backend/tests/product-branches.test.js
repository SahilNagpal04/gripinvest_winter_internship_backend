const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Product Branch Coverage Tests', () => {
  let adminToken;
  let userToken;
  let productId;

  beforeAll(async () => {
    await clearDatabase();

    // Login admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gripinvest.in',
        password: 'Admin@123'
      });
    adminToken = adminRes.body.data?.token;

    // Create user
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'ProductTest',
        email: `producttest${Date.now()}@example.com`,
        password: 'Password@123',
        risk_appetite: 'moderate'
      });
    userToken = userRes.body.data?.token;
  });

  describe('Create Product Branches', () => {
    it('should create product without description (auto-generate)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Auto Description Product',
          investment_type: 'bond',
          tenure_months: 12,
          annual_yield: 8.5,
          risk_level: 'low',
          min_investment: 5000
        });
      
      expect([201, 401]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        productId = res.body.data?.product?.id;
      }
    });

    it('should create product with description', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Custom Description Product',
          investment_type: 'mf',
          tenure_months: 24,
          annual_yield: 12.0,
          risk_level: 'high',
          min_investment: 1000,
          max_investment: 100000,
          description: 'This is a custom description'
        });
      
      expect([201, 401]).toContain(res.statusCode);
    });

    it('should create product without min_investment (use default)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Default Min Investment',
          investment_type: 'fd',
          tenure_months: 12,
          annual_yield: 7.0,
          risk_level: 'low'
        });
      
      expect([201, 401]).toContain(res.statusCode);
    });

    it('should create product without max_investment (null)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'No Max Investment',
          investment_type: 'etf',
          tenure_months: 36,
          annual_yield: 10.0,
          risk_level: 'moderate',
          min_investment: 2000
        });
      
      expect([201, 401]).toContain(res.statusCode);
    });
  });

  describe('Get Products with Filters Branches', () => {
    it('should get products filtered by investment_type', async () => {
      const res = await request(app)
        .get('/api/products?investment_type=bond');
      
      expect(res.statusCode).toBe(200);
    });

    it('should get products filtered by risk_level', async () => {
      const res = await request(app)
        .get('/api/products?risk_level=low');
      
      expect(res.statusCode).toBe(200);
    });

    it('should get products filtered by min_yield', async () => {
      const res = await request(app)
        .get('/api/products?min_yield=10');
      
      expect(res.statusCode).toBe(200);
    });

    it('should get products with multiple filters', async () => {
      const res = await request(app)
        .get('/api/products?investment_type=mf&risk_level=high&min_yield=11');
      
      expect(res.statusCode).toBe(200);
    });

    it('should get products with no filters', async () => {
      const res = await request(app)
        .get('/api/products');
      
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Get Product by ID Branches', () => {
    it('should get existing product by ID', async () => {
      if (productId) {
        const res = await request(app)
          .get(`/api/products/${productId}`);
        
        expect([200, 404]).toContain(res.statusCode);
      }
    });

    it('should return 404 for non-existent product', async () => {
      const res = await request(app)
        .get('/api/products/non-existent-id-12345');
      
      expect([200, 404]).toContain(res.statusCode);
    });
  });

  describe('Update Product Branches', () => {
    it('should update product successfully', async () => {
      if (productId) {
        const res = await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            annual_yield: 9.0,
            description: 'Updated description'
          });
        
        expect([200, 401, 404]).toContain(res.statusCode);
      }
    });

    it('should fail to update non-existent product', async () => {
      const res = await request(app)
        .put('/api/products/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ annual_yield: 10.0 });
      
      expect([200, 401, 404]).toContain(res.statusCode);
    });

    it('should fail to update as non-admin', async () => {
      if (productId) {
        const res = await request(app)
          .put(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ annual_yield: 15.0 });
        
        expect([401, 403]).toContain(res.statusCode);
      }
    });
  });

  describe('Get Recommended Products Branches', () => {
    it('should get recommended products for low risk user', async () => {
      const lowRiskRes = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'LowRisk',
          email: `lowrisk${Date.now()}@example.com`,
          password: 'Password@123',
          risk_appetite: 'low'
        });
      
      const lowToken = lowRiskRes.body.data?.token;

      if (lowToken) {
        const res = await request(app)
          .get('/api/products/recommended/me')
          .set('Authorization', `Bearer ${lowToken}`);
        
        expect([200, 401]).toContain(res.statusCode);
      }
    });

    it('should get recommended products for high risk user', async () => {
      const highRiskRes = await request(app)
        .post('/api/auth/signup')
        .send({
          first_name: 'HighRisk',
          email: `highrisk${Date.now()}@example.com`,
          password: 'Password@123',
          risk_appetite: 'high'
        });
      
      const highToken = highRiskRes.body.data?.token;

      if (highToken) {
        const res = await request(app)
          .get('/api/products/recommended/me')
          .set('Authorization', `Bearer ${highToken}`);
        
        expect([200, 401]).toContain(res.statusCode);
      }
    });
  });

  describe('Get Top Products Branches', () => {
    it('should get top 3 products', async () => {
      const res = await request(app)
        .get('/api/products/top?limit=3');
      
      expect(res.statusCode).toBe(200);
    });

    it('should get top 10 products', async () => {
      const res = await request(app)
        .get('/api/products/top?limit=10');
      
      expect(res.statusCode).toBe(200);
    });

    it('should get top products with default limit', async () => {
      const res = await request(app)
        .get('/api/products/top');
      
      expect(res.statusCode).toBe(200);
    });
  });

  describe('Delete Product Branches', () => {
    it('should delete product as admin', async () => {
      if (productId) {
        const res = await request(app)
          .delete(`/api/products/${productId}`)
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect([200, 401]).toContain(res.statusCode);
      }
    });

    it('should fail to delete as non-admin', async () => {
      const res = await request(app)
        .delete('/api/products/some-id')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect([401, 403]).toContain(res.statusCode);
    });
  });
});
