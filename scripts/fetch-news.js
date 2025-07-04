const fs = require('fs');
const axios = require('axios');
const Parser = require('rss-parser');

// Verified RSS feeds for comprehensive AI news coverage (200 articles from working sources)
// Expanded to include more sources for better coverage
const RSS_FEEDS = [
  // High-frequency AI News Sources (Updated Daily or Multiple Times Daily)
  'https://techcrunch.com/category/artificial-intelligence/feed/', // Very active, daily updates
  'https://www.artificialintelligence-news.com/feed/', // AI-focused, frequent updates
  'https://www.marktechpost.com/feed/', // Very active AI news
  'https://venturebeat.com/feed/', // Re-enabled - main feed works
  'https://thenextweb.com/neural/feed', // TNW Neural - AI section
  'https://www.zdnet.com/topic/artificial-intelligence/rss.xml', // ZDNet AI section
  'https://www.cnet.com/rss/news/', // CNET general tech including AI
  'https://www.engadget.com/rss.xml', // Engadget tech news
  
  // Major Tech Publications - AI Coverage
  'https://www.technologyreview.com/feed/',
  'https://www.wired.com/feed/tag/ai/latest/rss',
  'https://arstechnica.com/feed/',
  // 'https://spectrum.ieee.org/rss', // Removed - certificate/DNS issues
  
  // Major AI Companies & Models - Verified Working
  'https://openai.com/blog/rss.xml',
  'https://blog.google/technology/ai/rss/',
  'https://blogs.microsoft.com/ai/feed/',
  'https://blogs.nvidia.com/feed/',
  'https://www.microsoft.com/en-us/research/feed/',
  
  // Creative AI & Generation Tools - Verified Working
  'https://huggingface.co/blog/feed.xml',
  
  // Developer Tools & Platforms - Verified Working
  'https://pytorch.org/blog/feed.xml',
  'https://blog.tensorflow.org/feeds/posts/default',
  
  // Research & Academic Sources - Verified Working
  'https://blog.research.google/feeds/posts/default',
  'https://www.deepmind.com/blog/rss.xml',
  'https://bair.berkeley.edu/blog/feed.xml', // Berkeley AI Research
  'https://aws.amazon.com/blogs/machine-learning/feed/', // AWS ML Blog
  'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml', // ScienceDaily AI
  'https://rss.arxiv.org/rss/cs.AI', // arXiv Artificial Intelligence papers
  'https://rss.arxiv.org/rss/cs.LG', // arXiv Machine Learning papers
  'https://rss.arxiv.org/rss/cs.CV', // arXiv Computer Vision papers
  'https://rss.arxiv.org/rss/cs.CL', // arXiv Computation and Language papers
  'https://rss.arxiv.org/rss/cs.NE', // arXiv Neural and Evolutionary Computing
  
  // News & Analysis Platforms - Verified Working
  'https://machinelearningmastery.com/feed/',
  'https://analyticsindiamag.com/feed/',
  'https://www.kdnuggets.com/feed',
  'https://towardsdatascience.com/feed',
  'https://syncedreview.com/feed/', // Active AI news
  'https://www.unite.ai/feed/', // Frequent AI updates
  
  // Industry & Business - Verified Working
  // 'https://techcrunch.com/tag/artificial-intelligence/feed/', // Duplicate of above TechCrunch feed
  
  // Specialized AI Applications - Verified Working
  'https://www.roboticsbusinessreview.com/feed/',
  
  // International Sources - Verified Working
  // 'https://www.scmp.com/rss/91/feed', // Removed - 403 forbidden
  'https://www.bbc.com/news/technology/rss.xml',
  'https://www.theguardian.com/technology/rss',
  
  // Japanese Sources - Verified Working
  // 'https://tech.nikkeibp.co.jp/rss/index.rdf', // Removed - 403 forbidden/paywall
  'https://rss.itmedia.co.jp/rss/2.0/aiplus.xml', // ITmedia AI+ - AI/ML focused news
  'https://news.livedoor.com/topics/rss/inet.xml', // Livedoor IT/Internet News
  'https://gigazine.net/news/rss_2.0/', // Gigazine - Tech/Science news
  
  // Developer Tools & GitHub - Critical for AI tools coverage
  'https://github.blog/feed',
  'https://github.blog/engineering/feed',
  'https://www.anthropic.com/rss.xml', // Anthropic (Claude) updates
  'https://jack-clark.net/feed/', // Import AI by Jack Clark
  // 'https://www.artificial-intelligence.blog/rss', // Removed - DNS/certificate issues
  
  // New Developer & Investment Sources (Added 2025-07-01)
  'https://developers.googleblog.com/feeds/posts/default', // Google Developers Blog - AI/ML content
  'https://www.ainvest.com/feed/', // AI Investment & Business Analysis
  
  // Japanese AI Research & News Sources (Added 2025-07-01)
  'https://sakana.ai/blog/feed', // Sakana AI - Japanese AI research company
  'https://innovatopia.jp/feed/', // Innovatopia - Japanese AI news
  
  // Emerging Sources - Verified Working
  // 'https://stratechery.com/feed/', // Removed - paywall/limited access
  
  // Additional High-Quality Sources for 200 Articles
  'https://www.axios.com/technology/rss',
  'https://siliconangle.com/feed/',
  'https://singularityhub.com/feed/',
  'https://hai.stanford.edu/news/rss.xml',
  'https://news.mit.edu/rss/topic/artificial-intelligence2',
  'https://www.cmu.edu/news/rss/all.xml',
  'https://www.berkeley.edu/news/rss/all.xml',
  'https://www.pcmag.com/feeds/all', // PCMag tech news
  'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', // The Verge AI section
  'https://www.reuters.com/technology/rss', // Reuters Technology
  'https://feeds.bloomberg.com/technology/news.rss', // Bloomberg Technology
  'https://feeds.npr.org/1019/rss.xml', // NPR Technology
  // 'https://www.cs.cmu.edu/news/rss.xml', // Removed - 404 not found
  // 'https://www.ai.org/feed/', // Removed - DNS/site issues
  // 'https://syncedreview.com/feed/', // Duplicate - already included above
  'https://www.datasciencecentral.com/feed/',
  // 'https://www.informationweek.com/rss_simple.asp', // Removed - 404 not found
  // 'https://www.computerworld.com/index.rss', // Removed - 404 not found
  // 'https://www.infoworld.com/category/artificial-intelligence/index.rss', // Removed - 404 not found
  'https://www.datanami.com/feed/',
  'https://insidebigdata.com/feed/',
  // 'https://www.aitrends.com/feed/', // Removed - site inactive
  // 'https://www.aitimejournal.com/feed', // Removed - DNS/certificate issues
  'https://emerj.com/feed/',
  // 'https://lexfridman.com/podcast/rss', // Removed - podcast feed, not news
  // 'https://twimlai.com/rss/', // Removed - podcast feed, not news
  // 'https://practical.ai/index.xml', // Removed - podcast feed, not news
  'https://www.thegradient.pub/rss/',
  // 'https://thebatch.ai/rss.xml', // Removed - 404 not found
  'https://www.fast.ai/feed.xml',
  // 'https://openai.com/research/rss.xml', // Removed - 404 not found
  // 'https://deepmind.com/blog/rss.xml', // Removed - duplicate of above DeepMind feed
  // 'https://ai.googleblog.com/feeds/posts/default', // Removed - redirects to blog.google
  // 'https://research.fb.com/feed/', // Already added as Meta AI Research
  // 'https://www.microsoft.com/en-us/research/blog/feed/', // Duplicate of above Microsoft Research feed
  // 'https://bair.berkeley.edu/blog/feed.xml', // Already added above
  // 'https://dawn.cs.stanford.edu/blog/feed/', // Removed - inactive/404
  // 'https://mlsys.org/feed.xml', // Removed - conference site, not news
  // 'https://jack-clark.net/feed/', // Already added above
  // 'https://www.oreilly.com/radar/topics/ai-ml/feed', // Removed - 404 not found
  // 'https://towards.ai/feed', // Removed - redirects/parse issues
  // 'https://medium.com/feed/the-gradient', // Removed - Medium feeds unreliable
  // 'https://medium.com/feed/ai-in-plain-english', // Removed - Medium feeds unreliable
  // 'https://medium.com/feed/syncedreview', // Removed - Medium feeds unreliable
  // 'https://medium.com/feed/towards-artificial-intelligence', // Removed - Medium feeds unreliable
  'https://blog.research.google/feeds/posts/default/-/Machine%20Learning',
  'https://blog.research.google/feeds/posts/default/-/Natural%20Language%20Processing',
  'https://blog.research.google/feeds/posts/default/-/Computer%20Vision',
  'https://feeds.feedburner.com/blogspot/gJZg', // Google Research Blog
  // 'https://www.deeplearning.ai/the-batch/feed/', // Removed - 404 not found
  // 'https://www.alignmentforum.org/feed.xml' // Removed - specialized/low volume
];

// Enhanced keywords for comprehensive AI news filtering
const AI_KEYWORDS = [
  // Core AI Terms
  'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'llm', 'generative ai', 'transformer',
  'computer vision', 'natural language processing', 'nlp',
  
  // Companies & Models
  'openai', 'anthropic', 'google ai', 'gemini', 'deepmind',
  'gpt', 'claude', 'chatgpt', 'bard', 'copilot', 'llama',
  'palm', 'bert', 'dall-e', 'sora', 'midjourney',
  'cursor', 'windsurf', 'codeium', 'github copilot', 'notebooklm', 'genspark',
  
  // AI Applications
  'video generation', 'image generation', 'audio generation',
  'voice synthesis', 'text-to-speech', 'speech recognition',
  'ai agent', 'autonomous agent', 'workflow automation',
  'presentation ai', 'slide generation', 'content creation',
  
  // Industry & Tools
  'ai model', 'ai research', 'ai breakthrough', 'ai startup',
  'stable diffusion', 'runway ml', 'elevenlabs', 'gamma',
  'tome', 'notion ai', 'jasper ai', 'copy.ai',
  
  // Technical Terms
  'multimodal', 'foundation model', 'fine-tuning',
  'prompt engineering', 'reinforcement learning', 'robotics',
  'automation', 'rpa', 'computer vision', 'diffusion model',
  
  // Japanese AI Terms
  '人工知能', 'AI', 'チャットボット', 'GPT', 'Claude',
  '機械学習', 'ディープラーニング', '生成AI', '自然言語処理',
  'コンピュータビジョン', 'ニューラルネットワーク', '大規模言語モデル'
];

// Enhanced translation dictionary for AI terms
const TRANSLATION_DICT = {
  // Core AI Terms
  'artificial intelligence': '人工知能',
  'machine learning': '機械学習',
  'deep learning': 'ディープラーニング',
  'neural network': 'ニューラルネットワーク',
  'natural language processing': '自然言語処理',
  'computer vision': 'コンピュータビジョン',
  'generative ai': '生成AI',
  'transformer': 'Transformer',
  'foundation model': '基盤モデル',
  'large language model': '大規模言語モデル',
  'llm': 'LLM',
  
  // Companies & Models
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'google': 'Google',
  'microsoft': 'Microsoft',
  'meta': 'Meta',
  'chatgpt': 'ChatGPT',
  'claude': 'Claude',
  'gemini': 'Gemini',
  'copilot': 'Copilot',
  'bard': 'Bard',
  
  // AI Applications
  'video generation': '動画生成',
  'image generation': '画像生成',
  'audio generation': '音声生成',
  'voice synthesis': '音声合成',
  'text-to-speech': 'テキスト読み上げ',
  'speech recognition': '音声認識',
  'presentation': 'プレゼンテーション',
  'slide generation': 'スライド生成',
  'content creation': 'コンテンツ作成',
  'ai agent': 'AIエージェント',
  'autonomous agent': '自律エージェント',
  'workflow automation': 'ワークフロー自動化',
  
  // Technical Terms
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
  'fine-tuning': 'ファインチューニング',
  'prompt engineering': 'プロンプトエンジニアリング',
  'performance': '性能',
  'accuracy': '精度',
  'efficiency': '効率',
  'multimodal': 'マルチモーダル',
  'diffusion model': '拡散モデル',
  
  // Domain Areas
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
  'collaboration': '連携',
  'conference': '会議',
  'journal': 'ジャーナル'
};

