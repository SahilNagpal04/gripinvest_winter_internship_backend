const userModel = require('../src/models/userModel');
const productModel = require('../src/models/productModel');
const { clearDatabase } = require('./setup');
const { hashPassword } = require('../src/utils/passwordUtils');

describe('User Model', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('should create user', async () => {
    const hash = await hashPassword('Test@123');
    const userId = await userModel.createUser({
      first_name: 'Test',
      last_name: 'User',
      email: 'testmodel@example.com',
      password_hash: hash,
      risk_appetite: 'moderate'
    });
    expect(userId).toBeTruthy();
  });

  it('should find user by email', async () => {
    const hash = await hashPassword('Test@123');
    await userModel.createUser({
      first_name: 'Test',
      email: 'testfind@example.com',
      password_hash: hash
    });
    
    const user = await userModel.findUserByEmail('testfind@example.com');
    expect(user).toBeTruthy();
    expect(user.email).toBe('testfind@example.com');
  });

  it('should return null for non-existent user', async () => {
    const user = await userModel.findUserByEmail('notexist@example.com');
    expect(user).toBeNull();
  });

  it('should get user balance', async () => {
    const hash = await hashPassword('Test@123');
    const userId = await userModel.createUser({
      first_name: 'Test',
      email: 'testbalance@example.com',
      password_hash: hash
    });
    
    const balance = await userModel.getUserBalance(userId);
    expect(balance).toBe('100000.00');
  });
});

describe('Product Model', () => {
  it('should get all products', async () => {
    const products = await productModel.getAllProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('should filter products by risk level', async () => {
    const products = await productModel.getAllProducts({ risk_level: 'low' });
    products.forEach(p => {
      expect(p.risk_level).toBe('low');
    });
  });

  it('should get top products', async () => {
    const products = await productModel.getTopProducts(3);
    expect(products.length).toBeLessThanOrEqual(3);
  });

  it('should get recommended products', async () => {
    const products = await productModel.getRecommendedProducts('moderate');
    products.forEach(p => {
      expect(p.risk_level).toBe('moderate');
    });
  });
});