const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 12;

/**
 * パスワードをハッシュ化
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * パスワードを検証
 */
async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * JWTトークンを生成
 */
function generateToken(userId, username) {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * JWTトークンを検証
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * リクエストからユーザー情報を取得
 */
function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No valid authorization header');
  }
  
  const token = authHeader.substring(7);
  return verifyToken(token);
}

/**
 * 入力値のバリデーション
 */
function validateInput(data, rules) {
  const errors = {};
  
  for (const field in rules) {
    const value = data[field];
    const rule = rules[field];
    
    if (rule.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} must be less than ${rule.maxLength} characters`;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} format is invalid`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * レスポンスヘルパー
 */
function sendResponse(res, status, data) {
  res.status(status).json({
    success: status < 400,
    ...data,
    timestamp: new Date().toISOString()
  });
}

/**
 * エラーレスポンスヘルパー
 */
function sendError(res, status, message, details = null) {
  sendResponse(res, status, {
    error: message,
    ...(details && { details })
  });
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  getUserFromRequest,
  validateInput,
  sendResponse,
  sendError
};