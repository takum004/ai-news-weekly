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
    <style>
        :root {
            --primary: #6366f1;
            --primary-dark: #4f46e5;
            --secondary: #8b5cf6;
            --bg-light: #f8fafc;
            --bg-dark: #0f172a;
            --card-light: #ffffff;
            --card-dark: #1e293b;
            --text-light: #1e293b;
            --text-dark: #e2e8f0;
            --border-light: #e2e8f0;
            --border-dark: #334155;
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans JP', sans-serif;
            line-height: 1.7;
            background: var(--bg-light);
            color: var(--text-light);
            transition: all 0.3s ease;
        }
        
        body.dark-mode {
            background: var(--bg-dark);
            color: var(--text-dark);
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* ヘッダー */
        header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            color: white;
            padding: 40px 0;
            position: relative;
            overflow: hidden;
        }
        
        header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 20s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.1) rotate(180deg); }
        }
        
        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: relative;
            z-index: 2;
        }
        
        .header-left {
            flex: 1;
        }
        
        .header-right {
            display: flex;
            gap: 15px;
            align-items: center;
        }
        
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .update-info {
            opacity: 0.9;
        }
        
        .update-time {
            font-size: 1em;
            margin-bottom: 5px;
        }
        
        .news-count {
            font-size: 0.9em;
        }
        
        /* ログイン・テーマボタン */
        .theme-toggle, .login-btn, .logout-btn {
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 25px;
            padding: 8px 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            color: white;
            font-size: 0.9em;
            backdrop-filter: blur(10px);
        }
        
        .theme-toggle:hover, .login-btn:hover, .logout-btn:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-1px);
        }
        
        .user-info {
            display: none;
            align-items: center;
            gap: 10px;
            color: white;
        }
        
        /* タブナビゲーション */
        .tab-navigation {
            background: var(--card-light);
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            position: sticky;
            top: 0;
            z-index: 100;
            margin-top: -20px;
            border-radius: 15px 15px 0 0;
        }
        
        body.dark-mode .tab-navigation {
            background: var(--card-dark);
        }
        
        .tabs {
            display: flex;
            overflow-x: auto;
            padding: 15px;
            gap: 8px;
            scrollbar-width: thin;
        }
        
        .tab {
            background: transparent;
            border: none;
            padding: 12px 20px;
            cursor: pointer;
            font-size: 0.95em;
            border-radius: 10px;
            transition: all 0.3s ease;
            white-space: nowrap;
            color: var(--text-light);
            font-weight: 500;
            min-width: fit-content;
        }
        
        body.dark-mode .tab {
            color: var(--text-dark);
        }
        
        .tab:hover {
            background: rgba(99, 102, 241, 0.1);
        }
        
        .tab.active {
            background: var(--primary);
            color: white;
        }
        
        /* メインコンテンツ */
        .main-content {
            padding: 30px 0 60px;
        }
        
        .news-grid {
            display: grid;
            gap: 25px;
            grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .news-item {
            background: var(--card-light);
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            border: 1px solid var(--border-light);
        }
        
        body.dark-mode .news-item {
            background: var(--card-dark);
            border-color: var(--border-dark);
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }
        
        .news-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        
        body.dark-mode .news-item:hover {
            box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        }
        
        .news-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary), var(--secondary));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        
        .news-item:hover::before {
            transform: scaleX(1);
        }
        
        .news-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            gap: 10px;
        }
        
        .news-meta {
            display: flex;
            flex-direction: column;
            gap: 5px;
            flex: 1;
        }
        
        .news-source {
            color: var(--primary);
            font-size: 0.85em;
            font-weight: bold;
        }
        
        .news-date {
            color: #64748b;
            font-size: 0.8em;
        }
        
        body.dark-mode .news-date {
            color: #94a3b8;
        }
        
        .news-actions {
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }
        
        .importance-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75em;
            font-weight: bold;
            color: white;
        }
        
        .importance-high {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .importance-medium {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .favorite-btn {
            background: none;
            border: none;
            font-size: 1.2em;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .favorite-btn:hover {
            background: rgba(99, 102, 241, 0.1);
        }
        
        .favorite-btn.favorited {
            color: #ef4444;
        }
        
        .news-title {
            color: var(--text-light);
            text-decoration: none;
            font-size: 1.1em;
            font-weight: bold;
            display: block;
            margin-bottom: 12px;
            line-height: 1.4;
        }
        
        body.dark-mode .news-title {
            color: var(--text-dark);
        }
        
        .news-title:hover {
            color: var(--primary);
        }
        
        .news-title-ja {
            color: #64748b;
            font-size: 0.95em;
            margin-bottom: 15px;
            line-height: 1.4;
        }
        
        body.dark-mode .news-title-ja {
            color: #94a3b8;
        }
        
        .news-content {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid var(--border-light);
        }
        
        body.dark-mode .news-content {
            border-color: var(--border-dark);
        }
        
        .summary-section {
            margin-bottom: 15px;
        }
        
        .summary-label {
            font-size: 0.8em;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 5px;
        }
        
        .summary-text {
            font-size: 0.9em;
            line-height: 1.5;
            color: #475569;
        }
        
        body.dark-mode .summary-text {
            color: #cbd5e1;
        }
        
        /* ログインモーダル */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-light);
            padding: 30px;
            border-radius: 15px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        body.dark-mode .modal-content {
            background: var(--card-dark);
        }
        
        .modal h2 {
            margin-bottom: 20px;
            color: var(--text-light);
        }
        
        body.dark-mode .modal h2 {
            color: var(--text-dark);
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
            color: var(--text-light);
        }
        
        body.dark-mode .form-group label {
            color: var(--text-dark);
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 2px solid var(--border-light);
            border-radius: 8px;
            background: var(--bg-light);
            color: var(--text-light);
        }
        
        body.dark-mode .form-group input {
            border-color: var(--border-dark);
            background: var(--bg-dark);
            color: var(--text-dark);
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            margin-right: 10px;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-primary:hover {
            background: var(--primary-dark);
        }
        
        .btn-secondary {
            background: #6b7280;
            color: white;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
        }
        
        /* マイページ */
        .mypage {
            display: none;
            padding: 30px 0;
        }
        
        .mypage h2 {
            margin-bottom: 20px;
            color: var(--text-light);
        }
        
        body.dark-mode .mypage h2 {
            color: var(--text-dark);
        }
        
        .favorites-grid {
            display: grid;
            gap: 20px;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        }
        
        /* フッター */
        footer {
            background: var(--card-light);
            border-top: 1px solid var(--border-light);
            padding: 30px 0;
            text-align: center;
        }
        
        body.dark-mode footer {
            background: var(--card-dark);
            border-color: var(--border-dark);
        }
        
        footer p {
            margin: 5px 0;
            color: #64748b;
        }
        
        body.dark-mode footer p {
            color: #94a3b8;
        }
        
        /* レスポンシブ */
        @media (max-width: 768px) {
            .header-content {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
            
            .header-right {
                justify-content: center;
            }
            
            header h1 {
                font-size: 2em;
            }
            
            .news-grid, .favorites-grid {
                grid-template-columns: 1fr;
            }
            
            .tabs {
                gap: 5px;
                padding: 10px;
            }
            
            .tab {
                padding: 10px 15px;
                font-size: 0.85em;
            }
        }
        
        .hidden {
            display: none !important;
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="header-content">
                <div class="header-left">
                    <h1>AI週刊ニュース</h1>
                    <div class="update-info">
                        <div class="update-time">最終更新: ${formatDate(data.lastUpdated)}</div>
                        <div class="news-count">📊 ${data.totalFound}件から厳選した${data.news.length}件の重要ニュース</div>
                    </div>
                </div>
                <div class="header-right">
                    <button class="theme-toggle" onclick="toggleTheme()">🌙</button>
                    <button class="login-btn" onclick="showLogin()">ログイン</button>
                    <div class="user-info">
                        <span class="username"></span>
                        <button class="logout-btn" onclick="logout()">ログアウト</button>
                    </div>
                </div>
            </div>
        </div>
    </header>
    
    <div class="container">
        <nav class="tab-navigation">
            <div class="tabs">
                <button class="tab active" onclick="showHome()">🏠 ホーム</button>
                <button class="tab" onclick="showMyPage()">⭐ マイページ</button>
                ${Object.entries(categoryNames).map(([key, name]) => `
                    <button class="tab" onclick="showCategory('${key}')">
                        ${name} (${categorizedNews[key].length})
                    </button>
                `).join('')}
            </div>
        </nav>
    </div>
    
    <main class="main-content">
        <div class="container">
            <!-- ホーム画面 -->
            <div id="home-content">
                ${Object.entries(categorizedNews).map(([category, items]) => `
                    <div class="news-grid category-content" data-category="${category}" ${category !== 'all' ? 'style="display:none"' : ''}>
                        ${items.map((item, index) => {
                            let importanceBadge = '';
                            let importanceClass = '';
                            
                            if (item.importance >= 60) {
                                importanceBadge = '🔥 重要';
                                importanceClass = 'importance-high';
                            } else if (item.importance >= 45) {
                                importanceBadge = '⭐ 注目';
                                importanceClass = 'importance-medium';
                            }
                            
                            return `
                            <article class="news-item" data-id="${category}-${index}">
                                <div class="news-header">
                                    <div class="news-meta">
                                        <div class="news-source">${item.source}</div>
                                        <div class="news-date">${formatDate(item.pubDate)}</div>
                                    </div>
                                    <div class="news-actions">
                                        ${importanceBadge ? `<span class="importance-badge ${importanceClass}">${importanceBadge}</span>` : ''}
                                        <button class="favorite-btn" onclick="toggleFavorite('${category}-${index}')" title="お気に入りに追加">🤍</button>
                                    </div>
                                </div>
                                <a href="${item.link}" target="_blank" class="news-title">${item.title}</a>
                                <div class="news-title-ja">${item.titleJa || item.title}</div>
                                <div class="news-content">
                                    <div class="summary-section">
                                        <div class="summary-label">📝 要約</div>
                                        <div class="summary-text">${item.summaryJa || item.summary || '要約を生成中...'}</div>
                                    </div>
                                </div>
                            </article>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
            
            <!-- マイページ -->
            <div id="mypage-content" class="mypage">
                <h2>📚 お気に入り記事</h2>
                <div class="favorites-grid" id="favorites-list">
                    <p style="text-align: center; color: #64748b; grid-column: 1/-1;">お気に入りに追加した記事はありません</p>
                </div>
            </div>
        </div>
    </main>
    
    <!-- ログインモーダル -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <h2>ログイン</h2>
            <div class="form-group">
                <label for="username">ユーザー名</label>
                <input type="text" id="username" placeholder="ユーザー名を入力">
            </div>
            <div class="form-group">
                <label for="password">パスワード</label>
                <input type="password" id="password" placeholder="パスワードを入力">
            </div>
            <button class="btn btn-primary" onclick="login()">ログイン</button>
            <button class="btn btn-secondary" onclick="hideLogin()">キャンセル</button>
        </div>
    </div>
    
    <footer>
        <div class="container">
            <p>🔄 毎日自動更新</p>
            <p>💻 Powered by GitHub Actions + Vercel</p>
            <p>🤖 AI翻訳・要約機能付き</p>
        </div>
    </footer>
    
    <script>
        // ニュースデータを保存
        const newsData = ${JSON.stringify(categorizedNews)};
        let currentUser = null;
        let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        // ページ読み込み時の初期化
        document.addEventListener('DOMContentLoaded', function() {
            // 保存されたテーマを適用
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-mode');
                document.querySelector('.theme-toggle').textContent = '☀️';
            }
            
            // 保存されたログイン状態を確認
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                updateUserInterface();
            }
            
            // お気に入りを反映
            updateFavoritesDisplay();
        });
        
        // タブ切り替え
        function showCategory(category) {
            // すべてのタブを非アクティブに
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // クリックされたタブをアクティブに
            event.target.classList.add('active');
            
            // ホーム表示
            document.getElementById('home-content').style.display = 'block';
            document.getElementById('mypage-content').style.display = 'none';
            
            // コンテンツの表示切り替え
            document.querySelectorAll('.category-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const targetContent = document.querySelector(\`[data-category="\${category}"]\`);
            if (targetContent) {
                targetContent.style.display = 'grid';
                targetContent.style.animation = 'fadeIn 0.5s ease';
            }
        }
        
        function showHome() {
            // タブ状態更新
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            // コンテンツ表示
            document.getElementById('home-content').style.display = 'block';
            document.getElementById('mypage-content').style.display = 'none';
            
            // デフォルトで全て表示
            document.querySelectorAll('.category-content').forEach(content => {
                content.style.display = 'none';
            });
            document.querySelector('[data-category="all"]').style.display = 'grid';
        }
        
        function showMyPage() {
            if (!currentUser) {
                alert('ログインが必要です');
                showLogin();
                return;
            }
            
            // タブ状態更新
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            // コンテンツ表示
            document.getElementById('home-content').style.display = 'none';
            document.getElementById('mypage-content').style.display = 'block';
            
            updateFavoritesPage();
        }
        
        // ダークモード切り替え
        function toggleTheme() {
            const body = document.body;
            const isDark = body.classList.toggle('dark-mode');
            const themeToggle = document.querySelector('.theme-toggle');
            
            themeToggle.textContent = isDark ? '☀️' : '🌙';
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        }
        
        // ログイン機能
        function showLogin() {
            document.getElementById('loginModal').style.display = 'block';
        }
        
        function hideLogin() {
            document.getElementById('loginModal').style.display = 'none';
        }
        
        function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                alert('ユーザー名とパスワードを入力してください');
                return;
            }
            
            // 簡易ログイン（実際のプロジェクトでは適切な認証を実装）
            currentUser = { username };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            updateUserInterface();
            hideLogin();
            
            // フォームをクリア
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
        }
        
        function logout() {
            currentUser = null;
            localStorage.removeItem('currentUser');
            favorites = [];
            localStorage.removeItem('favorites');
            updateUserInterface();
            
            // ホームに戻る
            showHome();
        }
        
        function updateUserInterface() {
            const loginBtn = document.querySelector('.login-btn');
            const userInfo = document.querySelector('.user-info');
            const username = document.querySelector('.username');
            
            if (currentUser) {
                loginBtn.style.display = 'none';
                userInfo.style.display = 'flex';
                username.textContent = currentUser.username;
            } else {
                loginBtn.style.display = 'block';
                userInfo.style.display = 'none';
            }
        }
        
        // お気に入り機能
        function toggleFavorite(itemId) {
            if (!currentUser) {
                alert('ログインが必要です');
                showLogin();
                return;
            }
            
            const btn = document.querySelector(\`[data-id="\${itemId}"] .favorite-btn\`);
            const isCurrentlyFavorited = favorites.includes(itemId);
            
            if (isCurrentlyFavorited) {
                favorites = favorites.filter(id => id !== itemId);
                btn.textContent = '🤍';
                btn.classList.remove('favorited');
            } else {
                favorites.push(itemId);
                btn.textContent = '❤️';
                btn.classList.add('favorited');
            }
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesPage();
        }
        
        function updateFavoritesDisplay() {
            favorites.forEach(itemId => {
                const btn = document.querySelector(\`[data-id="\${itemId}"] .favorite-btn\`);
                if (btn) {
                    btn.textContent = '❤️';
                    btn.classList.add('favorited');
                }
            });
        }
        
        function updateFavoritesPage() {
            const favoritesList = document.getElementById('favorites-list');
            
            if (favorites.length === 0) {
                favoritesList.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">お気に入りに追加した記事はありません</p>';
                return;
            }
            
            let favoritesHtml = '';
            
            favorites.forEach(itemId => {
                const [category, index] = itemId.split('-');
                const item = newsData[category][parseInt(index)];
                
                if (item) {
                    favoritesHtml += \`
                        <article class="news-item">
                            <div class="news-header">
                                <div class="news-meta">
                                    <div class="news-source">\${item.source}</div>
                                    <div class="news-date">\${new Date(item.pubDate).toLocaleDateString('ja-JP')}</div>
                                </div>
                                <button class="favorite-btn favorited" onclick="toggleFavorite('\${itemId}')" title="お気に入りから削除">❤️</button>
                            </div>
                            <a href="\${item.link}" target="_blank" class="news-title">\${item.title}</a>
                            <div class="news-title-ja">\${item.titleJa || item.title}</div>
                            <div class="news-content">
                                <div class="summary-section">
                                    <div class="summary-label">📝 要約</div>
                                    <div class="summary-text">\${item.summaryJa || item.summary || '要約を生成中...'}</div>
                                </div>
                            </div>
                        </article>
                    \`;
                }
            });
            
            favoritesList.innerHTML = favoritesHtml;
        }
        
        // モーダルの外側クリックで閉じる
        window.onclick = function(event) {
            const modal = document.getElementById('loginModal');
            if (event.target === modal) {
                hideLogin();
            }
        }
    </script>
</body>
</html>`;
    
    // docsディレクトリに保存
    const outputPath = path.join(__dirname, '..', 'docs', 'index.html');
    await fs.writeFile(outputPath, html);
    
    console.log('Page built successfully!');
  } catch (error) {
    console.error('Error building page:', error);
    process.exit(1);
  }
}

buildPage();