const fs = require('fs');
const axios = require('axios');
const Parser = require('rss-parser');

// RSS feeds for AI news (verified working feeds only)
const RSS_FEEDS = [
  'https://feeds.feedburner.com/venturebeat/SZYF',
  'https://www.technologyreview.com/feed/',
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.artificialintelligence-news.com/feed/',
  'https://openai.com/blog/rss.xml',
  // Removed problematic feeds:
  // 'https://hai.stanford.edu/news/rss.xml', // XML parsing error
  // 'https://www.anthropic.com/news.rss',   // 404 error
  // 'https://blog.google/products/ai/rss/'  // 404 error
];

// Keywords for AI news filtering
const AI_KEYWORDS = [
  'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'openai', 'anthropic', 'google ai', 'gemini',
  'gpt', 'claude', 'chatgpt', 'llm', 'generative ai', 'robotics',
  'automation', 'computer vision', 'natural language processing',
  'transformer', 'bert', 'ai model', 'ai research', 'ai breakthrough'
];

// Translation dictionary for common AI terms
const TRANSLATION_DICT = {
  'artificial intelligence': '人工知能',
  'machine learning': '機械学習',
  'deep learning': 'ディープラーニング',
  'neural network': 'ニューラルネットワーク',
  'natural language processing': '自然言語処理',
  'computer vision': 'コンピュータビジョン',
  'robotics': 'ロボティクス',
  'automation': 'オートメーション',
  'breakthrough': '画期的な進歩',
  'research': '研究',
  'development': '開発',
  'innovation': '革新',
  'technology': '技術',
  'algorithm': 'アルゴリズム',
  'data': 'データ',
  'model': 'モデル',
  'training': '訓練',
  'performance': '性能',
  'accuracy': '精度',
  'efficiency': '効率',
  'healthcare': 'ヘルスケア',
  'medical': '医療',
  'diagnosis': '診断',
  'treatment': '治療',
  'business': 'ビジネス',
  'enterprise': '企業',
  'investment': '投資',
  'funding': '資金調達',
  'startup': 'スタートアップ',
  'university': '大学',
  'academic': '学術',
  'paper': '論文',
  'study': '研究',
  'collaboration': '連携'
};

async function fetchNewsFromRSS() {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      'User-Agent': 'AI-News-Aggregator/1.0'
    }
  });
  
  const allArticles = [];
  
  for (const feedUrl of RSS_FEEDS) {
    try {
      console.log(`Fetching from: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items.slice(0, 15)) { // Latest 15 from each feed
        const title = item.title || '';
        const content = (item.content || item.summary || item.description || '').toLowerCase();
        const titleLower = title.toLowerCase();
        
        // Check if article is AI-related
        const isAIRelated = AI_KEYWORDS.some(keyword => 
          titleLower.includes(keyword) || content.includes(keyword)
        );
        
        if (isAIRelated) {
          const summary = extractSummary(item.content || item.summary || item.description || title);
          
          allArticles.push({
            id: generateId(item.link || item.guid || title),
            title: cleanText(title),
            titleJa: translateText(title),
            summary: cleanText(summary),
            summaryJa: translateText(summary),
            source: feed.title || extractDomain(feedUrl),
            category: categorizeArticle(title, content),
            importance: calculateImportance(title, content),
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            link: item.link || '#'
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching from ${feedUrl}:`, error.message);
    }
  }
  
  return allArticles;
}

function generateId(text) {
  return Buffer.from(text).toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 16) + '-' + Date.now().toString(36);
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 500); // Limit length
}

function extractSummary(content) {
  if (!content) return '';
  
  const cleaned = cleanText(content);
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Take first 2-3 sentences or up to 200 characters
  let summary = '';
  for (const sentence of sentences.slice(0, 3)) {
    if (summary.length + sentence.length > 300) break;
    summary += sentence.trim() + '. ';
  }
  
  return summary.trim();
}

function categorizeArticle(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('health') || text.includes('medical') || text.includes('drug') || text.includes('diagnosis')) {
    return 'healthcare';
  } else if (text.includes('robot') || text.includes('research') || text.includes('breakthrough') || text.includes('algorithm')) {
    return 'research';
  } else if (text.includes('business') || text.includes('invest') || text.includes('funding') || text.includes('enterprise')) {
    return 'business';
  } else if (text.includes('university') || text.includes('paper') || text.includes('study') || text.includes('academic')) {
    return 'academic';
  } else {
    return 'tech';
  }
}

function calculateImportance(title, content) {
  let score = 50;
  const text = (title + ' ' + content).toLowerCase();
  
  // High importance keywords
  if (text.includes('breakthrough') || text.includes('revolutionary')) score += 30;
  if (text.includes('openai') || text.includes('google') || text.includes('anthropic')) score += 25;
  if (text.includes('gpt-4') || text.includes('claude') || text.includes('gemini')) score += 20;
  if (text.includes('billion') || text.includes('major') || text.includes('launch')) score += 15;
  if (text.includes('first') || text.includes('new') || text.includes('release')) score += 10;
  if (text.includes('research') || text.includes('study')) score += 5;
  
  // Reduce score for less important content
  if (text.includes('rumor') || text.includes('speculation')) score -= 20;
  if (text.includes('opinion') || text.includes('editorial')) score -= 10;
  
  return Math.min(Math.max(score, 30), 100);
}

