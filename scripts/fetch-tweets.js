const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs').promises;
const path = require('path');

// X (Twitter) アカウントリスト（無料プラン制限対応：重要5アカウントのみ）
const TWITTER_ACCOUNTS = [
  // 最重要AI企業のみに限定
  { handle: 'OpenAI', name: 'OpenAI', category: 'openai' },
  { handle: 'AnthropicAI', name: 'Anthropic', category: 'anthropic' },
  { handle: 'GoogleAI', name: 'Google AI', category: 'google' },
  { handle: 'midjourney', name: 'Midjourney', category: 'image_generation' },
  { handle: 'cursor_ai', name: 'Cursor', category: 'code_generation' }
];

// 将来的に有料プラン利用時に追加可能なアカウント
const ADDITIONAL_ACCOUNTS_FOR_PAID_PLAN = [
  { handle: 'MSFTResearch', name: 'Microsoft Research', category: 'microsoft' },
  { handle: 'DeepMind', name: 'DeepMind', category: 'google' },
  { handle: 'StabilityAI', name: 'Stability AI', category: 'image_generation' },
  { handle: 'runwayml', name: 'Runway', category: 'video_generation' },
  { handle: 'genspark_ai', name: 'Genspark', category: 'agents' },
  { handle: 'kling_ai', name: 'KlingAI', category: 'video_generation' },
  { handle: 'suno_ai_', name: 'Suno', category: 'music_generation' },
  { handle: 'ViduAI_official', name: 'Vidu', category: 'video_generation' }
];

// Twitter APIクライアントの初期化
function initializeTwitterClient() {
  if (!process.env.TWITTER_BEARER_TOKEN) {
    throw new Error('TWITTER_BEARER_TOKEN is not set');
  }
  
  return new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
}

// ツイートがAI関連かどうかを判定
function isAIRelatedTweet(text) {
  const AI_KEYWORDS = [
    'ai', 'artificial intelligence', 'machine learning', 'deep learning',
    'neural network', 'llm', 'gpt', 'model', 'release', 'update',
    'launch', 'announce', 'new feature', 'improvement', 'breakthrough',
    'research', 'paper', 'api', 'beta', 'preview', 'available'
  ];
  
  const lowerText = text.toLowerCase();
  return AI_KEYWORDS.some(keyword => lowerText.includes(keyword));
}

// ツイートを記事形式に変換
function convertTweetToArticle(tweet, account) {
  const text = tweet.text || '';
  const urls = tweet.entities?.urls || [];
  
  // URLを展開
  let expandedText = text;
  urls.forEach(url => {
    if (url.expanded_url) {
      expandedText = expandedText.replace(url.url, url.expanded_url);
    }
  });
  
  // タイトルを生成（最初の文またはツイートの要約）
  const sentences = expandedText.split(/[.!?]+/).filter(s => s.trim());
  const title = sentences[0] || expandedText.substring(0, 100);
  
  // 記事オブジェクトを作成
  return {
    id: `tweet_${tweet.id}`,
    title: `${account.name}: ${title.trim()}`,
    titleJa: '', // fetch-news.jsで翻訳される
    summary: expandedText,
    summaryJa: '', // fetch-news.jsで翻訳される
    source: `X (@${account.handle})`,
    category: account.category,
    importance: calculateTweetImportance(tweet, text),
    pubDate: new Date(tweet.created_at).toISOString(),
    link: `https://twitter.com/${account.handle}/status/${tweet.id}`,
    isTweet: true
  };
}

