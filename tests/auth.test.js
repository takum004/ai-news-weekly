const { sql } = require('@vercel/postgres');
const registerHandler = require('../api/auth/register');
const loginHandler = require('../api/auth/login');
const { hashPassword, verifyPassword, validateInput } = require('../api/utils/auth');

describe('認証システム', () => {
  beforeEach(() => {
    // モックをリセット
    jest.clearAllMocks();
  });

  describe('パスワードハッシュ化', () => {
    test('パスワードが正しくハッシュ化される', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    test('ハッシュ化されたパスワードが正しく検証される', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      const isInvalid = await verifyPassword('wrongpassword', hash);
      
      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('入力値バリデーション', () => {
    test('有効な入力値が正しく検証される', () => {
      const data = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const rules = {
        username: { required: true, minLength: 3 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        password: { required: true, minLength: 8 }
      };
      
      const result = validateInput(data, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('無効な入力値が正しく検証される', () => {
      const data = {
        username: 'ab', // 短すぎる
        email: 'invalid-email', // 無効なメール
        password: '123' // 短すぎる
      };
      
      const rules = {
        username: { required: true, minLength: 3 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        password: { required: true, minLength: 8 }
      };
      
      const result = validateInput(data, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors)).toHaveLength(3);
    });
  });

  describe('新規登録API', () => {
    test('有効なデータで登録が成功する', async () => {
      const req = testUtils.createMockRequest('POST', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = testUtils.createMockResponse();

      // 既存ユーザーなしをモック
      sql.mockResolvedValueOnce({ rows: [] });
      // ユーザー作成をモック
      sql.mockResolvedValueOnce({
        rows: [{
          id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          created_at: new Date()
        }]
      });
      // プロフィール作成をモック
      sql.mockResolvedValueOnce({ rows: [] });

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User registered successfully',
          token: expect.any(String),
          user: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com'
          })
        })
      );
    });

    test('重複ユーザーで登録が失敗する', async () => {
      const req = testUtils.createMockRequest('POST', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      const res = testUtils.createMockResponse();

      // 既存ユーザーありをモック
      sql.mockResolvedValueOnce({ rows: [{ id: 'existing-user' }] });

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Username or email already exists'
        })
      );
    });

    test('無効なデータで登録が失敗する', async () => {
      const req = testUtils.createMockRequest('POST', {
        username: 'ab', // 短すぎる
        email: 'invalid-email',
        password: '123'
      });
      const res = testUtils.createMockResponse();

      await registerHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Validation failed',
          details: expect.any(Object)
        })
      );
    });
  });

  describe('ログインAPI', () => {
    test('有効な認証情報でログインが成功する', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);
      
      const req = testUtils.createMockRequest('POST', {
        identifier: 'testuser',
        password: password
      });
      const res = testUtils.createMockResponse();

      // ユーザー検索をモック
      sql.mockResolvedValueOnce({
        rows: [{
          id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          password_hash: hashedPassword,
          created_at: new Date()
        }]
      });

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Login successful',
          token: expect.any(String),
          user: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com'
          })
        })
      );
    });

    test('存在しないユーザーでログインが失敗する', async () => {
      const req = testUtils.createMockRequest('POST', {
        identifier: 'nonexistent',
        password: 'password123'
      });
      const res = testUtils.createMockResponse();

      // ユーザーなしをモック
      sql.mockResolvedValueOnce({ rows: [] });

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid credentials'
        })
      );
    });

    test('間違ったパスワードでログインが失敗する', async () => {
      const correctPassword = 'password123';
      const hashedPassword = await hashPassword(correctPassword);
      
      const req = testUtils.createMockRequest('POST', {
        identifier: 'testuser',
        password: 'wrongpassword'
      });
      const res = testUtils.createMockResponse();

      // ユーザー検索をモック
      sql.mockResolvedValueOnce({
        rows: [{
          id: 'test-user-id',
          username: 'testuser',
          email: 'test@example.com',
          password_hash: hashedPassword,
          created_at: new Date()
        }]
      });

      await loginHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Invalid credentials'
        })
      );
    });
  });
});