function translateText(text) {
  if (!text) return '';
  
  let translated = text;
  let hasTranslation = false;
  
  // Simple dictionary-based translation for key terms
  for (const [english, japanese] of Object.entries(TRANSLATION_DICT)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    if (translated.match(regex)) {
      translated = translated.replace(regex, japanese);
      hasTranslation = true;
    }
  }
  
  // Additional smart translation patterns
  const smartTranslations = [
    // Company names and products
    [/\bOpenAI\b/gi, 'OpenAI'],
    [/\bGoogle\b/gi, 'Google'],
    [/\bAnthropic\b/gi, 'Anthropic'],
    [/\bMicrosoft\b/gi, 'Microsoft'],
    [/\bGPT-?4\.?1?\b/gi, 'GPT-4.1'],
    [/\bClaude\s+4?\b/gi, 'Claude 4'],
    [/\bGemini\s+2\.5?\b/gi, 'Gemini 2.5'],
    
    // Action words
    [/\blaunches?\b/gi, '発表'],
    [/\bannounces?\b/gi, '発表'],
    [/\breleases?\b/gi, 'リリース'],
    [/\bintroduces?\b/gi, '導入'],
    [/\bunveils?\b/gi, '発表'],
    [/\breceives?\b/gi, '受領'],
    [/\bachieves?\b/gi, '達成'],
    [/\bdevelops?\b/gi, '開発'],
    [/\bcreates?\b/gi, '作成'],
    [/\btransforms?\b/gi, '変革'],
    [/\revolutionizes?\b/gi, '革命化'],
    
    // Common phrases
    [/\bfor the first time\b/gi, '初めて'],
    [/\baccording to\b/gi, 'によると'],
    [/\bin collaboration with\b/gi, 'との連携で'],
    [/\bis expected to\b/gi, 'と予想される'],
    [/\bhas been\b/gi, 'されている'],
    [/\bwill be\b/gi, 'される予定'],
    [/\bcan be\b/gi, 'できる'],
    
    // Technical terms
    [/\bmultimodal\b/gi, 'マルチモーダル'],
    [/\bfoundation models?\b/gi, '基盤モデル'],
    [/\bneural networks?\b/gi, 'ニューラルネットワーク'],
    [/\breal[- ]?time\b/gi, 'リアルタイム'],
    [/\bopen[- ]?source\b/gi, 'オープンソース'],
    [/\bcloud computing\b/gi, 'クラウドコンピューティング'],
    [/\bdata analysis\b/gi, 'データ分析'],
    [/\bmachine vision\b/gi, 'マシンビジョン'],
    [/\bpredictive analytics\b/gi, '予測分析'],
    
    // Numbers and measurements
    [/\$(\d+(?:\.\d+)?)\s*billion/gi, '$1億ドル'],
    [/\$(\d+(?:\.\d+)?)\s*million/gi, '$1万ドル'],
    [/(\d+)%\s*accuracy/gi, '$1%の精度'],
    [/(\d+)x\s*faster/gi, '$1倍高速'],
  ];
  
  for (const [pattern, replacement] of smartTranslations) {
    if (translated.match(pattern)) {
      translated = translated.replace(pattern, replacement);
      hasTranslation = true;
    }
  }
  
  // Return partial translation if we found some matches, otherwise empty string
  return hasTranslation ? translated : '';
}

async function main() {
  try {
    console.log('🤖 Starting AI news aggregation...');
    const articles = await fetchNewsFromRSS();
    
    if (articles.length === 0) {
      console.log('⚠️ No articles found, keeping existing data');
      return;
    }
    
    // Remove duplicates based on title similarity
    const uniqueArticles = [];
    for (const article of articles) {
      const isDuplicate = uniqueArticles.some(existing => 
        similarity(existing.title.toLowerCase(), article.title.toLowerCase()) > 0.8
      );
      if (!isDuplicate) {
        uniqueArticles.push(article);
      }
    }
    
    // Sort by importance and date, then take top 30
    const sortedArticles = uniqueArticles
      .sort((a, b) => {
        const importanceDiff = b.importance - a.importance;
        if (importanceDiff !== 0) return importanceDiff;
        return new Date(b.pubDate) - new Date(a.pubDate);
      })
      .slice(0, 30);
    
    const newsData = {
      lastUpdated: new Date().toISOString(),
      totalArticles: sortedArticles.length,
      generatedBy: 'AI News Aggregator v1.0',
      sources: RSS_FEEDS.length,
      articles: sortedArticles
    };
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync('data')) {
      fs.mkdirSync('data', { recursive: true });
    }
    
    // Write to data/news.json
    fs.writeFileSync('data/news.json', JSON.stringify(newsData, null, 2));
    
    console.log(`✅ Successfully updated with ${sortedArticles.length} articles`);
    console.log(`📊 Categories: ${getCategoryStats(sortedArticles)}`);
    console.log(`🔗 Sources: ${new Set(sortedArticles.map(a => a.source)).size} unique sources`);
    
  } catch (error) {
    console.error('❌ Error updating news:', error);
    process.exit(1);
  }
}

function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

function getCategoryStats(articles) {
  const stats = {};
  articles.forEach(article => {
    stats[article.category] = (stats[article.category] || 0) + 1;
  });
  return Object.entries(stats).map(([cat, count]) => `${cat}:${count}`).join(', ');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  fetchNewsFromRSS,
  categorizeArticle,
  calculateImportance,
  translateText
};