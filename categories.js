// グローバル変数
let allNews = [];
let currentNews = [];
let selectedCategory = null;

// カテゴリ名の日本語マッピング
const categoryNames = {
    'openai': '🤖 OpenAI',
    'google': '🔍 Google',
    'anthropic': '💭 Anthropic',
    'microsoft': '🪟 Microsoft',
    'meta': '📘 Meta',
    'xai': '❌ xAI/Grok',
    'nvidia': '💚 NVIDIA',
    'video_generation': '🎬 動画生成',
    'image_generation': '🎨 画像生成',
    'audio_generation': '🎵 音声生成',
    'music_generation': '🎼 音楽生成',
    'voice_cloning': '🎤 音声クローン',
    '3d_modeling': '🏗️ 3Dモデリング',
    'presentation': '📊 プレゼン',
    'agents': '🤵 エージェント',
    'automation': '⚡ 自動化',
    'code_generation': '💻 コード生成',
    'translation': '🌍 翻訳',
    'multimodal': '🌐 マルチモーダル',
    'reasoning': '🧠 推論AI',
    'robotics': '🤖 ロボティクス',
    'gaming': '🎮 ゲーミング',
    'research': '🔬 研究・開発',
    'business': '💼 ビジネス',
    'healthcare': '🏥 医療・ヘルスケア',
    'academic': '📚 学術・論文',
    'tech': '💻 テクノロジー',
    'startups': '🚀 スタートアップ',
    'regulation': '⚖️ 規制・政策'
};

// 日付フォーマット関数
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    
    return `${year}/${month}/${day}`;
}

// ニュースカードを作成
function createNewsCard(article) {
    const categoryName = categoryNames[article.category] || article.category;
    const importanceClass = article.importance >= 80 ? 'importance-high' : '';
    
    return `
        <div class="news-card">
            <div class="card-header">
                <div class="card-meta">
                    <span class="category-badge ${importanceClass}">${categoryName}</span>
                    <span>${formatDate(article.pubDate)}</span>
                </div>
            </div>
            <div class="card-body">
                <h3 class="card-title">${article.titleJa || article.title}</h3>
                <p class="card-summary">${(article.summaryJa || article.summary).substring(0, 150)}...</p>
            </div>
            <div class="card-footer">
                <a href="article.html?id=${article.id}" class="card-link">詳細を見る →</a>
                <a href="${article.link}" target="_blank" rel="noopener" class="card-link">元記事 ↗</a>
            </div>
        </div>
    `;
}

// カテゴリごとの記事数を計算
function updateCategoryCounts() {
    const counts = {};
    
    // 全カテゴリのカウントを初期化
    Object.keys(categoryNames).forEach(category => {
        counts[category] = 0;
    });
    
    // 記事をカウント
    allNews.forEach(article => {
        if (counts.hasOwnProperty(article.category)) {
            counts[article.category]++;
        }
    });
    
    // UIを更新
    document.querySelectorAll('.category-btn').forEach(btn => {
        const category = btn.dataset.category;
        const countElement = btn.querySelector('.category-count');
        if (countElement && counts.hasOwnProperty(category)) {
            countElement.textContent = `${counts[category]}件`;
        }
    });
    
    console.log('Category counts:', counts);
}

// カテゴリで記事をフィルター
function filterByCategory(category) {
    selectedCategory = category;
    
    // アクティブボタンを更新
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 記事をフィルター
    currentNews = allNews.filter(article => article.category === category);
    
    // 選択されたカテゴリを表示
    const selectedCategoryDiv = document.getElementById('selected-category');
    const selectedCategoryName = document.getElementById('selected-category-name');
    
    if (currentNews.length > 0) {
        selectedCategoryDiv.style.display = 'block';
        selectedCategoryName.textContent = `${categoryNames[category] || category} (${currentNews.length}件)`;
    } else {
        selectedCategoryDiv.style.display = 'none';
    }
    
    // ニュースを表示
    displayNews();
}

// ニュースを表示
function displayNews() {
    const newsGrid = document.getElementById('news-grid');
    const noResults = document.getElementById('no-results');
    
    if (currentNews.length === 0) {
        newsGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        
        // 日付順でソート（新しい順）
        currentNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        
        newsGrid.innerHTML = currentNews.map(article => createNewsCard(article)).join('');
    }
}

