const { sql } = require('@vercel/postgres');
const { getUserFromRequest, sendResponse, sendError } = require('../utils/auth');

module.exports = async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const user = getUserFromRequest(req);

    switch (req.method) {
      case 'GET':
        return await getFavorites(req, res, user);
      case 'POST':
        return await addFavorite(req, res, user);
      case 'DELETE':
        return await removeFavorite(req, res, user);
      default:
        return sendError(res, 405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Favorites API error:', error);
    sendError(res, 401, 'Authentication required');
  }
}

// お気に入り一覧取得
async function getFavorites(req, res, user) {
  try {
    const result = await sql`
      SELECT 
        id,
        article_url,
        article_title,
        article_summary,
        created_at
      FROM favorites 
      WHERE user_id = ${user.userId}
      ORDER BY created_at DESC
    `;

    sendResponse(res, 200, {
      favorites: result.rows
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    sendError(res, 500, 'Failed to fetch favorites');
  }
}

// お気に入り追加
async function addFavorite(req, res, user) {
  try {
    const { articleUrl, articleTitle, articleSummary } = req.body;

    if (!articleUrl || !articleTitle) {
      return sendError(res, 400, 'Article URL and title are required');
    }

    // 既存チェック
    const existing = await sql`
      SELECT id FROM favorites 
      WHERE user_id = ${user.userId} AND article_url = ${articleUrl}
    `;

    if (existing.rows.length > 0) {
      return sendError(res, 409, 'Article already in favorites');
    }

    // 追加
    const result = await sql`
      INSERT INTO favorites (user_id, article_url, article_title, article_summary)
      VALUES (${user.userId}, ${articleUrl}, ${articleTitle}, ${articleSummary || null})
      RETURNING id, created_at
    `;

    sendResponse(res, 201, {
      message: 'Added to favorites',
      favorite: {
        id: result.rows[0].id,
        articleUrl,
        articleTitle,
        articleSummary,
        createdAt: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    sendError(res, 500, 'Failed to add favorite');
  }
}

// お気に入り削除
async function removeFavorite(req, res, user) {
  try {
    const { articleUrl } = req.body;

    if (!articleUrl) {
      return sendError(res, 400, 'Article URL is required');
    }

    const result = await sql`
      DELETE FROM favorites 
      WHERE user_id = ${user.userId} AND article_url = ${articleUrl}
      RETURNING id
    `;

    if (result.rows.length === 0) {
      return sendError(res, 404, 'Favorite not found');
    }

    sendResponse(res, 200, {
      message: 'Removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    sendError(res, 500, 'Failed to remove favorite');
  }
}