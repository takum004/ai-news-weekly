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
        month: 'short',
        day: 'numeric'
      });
    };
    
    // カテゴリラベル取得
    const getCategoryLabel = (category) => {
      const labels = {
        'research': 'AI研究',
        'healthcare': '医療',
        'business': 'ビジネス',
        'tech': 'テクノロジー',
        'academic': '学術',
        'japan': '日本'
      };
      return labels[category] || category;
    };
    
    // カテゴリ別に分類
    const categorizedNews = {
      all: data.news,
      research: [],
      healthcare: [],
      business: [],
      tech: [],
      academic: [],
      japan: []
    };
    
    data.news.forEach(item => {
      const category = item.category || 'other';
      if (categorizedNews[category]) {
        categorizedNews[category].push(item);
      }
    });
    
    // カテゴリ名の日本語化
    const categoryNames = {
      all: '🌐 すべて',
      research: '🔬 AI研究・開発',
      healthcare: '🏥 医療・ヘルスケア',
      business: '💼 ビジネス・投資',
      tech: '💻 テクノロジー',
      academic: '📚 論文・学術研究',
      japan: '🇯🇵 日本のAI'
    };
    
    // HTMLを生成
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI週刊ニュース - 最新のAI動向を日本語で</title>
    <link rel="stylesheet" href="/css/styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <div class="header-content">
            <a href="/" class="logo">AI Weekly News</a>
            <nav class="nav-menu">
                <a href="#" class="nav-link" onclick="showHome()">ホーム</a>
                <a href="#" class="nav-link" onclick="showAllNews()">ニュース</a>
            </nav>
            <div class="auth-buttons">
                <button id="loginBtn" class="btn btn-outline">
                    <span>ログイン</span>
                </button>
                <button id="registerBtn" class="btn btn-primary">
                    <span>新規登録</span>
                </button>
            </div>
            <div class="user-profile" style="display: none;">
                <div class="user-avatar">U</div>
                <span class="username">ユーザー</span>
            </div>
        </div>
    </header>

    <main class="container">
        <!-- ヒーローセクション -->
        <section class="hero">
            <h1>最新のAIニュースを日本語で</h1>
            <p>毎日更新される重要なAI関連ニュースを、自動翻訳と要約で分かりやすくお届けします</p>
            <div class="update-info">
                <small>最終更新: ${formatDate(data.lastUpdated)} | ${data.totalFound}件から厳選した${data.news.length}件</small>
            </div>
        </section>

        <!-- ニュースタブ -->
        <nav class="news-tabs">
            ${Object.entries(categoryNames).map(([key, name]) => `
                <button class="tab-button ${key === 'all' ? 'active' : ''}" onclick="showCategory('${key}')">
                    ${name} <span class="count">(${categorizedNews[key].length})</span>
                </button>
            `).join('')}
        </nav>

        <!-- ニュースコンテンツ -->
        <div id="news-content">
            ${Object.entries(categorizedNews).map(([category, items]) => `
                <div class="news-grid category-content" data-category="${category}" ${category !== 'all' ? 'style="display:none"' : ''}>
                    ${items.map((item, index) => {
                        let categoryBadge = '';
                        if (item.importance >= 60) {
                            categoryBadge = '🔥 重要';
                        } else if (item.importance >= 45) {
                            categoryBadge = '⭐ 注目';
                        }
                        
                        return `
                        <article class="news-card" data-id="${category}-${index}">
                            <div class="news-meta">
                                <span class="news-date">${formatDate(item.pubDate)}</span>
                                <span class="news-source">${item.source}</span>
                            </div>
                            ${item.category ? `<span class="news-category">${getCategoryLabel(item.category)}</span>` : ''}
                            ${categoryBadge ? `<span class="news-category important">${categoryBadge}</span>` : ''}
                            
                            <h3 class="news-title">
                                <a href="${item.link}" target="_blank">${item.title}</a>
                            </h3>
                            
                            ${item.titleJa && item.titleJa !== item.title ? `
                                <p class="news-title-ja">${item.titleJa}</p>
                            ` : ''}
                            
                            <p class="news-summary">${item.summaryJa || item.summary || '要約を生成中...'}</p>
                            
                            <div class="news-actions">
                                <a href="${item.link}" target="_blank" class="btn btn-secondary">
                                    記事を読む
                                </a>
                                <button class="favorite-btn" onclick="toggleFavorite('${category}-${index}', this)" title="お気に入りに追加">
                                    ♡
                                </button>
                            </div>
                        </article>
                        `;
                    }).join('')}
                </div>
            `).join('')}
        </div>
    </main>

    <footer>
        <div class="container">
            <p>🔄 毎日自動更新 | 💻 Powered by GitHub Actions + Vercel | 🤖 AI翻訳・要約機能付き</p>
        </div>
    </footer>

    <!-- JavaScript -->
    <script src="/js/auth.js"></script>
    <script>
        // ニュースデータ
        const newsData = ${JSON.stringify(categorizedNews)};
        
        // カテゴリ表示関数
        function showCategory(category) {
            // タブの状態更新
            document.querySelectorAll('.tab-button').forEach(tab => {
                tab.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // コンテンツ表示切り替え
            document.querySelectorAll('.category-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const targetContent = document.querySelector(\`[data-category="\${category}"]\`);
            if (targetContent) {
                targetContent.style.display = 'grid';
            }
        }
        
        // ホーム表示
        function showHome() {
            showCategory('all');
        }
        
        // 全ニュース表示
        function showAllNews() {
            showCategory('all');
        }
        
        // カテゴリラベル取得
        function getCategoryLabel(category) {
            const labels = {
                'research': 'AI研究',
                'healthcare': '医療',
                'business': 'ビジネス',
                'tech': 'テクノロジー',
                'academic': '学術',
                'japan': '日本'
            };
            return labels[category] || category;
        }
        
        // お気に入り機能
        async function toggleFavorite(itemId, buttonEl) {
            if (!authManager.isAuthenticated()) {
                authManager.showLoginModal();
                return;
            }
            
            const [category, index] = itemId.split('-');
            const item = newsData[category][parseInt(index)];
            
            if (!item) return;
            
            const isFavorited = buttonEl.classList.contains('favorited');
            
            try {
                if (isFavorited) {
                    // お気に入りから削除
                    await authManager.request('/api/favorites', {
                        method: 'DELETE',
                        body: JSON.stringify({
                            articleUrl: item.link
                        })
                    });
                    
                    buttonEl.textContent = '♡';
                    buttonEl.classList.remove('favorited');
                    authManager.showSuccess('お気に入りから削除しました');
                } else {
                    // お気に入りに追加
                    await authManager.request('/api/favorites', {
                        method: 'POST',
                        body: JSON.stringify({
                            articleUrl: item.link,
                            articleTitle: item.title,
                            articleSummary: item.summaryJa || item.summary
                        })
                    });
                    
                    buttonEl.textContent = '♥';
                    buttonEl.classList.add('favorited');
                    authManager.showSuccess('お気に入りに追加しました');
                }
            } catch (error) {
                console.error('Favorite toggle error:', error);
                authManager.showError('操作に失敗しました');
            }
        }
        
        // ページ読み込み時の初期化
        document.addEventListener('DOMContentLoaded', function() {
            // お気に入りの状態を復元
            if (authManager.isAuthenticated()) {
                loadFavoriteStates();
            }
        });
        
        // お気に入り状態の読み込み
        async function loadFavoriteStates() {
            if (!authManager.isAuthenticated()) return;
            
            try {
                const data = await authManager.request('/api/favorites');
                const favoriteUrls = data.favorites.map(fav => fav.article_url);
                
                // UIに反映
                document.querySelectorAll('.favorite-btn').forEach(btn => {
                    const card = btn.closest('.news-card');
                    const link = card.querySelector('.news-title a').href;
                    
                    if (favoriteUrls.includes(link)) {
                        btn.textContent = '♥';
                        btn.classList.add('favorited');
                    }
                });
            } catch (error) {
                console.error('Failed to load favorites:', error);
            }
        }
    </script>
</body>
</html>`;
    
    // docsディレクトリに保存
    const outputPath = path.join(__dirname, '..', 'docs', 'index.html');
    await fs.writeFile(outputPath, html);
    
    console.log('✅ モダンなページが正常に生成されました!');
  } catch (error) {
    console.error('❌ ページ生成エラー:', error);
    process.exit(1);
  }
}

buildPage();