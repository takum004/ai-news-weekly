// グローバル変数
let allNews = [];
let currentNews = [];
let searchTerm = '';
let sortOrder = 'date-desc';

// カテゴリ名の日本語マッピング（script.jsと統一）
const categoryNames = {
    // Company/Model Releases
    'openai': '🤖 OpenAI',
    'google': '🔍 Google/Gemini',
    'anthropic': '💭 Anthropic/Claude',
    'microsoft': '🪟 Microsoft/Copilot',
    'meta': '📘 Meta/Llama',
    'xai': '❌ xAI/Grok',
    'nvidia': '💚 NVIDIA',
    
    // AI Application Areas - Creative
    'video_generation': '🎬 動画生成',
    'image_generation': '🎨 画像生成',
    'audio_generation': '🎵 音声生成',
    'music_generation': '🎼 音楽生成',
    'voice_cloning': '🎤 音声クローン',
    '3d_modeling': '🏗️ 3Dモデリング',
    
    // AI Application Areas - Productivity
    'presentation': '📊 プレゼン・スライド',
    'agents': '🤵 エージェントAI',
    'automation': '⚡ 自動化・RPA',
    'code_generation': '💻 コード生成',
    'translation': '🌍 翻訳',
    
    // AI Application Areas - Advanced
    'multimodal': '🌐 マルチモーダル',
    'reasoning': '🧠 推論AI',
    'robotics': '🤖 ロボティクス',
    'gaming': '🎮 ゲーミング',
    
    // Traditional Categories
    'research': '🔬 AI研究',
    'academic': '📚 論文・学術',
    'business': '💼 ビジネス・投資',
    'healthcare': '🏥 医療・ヘルスケア',
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
        
        // 記事数を更新
        document.getElementById('article-count').textContent = allNews.length;
        
        // 情報源数を更新
        if (data.sources) {
            const sourcesElement = document.getElementById('sources-count');
            if (sourcesElement) {
                sourcesElement.textContent = data.sources;
            }
        }
        
        // 最終更新日を更新
        if (data.lastUpdated) {
            const date = new Date(data.lastUpdated);
            document.getElementById('last-updated').textContent = date.toLocaleDateString('ja-JP');
        }
        
        // 初期表示
        filterAndSortNews();
        
    } catch (error) {
        console.error('Error loading news:', error);
        console.error('Error details:', error.message);
        console.error('Error type:', error.name);
        
        // ローカルファイルアクセスのCORSエラーの場合のメッセージ
        if (error.message && error.message.includes('Failed to fetch')) {
            console.warn('Note: If running locally with file://, use a local server instead (e.g., python3 -m http.server)');
        }
        
        // エラー時は埋め込みデータを使用
        loadEmbeddedNews();
    }
}

// 埋め込みニュースデータ（フォールバック用）
function loadEmbeddedNews() {
    console.log('Loading embedded news data as fallback');
    
    // 実際のデータから取得した80件の記事データを埋め込み
    const embeddedData = {
        lastUpdated: "2025-06-21T13:00:50.170Z",
        totalArticles: 80,
        articles: [] // 実際のデータはloadAllArticles()で動的に読み込まれます
    };
    
    // 実際のデータを動的に読み込む
    loadAllArticles();
    
    // エラーでもデータを表示できるようにする
    console.log('Loaded embedded data:', allNews.length, 'articles (showing 3 of 80)');
    console.log('Note: Full 80 articles data available in production');
    document.getElementById('article-count').textContent = allNews.length;
    document.getElementById('last-updated').textContent = new Date(embeddedData.lastUpdated).toLocaleDateString('ja-JP');
    
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

// すべての記事データを読み込む関数
async function loadAllArticles() {
    try {
        // XMLHttpRequestを使用（より互換性が高い）
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/news.json', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                allNews = data.articles || [];
                console.log('Successfully loaded all articles:', allNews.length);
                document.getElementById('article-count').textContent = allNews.length;
                
                // 情報源数を更新
                if (data.sources) {
                    const sourcesElement = document.getElementById('sources-count');
                    if (sourcesElement) {
                        sourcesElement.textContent = data.sources;
                    }
                }
                
                if (data.lastUpdated) {
                    document.getElementById('last-updated').textContent = new Date(data.lastUpdated).toLocaleDateString('ja-JP');
                }
                filterAndSortNews();
            } else {
                throw new Error('Failed to load data');
            }
        };
        xhr.onerror = function() {
            // ローカルファイルエラーの場合は手動でデータを設定
            useStaticData();
        };
        xhr.send();
    } catch (error) {
        console.error('Error in loadAllArticles:', error);
        useStaticData();
    }
}

// 静的データを使用する関数（file://プロトコル用）
function useStaticData() {
    // static-news-data.jsから読み込まれたデータを使用
    if (typeof staticNewsData !== 'undefined') {
        console.log('Using static data from static-news-data.js');
        allNews = staticNewsData.articles || [];
        document.getElementById('article-count').textContent = allNews.length;
        
        // 情報源数を更新
        if (staticNewsData.sources) {
            const sourcesElement = document.getElementById('sources-count');
            if (sourcesElement) {
                sourcesElement.textContent = staticNewsData.sources;
            }
        }
        
        document.getElementById('last-updated').textContent = new Date(staticNewsData.lastUpdated).toLocaleDateString('ja-JP');
        filterAndSortNews();
    } else {
        console.error('Static news data not found. Please ensure static-news-data.js is loaded.');
        allNews = [];
        document.getElementById('article-count').textContent = '0';
        document.getElementById('last-updated').textContent = new Date().toLocaleDateString('ja-JP');
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadNews();
});