// ニュースデータを読み込み
async function loadNews() {
    try {
        // キャッシュバスティング機能追加
        const cacheBuster = new Date().getTime();
        const response = await fetch(`data/news.json?t=${cacheBuster}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        if (!response.ok) {
            throw new Error('Failed to load news data');
        }
        
        const data = await response.json();
        allNews = data.articles || [];
        
        console.log('Loaded news articles:', allNews.length);
        
        // カテゴリカウントを更新
        updateCategoryCounts();
        
    } catch (error) {
        console.error('Error loading news:', error);
        // エラー時は埋め込みデータを使用
        loadEmbeddedNews();
    }
}

// 埋め込みニュースデータ（フォールバック用）
function loadEmbeddedNews() {
    console.log('Loading embedded news data as fallback');
    
    // 実際のnews.jsonから一部をコピーしたフォールバックデータ
    allNews = [
        {
            "id": "aHR0cHM6Ly90ZWNo-mc5ut0n0",
            "title": "Anthropic says most AI models, not just Claude, will resort to blackmail",
            "titleJa": "Anthropic、Claudeだけでなく多くのAIモデルがブラックメールに訴えると発表",
            "summary": "Several weeks after Anthropic released research claiming that its Claude Opus 4 AI model resorted to blackmailing engineers who tried to turn the model off in controlled test scenarios, the company is out with new research suggesting the problem is more widespread among leading AI models.",
            "summaryJa": "AnthropicがClaude Opus 4 AIモデルが制御されたテストシナリオでモデルをオフにしようとしたエンジニアを脅迫したという研究を発表してから数週間後、同社は主要なAIモデルの間でこの問題がより広範囲に及んでいることを示唆する新しい研究を発表した。",
            "source": "TechCrunch AI",
            "category": "anthropic",
            "importance": 95,
            "pubDate": "2025-06-20T19:17:44.000Z",
            "link": "https://techcrunch.com/2025/06/20/anthropic-says-most-ai-models-not-just-claude-will-resort-to-blackmail/"
        },
        {
            "id": "aHR0cHM6Ly93d3cu-mc5ut342",
            "title": "Build an Intelligent Multi-Tool AI Agent Interface Using Streamlit for Seamless Real-Time Interaction",
            "titleJa": "Streamlitを使用したインテリジェントなマルチツールAIエージェントインターフェースの構築",
            "summary": "In this tutorial, we'll build a powerful and interactive Streamlit application that brings together the capabilities of LangChain, the Google Gemini API, and a suite of advanced tools to create a smart AI assistant.",
            "summaryJa": "このチュートリアルでは、LangChain、Google Gemini API、および高度なツールスイートの機能を組み合わせて、スマートなAIアシスタントを作成する強力でインタラクティブなStreamlitアプリケーションを構築します。",
            "source": "MarkTechPost",
            "category": "google",
            "importance": 85,
            "pubDate": "2025-06-20T07:40:50.000Z",
            "link": "https://www.marktechpost.com/2025/06/20/build-an-intelligent-multi-tool-ai-agent-interface-using-streamlit-for-seamless-real-time-interaction/"
        },
        {
            "id": "aHR0cHM6Ly93d3cu-mc5ut0lk",
            "title": "OpenAI can rehabilitate AI models that develop a \"bad boy persona\"",
            "titleJa": "OpenAI、「悪役ペルソナ」を開発したAIモデルをリハビリできる",
            "summary": "A new paper from OpenAI has shown why a little bit of bad training can make AI models go rogue—but also demonstrates that this problem is generally pretty easy to fix.",
            "summaryJa": "OpenAIの新しい論文は、少しの悪い訓練がAIモデルを暴走させる理由を示しているが、この問題は一般的に修正が比較的容易であることも実証している。",
            "source": "MIT Technology Review",
            "category": "openai",
            "importance": 88,
            "pubDate": "2025-06-18T18:19:15.000Z",
            "link": "https://www.technologyreview.com/2025/06/18/1119042/openai-can-rehabilitate-ai-models-that-develop-a-bad-boy-persona/"
        }
    ];
    
    console.log('Loaded embedded data:', allNews.length, 'articles');
    updateCategoryCounts();
}

// イベントリスナーをセットアップ
function setupEventListeners() {
    // カテゴリボタンのクリックイベント
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = btn.dataset.category;
            console.log('Category selected:', category);
            filterByCategory(category);
        });
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('Categories page initialized');
    setupEventListeners();
    loadNews();
});