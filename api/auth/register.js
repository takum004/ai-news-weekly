const { sql } = require('@vercel/postgres');
const { hashPassword, generateToken, validateInput, sendResponse, sendError } = require('../utils/auth');

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
    const { username, email, password } = req.body;

    // バリデーション
    const validation = validateInput({ username, email, password }, {
      username: {
        required: true,
        minLength: 3,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9_]+$/,
        message: 'Username can only contain letters, numbers, and underscores'
      },
      email: {
        required: true,
        maxLength: 255,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      password: {
        required: true,
        minLength: 8,
        maxLength: 128
      }
    });

    if (!validation.isValid) {
      return sendError(res, 400, 'Validation failed', validation.errors);
    }

    // 既存ユーザーチェック
    const existingUser = await sql`
      SELECT id FROM users 
      WHERE username = ${username} OR email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return sendError(res, 409, 'Username or email already exists');
    }

    // パスワードハッシュ化
    const passwordHash = await hashPassword(password);

    // ユーザー作成
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email, created_at
    `;

    const newUser = result.rows[0];

    // プロフィール初期化
    await sql`
      INSERT INTO user_profiles (user_id, display_name)
      VALUES (${newUser.id}, ${username})
    `;

    // JWTトークン生成
    const token = generateToken(newUser.id, newUser.username);

    sendResponse(res, 201, {
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 500, 'Internal server error');
  }
}