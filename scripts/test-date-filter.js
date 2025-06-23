const Parser = require('rss-parser');

async function testDateFilter() {
  const parser = new Parser({
    timeout: 15000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  // Test with a few active feeds
  const testFeeds = [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.artificialintelligence-news.com/feed/',
    'https://venturebeat.com/ai/feed/'
  ];

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  console.log(`Testing date filter...`);
  console.log(`Current date: ${now.toISOString()}`);
  console.log(`7 days ago: ${sevenDaysAgo.toISOString()}`);
  console.log(`\n`);

  for (const feedUrl of testFeeds) {
    try {
      console.log(`\nTesting feed: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      
      let totalArticles = 0;
      let recentArticles = 0;
      let oldArticles = 0;
      let futureArticles = 0;

      for (const item of feed.items.slice(0, 10)) {
        totalArticles++;
        const articleDate = new Date(item.pubDate || item.isoDate || item.date || new Date());
        
        if (articleDate > now) {
          futureArticles++;
          console.log(`  ❌ Future article: "${item.title}" - ${articleDate.toISOString()}`);
        } else if (articleDate < sevenDaysAgo) {
          oldArticles++;
          console.log(`  ❌ Old article: "${item.title}" - ${articleDate.toISOString()}`);
        } else {
          recentArticles++;
          console.log(`  ✅ Recent article: "${item.title}" - ${articleDate.toISOString()}`);
        }
      }

      console.log(`\nSummary for ${feedUrl}:`);
      console.log(`  Total articles checked: ${totalArticles}`);
      console.log(`  Recent (last 7 days): ${recentArticles}`);
      console.log(`  Old (>7 days): ${oldArticles}`);
      console.log(`  Future dates: ${futureArticles}`);

    } catch (error) {
      console.error(`Error fetching ${feedUrl}: ${error.message}`);
    }
  }
}

if (require.main === module) {
  testDateFilter().catch(console.error);
}