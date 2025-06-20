const fs = require('fs').promises;
const path = require('path');

async function buildPage() {
  try {
    // ニュースデータを読み込む
    const dataPath = path.join(__dirname, '..', 'data', 'news.json');
    const data = JSON.parse(await fs.readFile(dataPath, 'utf8'));
    
    // 日付フォーマット
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    };
    
    // カテゴリ別に分類
    const categorizedNews = {
      research: [],
      healthcare: [],
      business: [],
      tech: [],
      academic: [],
      japan: [],
      other: []
    };
    
    data.news.forEach(item => {
      const category = item.category || 'other';
      if (categorizedNews[category]) {
        categorizedNews[category].push(item);
      } else {
        categorizedNews.other.push(item);
      }
    });
    
    // カテゴリ名の日本語化
    const categoryNames = {
      research: '🔬 AI研究・開発',
      healthcare: '🏥 医療・ヘルスケアAI',
      business: '💼 ビジネス・投資',
      tech: '💻 テクノロジー',
      academic: '📚 論文・学術研究',
      japan: '🇯🇵 日本のAI',
      other: '📰 その他'
    };
    
    // HTMLを生成
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI週刊ニュース - 最新のAI動向</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            background-color: #f0f2f5;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-align: center;
        }
        
        .update-info {
            text-align: center;
            opacity: 0.9;
        }
        
        .update-time {
            font-size: 1em;
            margin-bottom: 5px;
        }
        
        .news-count {
            font-size: 0.9em;
        }
        
        .main-content {
            padding: 40px 0;
        }
        
        .category-section {
            margin-bottom: 50px;
        }
        
        .category-header {
            font-size: 1.8em;
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .news-grid {
            display: grid;
            gap: 20px;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }
        
        .news-item {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .news-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 25px rgba(0,0,0,0.12);
        }
        
        .importance-badge {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff6b6b;
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: bold;
        }
        
        .importance-high {
            background: #ff6b6b;
        }
        
        .importance-medium {
            background: #feca57;
        }
        
        .importance-normal {
            background: #48dbfb;
        }
        
        .news-source {
            color: #667eea;
            font-size: 0.85em;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .news-title {
            color: #2c3e50;
            text-decoration: none;
            font-size: 1.15em;
            font-weight: bold;
            display: block;
            margin-bottom: 12px;
            line-height: 1.4;
        }
        
        .news-title:hover {
            color: #667eea;
        }
        
        .news-date {
            color: #7f8c8d;
            font-size: 0.85em;
            margin-bottom: 12px;
        }
        
        .news-content {
            color: #555;
            font-size: 0.95em;
            line-height: 1.6;
        }
        
        footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 30px 0;
            margin-top: 60px;
        }
        
        footer p {
            margin: 5px 0;
        }
        
        @media (max-width: 768px) {
            header h1 {
                font-size: 2em;
            }
            
            .news-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .empty-category {
            color: #7f8c8d;
            font-style: italic;
            padding: 20px;
            text-align: center;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>🤖 AI週刊ニュース</h1>
            <div class="update-info">
                <div class="update-time">最終更新: ${formatDate(data.lastUpdated)}</div>
                <div class="news-count">収集: ${data.totalFound}件 / 掲載: ${data.news.length}件の重要ニュース</div>
            </div>
        </div>
    </header>
    
    <main class="main-content">
        <div class="container">
            ${Object.entries(categorizedNews).map(([category, items]) => {
              if (items.length === 0) return '';
              
              return `
            <section class="category-section">
                <h2 class="category-header">${categoryNames[category]}</h2>
                <div class="news-grid">
                    ${items.map(item => {
                      let importanceBadge = '';
                      let importanceClass = '';
                      
                      if (item.importance >= 60) {
                        importanceBadge = '重要';
                        importanceClass = 'importance-high';
                      } else if (item.importance >= 45) {
                        importanceBadge = '注目';
                        importanceClass = 'importance-medium';
                      }
                      
                      return `
                    <article class="news-item">
                        ${importanceBadge ? `<span class="importance-badge ${importanceClass}">${importanceBadge}</span>` : ''}
                        <div class="news-source">${item.source}</div>
                        <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
                        <div class="news-date">${formatDate(item.pubDate)}</div>
                        <div class="news-content">${item.content.substring(0, 200)}${item.content.length > 200 ? '...' : ''}</div>
                    </article>
                      `;
                    }).join('')}
                </div>
            </section>
              `;
            }).join('')}
        </div>
    </main>
    
    <footer>
        <div class="container">
            <p>このページは毎週水曜日と土曜日に自動更新されます</p>
            <p>Powered by GitHub Actions + GitHub Pages</p>
        </div>
    </footer>
</body>
</html>`;
    
    // docsディレクトリに保存（GitHub Pages用）
    const outputPath = path.join(__dirname, '..', 'docs', 'index.html');
    await fs.writeFile(outputPath, html);
    
    console.log('Page built successfully!');
  } catch (error) {
    console.error('Error building page:', error);
    process.exit(1);
  }
}

buildPage();