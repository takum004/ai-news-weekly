const { sql } = require('@vercel/postgres');
const favoritesHandler = require('../api/favorites/index');

describe('お気に入り機能', () => {
  const testToken = testUtils.generateTestToken();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('お気に入り一覧取得', () => {
    test('認証済みユーザーがお気に入り一覧を取得できる', async () => {
      const req = testUtils.createMockRequest('GET', {}, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      const mockFavorites = [
        {
          id: 'fav-1',
          article_url: 'https://example.com/article1',
          article_title: 'Test Article 1',
          article_summary: 'Summary 1',
          created_at: new Date()
        },
        {
          id: 'fav-2',
          article_url: 'https://example.com/article2',
          article_title: 'Test Article 2',
          article_summary: 'Summary 2',
          created_at: new Date()
        }
      ];

      sql.mockResolvedValueOnce({ rows: mockFavorites });

      await favoritesHandler(req, res);

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.anything()
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          favorites: mockFavorites
        })
      );
    });

    test('未認証ユーザーがアクセスを拒否される', async () => {
      const req = testUtils.createMockRequest('GET');
      const res = testUtils.createMockResponse();

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Authentication required'
        })
      );
    });
  });

  describe('お気に入り追加', () => {
    test('新しい記事をお気に入りに追加できる', async () => {
      const req = testUtils.createMockRequest('POST', {
        articleUrl: 'https://example.com/new-article',
        articleTitle: 'New Article',
        articleSummary: 'New Summary'
      }, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      // 既存チェック（なし）
      sql.mockResolvedValueOnce({ rows: [] });
      // 追加実行
      sql.mockResolvedValueOnce({
        rows: [{ id: 'new-fav-id', created_at: new Date() }]
      });

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Added to favorites',
          favorite: expect.objectContaining({
            articleUrl: 'https://example.com/new-article',
            articleTitle: 'New Article'
          })
        })
      );
    });

    test('既存の記事の重複追加が拒否される', async () => {
      const req = testUtils.createMockRequest('POST', {
        articleUrl: 'https://example.com/existing-article',
        articleTitle: 'Existing Article'
      }, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      // 既存チェック（あり）
      sql.mockResolvedValueOnce({ rows: [{ id: 'existing-fav' }] });

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Article already in favorites'
        })
      );
    });

    test('必須項目なしで追加が失敗する', async () => {
      const req = testUtils.createMockRequest('POST', {
        articleUrl: '', // 空
        articleTitle: '' // 空
      }, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Article URL and title are required'
        })
      );
    });
  });

  describe('お気に入り削除', () => {
    test('既存のお気に入りを削除できる', async () => {
      const req = testUtils.createMockRequest('DELETE', {
        articleUrl: 'https://example.com/article-to-delete'
      }, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      // 削除実行（成功）
      sql.mockResolvedValueOnce({ rows: [{ id: 'deleted-fav' }] });

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Removed from favorites'
        })
      );
    });

    test('存在しないお気に入りの削除が失敗する', async () => {
      const req = testUtils.createMockRequest('DELETE', {
        articleUrl: 'https://example.com/nonexistent-article'
      }, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      // 削除実行（対象なし）
      sql.mockResolvedValueOnce({ rows: [] });

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Favorite not found'
        })
      );
    });
  });

  describe('HTTPメソッド', () => {
    test('OPTIONSリクエストが正しく処理される', async () => {
      const req = testUtils.createMockRequest('OPTIONS');
      const res = testUtils.createMockResponse();

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalled();
    });

    test('サポートされていないHTTPメソッドでエラーが返される', async () => {
      const req = testUtils.createMockRequest('PUT', {}, testUtils.getAuthHeaders(testToken));
      const res = testUtils.createMockResponse();

      await favoritesHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Method not allowed'
        })
      );
    });
  });
});