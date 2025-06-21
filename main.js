// グローバル変数
let allNews = [];
let currentNews = [];
let searchTerm = '';
let sortOrder = 'date-desc';

// カテゴリ名の日本語マッピング
const categoryNames = {
    'openai': '🤖 OpenAI',
    'google': '🔍 Google',
    'anthropic': '💭 Anthropic',
    'microsoft': '🪟 Microsoft',
    'meta': '📘 Meta',
    'research': '🔬 研究',
    'business': '💼 ビジネス',
    'healthcare': '🏥 医療',
    'academic': '📚 学術',
    'tech': '💻 テクノロジー'
};

// 日付フォーマット関数
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return '今日';
    } else if (diffDays === 1) {
        return '昨日';
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else {
        return date.toLocaleDateString('ja-JP', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
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

// ニュースを表示
function displayNews() {
    const newsGrid = document.getElementById('news-grid');
    const noResults = document.getElementById('no-results');
    
    if (currentNews.length === 0) {
        newsGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        newsGrid.innerHTML = currentNews.map(article => createNewsCard(article)).join('');
    }
}

// ニュースをフィルター・ソート
function filterAndSortNews() {
    // 検索フィルター
    if (searchTerm) {
        currentNews = allNews.filter(article => {
            const searchLower = searchTerm.toLowerCase();
            return (
                (article.title && article.title.toLowerCase().includes(searchLower)) ||
                (article.titleJa && article.titleJa.toLowerCase().includes(searchLower)) ||
                (article.summary && article.summary.toLowerCase().includes(searchLower)) ||
                (article.summaryJa && article.summaryJa.toLowerCase().includes(searchLower))
            );
        });
    } else {
        currentNews = [...allNews];
    }
    
    // ソート
    switch (sortOrder) {
        case 'date-desc':
            currentNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            break;
        case 'date-asc':
            currentNews.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
            break;
        case 'importance-desc':
            currentNews.sort((a, b) => b.importance - a.importance);
            break;
    }
    
    displayNews();
}

// ニュースデータを読み込み
async function loadNews() {
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) {
            throw new Error('Failed to load news data');
        }
        
        const data = await response.json();
        allNews = data.articles || [];
        
        // 記事数を更新
        document.getElementById('article-count').textContent = allNews.length;
        
        // 最終更新日を更新
        if (data.lastUpdated) {
            const date = new Date(data.lastUpdated);
            document.getElementById('last-updated').textContent = date.toLocaleDateString('ja-JP');
        }
        
        // 初期表示
        filterAndSortNews();
        
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
    document.getElementById('article-count').textContent = allNews.length;
    document.getElementById('last-updated').textContent = new Date().toLocaleDateString('ja-JP');
    
    filterAndSortNews();
}

// イベントリスナーをセットアップ
function setupEventListeners() {
    // 検索ボタン
    document.getElementById('search-btn').addEventListener('click', () => {
        searchTerm = document.getElementById('search-input').value.trim();
        filterAndSortNews();
    });
    
    // 検索入力（Enterキー）
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchTerm = e.target.value.trim();
            filterAndSortNews();
        }
    });
    
    // ソート選択
    document.getElementById('sort-select').addEventListener('change', (e) => {
        sortOrder = e.target.value;
        filterAndSortNews();
    });
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadNews();
});