// ツイートの重要度を計算
function calculateTweetImportance(tweet, text) {
  let score = 50;
  
  // エンゲージメント指標
  const metrics = tweet.public_metrics || {};
  if (metrics.like_count > 1000) score += 20;
  else if (metrics.like_count > 500) score += 15;
  else if (metrics.like_count > 100) score += 10;
  
  if (metrics.retweet_count > 500) score += 15;
  else if (metrics.retweet_count > 100) score += 10;
  else if (metrics.retweet_count > 50) score += 5;
  
  // キーワードベースのスコアリング
  const importantKeywords = ['release', 'launch', 'announce', 'new', 'available', 'breakthrough'];
  const lowerText = text.toLowerCase();
  importantKeywords.forEach(keyword => {
    if (lowerText.includes(keyword)) score += 10;
  });
  
  // URLが含まれている場合（詳細情報へのリンク）
  if (tweet.entities?.urls?.length > 0) score += 5;
  
  return Math.min(Math.max(score, 30), 100);
}

// メイン処理
async function fetchTweets() {
  try {
    console.log('🐦 Starting Twitter/X feed collection...');
    const client = initializeTwitterClient();
    const v2Client = client.v2;
    
    const allTweets = [];
    const errors = [];
    
    // 各アカウントのツイートを取得
    for (const account of TWITTER_ACCOUNTS) {
      try {
        console.log(`Fetching tweets from @${account.handle}...`);
        
        // ユーザーIDを取得
        const user = await v2Client.userByUsername(account.handle);
        if (!user.data) {
          console.error(`User not found: @${account.handle}`);
          continue;
        }
        
        // 最新のツイートを取得（過去24時間）
        const tweets = await v2Client.userTimeline(user.data.id, {
          max_results: 5, // 無料プラン対応：10から5に削減
          exclude: ['retweets', 'replies'],
          'tweet.fields': ['created_at', 'public_metrics', 'entities'],
          start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        });
        
        if (!tweets.data || tweets.data.length === 0) {
          console.log(`No recent tweets from @${account.handle}`);
          continue;
        }
        
        // ツイートをフィルタリングして記事形式に変換
        const articles = tweets.data
          .filter(tweet => isAIRelatedTweet(tweet.text))
          .map(tweet => convertTweetToArticle(tweet, account));
        
        allTweets.push(...articles);
        console.log(`✓ @${account.handle}: ${articles.length} relevant tweets`);
        
      } catch (error) {
        console.error(`Error fetching tweets from @${account.handle}:`, error.message);
        errors.push({ account: account.handle, error: error.message });
      }
      
      // レート制限を避けるための待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n📊 Tweet Summary:`);
    console.log(`✅ Total AI-related tweets collected: ${allTweets.length}`);
    console.log(`❌ Failed accounts: ${errors.length}`);
    
    // API使用量の見積もり
    const tweetsPerDay = TWITTER_ACCOUNTS.length * 5 * 2; // アカウント数 × 5ツイート × 1日2回
    const tweetsPerMonth = tweetsPerDay * 30;
    console.log(`\n📈 API Usage Estimate:`);
    console.log(`- Per execution: ${TWITTER_ACCOUNTS.length * 5} tweets`);
    console.log(`- Per day (2x): ${tweetsPerDay} tweets`);
    console.log(`- Per month: ${tweetsPerMonth} tweets (Free tier limit: 1,500)`);
    
    // 重複チェック（同じ内容のツイート）
    const uniqueTweets = [];
    const seenTexts = new Set();
    
    for (const tweet of allTweets) {
      const normalizedText = tweet.summary.toLowerCase().replace(/\s+/g, ' ').trim();
      if (!seenTexts.has(normalizedText)) {
        seenTexts.add(normalizedText);
        uniqueTweets.push(tweet);
      }
    }
    
    console.log(`🔍 After deduplication: ${uniqueTweets.length} unique tweets`);
    
    // ファイルに保存
    const outputPath = path.join(__dirname, '..', 'data', 'tweets.json');
    await fs.writeFile(outputPath, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalTweets: uniqueTweets.length,
      tweets: uniqueTweets
    }, null, 2));
    
    console.log(`✅ Tweets saved to ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error in fetchTweets:', error);
    throw error;
  }
}

// エクスポート
module.exports = { fetchTweets, TWITTER_ACCOUNTS };

// 直接実行された場合
if (require.main === module) {
  fetchTweets().catch(console.error);
}