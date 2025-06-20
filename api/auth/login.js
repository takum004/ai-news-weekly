const { sql } = require('@vercel/postgres');
const { verifyPassword, generateToken, validateInput, sendResponse, sendError } = require('../utils/auth');

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

  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const { identifier, password } = req.body;

    // バリデーション
    const validation = validateInput({ identifier, password }, {
      identifier: {
        required: true,
        message: 'Username or email is required'
      },
      password: {
        required: true,
        message: 'Password is required'
      }
    });

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', validation.errors);
    }

    // ユーザー検索（username または email）
    const userResult = await sql`
      SELECT id, username, email, password_hash, created_at
      FROM users 
      WHERE username = ${identifier} OR email = ${identifier}
    `;

    if (userResult.rows.length === 0) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const user = userResult.rows[0];

    // パスワード検証
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // JWTトークン生成
    const token = generateToken(user.id, user.username);

    sendResponse(res, 200, {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 500, 'Internal server error');
  }
}