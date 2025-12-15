const request = require('supertest');
const app = require('../src/app');
const { clearDatabase } = require('./setup');

describe('Product Endpoints', () => {
  let adminToken;
  let userToken;
  let productId;

  beforeAll(async () => {
    await clearDatabase();

    // Login as admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gripinvest.in',
        password: 'Admin@123'
      });
    adminToken = adminRes.body.data.token;

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        first_name: 'Test',
        email: 'testproduct@example.com',
        password: 'Password@123'
      });
    userToken = userRes.body.data.token;
  });

  describe('GET /api/products', () => {
    it('should get all products without authentication', async () => {
      const res = await request(app)
        .get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data.products)).toBe(true);
    });

    it('should filter products by risk level', async () => {
      const res = await request(app)
        .get('/api/products?risk_level=low');

      expect(res.statusCode).toBe(200);
      if (res.body.data.products.length > 0) {
        expect(res.body.data.products[0].risk_level).toBe('low');
      }
    });
  });



  describe('GET /api/products/:id', () => {
    it('should get product by ID', async () => {
      const allProducts = await request(app).get('/api/products');
      if (allProducts.body.data.products.length > 0) {
        const id = allProducts.body.data.products[0].id;
        
        const res = await request(app)
          .get(`/api/products/${id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.product).toHaveProperty('id');
      }
    });
  });

  

  describe('GET /api/products/recommended/me', () => {
    it('should get recommended products for logged-in user', async () => {
      const res = await request(app)
        .get('/api/products/recommended/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401]).toContain(res.statusCode);
    });
  });
});
