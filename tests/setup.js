// テスト環境の初期設定
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

// モックデータベース接続
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn()
}));

// グローバルテストヘルパー
global.testUtils = {
  // テスト用JWTトークン生成
  generateTestToken: (userId = 'test-user-id', username = 'testuser') => {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ userId, username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  },
  
  // テスト用リクエストヘッダー
  getAuthHeaders: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }),
  
  // モックレスポンスオブジェクト
  createMockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis()
    };
    return res;
  },
  
  // モックリクエストオブジェクト
  createMockRequest: (method = 'GET', body = {}, headers = {}) => ({
    method,
    body,
    headers
  })
};