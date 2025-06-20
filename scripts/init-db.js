const { sql } = require('@vercel/postgres');

async function initDatabase() {
  try {
    // ユーザーテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // お気に入りテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        article_url VARCHAR(500) NOT NULL,
        article_title VARCHAR(500) NOT NULL,
        article_summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, article_url)
      )
    `;

    // ユーザープロフィールテーブルの作成
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        display_name VARCHAR(100),
        bio TEXT,
        avatar_url VARCHAR(500),
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ データベースの初期化が完了しました');
  } catch (error) {
    console.error('❌ データベース初期化エラー:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };