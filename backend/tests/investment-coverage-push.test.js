const investmentController = require('../src/controllers/investmentController');
const db = require('../src/config/database');

describe('Investment Controller Coverage Push', () => {
  let originalQuery;

  beforeEach(() => {
    originalQuery = db.query;
  });

  afterEach(() => {
    db.query = originalQuery;
  });

  it('should create investment successfully', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 10000 },
      body: { productId: 'prod1', amount: 5000 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn()
      .mockResolvedValueOnce([{ id: 'prod1', min_investment: 1000, max_investment: 100000, annual_yield: 8, is_active: 1 }])
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('should handle insufficient balance', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 500 },
      body: { productId: 'prod1', amount: 5000 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([{ id: 'prod1', min_investment: 1000, max_investment: 100000 }]);

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle below minimum investment', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 10000 },
      body: { productId: 'prod1', amount: 500 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([{ id: 'prod1', min_investment: 1000, max_investment: 100000 }]);

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle above maximum investment', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 200000 },
      body: { productId: 'prod1', amount: 150000 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([{ id: 'prod1', min_investment: 1000, max_investment: 100000 }]);

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle inactive product', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 10000 },
      body: { productId: 'prod1', amount: 5000 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([{ id: 'prod1', min_investment: 1000, max_investment: 100000, is_active: 0 }]);

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle product not found', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 10000 },
      body: { productId: 'prod1', amount: 5000 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([]);

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should get portfolio successfully', async () => {
    const mockReq = {
      user: { id: 'user1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([
      { id: 'inv1', amount: 5000, expected_return: 5400, status: 'active' }
    ]);

    await investmentController.getPortfolio(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should get portfolio summary', async () => {
    const mockReq = {
      user: { id: 'user1', risk_appetite: 'medium' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([
      { total_invested: 10000, current_value: 11000, total_returns: 1000, active_count: 2 }
    ]);

    await investmentController.getPortfolioSummary(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should get investment by id', async () => {
    const mockReq = {
      user: { id: 'user1' },
      params: { id: 'inv1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([
      { id: 'inv1', amount: 5000, user_id: 'user1' }
    ]);

    await investmentController.getInvestmentById(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should handle investment not found', async () => {
    const mockReq = {
      user: { id: 'user1' },
      params: { id: 'inv1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([]);

    await investmentController.getInvestmentById(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  it('should cancel investment', async () => {
    const mockReq = {
      user: { id: 'user1' },
      params: { id: 'inv1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn()
      .mockResolvedValueOnce([{ id: 'inv1', user_id: 'user1', status: 'active', amount: 5000 }])
      .mockResolvedValueOnce({ affectedRows: 1 })
      .mockResolvedValueOnce({ affectedRows: 1 });

    await investmentController.cancelInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('should not cancel non-active investment', async () => {
    const mockReq = {
      user: { id: 'user1' },
      params: { id: 'inv1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockResolvedValueOnce([{ id: 'inv1', user_id: 'user1', status: 'matured' }]);

    await investmentController.cancelInvestment(mockReq, mockRes, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should handle create investment error', async () => {
    const mockReq = {
      user: { id: 'user1', balance: 10000 },
      body: { productId: 'prod1', amount: 5000 }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

    await investmentController.createInvestment(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle portfolio error', async () => {
    const mockReq = {
      user: { id: 'user1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

    await investmentController.getPortfolio(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle portfolio summary error', async () => {
    const mockReq = {
      user: { id: 'user1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

    await investmentController.getPortfolioSummary(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle get investment error', async () => {
    const mockReq = {
      user: { id: 'user1' },
      params: { id: 'inv1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

    await investmentController.getInvestmentById(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle cancel investment error', async () => {
    const mockReq = {
      user: { id: 'user1' },
      params: { id: 'inv1' }
    };
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    db.query = jest.fn().mockRejectedValue(new Error('DB Error'));

    await investmentController.cancelInvestment(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});