async function fetchNewsFromRSS() {
  const parser = new Parser({
    timeout: 15000, // Increased timeout for better reliability
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    maxRedirects: 5
  });
  
  const allArticles = [];
  let processedFeeds = 0;
  let successfulFeeds = 0;
  const failedFeeds = [];
  
  // Calculate date 7 days ago and current date
  const now = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // 1週間以内のニュースを取得
  
  console.log(`Fetching from ${RSS_FEEDS.length} RSS feeds...`);
  console.log(`Filtering articles between: ${oneWeekAgo.toISOString()} and ${now.toISOString()}`);
  
  // バッチ処理で並列実行（10個ずつ）
  const batchSize = 10;
  for (let i = 0; i < RSS_FEEDS.length; i += batchSize) {
    const batch = RSS_FEEDS.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (feedUrl) => {
    try {
      console.log(`Fetching from: ${feedUrl}`);
      
      // Add retry mechanism with exponential backoff
      let retryCount = 0;
      let feed = null;
      
      while (retryCount < 3 && !feed) {
        try {
          if (retryCount > 0) {
            const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`Retrying ${feedUrl} in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          feed = await parser.parseURL(feedUrl);
          break;
        } catch (retryError) {
          retryCount++;
          if (retryCount >= 3) {
            throw retryError;
          }
        }
      }
      
      if (!feed) {
        throw new Error('Failed after 3 retries');
      }
      
      let feedArticleCount = 0;
      
      for (const item of feed.items.slice(0, 10)) { // Increased from 8 to 10 items per feed
        const title = item.title || '';
        const content = (item.content || item.summary || item.description || '').toLowerCase();
        const titleLower = title.toLowerCase();
        
        // Enhanced AI content filtering
        const isAIRelated = AI_KEYWORDS.some(keyword => {
          const keywordLower = keyword.toLowerCase();
          return titleLower.includes(keywordLower) || 
                 content.includes(keywordLower) ||
                 (item.categories && item.categories.some(cat => {
                   // カテゴリが文字列でない場合の対応
                   if (typeof cat === 'string') {
                     const catLower = cat.toLowerCase();
                     return catLower.includes('ai') || 
                            catLower.includes('artificial') ||
                            catLower.includes('machine');
                   } else if (cat && typeof cat === 'object') {
                     // カテゴリがオブジェクトの場合（{term: "AI"} など）
                     const catStr = cat.term || cat.name || cat.label || '';
                     const catLower = catStr.toLowerCase();
                     return catLower.includes('ai') || 
                            catLower.includes('artificial') ||
                            catLower.includes('machine');
                   }
                   return false;
                 }));
        });
        
        if (isAIRelated && title.length > 10 && item.link && item.link.startsWith('http')) {
          try {
            // Parse article date
            const articleDate = new Date(item.pubDate || item.isoDate || item.date || new Date());
            
            // Skip articles older than 1 week or in the future
            if (articleDate < oneWeekAgo || articleDate > now) {
              continue;
            }
            
            const summary = extractSummary(item.content || item.summary || item.description || title);
            
            // 翻訳を無効化 - 英語のまま表示
            const translatedTitle = title;
            const translatedSummary = summary;
            
            // 日本語要約も英語のまま
            const improvedSummaryJa = summary;
            
            const article = {
              id: generateId(item.link || item.guid || title),
              title: cleanText(title),
              summary: cleanText(summary),
              source: extractSourceName(feed.title, feedUrl),
              category: categorizeArticle(title, content),
              importance: calculateImportance(title, content, articleDate),
              pubDate: articleDate.toISOString(),
              link: item.link
            };
            
            // Additional validation
            if (article.title.length > 10 && article.summary.length > 20) {
              allArticles.push(article);
              feedArticleCount++;
            }
          } catch (articleError) {
            console.error(`Error processing article from ${feedUrl}:`, articleError.message);
          }
        }
      }
      
      console.log(`✓ ${extractDomain(feedUrl)}: ${feedArticleCount} articles`);
      successfulFeeds++;
      
    } catch (error) {
      console.error(`✗ Error fetching from ${feedUrl}: ${error.message}`);
      failedFeeds.push({ url: feedUrl, error: error.message });
    }
    
    processedFeeds++;
    }));
    
    console.log(`Progress: ${Math.min(i + batchSize, RSS_FEEDS.length)}/${RSS_FEEDS.length} feeds processed...`);
  }
  
  console.log(`\n📊 Feed Summary:`);
  console.log(`✅ Successful: ${successfulFeeds}/${RSS_FEEDS.length} feeds`);
  console.log(`❌ Failed: ${failedFeeds.length}/${RSS_FEEDS.length} feeds`);
  console.log(`📰 Total articles collected: ${allArticles.length}`);
  console.log(`🗓️  Articles from last 7 days only`);
  
  if (failedFeeds.length > 0) {
    console.log(`\n⚠️ Failed feeds (for debugging):`);
    failedFeeds.slice(0, 5).forEach(f => console.log(`   ${extractDomain(f.url)}: ${f.error.substring(0, 80)}...`));
    if (failedFeeds.length > 5) {
      console.log(`   ... and ${failedFeeds.length - 5} more failed feeds`);
    }
  }
  
  return allArticles;
}

function generateId(text) {
  // URLのハッシュを生成して一意で固定のIDを作成
  const base64 = Buffer.from(text).toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '');
  
  // 長すぎる場合は最初の32文字に制限
  return base64.length > 32 ? base64.slice(0, 32) : base64;
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

// Extract clean source name from feed title
function extractSourceName(feedTitle, feedUrl) {
  if (!feedTitle) {
    return extractDomain(feedUrl);
  }
  
  // Remove common prefixes and suffixes
  let source = feedTitle;
  
  // If title contains | or -, take the last part (usually the source name)
  if (source.includes('|')) {
    source = source.split('|').pop().trim();
  } else if (source.includes(' - ') && source.split(' - ').length > 1) {
    source = source.split(' - ').pop().trim();
  }
  
  // Remove common suffixes
  source = source
    .replace(/\s*(RSS|Feed|News Feed|Blog|AI News|Artificial Intelligence|Tech News)\s*$/i, '')
    .replace(/\s*(\(.*\))\s*$/g, '') // Remove content in parentheses
    .trim();
  
  // Map known sources to clean names
  const sourceMap = {
    'techcrunch': 'TechCrunch',
    'venturebeat': 'VentureBeat',
    'the verge': 'The Verge',
    'ars technica': 'Ars Technica',
    'wired': 'WIRED',
    'mit technology review': 'MIT Technology Review',
    'zdnet': 'ZDNet',
    'cnet': 'CNET',
    'engadget': 'Engadget',
    'the next web': 'The Next Web',
    'tnw': 'The Next Web',
    'bloomberg': 'Bloomberg',
    'reuters': 'Reuters',
    'bbc': 'BBC',
    'the guardian': 'The Guardian',
    'hugging face': 'Hugging Face',
    'openai': 'OpenAI',
    'google': 'Google AI',
    'microsoft': 'Microsoft Research',
    'anthropic': 'Anthropic',
    'deepmind': 'DeepMind',
    'nvidia': 'NVIDIA',
    'meta': 'Meta AI',
    'berkeley': 'Berkeley AI Research',
    'stanford': 'Stanford HAI',
    'mit': 'MIT News',
    'axios': 'Axios',
    'siliconangle': 'SiliconANGLE',
    'singularityhub': 'Singularity Hub',
    'hai': 'Stanford HAI',
    'cmu': 'CMU',
    'pcmag': 'PCMag',
    'npr': 'NPR',
    'datasciencecentral': 'Data Science Central',
    'datanami': 'Datanami',
    'insidebigdata': 'insideBigData',
    'emerj': 'Emerj',
    'thegradient': 'The Gradient',
    'fast': 'fast.ai',
    'syncedreview': 'Synced',
    'decrypt': 'Decrypt',
    'gizmodo': 'Gizmodo',
    'artificialintelligence-news': 'AI News',
    'importai': 'Import AI',
    'gigaom': 'Gigaom',
    'marktechpost': 'MarkTechPost',
    'analyticsinsight': 'Analytics Insight',
    'kdnuggets': 'KDnuggets',
    'itpro': 'ITPro',
    'cio': 'CIO',
    'informationweek': 'InformationWeek',
    'sciencedaily': 'ScienceDaily'
  };
  
  // Check if we have a known mapping
  const sourceLower = source.toLowerCase();
  for (const [key, value] of Object.entries(sourceMap)) {
    if (sourceLower.includes(key)) {
      return value;
    }
  }
  
  // If no mapping found, return the cleaned source
  return source || extractDomain(feedUrl);
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

// 日本語要約の改善
function improveJapaneseSummary(translatedSummary, originalSummary, translatedTitle) {
  // 翻訳が失敗した場合の処理
  if (!translatedSummary || translatedSummary === originalSummary) {
    // タイトルから基本的な要約を生成
    if (translatedTitle && translatedTitle !== originalSummary) {
      return `${translatedTitle}に関するニュース。`;
    }
    // フォールバック
    return 'ニュースの詳細はリンク先をご確認ください。';
  }
  
  // 要約が長すぎる場合の対応
  if (translatedSummary.length > 200) {
    // 最初の200文字 + "..."
    const truncated = translatedSummary.substring(0, 197) + '...';
    // 最後の句点で切る
    const lastPeriod = truncated.lastIndexOf('。');
    if (lastPeriod > 100) {
      return truncated.substring(0, lastPeriod + 1);
    }
    return truncated;
  }
  
  // 要約が短すぎる場合の対応
  if (translatedSummary.length < 50 && translatedTitle) {
    // タイトルを使って補完
    if (!translatedSummary.includes(translatedTitle)) {
      return `${translatedTitle}に関する内容。${translatedSummary}`;
    }
  }
  
  // 句点の追加
  if (!translatedSummary.endsWith('。') && !translatedSummary.endsWith('!') && !translatedSummary.endsWith('?')) {
    return translatedSummary + '。';
  }
  
  return translatedSummary;
}

function categorizeArticle(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const titleLower = title.toLowerCase();
  
  // Helper function to check if article is primarily about a company
  const isAboutCompany = (company, keywords) => {
    // Check if company name is in title
    if (titleLower.includes(company)) {
      return true;
    }
    
    // Count keyword occurrences
    let keywordCount = 0;
    keywords.forEach(keyword => {
      const matches = (text.match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
      keywordCount += matches;
    });
    
    // Article is about the company if multiple keywords appear
    return keywordCount >= 3;
  };
  
  // Company/Model specific categories (highest priority - but only if article is ABOUT them)
  if (isAboutCompany('openai', ['openai', 'gpt-4', 'gpt-3', 'chatgpt', 'dall-e', 'sora', 'o1', 'o3'])) {
    return 'openai';
  }
  if (isAboutCompany('google', ['google', 'gemini', 'bard', 'deepmind', 'palm', 'vertex']) || 
      isAboutCompany('deepmind', ['deepmind', 'alphafold', 'alphagenome'])) {
    return 'google';
  }
  if (isAboutCompany('anthropic', ['anthropic', 'claude', 'constitutional ai'])) {
    return 'anthropic';
  }
  if (isAboutCompany('microsoft', ['microsoft', 'copilot', 'azure ai', 'bing ai', 'bing chat'])) {
    return 'microsoft';
  }
  if (isAboutCompany('meta', ['meta', 'llama', 'facebook ai', 'metaai', 'reality labs'])) {
    return 'meta';
  }
  if (isAboutCompany('xai', ['xai', 'grok']) || (titleLower.includes('elon musk') && text.includes('ai'))) {
    return 'xai';
  }
  if (isAboutCompany('nvidia', ['nvidia', 'cuda', 'tensor', 'rtx', 'geforce']) && text.includes('ai')) {
    return 'nvidia';
  }
  
  // AI Application Areas - Creative (second priority) - 細分化
  if (text.includes('video generation') || text.includes('video ai') || text.includes('runway') || text.includes('pika') || text.includes('video synthesis') || text.includes('motion') || text.includes('film') || text.includes('movie') || text.includes('sora') || text.includes('video creator') || text.includes('text-to-video') || text.includes('video editing')) {
    return 'video_generation';
  }
  if (text.includes('image generation') || text.includes('midjourney') || text.includes('stable diffusion') || text.includes('dall-e') || text.includes('imagen') || text.includes('art generation') || text.includes('creative ai') || text.includes('drawing') || text.includes('text-to-image') || text.includes('image synthesis') || text.includes('art ai')) {
    return 'image_generation';
  }
  if (text.includes('audio generation') || text.includes('speech synthesis') || text.includes('voice synthesis') || text.includes('tts') || text.includes('elevenlabs') || text.includes('audio ai')) {
    return 'audio_generation';
  }
  if (text.includes('music generation') || text.includes('music ai') || text.includes('suno') || text.includes('udio') || text.includes('mubert') || text.includes('composing') || text.includes('soundtrack')) {
    return 'music_generation';
  }
  if (text.includes('voice cloning') || text.includes('voice clone') || text.includes('voice mimicry') || text.includes('voice ai') || text.includes('speaker identification')) {
    return 'voice_cloning';
  }
  if (text.includes('3d modeling') || text.includes('3d generation') || text.includes('blender') || text.includes('meshy') || text.includes('spline') || text.includes('3d ai')) {
    return '3d_modeling';
  }
  
  // AI Application Areas - Productivity (third priority)
  if (text.includes('presentation') || text.includes('slide') || text.includes('powerpoint') || text.includes('gamma') || text.includes('tome') || text.includes('pitch deck') || text.includes('slides')) {
    return 'presentation';
  }
  if (text.includes('agent') || text.includes('autonomous') || text.includes('multi-agent') || text.includes('ai assistant') || text.includes('workflow') || text.includes('task automation')) {
    return 'agents';
  }
  if (text.includes('automation') || text.includes('rpa') || text.includes('robotic process') || text.includes('workflow automation') || text.includes('zapier') || text.includes('no-code')) {
    return 'automation';
  }
  if (text.includes('code generation') || text.includes('coding ai') || text.includes('programming') || text.includes('github copilot') || text.includes('cursor') || text.includes('replit')) {
    return 'code_generation';
  }
  if (text.includes('translation') || text.includes('translate') || text.includes('language translation') || text.includes('multilingual') || text.includes('localization')) {
    return 'translation';
  }
  
  // AI Application Areas - Advanced (fourth priority)
  if (text.includes('multimodal') || text.includes('multi-modal') || text.includes('vision language') || text.includes('cross-modal')) {
    return 'multimodal';
  }
  if (text.includes('reasoning') || text.includes('logical reasoning') || text.includes('chain of thought') || text.includes('problem solving') || text.includes('inference')) {
    return 'reasoning';
  }
  if (text.includes('robotics') || text.includes('robot') || text.includes('embodied ai') || text.includes('robotic') || text.includes('manipulation')) {
    return 'robotics';
  }
  if (text.includes('gaming') || text.includes('game ai') || text.includes('npc') || text.includes('procedural generation') || text.includes('game development')) {
    return 'gaming';
  }
  
  // Domain-specific categories (third priority)
  if (text.includes('health') || text.includes('medical') || text.includes('drug') || text.includes('diagnosis') || text.includes('healthcare') || text.includes('patient') || text.includes('clinical')) {
    return 'healthcare';
  }
  if (text.includes('research') || text.includes('breakthrough') || text.includes('algorithm') || text.includes('model architecture') || text.includes('training') || text.includes('neural network')) {
    return 'research';
  }
  if (text.includes('business') || text.includes('invest') || text.includes('funding') || text.includes('enterprise') || text.includes('startup') || text.includes('market') || text.includes('revenue')) {
    return 'business';
  }
  if (text.includes('university') || text.includes('paper') || text.includes('study') || text.includes('academic') || text.includes('journal') || text.includes('conference') || text.includes('arxiv')) {
    return 'academic';
  }
  
  // 新しい詳細カテゴリ
  if (text.includes('regulation') || text.includes('policy') || text.includes('government') || text.includes('law') || text.includes('ethics') || text.includes('copyright') || text.includes('privacy')) {
    return 'regulation';
  }
  if (text.includes('education') || text.includes('learning') || text.includes('teaching') || text.includes('edtech') || text.includes('course') || text.includes('tutorial')) {
    return 'education';
  }
  if (text.includes('finance') || text.includes('fintech') || text.includes('banking') || text.includes('trading') || text.includes('cryptocurrency') || text.includes('blockchain')) {
    return 'finance';
  }
  if (text.includes('security') || text.includes('cybersecurity') || text.includes('threat') || text.includes('attack') || text.includes('vulnerability') || text.includes('safety')) {
    return 'security';
  }
  if (text.includes('data') || text.includes('dataset') || text.includes('database') || text.includes('analytics') || text.includes('big data') || text.includes('data science')) {
    return 'data_science';
  }
  if (text.includes('startup') || text.includes('founder') || text.includes('entrepreneur') || text.includes('incubator') || text.includes('accelerator')) {
    return 'startups';
  }
  if (text.includes('quantum') || text.includes('quantum computing') || text.includes('quantum ai') || text.includes('quantum machine learning')) {
    return 'quantum';
  }
  if (text.includes('edge') || text.includes('iot') || text.includes('embedded') || text.includes('mobile ai') || text.includes('on-device')) {
    return 'edge_ai';
  }
  
  // 追加の詳細カテゴリ
  if (text.includes('climate') || text.includes('sustainability') || text.includes('environmental') || text.includes('green ai') || text.includes('carbon')) {
    return 'climate';
  }
  if (text.includes('retail') || text.includes('e-commerce') || text.includes('shopping') || text.includes('customer experience') || text.includes('personalization')) {
    return 'retail';
  }
  if (text.includes('manufacturing') || text.includes('industry 4.0') || text.includes('factory') || text.includes('production') || text.includes('supply chain')) {
    return 'manufacturing';
  }
  if (text.includes('transportation') || text.includes('autonomous vehicle') || text.includes('self-driving') || text.includes('mobility') || text.includes('logistics')) {
    return 'transportation';
  }
  if (text.includes('agriculture') || text.includes('farming') || text.includes('agtech') || text.includes('crop') || text.includes('precision agriculture')) {
    return 'agriculture';
  }
  if (text.includes('energy') || text.includes('power grid') || text.includes('renewable') || text.includes('energy efficiency') || text.includes('smart grid')) {
    return 'energy';
  }
  if (text.includes('legal') || text.includes('law firm') || text.includes('contract') || text.includes('compliance') || text.includes('legal tech')) {
    return 'legal';
  }
  if (text.includes('real estate') || text.includes('property') || text.includes('construction') || text.includes('architecture') || text.includes('building')) {
    return 'real_estate';
  }
  if (text.includes('entertainment') || text.includes('media') || text.includes('content creation') || text.includes('streaming') || text.includes('social media')) {
    return 'entertainment';
  }
  if (text.includes('military') || text.includes('defense') || text.includes('warfare') || text.includes('national security') || text.includes('weapon')) {
    return 'defense';
  }
  if (text.includes('space') || text.includes('satellite') || text.includes('astronomy') || text.includes('nasa') || text.includes('spacex')) {
    return 'space';
  }
  if (text.includes('biotech') || text.includes('genomics') || text.includes('crispr') || text.includes('synthetic biology') || text.includes('life science')) {
    return 'biotech';
  }
  
  // Default category
  return 'tech';
}

function calculateImportance(title, content, articleDate) {
  let score = 50;
  const text = (title + ' ' + content).toLowerCase();
  
  // Date-based scoring (adjusted for 1-week range)
  const now = new Date();
  const hoursSincePublished = (now - new Date(articleDate)) / (1000 * 60 * 60);
  
  if (hoursSincePublished < 24) {
    score += 30; // Articles from last 24 hours get major boost
  } else if (hoursSincePublished < 48) {
    score += 20; // Articles from last 48 hours get good boost
  } else if (hoursSincePublished < 72) {
    score += 10; // Articles from last 72 hours get moderate boost
  } else if (hoursSincePublished < 168) {
    score += 5; // Articles from last week get small boost
  }
  
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

async function translateText(text) {
  if (!text) return '';
  
  // Debug logging
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const hasDeepLKey = !!process.env.DEEPL_API_KEY;
  const hasLibreKey = !!process.env.LIBRETRANSLATE_URL;
  console.log(`Translation mode: ${hasApiKey ? 'OpenAI API' : hasDeepLKey ? 'DeepL API' : hasLibreKey ? 'LibreTranslate' : 'Enhanced Pattern Matching'}`);
  
  // OpenAI APIが利用可能な場合は高品質な翻訳を使用
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('Attempting OpenAI API translation...');
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: "あなたは優秀な技術翻訳者です。英語のAIニュースを自然で簡潔な日本語に翻訳してください。特に要約は100-200文字以内で、専門的でありながら読みやすい日本語にしてください。専門用語は適切に翻訳し、冗長な表現は避けてください。"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      console.log('OpenAI API translation successful');
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI translation error:', error.message);
      console.error('API Key exists:', !!process.env.OPENAI_API_KEY);
      console.error('Falling back to alternative translation...');
      // APIエラーの場合は他の翻訳にフォールバック
    }
  }
  
  // DeepL API Free (月50万文字まで無料、それ以降は課金)
  if (process.env.DEEPL_API_KEY) {
    try {
      console.log('Attempting DeepL API translation...');
      
      // レート制限対策: APIコールの間に遅延を追加
      if (global.lastDeepLCall) {
        const timeSinceLastCall = Date.now() - global.lastDeepLCall;
        if (timeSinceLastCall < 2000) { // 2秒以内の連続コールを避ける
          await new Promise(resolve => setTimeout(resolve, 2000 - timeSinceLastCall));
        }
      }
      global.lastDeepLCall = Date.now();
      
      // レート制限カウンター
      if (!global.deepLRateLimitHits) {
        global.deepLRateLimitHits = 0;
      }
      
      // レート制限に10回連続で引っかかった場合は一時停止
      if (global.deepLRateLimitHits >= 10) {
        console.log('DeepL API rate limit exceeded too many times, disabling for this session');
        return enhancedPartialTranslate(text);
      }
      
      const deepLUrl = 'https://api-free.deepl.com/v2/translate';
      const params = new URLSearchParams({
        auth_key: process.env.DEEPL_API_KEY,
        text: text.substring(0, 5000), // DeepL Freeの制限に合わせる
        source_lang: 'EN',
        target_lang: 'JA'
      });
      
      const response = await axios.post(deepLUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 30000 // 30秒タイムアウト
      });
      
      if (response.data && response.data.translations && response.data.translations[0]) {
        console.log('DeepL API translation successful');
        return response.data.translations[0].text;
      }
    } catch (error) {
      console.error('DeepL translation error:', error.message);
      if (error.response) {
        if (error.response.status === 456) {
          console.error('DeepL quota exceeded! Using fallback translation.');
        } else if (error.response.status === 429) {
          console.error('DeepL rate limit hit! Waiting before retry...');
          global.deepLRateLimitHits = (global.deepLRateLimitHits || 0) + 1;
          
          // バックオフ戦略: 失敗回数に応じて待機時間を増やす
          const waitTime = Math.min(30000, 5000 * Math.pow(1.5, global.deepLRateLimitHits));
          console.log(`Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      console.error('Falling back to pattern-based translation...');
    }
  }
  
  // LibreTranslate (セルフホスト可能、完全無料)
  if (process.env.LIBRETRANSLATE_URL) {
    try {
      console.log('Attempting LibreTranslate API translation...');
      const response = await axios.post(`${process.env.LIBRETRANSLATE_URL}/translate`, {
        q: text.substring(0, 1000),
        source: 'en',
        target: 'ja',
        format: 'text'
      }, {
        timeout: 10000
      });
      
      if (response.data && response.data.translatedText) {
        console.log('LibreTranslate API translation successful');
        return response.data.translatedText;
      }
    } catch (error) {
      console.error('LibreTranslate error:', error.message);
    }
  }
  
  // 最終フォールバック: 改良されたパターンベース翻訳
  console.log('Using enhanced pattern-based translation');
  
  // APIが全て失敗した場合でも、基本的な翻訳は提供する
  try {
    // AIニュースのタイトルでよく見られるパターンを分析し、より自然な日本語に変換
    let translated = translateByPattern(text);
    
    // パターンマッチングで翻訳できなかった場合は、改良された部分翻訳を使用
    if (translated === text) {
      translated = enhancedPartialTranslate(text);
    }
    
    // それでも翻訳できなかった場合の最終フォールバック
    if (translated === text && text.length > 50) {
      // 長い文章の場合は最初の部分だけでも翻訳を試みる
      const firstSentence = text.split('.')[0];
      const partialTranslation = enhancedPartialTranslate(firstSentence);
      if (partialTranslation !== firstSentence) {
        translated = partialTranslation + '...';
      }
    }
    
    return translated;
  } catch (fallbackError) {
    console.error('Fallback translation error:', fallbackError.message);
    // 全ての翻訳が失敗した場合は元のテキストを返す
    return text;
  }
}

// パターンベースの翻訳（完全な文を自然な日本語に）
function translateByPattern(text) {
  const patterns = [
    // Mitiga launches Helios AI to improve... のような特定パターン
    [/^Mitiga\s+launches\s+Helios\s+AI\s+to\s+improve\s+threat\s+triage\s+for\s+cloud\s+security\s+teams$/i, () => {
      return 'Mitigaがクラウドセキュリティチームの脅威トリアージを改善するHelios AIを発表';
    }],
    
    // SUPERWISE launches AgentOps to bring... のような特定パターン
    [/^SUPERWISE\s+launches\s+AgentOps\s+to\s+bring\s+governance\s+to\s+AI\s+agent\s+operations$/i, () => {
      return 'SUPERWISEがAIエージェント運用にガバナンスをもたらすAgentOpsを発表';
    }],
    
    // Fortanix launches PQC Central to assess... のような特定パターン
    [/^Fortanix\s+launches\s+PQC\s+Central\s+to\s+assess\s+cryptographic\s+risk\s+and\s+exposure$/i, () => {
      return 'Fortanixが暗号化リスクとエクスポージャーを評価するPQC Centralを発表';
    }],
    
    // Company + launches/announces + product + to + 目的 パターン（一般）
    [/^(.+?)\s+(?:launches?|announces?|introduces?|unveils?)\s+(.+?)\s+to\s+(.+)$/i, (match, company, product, purpose) => {
      const jpCompany = translateCompanyName(company);
      const jpProduct = translateProductName(product);
      const jpPurpose = translatePurpose(purpose);
      return `${jpCompany}が${jpPurpose}ための${jpProduct}を発表`;
    }],
    
    // Company + launches/announces + product/service パターン（toがない場合）
    [/^(.+?)\s+(?:launches?|announces?|introduces?|unveils?)\s+(.+)$/i, (match, company, product) => {
      const jpCompany = translateCompanyName(company);
      const jpProduct = translateProductOrService(product);
      return `${jpCompany}が${jpProduct}を発表`;
    }],
    
    // Company + partners with + Company パターン
    [/^(.+?)\s+partners?\s+with\s+(.+)$/i, (match, company1, company2) => {
      const jpCompany1 = translateCompanyName(company1);
      const jpCompany2 = translateCompanyName(company2);
      return `${jpCompany1}と${jpCompany2}が提携`;
    }],
    
    // Company + raises + funding パターン
    [/^(.+?)\s+raises?\s+\$?([\d.]+[MBK]?)\s*(?:million|billion)?\s*(?:in\s+)?(.*)$/i, (match, company, amount, type) => {
      const jpCompany = translateCompanyName(company);
      const jpAmount = translateAmount(amount);
      return `${jpCompany}が${jpAmount}の資金調達を実施`;
    }],
    
    // Judge/Court + backs/rules + decision パターン
    [/^(?:Judge|Court)\s+(?:backs?|rules?)\s+(.+)$/i, (match, decision) => {
      // "AI company over use of copyrighted books" のようなケースを処理
      if (/AI\s+(?:company|firm)\s+over\s+(?:use\s+of\s+)?copyrighted/i.test(decision)) {
        return '裁判所がAI企業の著作権使用を支持';
      }
      return `裁判所が${decision}を支持`;
    }],
    
    // Animal Health / Healthcare company パターン
    [/^(.+?)\s+(?:Health|Healthcare)\s+(?:company|firm)\s+(.+)$/i, (match, type, rest) => {
      if (/Animal/i.test(type)) {
        // "Animal Health company Zoetis Partners with..." のようなケース
        const restMatch = rest.match(/^(\w+)\s+partners?\s+with\s+(.+)$/i);
        if (restMatch) {
          const company1 = restMatch[1];
          const company2 = translateCompanyName(restMatch[2]);
          return `動物医療企業${company1}が${company2}と提携`;
        }
      }
      return `${type}ヘルスケア企業：${rest}`;
    }],
    
    // Product/Service + now available パターン
    [/^(.+?)\s+(?:is\s+)?now\s+available\s+(.*)$/i, (match, product, details) => {
      const jpProduct = translateProductOrService(product);
      const jpDetails = details ? `（${partialTranslate(details)}）` : '';
      return `${jpProduct}が利用可能に${jpDetails}`;
    }],
    
    // Company + is reportedly + doing something パターン
    [/^(.+?)\s+is\s+reportedly\s+(.+)$/i, (match, company, action) => {
      const jpCompany = translateCompanyName(company);
      const jpAction = translateAction(action);
      return `${jpCompany}が${jpAction}との報道`;
    }],
    
    // Company + reportedly + does something パターン
    [/^(.+?)\s+reportedly\s+(.+)$/i, (match, company, action) => {
      const jpCompany = translateCompanyName(company);
      const jpAction = translateAction(action);
      return `${jpCompany}が${jpAction}との報道`;
    }],
    
    // Company + acquires + Company パターン
    [/^(.+?)\s+acquires?\s+(.+)$/i, (match, buyer, target) => {
      const jpBuyer = translateCompanyName(buyer);
      const jpTarget = translateCompanyName(target);
      return `${jpBuyer}が${jpTarget}を買収`;
    }],
    
    // AI/Model + beats/outperforms パターン
    [/^(.+?)\s+(?:beats?|outperforms?)\s+(.+)$/i, (match, model1, model2) => {
      const jpModel1 = translateProductOrService(model1);
      const jpModel2 = translateProductOrService(model2);
      return `${jpModel1}が${jpModel2}を上回る性能を達成`;
    }],
    
    // Company + opens/launches + in location パターン
    [/^(.+?)\s+(?:opens?|launches?)\s+(?:in|at)\s+(.+)$/i, (match, company, location) => {
      const jpCompany = translateCompanyName(company);
      return `${jpCompany}が${location}で事業開始`;
    }],
    
    // Company + releases + update/version パターン
    [/^(.+?)\s+releases?\s+(.+?)\s+(?:update|version|v?[\d.]+)$/i, (match, company, product) => {
      const jpCompany = translateCompanyName(company);
      const jpProduct = translateProductOrService(product);
      return `${jpCompany}が${jpProduct}の新バージョンをリリース`;
    }],
    
    // Research/Study + shows/finds パターン
    [/^(?:New\s+)?(?:Research|Study)\s+(?:shows?|finds?|reveals?)\s+(.+)$/i, (match, finding) => {
      return `新研究：${finding}`;
    }],
    
    // Company + integrates/adds パターン
    [/^(.+?)\s+(?:integrates?|adds?)\s+(.+)$/i, (match, company, feature) => {
      const jpCompany = translateCompanyName(company);
      const jpFeature = translateProductOrService(feature);
      return `${jpCompany}が${jpFeature}を統合`;
    }],
    
    // Company + to/will + action パターン
    [/^(.+?)\s+(?:to|will)\s+(.+)$/i, (match, company, action) => {
      const jpCompany = translateCompanyName(company);
      return `${jpCompany}が${action}を予定`;
    }],
    
    // AI/Technology + enables/allows パターン
    [/^(.+?)\s+(?:enables?|allows?)\s+(.+)$/i, (match, tech, capability) => {
      const jpTech = translateProductOrService(tech);
      return `${jpTech}により${capability}が可能に`;
    }],
    
    // Company A and Company B + action パターン
    [/^(.+?)\s+and\s+(.+?)\s+(.+)$/i, (match, company1, company2, action) => {
      const jpCompany1 = translateCompanyName(company1);
      const jpCompany2 = translateCompanyName(company2);
      // actionが動詞で始まる場合
      if (/^(?:announce|launch|partner|collaborate|develop|create|build)/i.test(action)) {
        return `${jpCompany1}と${jpCompany2}が${action}`;
      }
      return `${jpCompany1}と${jpCompany2}：${action}`;
    }],
    
    // How/Why/What + subject + verb パターン
    [/^(?:How|Why|What)\s+(.+)$/i, (match, rest) => {
      return rest; // 疑問詞は省略して内容を優先
    }],
    
    // Breaking/Exclusive パターン
    [/^(?:Breaking|Exclusive):\s*(.+)$/i, (match, news) => {
      return `【速報】${news}`;
    }],
    
    // Creatio embeds AI agents across CRM workflow automation のような特定パターン
    [/^Creatio\s+embeds\s+AI\s+agents\s+across\s+CRM[0-9]*\s+workflow\s*[0-9]*\s+automation$/i, () => {
      return 'CreatioがCRMワークフロー自動化全体にAIエージェントを組み込み';
    }],
    
    // Company embeds/integrates + technology + in/across + product パターン
    [/^(.+?)\s+(?:embeds?|integrates?)\s+(.+?)\s+(?:in|into|across)\s+(.+)$/i, (match, company, tech, product) => {
      const jpCompany = translateCompanyName(company);
      const jpTech = translateProductOrService(tech);
      // 数字を含む製品名の処理
      const jpProduct = translateProductOrService(product.replace(/\d+/g, ''));
      return `${jpCompany}が${jpProduct}に${jpTech}を統合`;
    }],
    
    // Ring's AI video descriptions tell you who's doing what のような特定パターン
    [/^Ring's\s+AI\s+video\s+descriptions\s+tell\s+you\s+who's\s+doing\s+what$/i, () => {
      return 'RingのAI動画説明機能が誰が何をしているかを教えてくれる';
    }],
    
    // Product/Tool + tell/tells + you + what パターン
    [/^(.+?)\s+tells?\s+you\s+(.+)$/i, (match, product, what) => {
      const jpProduct = translateProductOrService(product);
      const jpWhat = what.replace(/who's doing what/gi, '誰が何をしているか');
      return `${jpProduct}が${jpWhat}を教えてくれる`;
    }],
    
    // Here's/Here is + description パターン
    [/^Here'?s?\s+(.+)$/i, (match, description) => {
      return description;
    }],
    
    // Company's + new + product パターン
    [/^(.+?)'s\s+new\s+(.+)$/i, (match, company, product) => {
      const jpCompany = translateCompanyName(company);
      const jpProduct = translateProductOrService(product);
      return `${jpCompany}の新しい${jpProduct}`;
    }],
    
    // Product + is/are + description パターン（with coverage of...等）
    [/^(.+?)\s+(?:is|are)\s+(.+?)\s+with\s+(.+)$/i, (match, product, description, details) => {
      const jpProduct = translateProductOrService(product);
      return `${jpProduct}は${description}（${details}）`;
    }],
    
    // Latest + noun + for/in + context パターン
    [/^Latest\s+(.+?)\s+(?:for|in)\s+(.+)$/i, (match, what, context) => {
      const jpWhat = translateProductOrService(what);
      const jpContext = translateProductOrService(context);
      return `${jpContext}における最新の${jpWhat}`;
    }]
  ];
  
  for (const [pattern, replacer] of patterns) {
    const match = text.match(pattern);
    if (match) {
      return replacer(...match);
    }
  }
  
  return text;
}

// 企業名の翻訳
function translateCompanyName(company) {
  const knownCompanies = {
    'OpenAI': 'OpenAI',
    'Google': 'Google',
    'Microsoft': 'Microsoft',
    'Meta': 'Meta',
    'Anthropic': 'Anthropic',
    'Amazon': 'Amazon',
    'Apple': 'Apple',
    'NVIDIA': 'NVIDIA',
    'IBM': 'IBM',
    'Tesla': 'Tesla',
    'Infosys': 'Infosys',
    'Zoetis': 'Zoetis',
    'DeepMind': 'DeepMind',
    'Stability AI': 'Stability AI',
    'Midjourney': 'Midjourney',
    'Hugging Face': 'Hugging Face',
    'Runway': 'Runway',
    'Cohere': 'Cohere',
    'Inflection AI': 'Inflection AI',
    'Adept': 'Adept',
    'Character.AI': 'Character.AI',
    'Jasper': 'Jasper',
    'Scale AI': 'Scale AI',
    'Databricks': 'Databricks',
    'Palantir': 'Palantir',
    'ByteDance': 'ByteDance',
    'Baidu': 'Baidu',
    'Alibaba': 'Alibaba',
    'Tencent': 'Tencent',
    'Samsung': 'Samsung',
    'Intel': 'Intel',
    'AMD': 'AMD',
    'Qualcomm': 'Qualcomm',
    'Oracle': 'Oracle',
    'Salesforce': 'Salesforce',
    'Adobe': 'Adobe',
    'Netflix': 'Netflix',
    'Spotify': 'Spotify',
    'Uber': 'Uber',
    'Waymo': 'Waymo',
    'xAI': 'xAI',
    'Mitiga': 'Mitiga',
    'SUPERWISE': 'SUPERWISE',
    'Creatio': 'Creatio',
    'Fortanix': 'Fortanix',
    'Ring': 'Ring',
    'ZDNet': 'ZDNet',
    'SiliconANGLE': 'SiliconANGLE',
    'Engadget': 'Engadget'
  };
  
  for (const [eng, jpn] of Object.entries(knownCompanies)) {
    if (company.toLowerCase().includes(eng.toLowerCase())) {
      return company.replace(new RegExp(eng, 'i'), jpn);
    }
  }
  
  return company;
}

// 製品名の翻訳（主に英語のまま残す）
function translateProductName(product) {
  // 製品名は基本的にそのまま残す
  // ただし、説明的な部分は除去
  return product.trim();
}

// 製品・サービス名の翻訳（より詳細な翻訳）
function translateProductOrService(product) {
  // 特定の製品名はそのまま残す
  const keepAsIs = ['GPT-4', 'GPT-3.5', 'Claude', 'Gemini', 'Llama', 'DALL-E', 'Midjourney'];
  for (const name of keepAsIs) {
    if (product.includes(name)) {
      return product;
    }
  }
  
  // AIサービスの一般的な用語を翻訳
  let translated = product
    .replace(/\bAI\s+(?:model|system|platform)/gi, 'AIモデル')
    .replace(/\bneural network/gi, 'ニューラルネットワーク')
    .replace(/\bmachine learning/gi, '機械学習')
    .replace(/\bdeep learning/gi, 'ディープラーニング')
    .replace(/\bnatural language/gi, '自然言語')
    .replace(/\bcomputer vision/gi, 'コンピュータビジョン')
    .replace(/\bAPI/g, 'API')
    .replace(/\bSDK/g, 'SDK')
    .replace(/\bplatform/gi, 'プラットフォーム')
    .replace(/\bservice/gi, 'サービス')
    .replace(/\btool/gi, 'ツール')
    .replace(/\bapp(?:lication)?/gi, 'アプリ')
    .replace(/\bsoftware/gi, 'ソフトウェア')
    .replace(/\bsolution/gi, 'ソリューション');
    
  return translated;
}

// 目的の翻訳
function translatePurpose(purpose) {
  // よくある目的の翻訳
  const purposeTranslations = {
    'improve': '改善する',
    'enhance': '強化する',
    'accelerate': '加速する',
    'automate': '自動化する',
    'optimize': '最適化する',
    'streamline': '効率化する',
    'bring': 'もたらす',
    'provide': '提供する',
    'enable': '可能にする',
    'assess': '評価する',
    'manage': '管理する',
    'reduce': '削減する',
    'increase': '増加させる',
    'support': 'サポートする',
    'secure': '保護する'
  };
  
  let translated = purpose;
  
  // 動詞の翻訳
  for (const [eng, jpn] of Object.entries(purposeTranslations)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translated = translated.replace(regex, jpn);
  }
  
  // その他の一般的な翻訳
  translated = translated
    .replace(/\bthreat triage/gi, '脅威トリアージ')
    .replace(/\bcloud security teams/gi, 'クラウドセキュリティチーム')
    .replace(/\bgovernance/gi, 'ガバナンス')
    .replace(/\bAI agent operations/gi, 'AIエージェント運用')
    .replace(/\bcryptographic risk/gi, '暗号化リスク')
    .replace(/\bexposure/gi, 'エクスポージャー')
    .replace(/\bworkflow automation/gi, 'ワークフロー自動化')
    .replace(/\bCRM/gi, 'CRM')
    .replace(/\bfor\s+/gi, '')
    .replace(/\bto\s+/gi, '');
    
  return translated;
}

// 金額の翻訳
function translateAmount(amount) {
  if (amount.includes('B')) {
    const num = parseFloat(amount);
    return `${num}0億ドル`;
  } else if (amount.includes('M')) {
    const num = parseFloat(amount);
    return `${num}00万ドル`;
  } else if (amount.includes('K')) {
    const num = parseFloat(amount);
    return `${num}000ドル`;
  }
  return amount + 'ドル';
}

// 部分的な翻訳（パターンマッチングで翻訳できなかった場合）
// 改良された部分翻訳関数
function enhancedPartialTranslate(text) {
  if (!text || text.length === 0) return '';
  
  // タイトルと要約の共通パターンを優先的に処理
  let translated = text;
  
  try {
    // 会社名を前処理
    const companies = [
      'OpenAI', 'Google', 'Microsoft', 'Meta', 'NVIDIA', 'Anthropic', 'DeepMind',
      'Amazon', 'Apple', 'Tesla', 'xAI', 'Hugging Face', 'Stability AI',
      'Midjourney', 'Cohere', 'Character.AI', 'Databricks', 'Palantir',
      'ByteDance', 'Baidu', 'Alibaba', 'Tencent', 'Samsung', 'Intel', 'AMD',
      'Qualcomm', 'Oracle', 'Salesforce', 'Adobe', 'Netflix', 'Spotify',
      'Uber', 'Waymo', 'Dell', 'IBM', 'Insta360', 'Bonfy', 'Mitiga',
      'SUPERWISE', 'Fortanix', 'Creatio', 'SiliconANGLE', 'Engadget'
    ];
    
    // 会社名を一時的にプレースホルダーに置換
    const companyMap = new Map();
    companies.forEach((company, index) => {
      const placeholder = `__COMPANY_${index}__`;
      const regex = new RegExp(company, 'gi');
      if (translated.match(regex)) {
        companyMap.set(placeholder, company);
        translated = translated.replace(regex, placeholder);
      }
    });
    
    // 基本的な翻訳パターンを適用
    const patterns = [
      // 動詞パターン
      [/\blaunches?\b/gi, '発表'],
      [/\bannounces?\b/gi, '発表'],
      [/\bintroduces?\b/gi, '導入'],
      [/\bunveils?\b/gi, '公開'],
      [/\breleases?\b/gi, 'リリース'],
      [/\bupdates?\b/gi, '更新'],
      [/\bimproves?\b/gi, '改善'],
      [/\benhances?\b/gi, '強化'],
      [/\benables?\b/gi, '可能にする'],
      [/\boffers?\b/gi, '提供'],
      [/\bprovides?\b/gi, '提供'],
      [/\bsupports?\b/gi, 'サポート'],
      [/\bachieves?\b/gi, '達成'],
      [/\breaches?\b/gi, '到達'],
      [/\bwins?\b/gi, '勝利'],
      [/\breceives?\b/gi, '受領'],
      
      // 名詞パターン
      [/\bnew\b/gi, '新しい'],
      [/\bAI\b/g, 'AI'],
      [/\bartificial intelligence\b/gi, '人工知能'],
      [/\bmachine learning\b/gi, '機械学習'],
      [/\bdeep learning\b/gi, 'ディープラーニング'],
      [/\bmodel\b/gi, 'モデル'],
      [/\bplatform\b/gi, 'プラットフォーム'],
      [/\btool\b/gi, 'ツール'],
      [/\bservice\b/gi, 'サービス'],
      [/\bsolution\b/gi, 'ソリューション'],
      [/\bsystem\b/gi, 'システム'],
      [/\bfeature\b/gi, '機能'],
      [/\btechnology\b/gi, '技術'],
      [/\bupdate\b/gi, 'アップデート'],
      [/\bsecurity\b/gi, 'セキュリティ'],
      [/\bgenerator?\b/gi, '生成'],
      [/\bvideo\b/gi, '動画'],
      [/\bimage\b/gi, '画像'],
      [/\baudio\b/gi, '音声'],
      [/\bvoice\b/gi, '音声'],
      [/\bcontent\b/gi, 'コンテンツ'],
      [/\bgaming\b/gi, 'ゲーミング'],
      [/\brobotics?\b/gi, 'ロボティクス'],
      [/\bhealthcare\b/gi, 'ヘルスケア'],
      [/\bmedical\b/gi, '医療'],
      [/\bfinance\b/gi, '金融'],
      [/\beducation\b/gi, '教育'],
      [/\bresearch\b/gi, '研究'],
      [/\bpaper\b/gi, '論文'],
      [/\bperformance\b/gi, '性能'],
      [/\baccuracy\b/gi, '精度'],
      [/\befficiency\b/gi, '効率'],
      [/\bproductivity\b/gi, '生産性'],
      [/\bautomation\b/gi, '自動化'],
      [/\bagents?\b/gi, 'エージェント'],
      [/\bworkflow\b/gi, 'ワークフロー'],
      [/\bmanagement\b/gi, '管理'],
      [/\boperations?\b/gi, '運用'],
      [/\bbusiness\b/gi, 'ビジネス'],
      [/\benterprise\b/gi, 'エンタープライズ'],
      [/\bcustomer\b/gi, '顧客'],
      [/\buser\b/gi, 'ユーザー'],
      [/\bteam\b/gi, 'チーム'],
      [/\bcompany\b/gi, '企業'],
      [/\borganization\b/gi, '組織'],
      
      // 接続詞・前置詞
      [/\bfor\b/gi, 'のための'],
      [/\bwith\b/gi, 'を使った'],
      [/\bto\b/gi, 'への'],
      [/\bby\b/gi, 'による'],
      [/\band\b/gi, 'と'],
      [/\bor\b/gi, 'または'],
      [/\bthe\b/gi, '']
    ];
    
    // パターンを適用
    patterns.forEach(([pattern, replacement]) => {
      translated = translated.replace(pattern, replacement);
    });
    
    // スペースの整理
    translated = translated.replace(/\s+/g, ' ').trim();
    
    // 会社名を復元
    companyMap.forEach((company, placeholder) => {
      translated = translated.replace(new RegExp(placeholder, 'g'), company);
    });
    
    // 最終的な整形
    translated = translated
      .replace(/がを/g, 'が')
      .replace(/をが/g, 'が')
      .replace(/のの/g, 'の')
      .replace(/へのへの/g, 'への')
      .replace(/\s+/g, ' ')
      .trim();
    
    // 翻訳結果が元の文とほとんど同じ場合は、基本的なフォールバックを返す
    if (translated === text || translated.length < 5) {
      // タイトルのみの場合の簡易翻訳
      if (text.includes('launches') || text.includes('announces')) {
        return text.replace(/launches|announces/gi, '発表') + 'に関するニュース';
      }
      return text + 'に関するニュース';
    }
    
    return translated;
  } catch (error) {
    console.error('Enhanced partial translate error:', error);
    return text;
  }
}

function partialTranslate(text) {
  // より積極的に翻訳を試みる
  let translated = text;
  
  // 基本的な単語・フレーズの翻訳
  const basicPhrases = {
    ' to ': '〜',
    ' for ': '〜のための',
    ' with ': '〜と',
    ' in ': '〜で',
    ' on ': '〜で',
    ' at ': '〜で',
    ' from ': '〜から',
    ' by ': '〜による',
    ' of ': '〜の',
    ' and ': 'と',
    ' or ': 'または',
    'launches': '発表',
    'announces': '発表',
    'introduces': '導入',
    'releases': 'リリース',
    'unveils': '公開',
    'reveals': '公開',
    'updates': '更新',
    'improves': '改善',
    'enhances': '強化',
    'brings': 'もたらす',
    'provides': '提供',
    'enables': '可能にする',
    'creates': '作成',
    'builds': '構築',
    'develops': '開発',
    'supports': 'サポート',
    'helps': '支援',
    'uses': '使用',
    'adds': '追加',
    'new': '新しい',
    'latest': '最新の',
    'first': '最初の',
    'AI': 'AI',
    'agents': 'エージェント',
    'model': 'モデル',
    'platform': 'プラットフォーム',
    'tool': 'ツール',
    'service': 'サービス',
    'solution': 'ソリューション',
    'system': 'システム',
    'feature': '機能',
    'technology': '技術',
    'software': 'ソフトウェア',
    'application': 'アプリケーション',
    'workflow': 'ワークフロー',
    'automation': '自動化',
    'intelligence': 'インテリジェンス',
    'security': 'セキュリティ',
    'cloud': 'クラウド',
    'data': 'データ',
    'analysis': '分析',
    'management': '管理',
    'operations': '運用',
    'business': 'ビジネス',
    'enterprise': 'エンタープライズ',
    'customer': '顧客',
    'user': 'ユーザー',
    'team': 'チーム',
    'company': '企業',
    'organization': '組織'
  };
  
  // フレーズごとに翻訳を適用
  for (const [eng, jpn] of Object.entries(basicPhrases)) {
    const regex = new RegExp(eng, 'gi');
    translated = translated.replace(regex, jpn);
  }
  
  // 翻訳後も英語が多く残っている場合は、元のテキストを返す
  const englishLetters = (translated.match(/[a-zA-Z]/g) || []).length;
  const totalLength = translated.length;
  
  if (englishLetters / totalLength > 0.5) {
    return text; // 英語のままの方が読みやすい
  }
  
  return translated;
}

// 以下、元のフォールバック翻訳関数（使用しない）
function oldPartialTranslate(text) {
  let translated = text;
  
  // まず、よく使われるフレーズを自然な日本語に置換
  const phraseTranslations = [
    // AIニュースで頻出する表現
    [/launches? new/gi, '新たに発表'],
    [/announces? new/gi, '新たに発表'],
    [/introduces? new/gi, '新たに導入'],
    [/reveals? new/gi, '新たに公開'],
    [/releases? new/gi, '新たにリリース'],
    [/has been/gi, 'された'],
    [/have been/gi, 'された'],
    [/will be/gi, 'される予定'],
    [/is being/gi, 'されている'],
    [/are being/gi, 'されている'],
    [/has announced/gi, '発表した'],
    [/have announced/gi, '発表した'],
    [/is expected to/gi, '予定されている'],
    [/are expected to/gi, '予定されている'],
    [/is planning to/gi, '計画している'],
    [/are planning to/gi, '計画している'],
    [/is set to/gi, '予定されている'],
    [/are set to/gi, '予定されている'],
    [/is designed to/gi, '設計されている'],
    [/are designed to/gi, '設計されている'],
    [/aims to/gi, '目指している'],
    [/seeks to/gi, '求めている'],
    [/plans to/gi, '計画している'],
    [/wants to/gi, '望んでいる'],
    [/needs to/gi, '必要としている'],
    [/according to/gi, 'によると'],
    [/based on/gi, 'に基づいて'],
    [/powered by/gi, 'を搭載'],
    [/developed by/gi, 'が開発'],
    [/created by/gi, 'が作成'],
    [/built by/gi, 'が構築'],
    [/designed by/gi, 'が設計'],
    [/founded by/gi, 'が設立'],
    [/led by/gi, 'が主導'],
    [/backed by/gi, 'が支援'],
    [/supported by/gi, 'がサポート'],
    [/funded by/gi, 'が資金提供'],
    [/in partnership with/gi, 'と提携して'],
    [/in collaboration with/gi, 'と協力して'],
    [/together with/gi, 'と共に'],
    [/along with/gi, 'と一緒に'],
    [/as part of/gi, 'の一環として'],
    [/in response to/gi, 'に対応して'],
    [/in order to/gi, 'するために'],
    [/in an effort to/gi, 'するための取り組みとして'],
    [/with the goal of/gi, 'を目標に'],
    [/for the purpose of/gi, 'の目的で'],
    [/takes down/gi, '削除'],
    [/pulls down/gi, '取り下げ'],
    [/agrees to be acquired/gi, '買収に合意'],
    [/due to/gi, 'により'],
    [/amid/gi, 'の中で'],
    [/according to/gi, 'によると'],
    [/in order to/gi, 'するために'],
    [/as well as/gi, 'だけでなく'],
    [/such as/gi, 'などの'],
    [/including/gi, 'を含む'],
    [/based on/gi, 'に基づいて'],
    [/related to/gi, 'に関連する'],
    [/compared to/gi, 'と比較して'],
    [/instead of/gi, 'の代わりに'],
    [/because of/gi, 'のため'],
    [/in addition to/gi, 'に加えて'],
    [/as a result/gi, 'その結果'],
    [/on the other hand/gi, '一方で'],
    [/for example/gi, '例えば'],
    [/in other words/gi, '言い換えれば'],
    [/first of all/gi, 'まず第一に'],
    [/last but not least/gi, '最後に重要なことは'],
    [/at the same time/gi, '同時に'],
    [/in the future/gi, '将来'],
    [/in the past/gi, '過去に'],
    [/at present/gi, '現在'],
    [/up to/gi, 'まで'],
    [/more than/gi, '以上'],
    [/less than/gi, '以下'],
    [/rather than/gi, 'よりむしろ'],
    [/in terms of/gi, 'の観点から'],
    [/with regard to/gi, 'に関して'],
    [/in spite of/gi, 'にもかかわらず'],
    [/in case of/gi, 'の場合'],
    [/as long as/gi, 'である限り'],
    [/as soon as/gi, 'するとすぐに'],
    [/even though/gi, 'であっても'],
    [/even if/gi, 'たとえ〜でも']
  ];
  
  // フレーズ翻訳を適用
  for (const [pattern, replacement] of phraseTranslations) {
    translated = translated.replace(pattern, replacement);
  }
  
  // AI関連の専門用語を優先的に翻訳
  const aiTermTranslations = [
    // AIモデル・サービス
    [/\bChatGPT\b/gi, 'ChatGPT'],
    [/\bGPT-4\b/gi, 'GPT-4'],
    [/\bGPT-3\.5\b/gi, 'GPT-3.5'],
    [/\bClaude\b/gi, 'Claude'],
    [/\bGemini\b/gi, 'Gemini'],
    [/\bBard\b/gi, 'Bard'],
    [/\bCopilot\b/gi, 'Copilot'],
    [/\bStable Diffusion\b/gi, 'Stable Diffusion'],
    [/\bMidjourney\b/gi, 'Midjourney'],
    [/\bDALL-E\b/gi, 'DALL-E'],
    
    // AI関連用語
    [/\bartificial intelligence\b/gi, '人工知能'],
    [/\bmachine learning\b/gi, '機械学習'],
    [/\bdeep learning\b/gi, 'ディープラーニング'],
    [/\bneural network\b/gi, 'ニューラルネットワーク'],
    [/\blarge language model\b/gi, '大規模言語モデル'],
    [/\bLLM\b/g, 'LLM'],
    [/\bgenerative AI\b/gi, '生成AI'],
    [/\bAI agent\b/gi, 'AIエージェント'],
    [/\bcomputer vision\b/gi, 'コンピュータービジョン'],
    [/\bnatural language processing\b/gi, '自然言語処理'],
    [/\bNLP\b/g, 'NLP'],
    [/\breinforcement learning\b/gi, '強化学習'],
    [/\btransformer\b/gi, 'トランスフォーマー'],
    [/\bfine-tuning\b/gi, 'ファインチューニング'],
    [/\bprompt engineering\b/gi, 'プロンプトエンジニアリング'],
    [/\btraining data\b/gi, '訓練データ'],
    [/\bdataset\b/gi, 'データセット'],
    [/\bmodel\b/gi, 'モデル'],
    [/\balgorithm\b/gi, 'アルゴリズム'],
    [/\bAPI\b/g, 'API'],
    [/\bSDK\b/g, 'SDK'],
    [/\bopen source\b/gi, 'オープンソース'],
    [/\bcloud\b/gi, 'クラウド'],
    [/\bedge computing\b/gi, 'エッジコンピューティング'],
    [/\bquantum computing\b/gi, '量子コンピューティング'],
    [/\bblockchain\b/gi, 'ブロックチェーン'],
    [/\bcryptocurrency\b/gi, '暗号通貨'],
    [/\bmetaverse\b/gi, 'メタバース'],
    [/\bvirtual reality\b/gi, '仮想現実'],
    [/\baugmented reality\b/gi, '拡張現実'],
    [/\bVR\b/g, 'VR'],
    [/\bAR\b/g, 'AR'],
    [/\bIoT\b/g, 'IoT'],
    [/\bInternet of Things\b/gi, 'モノのインターネット'],
    [/\b5G\b/g, '5G'],
    [/\b6G\b/g, '6G']
  ];
  
  // AI用語を先に適用
  for (const [pattern, replacement] of aiTermTranslations) {
    translated = translated.replace(pattern, replacement);
  }
  
  // Basic word translations for common English words
  const basicTranslations = [
    // Articles and connectors
    [/\bthe\s+/gi, ''],
    [/\ba\s+/gi, ''],
    [/\ban\s+/gi, ''],
    [/\band\s+/gi, 'と'],
    [/\bor\s+/gi, 'または'],
    [/\bof\s+/gi, 'の'],
    [/\bin\s+/gi, 'で'],
    [/\bon\s+/gi, 'で'],
    [/\bat\s+/gi, 'で'],
    [/\bto\s+/gi, 'に'],
    [/\bfor\s+/gi, 'のための'],
    [/\bwith\s+/gi, 'と'],
    [/\bfrom\s+/gi, 'から'],
    [/\bby\s+/gi, 'によって'],
    [/\bas\s+/gi, 'として'],
    [/\bthat\s+/gi, 'その'],
    [/\bthis\s+/gi, 'この'],
    [/\bits\s+/gi, 'その'],
    [/\btheir\s+/gi, 'それらの'],
    [/\bhow\s+/gi, 'どのように'],
    [/\bwhen\s+/gi, 'いつ'],
    [/\bwhere\s+/gi, 'どこで'],
    [/\bwhy\s+/gi, 'なぜ'],
    [/\bwhat\s+/gi, '何を'],
    [/\bwhich\s+/gi, 'どの'],
    [/\bwho\s+/gi, '誰が'],
    
    // Action verbs (present tense)
    [/\bbuilds?\b/gi, '構築'],
    [/\bmakes?\b/gi, '作成'],
    [/\bgets?\b/gi, '取得'],
    [/\btakes?\s+down\b/gi, '削除する'],
    [/\bpulls?\s+down\b/gi, '取り下げる'],
    [/\btakes?\b/gi, '取る'],
    [/\bgives?\b/gi, '与える'],
    [/\bshows?\b/gi, '示す'],
    [/\btells?\b/gi, '伝える'],
    [/\bsays?\b/gi, '述べる'],
    [/\bthinks?\b/gi, '考える'],
    [/\bknows?\b/gi, '知る'],
    [/\bfinds?\b/gi, '発見'],
    [/\bhelps?\b/gi, '支援'],
    [/\bworks?\b/gi, '機能'],
    [/\buses?\b/gi, '使用'],
    [/\btries?\b/gi, '試行'],
    [/\bstarts?\b/gi, '開始'],
    [/\bstops?\b/gi, '停止'],
    [/\bends?\b/gi, '終了'],
    [/\bbegins?\b/gi, '開始'],
    [/\bcomes?\b/gi, '来る'],
    [/\bgoes?\b/gi, '行く'],
    [/\breturns?\b/gi, '戻る'],
    [/\bmoves?\b/gi, '移動'],
    [/\bchanges?\b/gi, '変更'],
    [/\bimproves?\b/gi, '改善'],
    [/\bincreases?\b/gi, '増加'],
    [/\bdecreases?\b/gi, '減少'],
    [/\breduces?\b/gi, '削減'],
    [/\boffers?\b/gi, '提供'],
    [/\bprovides?\b/gi, '提供'],
    [/\bdelivers?\b/gi, '配信'],
    [/\benables?\b/gi, '可能にする'],
    [/\ballows?\b/gi, '許可'],
    [/\brequires?\b/gi, '必要'],
    [/\bneeds?\b/gi, '必要'],
    [/\bwants?\b/gi, '望む'],
    [/\blikes?\b/gi, '好む'],
    [/\bloves?\b/gi, '愛する'],
    [/\bhates?\b/gi, '嫌う'],
    [/\bfeels?\b/gi, '感じる'],
    [/\blooks?\b/gi, '見える'],
    [/\bsounds?\b/gi, '聞こえる'],
    [/\bseems?\b/gi, '見える'],
    [/\bappears?\b/gi, '現れる'],
    [/\bbecomes?\b/gi, 'になる'],
    [/\bremains?\b/gi, '残る'],
    [/\bstays?\b/gi, '留まる'],
    [/\bkeeps?\b/gi, '保つ'],
    [/\bholds?\b/gi, '保持'],
    [/\bcarries?\b/gi, '運ぶ'],
    [/\bbrings?\b/gi, '持参'],
    [/\btakes?\b/gi, '取る'],
    [/\bputs?\b/gi, '置く'],
    [/\bsets?\b/gi, '設定'],
    [/\bgets?\b/gi, '取得'],
    [/\breceives?\b/gi, '受信'],
    [/\bsends?\b/gi, '送信'],
    [/\bgives?\b/gi, '与える'],
    [/\btells?\b/gi, '伝える'],
    [/\basks?\b/gi, '尋ねる'],
    [/\banswers?\b/gi, '答える'],
    [/\bspeaks?\b/gi, '話す'],
    [/\btalks?\b/gi, '話す'],
    [/\bwrites?\b/gi, '書く'],
    [/\breads?\b/gi, '読む'],
    [/\blistens?\b/gi, '聞く'],
    [/\bwatches?\b/gi, '見る'],
    [/\bplays?\b/gi, '再生'],
    [/\bstudies?\b/gi, '研究'],
    [/\blearns?\b/gi, '学習'],
    [/\bteaches?\b/gi, '教える'],
    
    // Action verbs (past tense)
    [/\bbuilt\b/gi, '構築した'],
    [/\bmade\b/gi, '作成した'],
    [/\bgot\b/gi, '取得した'],
    [/\btook\b/gi, '取った'],
    [/\bgave\b/gi, '与えた'],
    [/\bshowed\b/gi, '示した'],
    [/\btold\b/gi, '伝えた'],
    [/\bsaid\b/gi, '述べた'],
    [/\bthought\b/gi, '考えた'],
    [/\bknew\b/gi, '知っていた'],
    [/\bfound\b/gi, '発見した'],
    [/\bhelped\b/gi, '支援した'],
    [/\bworked\b/gi, '機能した'],
    [/\bused\b/gi, '使用した'],
    [/\btried\b/gi, '試行した'],
    [/\bstarted\b/gi, '開始した'],
    [/\bstopped\b/gi, '停止した'],
    [/\bended\b/gi, '終了した'],
    [/\bbegan\b/gi, '開始した'],
    [/\bcame\b/gi, '来た'],
    [/\bwent\b/gi, '行った'],
    [/\breturned\b/gi, '戻った'],
    [/\bmoved\b/gi, '移動した'],
    [/\bchanged\b/gi, '変更した'],
    [/\bimproved\b/gi, '改善した'],
    [/\bincreased\b/gi, '増加した'],
    [/\bdecreased\b/gi, '減少した'],
    [/\breduced\b/gi, '削減した'],
    [/\boffered\b/gi, '提供した'],
    [/\bprovided\b/gi, '提供した'],
    [/\bdelivered\b/gi, '配信した'],
    [/\benabled\b/gi, '可能にした'],
    [/\ballowed\b/gi, '許可した'],
    [/\brequired\b/gi, '必要だった'],
    [/\bneeded\b/gi, '必要だった'],
    [/\bwanted\b/gi, '望んだ'],
    [/\bliked\b/gi, '好んだ'],
    [/\bloved\b/gi, '愛した'],
    [/\bhated\b/gi, '嫌った'],
    [/\bfelt\b/gi, '感じた'],
    [/\blooked\b/gi, '見えた'],
    [/\bsounded\b/gi, '聞こえた'],
    [/\bseemed\b/gi, '見えた'],
    [/\bappeared\b/gi, '現れた'],
    [/\bbecame\b/gi, 'になった'],
    [/\bremained\b/gi, '残った'],
    [/\bstayed\b/gi, '留まった'],
    [/\bkept\b/gi, '保った'],
    [/\bheld\b/gi, '保持した'],
    [/\bcarried\b/gi, '運んだ'],
    [/\bbrought\b/gi, '持参した'],
    [/\bput\b/gi, '置いた'],
    [/\bset\b/gi, '設定した'],
    [/\breceived\b/gi, '受信した'],
    [/\bsent\b/gi, '送信した'],
    [/\basked\b/gi, '尋ねた'],
    [/\banswered\b/gi, '答えた'],
    [/\bspoke\b/gi, '話した'],
    [/\btalked\b/gi, '話した'],
    [/\bwrote\b/gi, '書いた'],
    [/\bread\b/gi, '読んだ'],
    [/\blistened\b/gi, '聞いた'],
    [/\bwatched\b/gi, '見た'],
    [/\bplayed\b/gi, '再生した'],
    [/\bstudied\b/gi, '研究した'],
    [/\blearned\b/gi, '学習した'],
    [/\btaught\b/gi, '教えた'],
    
    // Adjectives
    [/\bnew\b/gi, '新しい'],
    [/\bold\b/gi, '古い'],
    [/\bgood\b/gi, '良い'],
    [/\bbad\b/gi, '悪い'],
    [/\bbest\b/gi, '最高の'],
    [/\bworst\b/gi, '最悪の'],
    [/\bbetter\b/gi, 'より良い'],
    [/\bworse\b/gi, 'より悪い'],
    [/\bbig\b/gi, '大きい'],
    [/\bsmall\b/gi, '小さい'],
    [/\blarge\b/gi, '大きい'],
    [/\btiny\b/gi, '小さな'],
    [/\bhuge\b/gi, '巨大な'],
    [/\benormous\b/gi, '巨大な'],
    [/\bmassive\b/gi, '大規模な'],
    [/\bfast\b/gi, '高速な'],
    [/\bslow\b/gi, '遅い'],
    [/\bquick\b/gi, '迅速な'],
    [/\brapid\b/gi, '急速な'],
    [/\bsmart\b/gi, 'スマートな'],
    [/\bintelligent\b/gi, '知的な'],
    [/\bclever\b/gi, '賢い'],
    [/\bwise\b/gi, '賢明な'],
    [/\bstrong\b/gi, '強力な'],
    [/\bweak\b/gi, '弱い'],
    [/\bpowerful\b/gi, '強力な'],
    [/\beasy\b/gi, '簡単な'],
    [/\bdifficult\b/gi, '困難な'],
    [/\bhard\b/gi, '困難な'],
    [/\bsimple\b/gi, 'シンプルな'],
    [/\bcomplex\b/gi, '複雑な'],
    [/\bcomplicated\b/gi, '複雑な'],
    [/\badvanced\b/gi, '高度な'],
    [/\bbasic\b/gi, '基本的な'],
    [/\bfree\b/gi, '無料の'],
    [/\bexpensive\b/gi, '高価な'],
    [/\bcheap\b/gi, '安い'],
    [/\bhigh\b/gi, '高い'],
    [/\blow\b/gi, '低い'],
    [/\bimportant\b/gi, '重要な'],
    [/\buseful\b/gi, '有用な'],
    [/\bhelpful\b/gi, '役立つ'],
    [/\beffective\b/gi, '効果的な'],
    [/\befficient\b/gi, '効率的な'],
    [/\bsuccessful\b/gi, '成功した'],
    [/\bpopular\b/gi, '人気の'],
    [/\bfamous\b/gi, '有名な'],
    [/\bspecial\b/gi, '特別な'],
    [/\bunique\b/gi, 'ユニークな'],
    [/\boriginal\b/gi, 'オリジナルの'],
    [/\bcreative\b/gi, 'クリエイティブな'],
    [/\binnovative\b/gi, '革新的な'],
    [/\bmodern\b/gi, 'モダンな'],
    [/\btraditional\b/gi, '伝統的な'],
    [/\bclassic\b/gi, 'クラシックな'],
    [/\bcontemporary\b/gi, '現代的な'],
    [/\bcurrent\b/gi, '現在の'],
    [/\blatest\b/gi, '最新の'],
    [/\brecent\b/gi, '最近の'],
    [/\bfuture\b/gi, '将来の'],
    [/\bpast\b/gi, '過去の'],
    [/\bpresent\b/gi, '現在の'],
    [/\breal\b/gi, '実際の'],
    [/\btrue\b/gi, '真の'],
    [/\bfalse\b/gi, '偽の'],
    [/\bright\b/gi, '正しい'],
    [/\bwrong\b/gi, '間違った'],
    [/\bcorrect\b/gi, '正しい'],
    [/\bincorrect\b/gi, '間違った'],
    [/\baccurate\b/gi, '正確な'],
    [/\binaccurate\b/gi, '不正確な'],
    [/\bprecise\b/gi, '精密な'],
    [/\bexact\b/gi, '正確な'],
    [/\bapproximate\b/gi, 'おおよその'],
    [/\brough\b/gi, '大まかな'],
    [/\bdetailed\b/gi, '詳細な'],
    [/\bspecific\b/gi, '特定の'],
    [/\bgeneral\b/gi, '一般的な'],
    [/\boverall\b/gi, '全体的な'],
    [/\btotal\b/gi, '総'],
    [/\bcomplete\b/gi, '完全な'],
    [/\bincomplete\b/gi, '不完全な'],
    [/\bfull\b/gi, '満杯の'],
    [/\bempty\b/gi, '空の'],
    [/\bopen\b/gi, '開いた'],
    [/\bclosed\b/gi, '閉じた'],
    [/\bavailable\b/gi, '利用可能な'],
    [/\bunavailable\b/gi, '利用不可の'],
    [/\baccessible\b/gi, 'アクセス可能な'],
    [/\binaccessible\b/gi, 'アクセス不可の'],
    [/\bvisible\b/gi, '見える'],
    [/\binvisible\b/gi, '見えない'],
    [/\bclear\b/gi, '明確な'],
    [/\bunclear\b/gi, '不明確な'],
    [/\bobvious\b/gi, '明らかな'],
    [/\bhidden\b/gi, '隠れた'],
    [/\bsecret\b/gi, '秘密の'],
    [/\bpublic\b/gi, '公開の'],
    [/\bprivate\b/gi, 'プライベートの'],
    [/\bpersonal\b/gi, '個人的な'],
    [/\bprofessional\b/gi, 'プロフェッショナルな'],
    [/\bofficial\b/gi, '公式の'],
    [/\bunofficial\b/gi, '非公式の'],
    [/\bformal\b/gi, 'フォーマルな'],
    [/\binformal\b/gi, '非公式な'],
    [/\bcasual\b/gi, 'カジュアルな'],
    [/\bserious\b/gi, '深刻な'],
    [/\bfunny\b/gi, '面白い'],
    [/\binteresting\b/gi, '興味深い'],
    [/\bboring\b/gi, '退屈な'],
    [/\bexciting\b/gi, '刺激的な'],
    [/\brelaxing\b/gi, 'リラックスできる'],
    [/\bstressful\b/gi, 'ストレスの多い'],
    [/\bcomfortable\b/gi, '快適な'],
    [/\buncomfortable\b/gi, '不快な'],
    [/\bpleasant\b/gi, '楽しい'],
    [/\bunpleasant\b/gi, '不快な'],
    [/\bbeautiful\b/gi, '美しい'],
    [/\bugly\b/gi, '醜い'],
    [/\battractive\b/gi, '魅力的な'],
    [/\bunattractive\b/gi, '魅力的でない'],
    [/\bcolorful\b/gi, 'カラフルな'],
    [/\bcolourful\b/gi, 'カラフルな'],
    [/\bbright\b/gi, '明るい'],
    [/\bdark\b/gi, '暗い'],
    [/\blight\b/gi, '軽い'],
    [/\bheavy\b/gi, '重い'],
    [/\bthick\b/gi, '厚い'],
    [/\bthin\b/gi, '薄い'],
    [/\bwide\b/gi, '幅広い'],
    [/\bnarrow\b/gi, '狭い'],
    [/\blong\b/gi, '長い'],
    [/\bshort\b/gi, '短い'],
    [/\btall\b/gi, '高い'],
    [/\bshallow\b/gi, '浅い'],
    [/\bdeep\b/gi, '深い'],
    [/\bflat\b/gi, '平らな'],
    [/\bround\b/gi, '丸い'],
    [/\bsquare\b/gi, '四角い'],
    [/\bstraight\b/gi, 'まっすぐな'],
    [/\bcurved\b/gi, '曲がった'],
    [/\bsmooth\b/gi, '滑らかな'],
    [/\brough\b/gi, '粗い'],
    [/\bsoft\b/gi, '柔らかい'],
    [/\bhard\b/gi, '硬い'],
    [/\bwarm\b/gi, '暖かい'],
    [/\bcold\b/gi, '冷たい'],
    [/\bhot\b/gi, '熱い'],
    [/\bcool\b/gi, '涼しい'],
    [/\bwet\b/gi, '濡れた'],
    [/\bdry\b/gi, '乾いた'],
    [/\bclean\b/gi, 'きれいな'],
    [/\bdirty\b/gi, '汚い'],
    [/\bfresh\b/gi, '新鮮な'],
    [/\bold\b/gi, '古い'],
    [/\byoung\b/gi, '若い'],
    [/\bmature\b/gi, '成熟した'],
    [/\bactive\b/gi, 'アクティブな'],
    [/\binactive\b/gi, '非アクティブな'],
    [/\blive\b/gi, 'ライブの'],
    [/\bdead\b/gi, '死んだ'],
    [/\balive\b/gi, '生きている'],
    [/\bhealthy\b/gi, '健康な'],
    [/\bunhealthy\b/gi, '不健康な'],
    [/\bsick\b/gi, '病気の'],
    [/\bwell\b/gi, '良い'],
    [/\bsafe\b/gi, '安全な'],
    [/\bunsafe\b/gi, '安全でない'],
    [/\bdangerous\b/gi, '危険な'],
    [/\brisky\b/gi, 'リスクのある'],
    [/\bsecure\b/gi, '安全な'],
    [/\binsecure\b/gi, '不安全な'],
    [/\bstable\b/gi, '安定した'],
    [/\bunstable\b/gi, '不安定な'],
    [/\breliable\b/gi, '信頼できる'],
    [/\bunreliable\b/gi, '信頼できない'],
    [/\btrusted\b/gi, '信頼された'],
    [/\buntrusted\b/gi, '信頼されない'],
    [/\bhonest\b/gi, '正直な'],
    [/\bdishonest\b/gi, '不正直な'],
    [/\bfair\b/gi, '公平な'],
    [/\bunfair\b/gi, '不公平な'],
    [/\bequal\b/gi, '等しい'],
    [/\bunequal\b/gi, '等しくない'],
    [/\bsimilar\b/gi, '似ている'],
    [/\bdifferent\b/gi, '異なる'],
    [/\bsame\b/gi, '同じ'],
    [/\bother\b/gi, '他の'],
    [/\banother\b/gi, '別の'],
    [/\bmore\b/gi, 'より多い'],
    [/\bless\b/gi, 'より少ない'],
    [/\bmost\b/gi, '最も'],
    [/\bleast\b/gi, '最も少ない'],
    [/\ball\b/gi, 'すべての'],
    [/\bsome\b/gi, 'いくつかの'],
    [/\bmany\b/gi, '多くの'],
    [/\bfew\b/gi, '少ない'],
    [/\bseveral\b/gi, 'いくつかの'],
    [/\bvarious\b/gi, '様々な'],
    [/\bmultiple\b/gi, '複数の'],
    [/\bsingle\b/gi, '単一の'],
    [/\bonly\b/gi, 'のみ'],
    [/\bjust\b/gi, 'ちょうど'],
    [/\beven\b/gi, 'さえ'],
    [/\balso\b/gi, 'また'],
    [/\btoo\b/gi, 'も'],
    [/\bvery\b/gi, '非常に'],
    [/\bquite\b/gi, 'かなり'],
    [/\brather\b/gi, 'むしろ'],
    [/\bpretty\b/gi, 'かなり'],
    [/\bfairly\b/gi, 'かなり'],
    [/\bextremely\b/gi, '極めて'],
    [/\bincredibly\b/gi, '信じられないほど'],
    [/\bamazingly\b/gi, '驚くほど'],
    [/\bsurprisingly\b/gi, '驚くことに'],
    [/\bobviously\b/gi, '明らかに'],
    [/\bclearly\b/gi, '明らかに'],
    [/\bcertainly\b/gi, '確実に'],
    [/\bdefinitely\b/gi, '間違いなく'],
    [/\babsolutely\b/gi, '絶対に'],
    [/\bcompletely\b/gi, '完全に'],
    [/\btotally\b/gi, '完全に'],
    [/\bentirely\b/gi, '完全に'],
    [/\bfully\b/gi, '完全に'],
    [/\bpartially\b/gi, '部分的に'],
    [/\bmostly\b/gi, '主に'],
    [/\bmainly\b/gi, '主に'],
    [/\bprimarily\b/gi, '主に'],
    [/\bchiefly\b/gi, '主に'],
    [/\bbasically\b/gi, '基本的に'],
    [/\bfundamentally\b/gi, '基本的に'],
    [/\bessentially\b/gi, '本質的に'],
    [/\bgenerally\b/gi, '一般的に'],
    [/\busually\b/gi, '通常'],
    [/\bnormally\b/gi, '通常'],
    [/\btypically\b/gi, '典型的に'],
    [/\bcommonly\b/gi, '一般的に'],
    [/\bfrequently\b/gi, '頻繁に'],
    [/\boften\b/gi, 'しばしば'],
    [/\bsometimes\b/gi, '時々'],
    [/\boccasionally\b/gi, '時々'],
    [/\brarely\b/gi, 'まれに'],
    [/\bseldom\b/gi, 'めったに'],
    [/\bnever\b/gi, '決して'],
    [/\balways\b/gi, '常に'],
    [/\bforever\b/gi, '永遠に'],
    [/\bconstantly\b/gi, '絶えず'],
    [/\bcontinuously\b/gi, '継続的に'],
    [/\bregularly\b/gi, '定期的に'],
    [/\bperiodically\b/gi, '定期的に'],
    [/\boccasionally\b/gi, '時々'],
    [/\btemporarily\b/gi, '一時的に'],
    [/\bpermanently\b/gi, '永続的に'],
    [/\bimmediately\b/gi, '即座に'],
    [/\binstantly\b/gi, '即座に'],
    [/\bquickly\b/gi, '迅速に'],
    [/\brapidly\b/gi, '急速に'],
    [/\bsuddenly\b/gi, '突然'],
    [/\bgradually\b/gi, '徐々に'],
    [/\bslowly\b/gi, 'ゆっくりと'],
    [/\beventually\b/gi, '最終的に'],
    [/\bfinally\b/gi, '最終的に'],
    [/\blastly\b/gi, '最後に'],
    [/\bfirstly\b/gi, '最初に'],
    [/\binitially\b/gi, '最初に'],
    [/\boriginally\b/gi, '元々'],
    [/\bpreviously\b/gi, '以前に'],
    [/\bearlier\b/gi, '以前に'],
    [/\blater\b/gi, '後で'],
    [/\bafterwards\b/gi, 'その後'],
    [/\bmeanwhile\b/gi, 'その間'],
    [/\bmeantime\b/gi, 'その間'],
    [/\bcurrently\b/gi, '現在'],
    [/\bpresently\b/gi, '現在'],
    [/\bnow\b/gi, '今'],
    [/\btoday\b/gi, '今日'],
    [/\byesterday\b/gi, '昨日'],
    [/\btomorrow\b/gi, '明日'],
    [/\brecently\b/gi, '最近'],
    [/\blately\b/gi, '最近'],
    [/\bsoon\b/gi, 'すぐに'],
    [/\bshortly\b/gi, 'まもなく'],
    [/\beventually\b/gi, '最終的に'],
    [/\bsooner\b/gi, 'より早く'],
    [/\bearlier\b/gi, 'より早く'],
    [/\blater\b/gi, 'より遅く'],
    [/\blonger\b/gi, 'より長く'],
    [/\bshorter\b/gi, 'より短く'],
    [/\bfaster\b/gi, 'より速く'],
    [/\bslower\b/gi, 'より遅く'],
    [/\bbetter\b/gi, 'より良く'],
    [/\bworse\b/gi, 'より悪く'],
    [/\beasier\b/gi, 'より簡単に'],
    [/\bharder\b/gi, 'より困難に'],
    [/\bdeeper\b/gi, 'より深く'],
    [/\bhigher\b/gi, 'より高く'],
    [/\blower\b/gi, 'より低く'],
    [/\bcloser\b/gi, 'より近く'],
    [/\bfarther\b/gi, 'より遠く'],
    [/\bfurther\b/gi, 'さらに'],
    [/\bnearer\b/gi, 'より近く'],
    [/\baway\b/gi, '離れて'],
    [/\bapart\b/gi, '離れて'],
    [/\btogether\b/gi, '一緒に'],
    [/\bseparately\b/gi, '別々に'],
    [/\bindividually\b/gi, '個別に'],
    [/\bcollectively\b/gi, '集合的に'],
    [/\bjointly\b/gi, '共同で'],
    [/\bmutually\b/gi, '相互に'],
    [/\breciprocally\b/gi, '相互に'],
    [/\bequally\b/gi, '等しく'],
    [/\bsimilarly\b/gi, '同様に'],
    [/\blikewise\b/gi, '同様に'],
    [/\baccordingly\b/gi, 'それに応じて'],
    [/\bconsequently\b/gi, 'その結果'],
    [/\btherefore\b/gi, 'したがって'],
    [/\bthus\b/gi, 'このように'],
    [/\bhence\b/gi, 'したがって'],
    [/\bso\b/gi, 'そのため'],
    [/\bbecause\b/gi, 'なぜなら'],
    [/\bsince\b/gi, 'から'],
    [/\bdue to\b/gi, 'のため'],
    [/\bowning to\b/gi, 'のおかげで'],
    [/\bthanks to\b/gi, 'のおかげで'],
    [/\bdespite\b/gi, 'にもかかわらず'],
    [/\balthough\b/gi, 'けれども'],
    [/\bthough\b/gi, 'けれども'],
    [/\beven though\b/gi, 'にもかかわらず'],
    [/\bhowever\b/gi, 'しかし'],
    [/\bnevertheless\b/gi, 'それにもかかわらず'],
    [/\bnonetheless\b/gi, 'それにもかかわらず'],
    [/\botherwise\b/gi, 'そうでなければ'],
    [/\binstead\b/gi, '代わりに'],
    [/\brather than\b/gi, 'ではなく'],
    [/\binstead of\b/gi, 'の代わりに'],
    [/\bin place of\b/gi, 'の代わりに'],
    [/\bin addition to\b/gi, 'に加えて'],
    [/\bbeside\b/gi, 'の横に'],
    [/\bbesides\b/gi, 'その上'],
    [/\bmoreover\b/gi, 'さらに'],
    [/\bfurthermore\b/gi, 'さらに'],
    [/\badditionally\b/gi, 'さらに'],
    [/\balso\b/gi, 'また'],
    [/\bplus\b/gi, 'プラス'],
    [/\bminus\b/gi, 'マイナス'],
    [/\bexcept\b/gi, 'を除いて'],
    [/\bbut\b/gi, 'しかし'],
    [/\byet\b/gi, 'まだ'],
    [/\bstill\b/gi, 'まだ'],
    [/\balready\b/gi, 'すでに'],
    [/\bno longer\b/gi, 'もはや'],
    [/\bnot yet\b/gi, 'まだ'],
    [/\bonce\b/gi, '一度'],
    [/\btwice\b/gi, '二度'],
    [/\bagain\b/gi, '再び'],
    [/\bonce more\b/gi, 'もう一度'],
    [/\bonce again\b/gi, 'もう一度'],
    [/\bover and over\b/gi, '何度も'],
    [/\brepeatedly\b/gi, '繰り返し'],
    [/\bcontinually\b/gi, '継続的に'],
    [/\bpersistently\b/gi, '持続的に'],
    [/\bconsistently\b/gi, '一貫して'],
    [/\buniformly\b/gi, '一様に'],
    [/\bevenly\b/gi, '均等に'],
    [/\bsmoothly\b/gi, '滑らかに'],
    [/\broughly\b/gi, '大まかに'],
    [/\bapproximately\b/gi, 'おおよそ'],
    [/\babout\b/gi, '約'],
    [/\baround\b/gi, '約'],
    [/\bnearly\b/gi, 'ほぼ'],
    [/\balmost\b/gi, 'ほぼ'],
    [/\bbarely\b/gi, 'かろうじて'],
    [/\bhardly\b/gi, 'ほとんど'],
    [/\bscarcely\b/gi, 'ほとんど'],
    [/\bonly just\b/gi, 'ちょうど'],
    [/\bexactly\b/gi, '正確に'],
    [/\bprecisely\b/gi, '正確に'],
    [/\bstrictly\b/gi, '厳密に'],
    [/\brigidly\b/gi, '厳格に'],
    [/\bflexibly\b/gi, '柔軟に'],
    [/\badaptably\b/gi, '適応可能に'],
    [/\badjustably\b/gi, '調整可能に'],
    [/\bvariably\b/gi, '可変的に'],
    [/\bfixedly\b/gi, '固定的に'],
    [/\bpermanently\b/gi, '永続的に'],
    [/\btemporarily\b/gi, '一時的に'],
    [/\bbriefly\b/gi, '短時間'],
    [/\bmomentarily\b/gi, '一瞬'],
    [/\binstantaneously\b/gi, '瞬時に'],
    [/\bimmediately\b/gi, '即座に'],
    [/\bstraightaway\b/gi, 'すぐに'],
    [/\bright away\b/gi, 'すぐに'],
    [/\bat once\b/gi, '一度に'],
    [/\bsimultaneously\b/gi, '同時に'],
    [/\bconcurrently\b/gi, '同時に'],
    [/\bparallel\b/gi, '並行して'],
    [/\bsequentially\b/gi, '順次'],
    [/\bconsecutively\b/gi, '連続して'],
    [/\bsuccessively\b/gi, '連続して'],
    [/\bprogressively\b/gi, '段階的に'],
    [/\bgradually\b/gi, '徐々に'],
    [/\bsteadily\b/gi, '着実に'],
    [/\bconsistently\b/gi, '一貫して'],
    [/\bregularly\b/gi, '定期的に'],
    [/\bperiodically\b/gi, '定期的に'],
    [/\bsystematically\b/gi, '体系的に'],
    [/\bmethodically\b/gi, '系統的に'],
    [/\borderley\b/gi, '整然と'],
    [/\bneatly\b/gi, 'きちんと'],
    [/\btidily\b/gi, 'きちんと'],
    [/\borganized\b/gi, '組織化された'],
    [/\bstructured\b/gi, '構造化された'],
    [/\barranged\b/gi, '配置された'],
    [/\bplanned\b/gi, '計画された'],
    [/\bdesigned\b/gi, '設計された'],
    [/\bcreated\b/gi, '作成された'],
    [/\bdeveloped\b/gi, '開発された'],
    [/\bbuilt\b/gi, '構築された'],
    [/\bconstructed\b/gi, '建設された'],
    [/\bestablished\b/gi, '確立された'],
    [/\bformed\b/gi, '形成された'],
    [/\bshaped\b/gi, '形作られた'],
    [/\bmolded\b/gi, '成型された'],
    [/\bmodeled\b/gi, 'モデル化された'],
    [/\bpattern\b/gi, 'パターン'],
    [/\btemplate\b/gi, 'テンプレート'],
    [/\bframework\b/gi, 'フレームワーク'],
    [/\bstructure\b/gi, '構造'],
    [/\barchitecture\b/gi, 'アーキテクチャ'],
    [/\bdesign\b/gi, 'デザイン'],
    [/\blayout\b/gi, 'レイアウト'],
    [/\bformat\b/gi, 'フォーマット'],
    [/\bstyle\b/gi, 'スタイル'],
    [/\bappearance\b/gi, '外観'],
    [/\blook\b/gi, '見た目'],
    [/\bimage\b/gi, '画像'],
    [/\bpicture\b/gi, '画像'],
    [/\bphoto\b/gi, '写真'],
    [/\bphotograph\b/gi, '写真'],
    [/\bsnapshot\b/gi, 'スナップショット'],
    [/\bscreenshot\b/gi, 'スクリーンショット'],
    [/\bvideo\b/gi, '動画'],
    [/\bmovie\b/gi, '映画'],
    [/\bfilm\b/gi, '映画'],
    [/\bclip\b/gi, 'クリップ'],
    [/\brecording\b/gi, '録画'],
    [/\baudio\b/gi, '音声'],
    [/\bsound\b/gi, '音'],
    [/\bmusic\b/gi, '音楽'],
    [/\bsong\b/gi, '歌'],
    [/\bvoice\b/gi, '声'],
    [/\bspeech\b/gi, 'スピーチ'],
    [/\btalk\b/gi, '話'],
    [/\bconversation\b/gi, '会話'],
    [/\bdiscussion\b/gi, '議論'],
    [/\bdebate\b/gi, '討論'],
    [/\bargument\b/gi, '議論'],
    [/\bdispute\b/gi, '論争'],
    [/\bconflict\b/gi, '対立'],
    [/\bproblem\b/gi, '問題'],
    [/\bissue\b/gi, '問題'],
    [/\bmatter\b/gi, '問題'],
    [/\bsubject\b/gi, '主題'],
    [/\btopic\b/gi, 'トピック'],
    [/\btheme\b/gi, 'テーマ'],
    [/\bidea\b/gi, 'アイデア'],
    [/\bconcept\b/gi, '概念'],
    [/\bnotion\b/gi, '概念'],
    [/\bthought\b/gi, '考え'],
    [/\bopinion\b/gi, '意見'],
    [/\bview\b/gi, '見解'],
    [/\bperspective\b/gi, '視点'],
    [/\bstandpoint\b/gi, '立場'],
    [/\bposition\b/gi, '立場'],
    [/\bstance\b/gi, '姿勢'],
    [/\battitude\b/gi, '態度'],
    [/\bapproach\b/gi, 'アプローチ'],
    [/\bmethod\b/gi, '方法'],
    [/\bway\b/gi, '方法'],
    [/\bmanner\b/gi, '方法'],
    [/\bmode\b/gi, 'モード'],
    [/\bstyle\b/gi, 'スタイル'],
    [/\btechnique\b/gi, '技術'],
    [/\bstrategy\b/gi, '戦略'],
    [/\btactic\b/gi, '戦術'],
    [/\bplan\b/gi, '計画'],
    [/\bscheme\b/gi, 'スキーム'],
    [/\bproject\b/gi, 'プロジェクト'],
    [/\bprogram\b/gi, 'プログラム'],
    [/\bsystem\b/gi, 'システム'],
    [/\bprocess\b/gi, 'プロセス'],
    [/\bprocedure\b/gi, '手順'],
    [/\bstep\b/gi, 'ステップ'],
    [/\bstage\b/gi, '段階'],
    [/\bphase\b/gi, 'フェーズ'],
    [/\bperiod\b/gi, '期間'],
    [/\btime\b/gi, '時間'],
    [/\bmoment\b/gi, '瞬間'],
    [/\binstant\b/gi, '瞬間'],
    [/\bsecond\b/gi, '秒'],
    [/\bminute\b/gi, '分'],
    [/\bhour\b/gi, '時間'],
    [/\bday\b/gi, '日'],
    [/\bweek\b/gi, '週'],
    [/\bmonth\b/gi, '月'],
    [/\byear\b/gi, '年'],
    [/\bdecade\b/gi, '10年'],
    [/\bcentury\b/gi, '世紀'],
    [/\bmillennium\b/gi, '千年紀'],
    [/\bera\b/gi, '時代'],
    [/\bage\b/gi, '時代'],
    [/\bepoch\b/gi, '時代'],
    [/\bgeneration\b/gi, '世代'],
    [/\blifetime\b/gi, '生涯'],
    [/\bcareer\b/gi, 'キャリア'],
    [/\bjob\b/gi, '仕事'],
    [/\bwork\b/gi, '仕事'],
    [/\bemployment\b/gi, '雇用'],
    [/\boccupation\b/gi, '職業'],
    [/\bprofession\b/gi, '職業'],
    [/\btrade\b/gi, '貿易'],
    [/\bbusiness\b/gi, 'ビジネス'],
    [/\bcompany\b/gi, '会社'],
    [/\bcorporation\b/gi, '企業'],
    [/\bfirm\b/gi, '会社'],
    [/\borganization\b/gi, '組織'],
    [/\binstitution\b/gi, '機関'],
    [/\bestablishment\b/gi, '施設'],
    [/\benterprise\b/gi, '企業'],
    [/\bventure\b/gi, 'ベンチャー'],
    [/\bstartup\b/gi, 'スタートアップ'],
    [/\binitiative\b/gi, 'イニシアチブ'],
    [/\bundertaking\b/gi, '事業'],
    [/\boperation\b/gi, '運営'],
    [/\bactivity\b/gi, '活動'],
    [/\baction\b/gi, '行動'],
    [/\bmove\b/gi, '動き'],
    [/\bmovement\b/gi, '動き'],
    [/\bmotion\b/gi, '動き'],
    [/\bgesture\b/gi, 'ジェスチャー'],
    [/\bsignal\b/gi, '信号'],
    [/\bsign\b/gi, '兆候'],
    [/\bsymbol\b/gi, 'シンボル'],
    [/\bmark\b/gi, 'マーク'],
    [/\blabel\b/gi, 'ラベル'],
    [/\btag\b/gi, 'タグ'],
    [/\bbadge\b/gi, 'バッジ'],
    [/\bicon\b/gi, 'アイコン'],
    [/\blogo\b/gi, 'ロゴ'],
    [/\bbrand\b/gi, 'ブランド'],
    [/\bname\b/gi, '名前'],
    [/\btitle\b/gi, 'タイトル'],
    [/\bheading\b/gi, '見出し'],
    [/\bheader\b/gi, 'ヘッダー'],
    [/\bfooter\b/gi, 'フッター'],
    [/\bsidebar\b/gi, 'サイドバー'],
    [/\bmenu\b/gi, 'メニュー'],
    [/\bnavigation\b/gi, 'ナビゲーション'],
    [/\blink\b/gi, 'リンク'],
    [/\bbutton\b/gi, 'ボタン'],
    [/\btab\b/gi, 'タブ'],
    [/\bpanel\b/gi, 'パネル'],
    [/\bwindow\b/gi, 'ウィンドウ'],
    [/\bdialog\b/gi, 'ダイアログ'],
    [/\bform\b/gi, 'フォーム'],
    [/\bfield\b/gi, 'フィールド'],
    [/\binput\b/gi, '入力'],
    [/\boutput\b/gi, '出力'],
    [/\bdata\b/gi, 'データ'],
    [/\binformation\b/gi, '情報'],
    [/\bcontent\b/gi, 'コンテンツ'],
    [/\bmaterial\b/gi, '素材'],
    [/\bsubstance\b/gi, '物質'],
    [/\bmatter\b/gi, '物質'],
    [/\belement\b/gi, '要素'],
    [/\bcomponent\b/gi, 'コンポーネント'],
    [/\bpart\b/gi, '部分'],
    [/\bpiece\b/gi, '部分'],
    [/\bsection\b/gi, 'セクション'],
    [/\bsegment\b/gi, 'セグメント'],
    [/\bportion\b/gi, '部分'],
    [/\bfraction\b/gi, '断片'],
    [/\bbit\b/gi, 'ビット'],
    [/\bchunk\b/gi, 'チャンク'],
    [/\bblock\b/gi, 'ブロック'],
    [/\bunit\b/gi, 'ユニット'],
    [/\bmodule\b/gi, 'モジュール'],
    [/\bpackage\b/gi, 'パッケージ'],
    [/\bbundle\b/gi, 'バンドル'],
    [/\bset\b/gi, 'セット'],
    [/\bgroup\b/gi, 'グループ'],
    [/\bteam\b/gi, 'チーム'],
    [/\bsquad\b/gi, 'チーム'],
    [/\bcrew\b/gi, 'クルー'],
    [/\bstaff\b/gi, 'スタッフ'],
    [/\bpersonnel\b/gi, '人員'],
    [/\bmember\b/gi, 'メンバー'],
    [/\bparticipant\b/gi, '参加者'],
    [/\bcontributor\b/gi, '貢献者'],
    [/\buser\b/gi, 'ユーザー'],
    [/\bcustomer\b/gi, '顧客'],
    [/\bclient\b/gi, 'クライアント'],
    [/\bpartner\b/gi, 'パートナー'],
    [/\bcolleague\b/gi, '同僚'],
    [/\bfriend\b/gi, '友人'],
    [/\bfamily\b/gi, '家族'],
    [/\brelative\b/gi, '親戚'],
    [/\bneighbor\b/gi, '隣人'],
    [/\bstranger\b/gi, '見知らぬ人'],
    [/\bperson\b/gi, '人'],
    [/\bindividual\b/gi, '個人'],
    [/\bhuman\b/gi, '人間'],
    [/\bbeing\b/gi, '存在'],
    [/\blife\b/gi, '生命'],
    [/\bliving\b/gi, '生きている'],
    [/\bexistence\b/gi, '存在'],
    [/\breality\b/gi, '現実'],
    [/\btruth\b/gi, '真実'],
    [/\bfact\b/gi, '事実'],
    [/\bevidence\b/gi, '証拠'],
    [/\bproof\b/gi, '証明'],
    [/\bdemonstration\b/gi, '実証'],
    [/\bexample\b/gi, '例'],
    [/\binstance\b/gi, '例'],
    [/\bcase\b/gi, 'ケース'],
    [/\bsituation\b/gi, '状況'],
    [/\bcircumstance\b/gi, '状況'],
    [/\bcondition\b/gi, '状態'],
    [/\bstate\b/gi, '状態'],
    [/\bstatus\b/gi, 'ステータス'],
    [/\bposition\b/gi, '位置'],
    [/\blocation\b/gi, '場所'],
    [/\bplace\b/gi, '場所'],
    [/\bspot\b/gi, '場所'],
    [/\bsite\b/gi, 'サイト'],
    [/\barea\b/gi, 'エリア'],
    [/\bregion\b/gi, '地域'],
    [/\bzone\b/gi, 'ゾーン'],
    [/\bterritory\b/gi, '領域'],
    [/\bdomain\b/gi, 'ドメイン'],
    [/\bfield\b/gi, '分野'],
    [/\bsphere\b/gi, '領域'],
    [/\brealm\b/gi, '領域'],
    [/\bscope\b/gi, '範囲'],
    [/\brange\b/gi, '範囲'],
    [/\bextent\b/gi, '範囲'],
    [/\blimit\b/gi, '限界'],
    [/\bboundary\b/gi, '境界'],
    [/\bborder\b/gi, '境界'],
    [/\bedge\b/gi, 'エッジ'],
    [/\bcorner\b/gi, '角'],
    [/\bside\b/gi, '側'],
    [/\bface\b/gi, '面'],
    [/\bsurface\b/gi, '表面'],
    [/\btop\b/gi, '上'],
    [/\bbottom\b/gi, '下'],
    [/\bleft\b/gi, '左'],
    [/\bright\b/gi, '右'],
    [/\bfront\b/gi, '前'],
    [/\bback\b/gi, '後ろ'],
    [/\binside\b/gi, '内側'],
    [/\boutside\b/gi, '外側'],
    [/\bcenter\b/gi, '中心'],
    [/\bmiddle\b/gi, '中央'],
    [/\bcore\b/gi, 'コア'],
    [/\bheart\b/gi, '心'],
    [/\bsoul\b/gi, '魂'],
    [/\bmind\b/gi, '心'],
    [/\bbrain\b/gi, '脳'],
    [/\bhead\b/gi, '頭'],
    [/\bbody\b/gi, '体'],
    [/\bhand\b/gi, '手'],
    [/\bfoot\b/gi, '足'],
    [/\beye\b/gi, '目'],
    [/\bear\b/gi, '耳'],
    [/\bnose\b/gi, '鼻'],
    [/\bmouth\b/gi, '口'],
    [/\bface\b/gi, '顔'],
    [/\bskin\b/gi, '肌'],
    [/\bhair\b/gi, '髪'],
    [/\bbone\b/gi, '骨'],
    [/\bmuscle\b/gi, '筋肉'],
    [/\bblood\b/gi, '血'],
    [/\bnerve\b/gi, '神経'],
    [/\bbrain\b/gi, '脳'],
    [/\borgan\b/gi, '臓器'],
    [/\btissue\b/gi, '組織'],
    [/\bcell\b/gi, '細胞'],
    [/\bgene\b/gi, '遺伝子'],
    [/\bDNA\b/gi, 'DNA'],
    [/\bRNA\b/gi, 'RNA'],
    [/\bprotein\b/gi, 'タンパク質'],
    [/\bvitamin\b/gi, 'ビタミン'],
    [/\bmineral\b/gi, 'ミネラル'],
    [/\bnutrient\b/gi, '栄養素'],
    [/\bfood\b/gi, '食物'],
    [/\bmeal\b/gi, '食事'],
    [/\bdiet\b/gi, '食事'],
    [/\bhealth\b/gi, '健康'],
    [/\bwellness\b/gi, 'ウェルネス'],
    [/\bfitness\b/gi, 'フィットネス'],
    [/\bexercise\b/gi, '運動'],
    [/\bsport\b/gi, 'スポーツ'],
    [/\bgame\b/gi, 'ゲーム'],
    [/\bplay\b/gi, 'プレイ'],
    [/\bfun\b/gi, '楽しみ'],
    [/\benjoyment\b/gi, '楽しさ'],
    [/\bpleasure\b/gi, '喜び'],
    [/\bhappiness\b/gi, '幸せ'],
    [/\bjoy\b/gi, '喜び'],
    [/\bdelight\b/gi, '喜び'],
    [/\bexcitement\b/gi, '興奮'],
    [/\bthrill\b/gi, 'スリル'],
    [/\badventure\b/gi, '冒険'],
    [/\bjourney\b/gi, '旅'],
    [/\btrip\b/gi, '旅行'],
    [/\bvacation\b/gi, '休暇'],
    [/\bholiday\b/gi, '休日'],
    [/\bbreak\b/gi, '休憩'],
    [/\brest\b/gi, '休息'],
    [/\bsleep\b/gi, '睡眠'],
    [/\bdream\b/gi, '夢'],
    [/\bnightmare\b/gi, '悪夢'],
    [/\bfear\b/gi, '恐怖'],
    [/\bworry\b/gi, '心配'],
    [/\banxiety\b/gi, '不安'],
    [/\bstress\b/gi, 'ストレス'],
    [/\bpressure\b/gi, 'プレッシャー'],
    [/\btension\b/gi, '緊張'],
    [/\brelaxation\b/gi, 'リラクゼーション'],
    [/\bcalm\b/gi, '落ち着き'],
    [/\bpeace\b/gi, '平和'],
    [/\bquiet\b/gi, '静か'],
    [/\bsilence\b/gi, '静寂'],
    [/\bnoise\b/gi, '騒音'],
    [/\bloud\b/gi, 'うるさい'],
    [/\bsoft\b/gi, '柔らかい'],
    [/\bgentle\b/gi, '優しい'],
    [/\bkind\b/gi, '親切な'],
    [/\bnice\b/gi, '素晴らしい'],
    [/\bsweet\b/gi, '甘い'],
    [/\bbitter\b/gi, '苦い'],
    [/\bsour\b/gi, '酸っぱい'],
    [/\bsalty\b/gi, '塩辛い'],
    [/\bspicy\b/gi, '辛い'],
    [/\bhot\b/gi, '辛い'],
    [/\bcold\b/gi, '冷たい'],
    [/\bwarm\b/gi, '温かい'],
    [/\bcool\b/gi, '涼しい'],
    [/\bfreeze\b/gi, '凍る'],
    [/\bmelt\b/gi, '溶ける'],
    [/\bboil\b/gi, '沸騰'],
    [/\bburn\b/gi, '燃える'],
    [/\bfire\b/gi, '火'],
    [/\bflame\b/gi, '炎'],
    [/\bsmoke\b/gi, '煙'],
    [/\bash\b/gi, '灰'],
    [/\bwater\b/gi, '水'],
    [/\bice\b/gi, '氷'],
    [/\bsnow\b/gi, '雪'],
    [/\brain\b/gi, '雨'],
    [/\bwind\b/gi, '風'],
    [/\bstorm\b/gi, '嵐'],
    [/\bthunder\b/gi, '雷'],
    [/\blightning\b/gi, '稲妻'],
    [/\bcloud\b/gi, '雲'],
    [/\bsky\b/gi, '空'],
    [/\bsun\b/gi, '太陽'],
    [/\bmoon\b/gi, '月'],
    [/\bstar\b/gi, '星'],
    [/\bplanet\b/gi, '惑星'],
    [/\bearth\b/gi, '地球'],
    [/\bworld\b/gi, '世界'],
    [/\buniverse\b/gi, '宇宙'],
    [/\bspace\b/gi, '宇宙'],
    [/\bgalaxy\b/gi, '銀河'],
    [/\bsolar system\b/gi, '太陽系'],
    [/\batmosphere\b/gi, '大気'],
    [/\benvironment\b/gi, '環境'],
    [/\bnature\b/gi, '自然'],
    [/\bnatural\b/gi, '自然の'],
    [/\bartificial\b/gi, '人工の'],
    [/\bmade\b/gi, '作られた'],
    [/\bmachine\b/gi, '機械'],
    [/\brobot\b/gi, 'ロボット'],
    [/\bcomputer\b/gi, 'コンピューター'],
    [/\bsoftware\b/gi, 'ソフトウェア'],
    [/\bhardware\b/gi, 'ハードウェア'],
    [/\bdevice\b/gi, 'デバイス'],
    [/\btool\b/gi, 'ツール'],
    [/\binstrument\b/gi, '楽器'],
    [/\bequipment\b/gi, '機器'],
    [/\bmaterial\b/gi, '材料'],
    [/\bresource\b/gi, 'リソース'],
    [/\bsupply\b/gi, '供給'],
    [/\bstock\b/gi, '在庫'],
    [/\binventory\b/gi, '在庫'],
    [/\basset\b/gi, '資産'],
    [/\bproperty\b/gi, '財産'],
    [/\bownership\b/gi, '所有権'],
    [/\bvalue\b/gi, '価値'],
    [/\bprice\b/gi, '価格'],
    [/\bcost\b/gi, 'コスト'],
    [/\bexpense\b/gi, '費用'],
    [/\bbill\b/gi, '請求書'],
    [/\bpayment\b/gi, '支払い'],
    [/\bmoney\b/gi, 'お金'],
    [/\bcash\b/gi, '現金'],
    [/\bcurrency\b/gi, '通貨'],
    [/\bdollar\b/gi, 'ドル'],
    [/\byen\b/gi, '円'],
    [/\beuro\b/gi, 'ユーロ'],
    [/\bpound\b/gi, 'ポンド'],
    [/\bincome\b/gi, '収入'],
    [/\bsalary\b/gi, '給与'],
    [/\bwage\b/gi, '賃金'],
    [/\bprofit\b/gi, '利益'],
    [/\bloss\b/gi, '損失'],
    [/\bdebt\b/gi, '借金'],
    [/\bloan\b/gi, 'ローン'],
    [/\bcredit\b/gi, 'クレジット'],
    [/\bbank\b/gi, '銀行'],
    [/\baccount\b/gi, 'アカウント'],
    [/\bcard\b/gi, 'カード'],
    [/\binvestment\b/gi, '投資'],
    [/\bstock\b/gi, '株'],
    [/\bshare\b/gi, '株式'],
    [/\bbond\b/gi, '債券'],
    [/\bmarket\b/gi, '市場'],
    [/\beconomy\b/gi, '経済'],
    [/\bfinance\b/gi, '金融'],
    [/\btax\b/gi, '税'],
    [/\bgovernment\b/gi, '政府'],
    [/\blaw\b/gi, '法律'],
    [/\brule\b/gi, 'ルール'],
    [/\bregulation\b/gi, '規制'],
    [/\bpolicy\b/gi, '政策'],
    [/\bpolitics\b/gi, '政治'],
    [/\bdemocracy\b/gi, '民主主義'],
    [/\belection\b/gi, '選挙'],
    [/\bvote\b/gi, '投票'],
    [/\bcitizen\b/gi, '市民'],
    [/\bsociety\b/gi, '社会'],
    [/\bcommunity\b/gi, 'コミュニティ'],
    [/\bculture\b/gi, '文化'],
    [/\btradition\b/gi, '伝統'],
    [/\bcustom\b/gi, '慣習'],
    [/\bhabit\b/gi, '習慣'],
    [/\broutine\b/gi, 'ルーチン'],
    [/\bpractice\b/gi, '実践'],
    [/\bexperience\b/gi, '経験'],
    [/\bskill\b/gi, 'スキル'],
    [/\bability\b/gi, '能力'],
    [/\btalent\b/gi, '才能'],
    [/\bgift\b/gi, '贈り物'],
    [/\bknowledge\b/gi, '知識'],
    [/\bwisdom\b/gi, '知恵'],
    [/\beducation\b/gi, '教育'],
    [/\blearning\b/gi, '学習'],
    [/\bteaching\b/gi, '教育'],
    [/\binstruction\b/gi, '指導'],
    [/\btraining\b/gi, '訓練'],
    [/\bpractice\b/gi, '練習'],
    [/\bexercise\b/gi, '演習'],
    [/\btest\b/gi, 'テスト'],
    [/\bexam\b/gi, '試験'],
    [/\bquiz\b/gi, 'クイズ'],
    [/\bquestion\b/gi, '質問'],
    [/\banswer\b/gi, '答え'],
    [/\bsolution\b/gi, '解決策'],
    [/\bresult\b/gi, '結果'],
    [/\boutcome\b/gi, '結果'],
    [/\bconsequence\b/gi, '結果'],
    [/\beffect\b/gi, '効果'],
    [/\bimpact\b/gi, '影響'],
    [/\binfluence\b/gi, '影響'],
    [/\bchange\b/gi, '変化'],
    [/\bimprovement\b/gi, '改善'],
    [/\bprogress\b/gi, '進歩'],
    [/\bdevelopment\b/gi, '発展'],
    [/\bgrowth\b/gi, '成長'],
    [/\bexpansion\b/gi, '拡張'],
    [/\bincrease\b/gi, '増加'],
    [/\brise\b/gi, '上昇'],
    [/\bdecrease\b/gi, '減少'],
    [/\bfall\b/gi, '下降'],
    [/\bdrop\b/gi, '下落'],
    [/\breduction\b/gi, '削減'],
    [/\bcut\b/gi, 'カット'],
    [/\bsaving\b/gi, '節約'],
    [/\bwaste\b/gi, '廃棄物'],
    [/\brunning\b/gi, '実行中'],
    [/\boperational\b/gi, '運用的'],
    [/\bfunctional\b/gi, '機能的'],
    [/\bworking\b/gi, '働いている'],
    [/\bactive\b/gi, 'アクティブ'],
    [/\binactive\b/gi, '非アクティブ'],
    [/\bpowerful\b/gi, '強力'],
    [/\beffective\b/gi, '効果的'],
    [/\befficient\b/gi, '効率的'],
    [/\boptimal\b/gi, '最適'],
    [/\bideal\b/gi, '理想的'],
    [/\bperfect\b/gi, '完璧'],
    [/\bexcellent\b/gi, '優秀'],
    [/\bgreat\b/gi, '素晴らしい'],
    [/\bwonderful\b/gi, '素晴らしい'],
    [/\bfantastic\b/gi, '素晴らしい'],
    [/\bamazing\b/gi, '驚くべき'],
    [/\bincredible\b/gi, '信じられない'],
    [/\bunbelievable\b/gi, '信じられない'],
    [/\bimpressive\b/gi, '印象的'],
    [/\boutstanding\b/gi, '優れた'],
    [/\bremarkable\b/gi, '注目すべき'],
    [/\bexceptional\b/gi, '例外的'],
    [/\bunique\b/gi, 'ユニーク'],
    [/\bspecial\b/gi, '特別'],
    [/\brare\b/gi, '稀な'],
    [/\buncommon\b/gi, '珍しい'],
    [/\bunusual\b/gi, '異常な'],
    [/\bstrange\b/gi, '奇妙な'],
    [/\bweird\b/gi, '変な'],
    [/\bodd\b/gi, '奇妙な'],
    [/\bfunny\b/gi, '面白い'],
    [/\bcrazy\b/gi, '狂った'],
    [/\bwild\b/gi, '野生の'],
    [/\brough\b/gi, '荒い'],
    [/\bsmooth\b/gi, '滑らか'],
    [/\bgentle\b/gi, '優しい'],
    [/\bsoft\b/gi, '柔らかい'],
    [/\bhard\b/gi, '硬い'],
    [/\btough\b/gi, 'タフな'],
    [/\bstrong\b/gi, '強い'],
    [/\bweak\b/gi, '弱い'],
    [/\bfragile\b/gi, '壊れやすい'],
    [/\bdelicate\b/gi, '繊細な'],
    [/\bsensitive\b/gi, '敏感な'],
    [/\bcareful\b/gi, '注意深い'],
    [/\bcautious\b/gi, '慎重な'],
    [/\baware\b/gi, '気づいている'],
    [/\balert\b/gi, '警戒している'],
    [/\bready\b/gi, '準備ができている'],
    [/\bprepared\b/gi, '準備された'],
    [/\borganized\b/gi, '組織された'],
    [/\bplanned\b/gi, '計画された'],
    [/\bscheduled\b/gi, 'スケジュールされた'],
    [/\barranged\b/gi, '配置された'],
    [/\bset up\b/gi, 'セットアップ'],
    [/\bestablished\b/gi, '確立された'],
    [/\bfounded\b/gi, '設立された'],
    [/\bcreated\b/gi, '作成された'],
    [/\bbuilt\b/gi, '構築された'],
    [/\bconstructed\b/gi, '建設された'],
    [/\bmade\b/gi, '作られた'],
    [/\bproduced\b/gi, '生産された'],
    [/\bmanufactured\b/gi, '製造された'],
    [/\bfabricated\b/gi, '製造された'],
    [/\bassembled\b/gi, '組み立てられた'],
    [/\binstalled\b/gi, 'インストールされた'],
    [/\bdeployed\b/gi, '配備された'],
    [/\blaunched\b/gi, '開始された'],
    [/\bstarted\b/gi, '開始された'],
    [/\binitiated\b/gi, '開始された'],
    [/\bbegun\b/gi, '始められた'],
    [/\bcommenced\b/gi, '開始された'],
    [/\bfinished\b/gi, '完成された'],
    [/\bcompleted\b/gi, '完了された'],
    [/\bended\b/gi, '終了された'],
    [/\bconcluded\b/gi, '終了された'],
    [/\bstopped\b/gi, '停止された'],
    [/\bhalted\b/gi, '停止された'],
    [/\bpaused\b/gi, '一時停止された'],
    [/\binterrupted\b/gi, '中断された'],
    [/\bdelayed\b/gi, '遅延された'],
    [/\bpostponed\b/gi, '延期された'],
    [/\bcanceled\b/gi, 'キャンセルされた'],
    [/\bcancelled\b/gi, 'キャンセルされた'],
    [/\babandoned\b/gi, '放棄された'],
    [/\bgiven up\b/gi, '諦められた'],
    [/\bsurrendered\b/gi, '降伏した'],
    [/\bdefeated\b/gi, '敗北した'],
    [/\bwon\b/gi, '勝った'],
    [/\bvictorious\b/gi, '勝利した'],
    [/\bsuccessful\b/gi, '成功した'],
    [/\bachieved\b/gi, '達成した'],
    [/\baccomplished\b/gi, '達成した'],
    [/\bfulfilled\b/gi, '満たした'],
    [/\brealized\b/gi, '実現した'],
    [/\bimplemented\b/gi, '実装した'],
    [/\bexecuted\b/gi, '実行した'],
    [/\bperformed\b/gi, '実行した'],
    [/\bcarried out\b/gi, '実行した'],
    [/\bconducted\b/gi, '実施した'],
    [/\bundertaken\b/gi, '引き受けた'],
    [/\battempted\b/gi, '試みた'],
    [/\btried\b/gi, '試した'],
    [/\btested\b/gi, 'テストした'],
    [/\bexamined\b/gi, '調べた'],
    [/\binvestigated\b/gi, '調査した'],
    [/\bresearched\b/gi, '研究した'],
    [/\bstudied\b/gi, '研究した'],
    [/\banalyzed\b/gi, '分析した'],
    [/\bevaluated\b/gi, '評価した'],
    [/\bassessed\b/gi, '評価した'],
    [/\bmeasured\b/gi, '測定した'],
    [/\bcounted\b/gi, '数えた'],
    [/\bcalculated\b/gi, '計算した'],
    [/\bcomputed\b/gi, '計算した'],
    [/\bprocessed\b/gi, '処理した'],
    [/\btransformed\b/gi, '変換した'],
    [/\bconverted\b/gi, '変換した'],
    [/\btranslated\b/gi, '翻訳した'],
    [/\binterpreted\b/gi, '解釈した'],
    [/\bunderstood\b/gi, '理解した'],
    [/\bcomprehended\b/gi, '理解した'],
    [/\bperceived\b/gi, '知覚した'],
    [/\brecognized\b/gi, '認識した'],
    [/\bidentified\b/gi, '特定した'],
    [/\bdiscovered\b/gi, '発見した'],
    [/\bfound\b/gi, '見つけた'],
    [/\bdetected\b/gi, '検出した'],
    [/\bnoticed\b/gi, '気づいた'],
    [/\bobserved\b/gi, '観察した'],
    [/\bwatched\b/gi, '見た'],
    [/\bmonitored\b/gi, '監視した'],
    [/\btracked\b/gi, '追跡した'],
    [/\bfollowed\b/gi, '追跡した'],
    [/\bguided\b/gi, '案内した'],
    [/\bled\b/gi, '導いた'],
    [/\bdirected\b/gi, '指示した'],
    [/\bcontrolled\b/gi, '制御した'],
    [/\bmanaged\b/gi, '管理した'],
    [/\bsupervised\b/gi, '監督した'],
    [/\boversaw\b/gi, '監督した'],
    [/\bhandled\b/gi, '取り扱った'],
    [/\bdealt with\b/gi, '対処した'],
    [/\btackled\b/gi, '取り組んだ'],
    [/\baddressed\b/gi, '対処した'],
    [/\bsolved\b/gi, '解決した'],
    [/\bresolved\b/gi, '解決した'],
    [/\bfixed\b/gi, '修正した'],
    [/\brepaired\b/gi, '修理した'],
    [/\brestored\b/gi, '復元した'],
    [/\brecovered\b/gi, '回復した'],
    [/\bhealed\b/gi, '治った'],
    [/\bimproved\b/gi, '改善した'],
    [/\benhanced\b/gi, '強化した'],
    [/\bupgraded\b/gi, 'アップグレードした'],
    [/\bupdated\b/gi, '更新した'],
    [/\bmodified\b/gi, '修正した'],
    [/\bchanged\b/gi, '変更した'],
    [/\baltered\b/gi, '変更した'],
    [/\badjusted\b/gi, '調整した'],
    [/\btuned\b/gi, '調整した'],
    [/\bcalibrated\b/gi, '校正した'],
    [/\boptimized\b/gi, '最適化した'],
    [/\bperfected\b/gi, '完璧にした'],
    [/\brefined\b/gi, '洗練した'],
    [/\bpolished\b/gi, '磨いた'],
    [/\bfinished\b/gi, '仕上げた'],
    [/\bfinal\b/gi, '最終'],
    [/\blast\b/gi, '最後'],
    [/\bendless\b/gi, '無限'],
    [/\beternal\b/gi, '永遠'],
    [/\btemporary\b/gi, '一時的'],
    [/\bbrief\b/gi, '短時間'],
    [/\bshort\b/gi, '短い'],
    [/\blong\b/gi, '長い'],
    [/\bextended\b/gi, '延長された'],
    [/\bprolonged\b/gi, '長期の'],
    [/\bcontinuous\b/gi, '連続'],
    [/\bongoing\b/gi, '進行中'],
    [/\bcurrent\b/gi, '現在の'],
    [/\bpresent\b/gi, '現在の'],
    [/\bexisting\b/gi, '既存の'],
    [/\bavailable\b/gi, '利用可能'],
    [/\baccessible\b/gi, 'アクセス可能'],
    [/\breachable\b/gi, '到達可能'],
    [/\bobtainable\b/gi, '取得可能'],
    [/\bachievable\b/gi, '達成可能'],
    [/\bfeasible\b/gi, '実現可能'],
    [/\bpossible\b/gi, '可能'],
    [/\bprobable\b/gi, '可能性がある'],
    [/\blikely\b/gi, '可能性が高い'],
    [/\bunlikely\b/gi, '可能性が低い'],
    [/\bimpossible\b/gi, '不可能'],
    [/\bimprobable\b/gi, '可能性が低い'],
    [/\bunsure\b/gi, '不確実'],
    [/\buncertain\b/gi, '不確実'],
    [/\bdoubtful\b/gi, '疑わしい'],
    [/\bquestionable\b/gi, '疑わしい'],
    [/\bsuspicious\b/gi, '疑わしい'],
    [/\btrusted\b/gi, '信頼された'],
    [/\breliable\b/gi, '信頼できる'],
    [/\bdependable\b/gi, '信頼できる'],
    [/\btrustworthy\b/gi, '信頼できる']
  ];
  
  // Apply basic translations
  for (const [pattern, replacement] of basicTranslations) {
    translated = translated.replace(pattern, replacement);
  }
  
  // Apply dictionary-based translation for key terms
  for (const [english, japanese] of Object.entries(TRANSLATION_DICT)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, japanese);
  }
  
  // Additional smart translation patterns
  const smartTranslations = [
    // 文末の調整（最初に実行）
    [/\bmentions of\b/gi, 'に関する言及を'],
    [/\bagreed to\b/gi, 'に合意した'],
    [/\bhas taken down\b/gi, 'を削除した'],
    [/\bappears to have\b/gi, 'したようだ'],
    [/\bforced to\b/gi, 'を余儀なくされた'],
    [/\baccording to\b/gi, 'によると'],
    [/\bdue to\b/gi, 'により'],
    [/\bamid\b/gi, 'の中で'],
    [/\bafter receiving\b/gi, 'を受けて'],
    [/\bvalued at\b/gi, 'と評価される'],
    [/\bwill receive\b/gi, 'を受け取る予定'],
    [/\bunder the terms of\b/gi, 'の条件により'],
    
    // Company names and products - keep as is
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
    
    // Remove extra spaces and clean up
    [/\s+/g, ' '],
    [/^\s+|\s+$/g, '']
  ];
  
  for (const [pattern, replacement] of smartTranslations) {
    translated = translated.replace(pattern, replacement);
  }
  
  return translated.trim();
}

async function main() {
  try {
    console.log('🤖 Starting AI news aggregation...');
    const articles = await fetchNewsFromRSS();
    
    // Twitter/X フィードの統合（オプション）
    let tweets = [];
    if (process.env.TWITTER_BEARER_TOKEN) {
      try {
        console.log('🐦 Fetching tweets from X accounts...');
        const { fetchTweets } = require('./fetch-tweets');
        await fetchTweets();
        
        // ツイートデータを読み込み
        const tweetsData = JSON.parse(fs.readFileSync('data/tweets.json', 'utf8'));
        tweets = tweetsData.tweets || [];
        console.log(`✓ Loaded ${tweets.length} tweets from X`);
      } catch (twitterError) {
        console.error('❌ Twitter integration error:', twitterError.message);
        // Twitterエラーでも続行
      }
    }
    
    // 記事とツイートを結合
    const allContent = [...articles, ...tweets];
    
    if (allContent.length === 0) {
      console.log('⚠️ No content found, keeping existing data');
      return;
    }
    
    // Remove duplicates based on title similarity
    const uniqueArticles = [];
    for (const article of allContent) {
      const isDuplicate = uniqueArticles.some(existing => {
        // タイトルの類似度チェック
        if (similarity(existing.title.toLowerCase(), article.title.toLowerCase()) > 0.8) {
          return true;
        }
        // ツイートとニュース記事の重複チェック（同じ内容を報じている場合）
        if (existing.isTweet !== article.isTweet) {
          const existingSummary = (existing.summary || '').toLowerCase();
          const articleSummary = (article.summary || '').toLowerCase();
          return similarity(existingSummary, articleSummary) > 0.7;
        }
        return false;
      });
      if (!isDuplicate) {
        uniqueArticles.push(article);
      }
    }
    
    // Sort by importance and date, then take top 200
    const sortedArticles = uniqueArticles
      .sort((a, b) => {
        const importanceDiff = b.importance - a.importance;
        if (importanceDiff !== 0) return importanceDiff;
        return new Date(b.pubDate) - new Date(a.pubDate);
      })
      .slice(0, 200); // Increased from 80 to 200 articles
    
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