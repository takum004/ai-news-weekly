const axios = require('axios');
const Parser = require('rss-parser');
const fs = require('fs').promises;
const path = require('path');
const { translateText, generateSummary } = require('./translate');

const parser = new Parser();

const NEWS_SOURCES = [
  // 主要AI研究機関・企業
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss/',
    type: 'rss',
    category: 'research'
  },
  {
    name: 'Google AI Blog',
    url: 'http://feeds.feedburner.com/blogspot/gJZg',
    type: 'rss',
    category: 'research'
  },
  {
    name: 'DeepMind Blog',
    url: 'https://deepmind.com/blog/feed/basic/',
    type: 'rss',
    category: 'research'
  },
  {
    name: 'Anthropic Blog',
    url: 'https://www.anthropic.com/rss.xml',
    type: 'rss',
    category: 'research'
  },
  
  // テクノロジーメディア
  {
    name: 'MIT Technology Review AI',
    url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed',
    type: 'rss',
    category: 'tech'
  },
  {
    name: 'AI News',
    url: 'https://www.artificialintelligence-news.com/feed/',
    type: 'rss',
    category: 'tech'
  },
  {
    name: 'VentureBeat AI',
    url: 'https://venturebeat.com/category/ai/feed/',
    type: 'rss',
    category: 'tech'
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
    type: 'rss',
    category: 'tech'
  },
  
  // 医療AI
  {
    name: 'Healthcare IT News AI',
    url: 'https://www.healthcareitnews.com/category/artificial-intelligence/feed',
    type: 'rss',
    category: 'healthcare'
  },
  {
    name: 'Medical AI News',
    url: 'https://medicalxpress.com/rss-feed/breaking/machine-learning-ai-news/',
    type: 'rss',
    category: 'healthcare'
  },
  
  // 研究論文・学術
  {
    name: 'arXiv AI',
    url: 'http://export.arxiv.org/rss/cs.AI',
    type: 'rss',
    category: 'academic'
  },
  {
    name: 'arXiv Machine Learning',
    url: 'http://export.arxiv.org/rss/cs.LG',
    type: 'rss',
    category: 'academic'
  },
  
  // ビジネス・スタートアップ
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    type: 'rss',
    category: 'business'
  },
  {
    name: 'Forbes AI',
    url: 'https://www.forbes.com/ai/feed/',
    type: 'rss',
    category: 'business'
  },
  
  // 日本のAIニュース
  {
    name: 'AI-SCHOLAR',
    url: 'https://ai-scholar.tech/feed',
    type: 'rss',
    category: 'japan'
  }
];

// 重要度を判定する関数
function calculateImportance(item, source) {
  let score = 0;
  const title = (item.title || '').toLowerCase();
  const content = (item.contentSnippet || item.content || '').toLowerCase();
  const combined = title + ' ' + content;
  
  // 重要なキーワード
  const importantKeywords = [
    'gpt', 'claude', 'gemini', 'llm', 'breakthrough', 'release', 'launch',
    'microsoft', 'google', 'openai', 'anthropic', 'meta', 'apple',
    'regulation', 'law', 'policy', 'billion', 'funding', 'acquisition',
    'medical breakthrough', 'clinical trial', 'fda', 'diagnosis',
    'autonomous', 'robot', 'quantum', 'neuromorphic'
  ];
  
  // 研究機関からのニュースは重要度を上げる
  if (['research', 'academic'].includes(source.category)) {
    score += 20;
  }
  
  // 重要キーワードのチェック
  importantKeywords.forEach(keyword => {
    if (combined.includes(keyword)) {
      score += 15;
    }
  });
  
  // タイトルに数字がある場合（資金調達、パフォーマンス向上など）
  if (/\d+/.test(title)) {
    score += 10;
  }
  
  // 新しいニュースほど重要
  const pubDate = new Date(item.pubDate);
  const daysSincePublished = (Date.now() - pubDate) / (1000 * 60 * 60 * 24);
  if (daysSincePublished < 1) {
    score += 30;
  } else if (daysSincePublished < 3) {
    score += 20;
  } else if (daysSincePublished < 7) {
    score += 10;
  }
  
  return score;
}

async function fetchRSSFeed(source) {
  try {
    console.log(`Fetching from ${source.name}...`);
    const feed = await parser.parseURL(source.url);
    
    const items = await Promise.all(feed.items.map(async item => {
      const translatedTitle = await translateText(item.title);
      const summary = generateSummary(item.contentSnippet || item.content || '');
      const translatedSummary = await translateText(summary);
      
      return {
        title: item.title,
        titleJa: translatedTitle,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentSnippet || item.content || '',
        summary: summary,
        summaryJa: translatedSummary,
        source: source.name,
        category: source.category,
        importance: calculateImportance(item, source)
      };
    }));
    
    return items;
  } catch (error) {
    console.error(`Error fetching ${source.name}:`, error.message);
    return [];
  }
}

async function fetchAllNews() {
  const allNews = [];
  
  // 並列でフェッチ（3つずつ）
  for (let i = 0; i < NEWS_SOURCES.length; i += 3) {
    const batch = NEWS_SOURCES.slice(i, i + 3);
    const results = await Promise.all(batch.map(source => fetchRSSFeed(source)));
    results.forEach(news => allNews.push(...news));
  }

  // 重複を除去（同じタイトルのニュースを削除）
  const uniqueNews = [];
  const seenTitles = new Set();
  
  for (const item of allNews) {
    const normalizedTitle = item.title.toLowerCase().trim();
    if (!seenTitles.has(normalizedTitle)) {
      seenTitles.add(normalizedTitle);
      uniqueNews.push(item);
    }
  }

  // 日付順でソート（最新が上）
  uniqueNews.sort((a, b) => {
    // まず日付で比較（新しい順）
    const dateA = new Date(a.pubDate);
    const dateB = new Date(b.pubDate);
    if (dateB.getTime() !== dateA.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    // 同じ日付なら重要度で比較
    return b.importance - a.importance;
  });
  
  // 重要度が一定以上のニュースのみを選択（上限なし）
  const importantNews = uniqueNews.filter(item => item.importance >= 30);
  
  console.log(`Found ${uniqueNews.length} unique news items, selected ${importantNews.length} important ones`);
  
  // データを保存
  const dataPath = path.join(__dirname, '..', 'data', 'news.json');
  await fs.writeFile(dataPath, JSON.stringify({
    lastUpdated: new Date().toISOString(),
    totalFound: uniqueNews.length,
    news: importantNews
  }, null, 2));
  
  console.log(`Saved ${importantNews.length} important news items`);
}

fetchAllNews().catch(console.error);