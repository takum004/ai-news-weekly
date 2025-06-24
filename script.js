// News Data - data/news.jsonから読み込み
let newsData = null;
let mockNews = [];

// Global Variables
let allNews = []; // Original complete dataset
let currentNews = []; // Currently displayed news (for display only)
let currentCategory = 'all';
let currentSearch = '';
let viewMode = 'card'; // 'card' or 'list'

// Enhanced Category Configuration
const categories = {
    all: { name: '🌐 すべて', count: 0 },
    
    // Company/Model Releases
    openai: { name: '🤖 OpenAI', count: 0 },
    google: { name: '🔍 Google/Gemini', count: 0 },
    anthropic: { name: '💭 Anthropic/Claude', count: 0 },
    microsoft: { name: '🪟 Microsoft/Copilot', count: 0 },
    meta: { name: '📘 Meta/Llama', count: 0 },
    xai: { name: '❌ xAI/Grok', count: 0 },
    nvidia: { name: '💚 NVIDIA', count: 0 },
    
    // AI Application Areas - Creative
    video_generation: { name: '🎬 動画生成', count: 0 },
    image_generation: { name: '🎨 画像生成', count: 0 },
    audio_generation: { name: '🎵 音声生成', count: 0 },
    music_generation: { name: '🎼 音楽生成', count: 0 },
    voice_cloning: { name: '🎤 音声クローン', count: 0 },
    '3d_modeling': { name: '🏗️ 3Dモデリング', count: 0 },
    
    // AI Application Areas - Productivity
    presentation: { name: '📊 プレゼン・スライド', count: 0 },
    agents: { name: '🤵 エージェントAI', count: 0 },
    automation: { name: '⚡ 自動化・RPA', count: 0 },
    code_generation: { name: '💻 コード生成', count: 0 },
    translation: { name: '🌍 翻訳', count: 0 },
    
    // AI Application Areas - Advanced
    multimodal: { name: '🌐 マルチモーダル', count: 0 },
    reasoning: { name: '🧠 推論AI', count: 0 },
    robotics: { name: '🤖 ロボティクス', count: 0 },
    gaming: { name: '🎮 ゲーミング', count: 0 },
    
    // Traditional Categories
    research: { name: '🔬 AI研究', count: 0 },
    academic: { name: '📚 論文・学術', count: 0 },
    business: { name: '💼 ビジネス・投資', count: 0 },
    healthcare: { name: '🏥 医療・ヘルスケア', count: 0 },
    tech: { name: '💻 テクノロジー', count: 0 },
    startups: { name: '🚀 スタートアップ', count: 0 },
    regulation: { name: '⚖️ 規制・政策', count: 0 }
};

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    
    return `${year}/${month}/${day}`;
}

function getCategoryLabel(category) {
    if (categories[category]) {
        return categories[category].name;
    }
    
    // Fallback labels
    const labels = {
        tech: '💻 テクノロジー',
        research: '🔬 AI研究',
        business: '💼 ビジネス',
        healthcare: '🏥 医療',
        academic: '📚 学術',
        openai: '🤖 OpenAI',
        google: '🔍 Google',
        anthropic: '💭 Anthropic',
        microsoft: '🪟 Microsoft',
        meta: '📘 Meta',
        video_generation: '🎬 動画生成',
        image_generation: '🎨 画像生成',
        audio_generation: '🎵 音声生成',
        presentation: '📊 プレゼン',
        agents: '🤵 エージェント',
        automation: '⚡ 自動化'
    };
    return labels[category] || `📰 ${category}`;
}

function getImportanceBadge(importance) {
    if (importance >= 80) {
        return {
            class: 'high',
            icon: '🔥',
            text: '重要'
        };
    } else if (importance >= 65) {
        return {
            class: 'medium',
            icon: '⭐',
            text: '注目'
        };
    }
    return null;
}

// Update Category Counts
function updateCategoryCounts() {
    console.log('updateCategoryCounts called, allNews length:', allNews.length);
    
    // Reset counts
    Object.keys(categories).forEach(key => {
        categories[key].count = 0;
    });
    
    // Count articles by category using the original dataset
    allNews.forEach(article => {
        if (categories[article.category]) {
            categories[article.category].count++;
        }
        categories.all.count++;
    });
    
    console.log('Category counts after calculation:', Object.fromEntries(
        Object.entries(categories).map(([key, value]) => [key, value.count])
    ));
    
    // Update UI - handle both old and new HTML structures
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        const category = tab.dataset.category;
        // Try to find count element with different selectors
        let countElement = tab.querySelector('.count') || tab.querySelector('span.count');
        
        if (countElement && categories[category]) {
            countElement.textContent = categories[category].count;
        }
    });
    
    // Update stats element if it exists
    const articleCountElement = document.getElementById('article-count');
    if (articleCountElement) {
        articleCountElement.textContent = categories.all.count;
    }
    
    // Log for debugging (simplified)
    console.log(`Categories updated: Total=${categories.all.count}, OpenAI=${categories.openai?.count || 0}, Google=${categories.google?.count || 0}`);
}

// Create News Card HTML
function createNewsCard(article) {
    const importanceBadge = getImportanceBadge(article.importance);
    
    return `
        <article class="news-card ${article.category} fade-in">
            <div class="news-card-header">
                <div class="news-card-meta">
                    <div class="news-card-tags">
                        <span class="news-card-category ${article.category}">
                            ${getCategoryLabel(article.category)}
                        </span>
                        ${importanceBadge ? `
                            <span class="importance-badge ${importanceBadge.class}">
                                <span>${importanceBadge.icon}</span>
                                <span>${importanceBadge.text}</span>
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                <div class="news-card-source">
                    <span class="source-name">${article.source}</span>
                    <span class="source-date">${formatDate(article.pubDate)}</span>
                </div>
            </div>
            
            <div class="news-card-content">
                <h3 class="news-card-title">
                    ${article.titleJa || article.title}
                </h3>
                
                ${article.titleJa && article.titleJa !== article.title ? `
                    <p class="news-card-title-original">
                        ${article.title}
                    </p>
                ` : ''}
                
                <p class="news-card-summary">
                    ${article.summaryJa || article.summary}
                </p>
            </div>
            
            <div class="news-card-footer">
                <div class="news-card-actions">
                    <a href="article.html?id=${article.id}" class="news-card-link secondary">
                        <span>詳細を見る</span>
                        <span class="news-card-link-icon">→</span>
                    </a>
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-card-link primary">
                        <span>元記事</span>
                        <span class="news-card-link-icon">↗</span>
                    </a>
                </div>
            </div>
        </article>
    `;
}

// Filter and Display News
function filterAndDisplayNews() {
    if (!allNews || allNews.length === 0) {
        console.warn('No news data available');
        return;
    }
    
    let filteredNews = [...allNews];
    
    // Category filter
    if (currentCategory !== 'all') {
        const beforeCount = filteredNews.length;
        filteredNews = filteredNews.filter(article => article.category === currentCategory);
        console.log(`Filtering by category '${currentCategory}': ${beforeCount} -> ${filteredNews.length} articles`);
    }
    
    // Search filter
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filteredNews = filteredNews.filter(article => 
            (article.title && article.title.toLowerCase().includes(searchTerm)) ||
            (article.titleJa && article.titleJa.toLowerCase().includes(searchTerm)) ||
            (article.summary && article.summary.toLowerCase().includes(searchTerm)) ||
            (article.summaryJa && article.summaryJa.toLowerCase().includes(searchTerm)) ||
            (article.source && article.source.toLowerCase().includes(searchTerm))
        );
    }
    
    // Sort
    const sortSelect = document.getElementById('sort-select');
    const sortValue = sortSelect.value;
    
    switch (sortValue) {
        case 'date-desc':
            filteredNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            break;
        case 'date-asc':
            filteredNews.sort((a, b) => new Date(a.pubDate) - new Date(b.pubDate));
            break;
        case 'importance-desc':
            filteredNews.sort((a, b) => b.importance - a.importance);
            break;
    }
    
    currentNews = filteredNews;
    displayNews();
}

// Display News in Grid or List
function displayNews() {
    const newsGrid = document.getElementById('news-grid');
    const noResults = document.getElementById('no-results');
    
    if (currentNews.length === 0) {
        newsGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        
        // Apply view mode class
        newsGrid.className = viewMode === 'list' ? 'news-list' : 'news-grid';
        
        // Create appropriate HTML based on view mode
        if (viewMode === 'list') {
            newsGrid.innerHTML = currentNews.map(article => createNewsListItem(article)).join('');
        } else {
            newsGrid.innerHTML = currentNews.map(article => createNewsCard(article)).join('');
            
            // Add staggered animation with cleanup (only for card view)
            const cards = newsGrid.querySelectorAll('.news-card');
            cards.forEach((card, index) => {
                // Clear any existing timeouts on this card
                if (card.animationTimeout) {
                    clearTimeout(card.animationTimeout);
                }
                
                card.animationTimeout = setTimeout(() => {
                    card.classList.add('slide-up');
                    card.animationTimeout = null;
                }, index * 50); // Reduced delay for faster loading
            });
        }
    }
    
    // Don't call updateCategoryCounts here since it's called after data loading
}

// Event Listeners
function setupEventListeners() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            console.log(`Category tab clicked: ${tab.dataset.category}`);
            
            // Update active state
            categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update current category
            currentCategory = tab.dataset.category;
            
            // Filter and display
            filterAndDisplayNews();
        });
    });
    
    // Search
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    function performSearch() {
        currentSearch = searchInput.value.trim();
        filterAndDisplayNews();
    }
    
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Live search (optional)
    searchInput.addEventListener('input', () => {
        currentSearch = searchInput.value.trim();
        if (currentSearch.length >= 2 || currentSearch.length === 0) {
            filterAndDisplayNews();
        }
    });
    
    // Sort
    const sortSelect = document.getElementById('sort-select');
    sortSelect.addEventListener('change', filterAndDisplayNews);
    
    // View toggle
    const cardViewBtn = document.getElementById('card-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');
    
    if (cardViewBtn && listViewBtn) {
        cardViewBtn.addEventListener('click', () => {
            viewMode = 'card';
            cardViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            filterAndDisplayNews();
        });
        
        listViewBtn.addEventListener('click', () => {
            viewMode = 'list';
            listViewBtn.classList.add('active');
            cardViewBtn.classList.remove('active');
            filterAndDisplayNews();
        });
    }
    
    // Smooth scrolling for nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Header scroll effect
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Initialize App
async function initApp() {
    try {
        // Load news data first
        await loadNewsData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial display - ensure data is loaded
        console.log('InitApp: allNews length:', allNews.length);
        if (allNews.length > 0) {
            filterAndDisplayNews();
        } else {
            console.error('No news data available for display');
        }
        
        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1000);
        
        // Add some dynamic effects
        setTimeout(() => {
            const heroContent = document.querySelector('.hero-content');
            if (heroContent) {
                heroContent.classList.add('slide-up');
            }
        }, 1200);
        
    } catch (error) {
        console.error('Failed to initialize app:', error);
        
        // Hide loading screen even on error
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading');
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
            }
        }, 1000);
    }
}

// Data Loading
async function loadNewsData() {
    try {
        // Try to load from news.json file with cache busting
        const cacheBuster = new Date().getTime();
        const response = await fetch(`data/news.json?t=${cacheBuster}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        newsData = data;
        mockNews = data.articles || [];
        allNews = [...(data.articles || [])]; // Store original dataset
        
        console.log('Data loaded - Total articles:', allNews.length);
        console.log('Categories found:', [...new Set(allNews.map(a => a.category))]);
        
        // Update last updated time
        if (data.lastUpdated) {
            const lastUpdated = new Date(data.lastUpdated);
            document.getElementById('last-updated').textContent = 
                lastUpdated.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
        }
        
        // Update article count
        document.getElementById('article-count').textContent = mockNews.length;
        console.log('Updated article count to:', mockNews.length);
        
        // Update category counts immediately after data is loaded
        updateCategoryCounts();
        
        return mockNews;
    } catch (error) {
        console.error('Failed to load news data:', error);
        console.log('Using embedded news data instead...');
        
        // Use embedded news data when file loading fails
        return loadEmbeddedNews();
    }
}

// Embedded news data for when file loading fails
function loadEmbeddedNews() {
    // Full embedded news data
    const embeddedData = {
        lastUpdated: "2025-06-21T00:00:00Z",
        totalArticles: 80,
        articles: [
            {
                id: "openai-gpt-4-1-release",
                title: "OpenAI launches new GPT-4.1 models with improved coding, long context comprehension",
                titleJa: "OpenAI、コーディング能力と長文理解を向上させた新モデル「GPT-4.1」をリリース",
                summary: "OpenAI has launched three new models in the API: GPT-4.1, GPT-4.1 mini, and GPT-4.1 nano. These models outperform GPT-4o with major gains in coding and instruction following.",
                summaryJa: "OpenAIがAPI向けに3つの新モデル「GPT-4.1」「GPT-4.1 mini」「GPT-4.1 nano」をリリース。GPT-4oを上回る性能でコーディングと指示追従が大幅改善。",
                source: "Reuters",
                category: "tech",
                importance: 95,
                pubDate: "2025-06-20T14:30:00Z",
                link: "https://www.reuters.com/technology/artificial-intelligence/openai-launches-new-gpt-41-models-with-improved-coding-long-context-2025-04-14/"
            },
            {
                id: "anthropic-claude-4-opus",
                title: "Anthropic unveils Claude 4 Opus with claim to AI coding crown",
                titleJa: "Anthropic、AIコーディング分野でのリーダーシップを主張する「Claude 4 Opus」を発表",
                summary: "Anthropic debuted Claude 4 Opus, claiming the world's best coding model with sustained performance on complex tasks.",
                summaryJa: "Anthropicが複雑なタスクで持続的な性能を発揮する世界最高のコーディングモデルとして「Claude 4 Opus」を発表。",
                source: "Axios",
                category: "tech",
                importance: 92,
                pubDate: "2025-06-20T13:15:00Z",
                link: "https://www.axios.com/2025/05/22/anthropic-claude-version-4-ai-model"
            },
            {
                id: "google-gemini-2-5-pro",
                title: "Google introduces Gemini 2.5: Our most intelligent AI model",
                titleJa: "Google、最も知的なAIモデル「Gemini 2.5」を発表",
                summary: "Google's Gemini 2.5 Pro and Flash include thought summaries and improved efficiency.",
                summaryJa: "GoogleのGemini 2.5 ProとFlashは思考要約を含み効率が向上。",
                source: "Google DeepMind",
                category: "tech",
                importance: 90,
                pubDate: "2025-06-20T12:00:00Z",
                link: "https://blog.google/technology/google-deepmind/gemini-model-thinking-updates-march-2025/"
            },
            {
                id: "ai-robotics-fast-learning",
                title: "Fast-learning robots: AI advances rapidly speed up robot training",
                titleJa: "高速学習ロボット：AI進歩がロボット訓練を劇的に高速化",
                summary: "AI advances are rapidly speeding up the process of training robots, helping them do new tasks almost instantly.",
                summaryJa: "AI技術の進歩がロボット訓練プロセスを劇的に高速化し、ほぼ瞬時に新しいタスクを実行可能に。",
                source: "MIT Technology Review",
                category: "research",
                importance: 88,
                pubDate: "2025-06-20T11:30:00Z",
                link: "https://www.technologyreview.com"
            },
            {
                id: "microsoft-mayo-clinic-rad-dino",
                title: "Microsoft and Mayo Clinic develop multimodal foundation models for radiology",
                titleJa: "MicrosoftとMayo Clinic、放射線科向けマルチモーダル基盤モデルを開発",
                summary: "Microsoft Research and Mayo Clinic are collaborating to develop multimodal foundation models for radiology applications.",
                summaryJa: "Microsoft ResearchとMayo Clinicが放射線科向けマルチモーダル基盤モデルを共同開発。",
                source: "Microsoft",
                category: "healthcare",
                importance: 85,
                pubDate: "2025-06-20T10:45:00Z",
                link: "https://news.microsoft.com"
            },
            {
                id: "google-txgemma-drug-discovery",
                title: "Google announces TxGemma for AI-powered drug discovery",
                titleJa: "Google、AI支援創薬向け「TxGemma」を発表",
                summary: "Google announced TxGemma, a collection of Gemma-based open models for AI-powered drug discovery.",
                summaryJa: "GoogleがAI支援創薬向けGemmaベースのオープンモデル集「TxGemma」を発表。",
                source: "Google Research",
                category: "healthcare",
                importance: 82,
                pubDate: "2025-06-20T09:30:00Z",
                link: "https://blog.google"
            },
            {
                id: "ai-business-automation-2025",
                title: "Agentic AI and autonomous systems transform enterprise automation",
                titleJa: "エージェントAIと自律システムが企業オートメーションを変革",
                summary: "AI is evolving beyond simple automation to autonomous AI agents that can observe, learn, and act without human approval.",
                summaryJa: "AIが単純な自動化を超えて、人間の承認なしに観察、学習、行動できる自律AIエージェントに進化。",
                source: "PwC",
                category: "business",
                importance: 80,
                pubDate: "2025-06-20T08:15:00Z",
                link: "https://www.pwc.com"
            },
            {
                id: "cornell-ai-research-funding",
                title: "Cornell University receives $10.5 million for AI research advancement",
                titleJa: "Cornell大学、AI研究推進のため1050万ドルの寄付を受領",
                summary: "Cornell University has received a $10.5 million donation to fund AI-related research.",
                summaryJa: "Cornell大学がAI関連研究資金として1050万ドルの寄付を受領。",
                source: "Cornell University",
                category: "academic",
                importance: 78,
                pubDate: "2025-06-20T07:45:00Z",
                link: "#"
            },
            {
                id: "ai-epilepsy-detection",
                title: "AI tool detects 64% of epilepsy brain lesions missed by radiologists",
                titleJa: "AIツールが放射線科医が見落とした脳てんかん病変の64%を検出",
                summary: "A UK study found that an AI tool can successfully detect 64% of epilepsy brain lesions previously missed.",
                summaryJa: "英国の研究で、AIツールが以前見落とされていた脳てんかん病変の64%を正確に検出。",
                source: "UK Medical Research",
                category: "healthcare",
                importance: 86,
                pubDate: "2025-06-20T06:30:00Z",
                link: "#"
            },
            {
                id: "nvidia-robotics-foundation",
                title: "NVIDIA's foundation model enables customizable AI brains for robots",
                titleJa: "NVIDIA基盤モデルがロボット向けカスタマイズ可能AIブレインを実現",
                summary: "NVIDIA's foundation model enables developers to create customizable AI brains for robots.",
                summaryJa: "NVIDIAの基盤モデルが開発者にロボット向けカスタマイズ可能AIブレインの作成を可能に。",
                source: "NVIDIA",
                category: "research",
                importance: 84,
                pubDate: "2025-06-20T05:15:00Z",
                link: "#"
            },
            {
                id: "hyperautomation-financial",
                title: "Hyperautomation transforms financial services with AI and RPA integration",
                titleJa: "ハイパーオートメーションがAIとRPA統合で金融サービスを変革",
                summary: "Hyperautomation combines RPA with AI, machine learning, and process mining in financial services.",
                summaryJa: "ハイパーオートメーションがRPAとAI、機械学習を組み合わせて金融サービスを拡張。",
                source: "McKinsey",
                category: "business",
                importance: 79,
                pubDate: "2025-06-20T04:00:00Z",
                link: "#"
            },
            {
                id: "google-ai-ultra",
                title: "Google launches AI Ultra subscription tier with premium features",
                titleJa: "Google、プレミアム機能付き「AI Ultra」サブスクリプション層を開始",
                summary: "Google AI Ultra is available in the U.S. for $249.99/month with premium features.",
                summaryJa: "Google AI Ultraが米国で月額249.99ドルでプレミアム機能付きで提供開始。",
                source: "Google",
                category: "business",
                importance: 75,
                pubDate: "2025-06-20T03:30:00Z",
                link: "#"
            },
            {
                id: "mobile-manipulators",
                title: "Autonomous Mobile Manipulation revolutionizes industrial automation",
                titleJa: "自律移動マニピュレーションが産業オートメーションに革命",
                summary: "Autonomous Mobile Manipulation combines mobile platforms with manipulator arms for industrial tasks.",
                summaryJa: "自律移動マニピュレーションが移動プラットフォームとアームを組み合わせ産業タスクを実現。",
                source: "Robotnik",
                category: "research",
                importance: 81,
                pubDate: "2025-06-20T02:45:00Z",
                link: "#"
            },
            {
                id: "soft-robotics-innovation",
                title: "Soft robotics transforms automation with flexible materials",
                titleJa: "ソフトロボティクスが柔軟素材でオートメーションを変革",
                summary: "Soft robotics is transforming automation by utilizing flexible, soft materials.",
                summaryJa: "ソフトロボティクスが柔軟で軟らかい素材を活用してオートメーションを変革。",
                source: "Advanced Robotics",
                category: "research",
                importance: 77,
                pubDate: "2025-06-20T01:30:00Z",
                link: "#"
            },
            {
                id: "med-gemini-accuracy",
                title: "Google's Med-Gemini achieves 91.1% accuracy on U.S. medical exams",
                titleJa: "GoogleのMed-Geminiが米国医師試験で91.1%の精度を達成",
                summary: "Google's Med-Gemini achieved 91.1% accuracy on U.S. medical exam-style questions.",
                summaryJa: "GoogleのMed-Geminiが米国医師試験形式の問題で91.1%の精度を達成。",
                source: "Google Health",
                category: "healthcare",
                importance: 87,
                pubDate: "2025-06-19T23:15:00Z",
                link: "#"
            },
            {
                id: "digital-twin-robotics",
                title: "Digital Twin technology optimizes robotic systems with virtual replicas",
                titleJa: "デジタルツイン技術が仮想レプリカでロボットシステムを最適化",
                summary: "Digital Twin technology creates virtual replicas of robotic systems for optimization.",
                summaryJa: "デジタルツイン技術がロボットシステムの仮想レプリカを作成し最適化を実現。",
                source: "Technology Review",
                category: "research",
                importance: 76,
                pubDate: "2025-06-19T22:00:00Z",
                link: "#"
            },
            {
                id: "turing-award-2025",
                title: "Andrew Barto and Richard Sutton receive 2025 Turing Award",
                titleJa: "Andrew BartoとRichard Suttonが2025年チューリング賞を受賞",
                summary: "Awarded for their groundbreaking work in reinforcement learning.",
                summaryJa: "強化学習での画期的な業績により受賞。",
                source: "ACM",
                category: "academic",
                importance: 89,
                pubDate: "2025-06-19T21:30:00Z",
                link: "#"
            },
            {
                id: "mount-sinai-ai-center",
                title: "Mount Sinai opens 12-story AI center for healthcare innovation",
                titleJa: "Mount Sinaiがヘルスケア革新向け12階建てAIセンターを開設",
                summary: "Mount Sinai Health System opened a 12-story, 65,000-square-foot AI facility.",
                summaryJa: "Mount Sinai Health Systemが12階建て65,000平方フィートのAI施設を開設。",
                source: "Mount Sinai",
                category: "healthcare",
                importance: 83,
                pubDate: "2025-06-19T20:45:00Z",
                link: "#"
            },
            {
                id: "collaborative-robots",
                title: "Collaborative robots evolve with increased autonomy",
                titleJa: "協働ロボットが自律性向上で進化",
                summary: "Collaborative robots are evolving with increased autonomy through advanced software.",
                summaryJa: "協働ロボットが高度なソフトウェアによる自律性向上で進化。",
                source: "Robotics Today",
                category: "research",
                importance: 74,
                pubDate: "2025-06-19T19:30:00Z",
                link: "#"
            },
            {
                id: "ai-financial-operations",
                title: "AI transforms financial operations with real-time processing",
                titleJa: "AIがリアルタイム処理能力で金融業務を変革",
                summary: "AI finance tools process invoices and reconcile accounts with near-perfect accuracy.",
                summaryJa: "AI金融ツールがほぼ完璧な精度で請求書処理と勘定照合を実行。",
                source: "Workday",
                category: "business",
                importance: 78,
                pubDate: "2025-06-19T18:15:00Z",
                link: "#"
            },
            {
                id: "princess-maxima-cancer",
                title: "Princess Máxima Center develops AI tool for personalized cancer treatments",
                titleJa: "Princess Máxima Centerが個別化がん治療向けAIツールを開発",
                summary: "Developing Capricorn, an AI tool using Gemini models for cancer treatment.",
                summaryJa: "Geminiモデルを使用したAIツール「Capricorn」を開発。",
                source: "Google Health",
                category: "healthcare",
                importance: 85,
                pubDate: "2025-06-19T17:00:00Z",
                link: "#"
            },
            {
                id: "rice-university-ai",
                title: "Rice University launches AI venture accelerator with Google",
                titleJa: "Rice大学がGoogle連携でAIベンチャーアクセラレータを開始",
                summary: "Rice University launches AI venture accelerator in collaboration with Google.",
                summaryJa: "Rice大学がGoogleとの連携でAIベンチャーアクセラレータを開始。",
                source: "Rice University",
                category: "academic",
                importance: 72,
                pubDate: "2025-06-19T16:30:00Z",
                link: "#"
            },
            {
                id: "ai-overviews-scale",
                title: "Google's AI Overviews scale to 1.5 billion monthly users",
                titleJa: "GoogleのAI Overviewsが月間15億ユーザーに拡大",
                summary: "AI Overviews have scaled to 1.5 billion monthly users in 200 countries.",
                summaryJa: "AI Overviewsが200の国と地域で月間15億ユーザーに拡大。",
                source: "Google",
                category: "tech",
                importance: 91,
                pubDate: "2025-06-19T15:45:00Z",
                link: "#"
            },
            {
                id: "gemini-workspace",
                title: "Gemini in Workspace provides 2 billion AI assists monthly",
                titleJa: "WorkspaceのGeminiが月間20億のAIアシストを提供",
                summary: "Gemini in Workspace now provides business users with more than 2 billion AI assists monthly.",
                summaryJa: "WorkspaceのGeminiが企業ユーザーに月間20億以上のAIアシストを提供。",
                source: "Google Workspace",
                category: "business",
                importance: 80,
                pubDate: "2025-06-19T14:30:00Z",
                link: "#"
            },
            {
                id: "georgia-tech-ai",
                title: "Georgia Tech inaugurates AI accelerator program",
                titleJa: "Georgia Tech、AIアクセラレータプログラムを開始",
                summary: "Georgia Tech inaugurates AI accelerator for translating research into practical applications.",
                summaryJa: "Georgia Techが研究を実用化するためのAIアクセラレータプログラムを開始。",
                source: "Georgia Tech",
                category: "academic",
                importance: 73,
                pubDate: "2025-06-19T13:15:00Z",
                link: "#"
            },
            {
                id: "china-ai-hiring",
                title: "China's AI sector experiences unprecedented hiring surge",
                titleJa: "中国のAI分野で前例のない採用急増",
                summary: "China's AI sector is experiencing an unprecedented hiring surge.",
                summaryJa: "中国のAI分野で前例のない採用急増が発生。",
                source: "Stanford HAI",
                category: "business",
                importance: 76,
                pubDate: "2025-06-19T12:00:00Z",
                link: "#"
            },
            {
                id: "synthid-detector",
                title: "Google launches SynthID Detector for AI-generated content verification",
                titleJa: "Google、AI生成コンテンツ検証向け「SynthID Detector」を開始",
                summary: "Google announced SynthID Detector for identifying watermarked content.",
                summaryJa: "GoogleがウォーターマークされたコンテンツIdentificationのSynthID Detectorを発表。",
                source: "Google",
                category: "tech",
                importance: 77,
                pubDate: "2025-06-19T11:30:00Z",
                link: "#"
            },
            {
                id: "pixel-watch-pulse",
                title: "Google receives FDA clearance for Loss of Pulse Detection",
                titleJa: "Google、脈拍停止検出機能でFDA承認を取得",
                summary: "FDA clearance for Loss of Pulse Detection feature on Pixel Watch 3.",
                summaryJa: "Pixel Watch 3の脈拍停止検出機能でFDA承認を取得。",
                source: "Google Health",
                category: "healthcare",
                importance: 84,
                pubDate: "2025-06-19T10:15:00Z",
                link: "#"
            },
            {
                id: "washington-health-ai",
                title: "Washington University launches Center for Health AI",
                titleJa: "Washington大学がCenter for Health AIを設立",
                summary: "Washington University and BJC Health System launch joint Center for Health AI.",
                summaryJa: "Washington大学とBJC Health Systemが共同でCenter for Health AIを設立。",
                source: "Washington University",
                category: "healthcare",
                importance: 79,
                pubDate: "2025-06-19T09:45:00Z",
                link: "#"
            },
            {
                id: "elea-ai-germany",
                title: "German AI platform Elea cuts medical testing time to hours",
                titleJa: "ドイツのAIプラットフォーム「Elea」が医療検査時間を時間単位に短縮",
                summary: "Elea has revolutionized medical diagnostics by cutting testing times from weeks to hours.",
                summaryJa: "Eleaが検査時間を週単位から時間単位に短縮し医療診断に革命。",
                source: "Healthcare Innovation",
                category: "healthcare",
                importance: 81,
                pubDate: "2025-06-19T08:30:00Z",
                link: "#"
            },
            {
                id: "healthcare-analytics-market",
                title: "Healthcare predictive analytics market to reach $126.15 billion by 2032",
                titleJa: "ヘルスケア予測分析市場、2032年までに1,261.5億ドルに到達予想",
                summary: "The healthcare predictive analytics market size is expected to reach $126.15 billion by 2032.",
                summaryJa: "ヘルスケア予測分析市場規模が2032年までに1,261.5億ドルに到達予想。",
                source: "Market Research",
                category: "business",
                importance: 75,
                pubDate: "2025-06-19T07:00:00Z",
                link: "#"
            },
            // Video Generation Articles
            {
                id: "runway-gen-3-alpha",
                title: "Runway Gen-3 Alpha model creates Hollywood-quality video from text",
                titleJa: "Runway Gen-3 Alpha、テキストからハリウッド品質の動画を生成",
                summary: "Runway's Gen-3 Alpha brings significant improvements in video quality, consistency, and motion control.",
                summaryJa: "RunwayのGen-3 Alphaが動画品質、一貫性、モーション制御で大幅改善を実現。",
                source: "Runway Research",
                category: "video_generation",
                importance: 94,
                pubDate: "2025-06-20T16:00:00Z",
                link: "#"
            },
            {
                id: "pika-labs-video-ai",
                title: "Pika Labs launches new video AI model with camera controls",
                titleJa: "Pika Labs、カメラ制御機能付き新動画AIモデルをリリース",
                summary: "Pika's latest model offers precise camera movements, zoom controls, and cinematic effects.",
                summaryJa: "Pikaの最新モデルが精密なカメラワーク、ズーム制御、映画的効果を提供。",
                source: "Pika Labs",
                category: "video_generation",
                importance: 90,
                pubDate: "2025-06-20T14:30:00Z",
                link: "#"
            },
            {
                id: "stable-video-diffusion",
                title: "Stability AI releases Stable Video Diffusion for open-source community",
                titleJa: "Stability AI、オープンソースコミュニティ向けStable Video Diffusionをリリース",
                summary: "The open-source video generation model enables developers to create custom video AI applications.",
                summaryJa: "オープンソース動画生成モデルにより開発者が独自の動画AIアプリケーションを作成可能。",
                source: "Stability AI",
                category: "video_generation",
                importance: 88,
                pubDate: "2025-06-20T12:00:00Z",
                link: "#"
            },
            // Image Generation Articles
            {
                id: "midjourney-v7-announcement",
                title: "Midjourney V7 delivers photorealistic images with enhanced consistency",
                titleJa: "Midjourney V7、一貫性を向上させた写真品質の画像を提供",
                summary: "The latest version brings significant improvements in image coherence and style consistency.",
                summaryJa: "最新版が画像の一貫性とスタイルの統一性で大幅な改善を実現。",
                source: "Midjourney",
                category: "image_generation",
                importance: 93,
                pubDate: "2025-06-20T15:45:00Z",
                link: "#"
            },
            {
                id: "dalle-3-hd-update",
                title: "DALL-E 3 HD update enables 4K image generation with fine details",
                titleJa: "DALL-E 3 HDアップデートで4K画像生成と精細ディテールが可能",
                summary: "OpenAI's updated DALL-E 3 can now generate high-resolution images with unprecedented detail.",
                summaryJa: "OpenAIの更新されたDALL-E 3が前例のない詳細度で高解像度画像を生成可能。",
                source: "OpenAI",
                category: "image_generation",
                importance: 91,
                pubDate: "2025-06-20T13:20:00Z",
                link: "#"
            },
            {
                id: "adobe-firefly-integration",
                title: "Adobe integrates Firefly AI across Creative Cloud suite",
                titleJa: "Adobe、Creative CloudスイートにFirefly AIを統合",
                summary: "Full integration brings AI-powered image generation directly into Photoshop, Illustrator, and more.",
                summaryJa: "完全統合によりAI画像生成がPhotoshop、Illustrator等に直接組み込まれる。",
                source: "Adobe",
                category: "image_generation",
                importance: 89,
                pubDate: "2025-06-20T11:10:00Z",
                link: "#"
            },
            // Music Generation Articles
            {
                id: "suno-v4-music-ai",
                title: "Suno V4 generates full songs with lyrics in any genre",
                titleJa: "Suno V4、あらゆるジャンルで歌詞付きフル楽曲を生成",
                summary: "The latest Suno model can create complete songs with vocals, instruments, and production quality.",
                summaryJa: "最新Sunoモデルがボーカル、楽器、プロダクション品質を含む完全な楽曲を作成。",
                source: "Suno AI",
                category: "music_generation",
                importance: 87,
                pubDate: "2025-06-20T10:30:00Z",
                link: "#"
            },
            {
                id: "udio-beta-release",
                title: "Udio launches public beta with advanced music composition AI",
                titleJa: "Udio、高度な音楽作曲AIでパブリックベータを開始",
                summary: "Udio's beta platform allows users to create professional-quality music tracks using AI.",
                summaryJa: "UdioのベータプラットフォームでユーザーがAIを使用してプロ品質の音楽トラックを作成可能。",
                source: "Udio",
                category: "music_generation",
                importance: 85,
                pubDate: "2025-06-20T09:15:00Z",
                link: "#"
            },
            // Voice Cloning Articles
            {
                id: "elevenlabs-voice-cloning",
                title: "ElevenLabs introduces real-time voice cloning with emotion control",
                titleJa: "ElevenLabs、感情制御付きリアルタイム音声クローニングを発表",
                summary: "The new feature allows instant voice replication with adjustable emotional expressions.",
                summaryJa: "新機能により調整可能な感情表現でインスタント音声複製が可能。",
                source: "ElevenLabs",
                category: "voice_cloning",
                importance: 86,
                pubDate: "2025-06-20T08:00:00Z",
                link: "#"
            },
            {
                id: "speechify-voice-ai",
                title: "Speechify launches AI voice actors for audiobook narration",
                titleJa: "Speechify、オーディオブック朗読用AI声優を開始",
                summary: "Professional-quality AI voices can now narrate entire books with consistent character voices.",
                summaryJa: "プロ品質のAI音声が一貫したキャラクター音声で書籍全体を朗読可能。",
                source: "Speechify",
                category: "voice_cloning",
                importance: 82,
                pubDate: "2025-06-19T19:30:00Z",
                link: "#"
            },
            // 3D Modeling Articles
            {
                id: "meta-3d-gen-model",
                title: "Meta releases 3D Gen for instant 3D model creation from text",
                titleJa: "Meta、テキストからインスタント3Dモデル作成の3D Genをリリース",
                summary: "Meta's 3D Gen can create detailed 3D models and textures from simple text descriptions.",
                summaryJa: "MetaのMD Genが簡単なテキスト説明から詳細な3Dモデルとテクスチャを作成。",
                source: "Meta AI",
                category: "3d_modeling",
                importance: 89,
                pubDate: "2025-06-19T18:45:00Z",
                link: "#"
            },
            {
                id: "nvidia-3d-ai-tools",
                title: "NVIDIA Omniverse integrates AI-powered 3D content creation",
                titleJa: "NVIDIA Omniverse、AI駆動3Dコンテンツ作成を統合",
                summary: "New AI tools in Omniverse enable rapid 3D scene generation and asset creation.",
                summaryJa: "OmniverseのAIツールが高速3Dシーン生成とアセット作成を実現。",
                source: "NVIDIA",
                category: "3d_modeling",
                importance: 84,
                pubDate: "2025-06-19T17:20:00Z",
                link: "#"
            },
            // Code Generation Articles
            {
                id: "github-copilot-workspace",
                title: "GitHub Copilot Workspace enables AI-powered end-to-end development",
                titleJa: "GitHub Copilot Workspace、AI駆動のエンドツーエンド開発を実現",
                summary: "New workspace features allow AI to plan, code, test, and deploy entire applications.",
                summaryJa: "新ワークスペース機能によりAIがアプリケーション全体の計画、コーディング、テスト、デプロイを実行。",
                source: "GitHub",
                category: "code_generation",
                importance: 92,
                pubDate: "2025-06-19T16:00:00Z",
                link: "#"
            },
            {
                id: "cursor-ai-editor",
                title: "Cursor AI editor gains predictive coding with 90% accuracy",
                titleJa: "Cursor AIエディタ、90%精度の予測コーディングを獲得",
                summary: "The AI-powered editor can now predict and write code blocks before developers finish typing.",
                summaryJa: "AI駆動エディタが開発者のタイピング完了前にコードブロックを予測・作成可能。",
                source: "Cursor",
                category: "code_generation",
                importance: 88,
                pubDate: "2025-06-19T15:15:00Z",
                link: "#"
            },
            {
                id: "replit-agent-coding",
                title: "Replit Agent can build full applications from natural language",
                titleJa: "Replit Agent、自然言語から完全なアプリケーションを構築",
                summary: "The AI agent understands requirements and builds complete web applications autonomously.",
                summaryJa: "AIエージェントが要件を理解し、完全なWebアプリケーションを自律的に構築。",
                source: "Replit",
                category: "code_generation",
                importance: 86,
                pubDate: "2025-06-19T14:30:00Z",
                link: "#"
            },
            // Agent AI Articles
            {
                id: "anthropic-claude-agents",
                title: "Anthropic releases Claude Agents for autonomous task completion",
                titleJa: "Anthropic、自律タスク完了のClaude Agentsをリリース",
                summary: "Claude Agents can browse the web, use tools, and complete complex multi-step tasks.",
                summaryJa: "Claude AgentsがWeb閲覧、ツール使用、複雑な多段階タスクの完了が可能。",
                source: "Anthropic",
                category: "agents",
                importance: 91,
                pubDate: "2025-06-19T13:45:00Z",
                link: "#"
            },
            {
                id: "openai-operator-release",
                title: "OpenAI Operator can control your computer to complete tasks",
                titleJa: "OpenAI Operator、タスク完了のためコンピュータを制御可能",
                summary: "The new AI agent can interact with any software interface to accomplish user goals.",
                summaryJa: "新AIエージェントがユーザー目標達成のため任意のソフトウェアインターフェースと対話可能。",
                source: "OpenAI",
                category: "agents",
                importance: 94,
                pubDate: "2025-06-19T12:20:00Z",
                link: "#"
            },
            // Robotics Articles
            {
                id: "boston-dynamics-atlas-ai",
                title: "Boston Dynamics Atlas robot gains AI-powered autonomous navigation",
                titleJa: "Boston Dynamics Atlas ロボット、AI駆動自律ナビゲーションを獲得",
                summary: "Atlas can now navigate complex environments and perform tasks without human guidance.",
                summaryJa: "Atlasが複雑な環境をナビゲートし、人間の指導なしでタスクを実行可能。",
                source: "Boston Dynamics",
                category: "robotics",
                importance: 89,
                pubDate: "2025-06-19T11:00:00Z",
                link: "#"
            },
            {
                id: "tesla-optimus-update",
                title: "Tesla Optimus robot demonstrates household task automation",
                titleJa: "Tesla Optimusロボット、家事タスク自動化を実演",
                summary: "Latest Optimus prototype can perform cooking, cleaning, and organizing tasks autonomously.",
                summaryJa: "最新Optimusプロトタイプが料理、掃除、整理タスクを自律的に実行可能。",
                source: "Tesla",
                category: "robotics",
                importance: 87,
                pubDate: "2025-06-19T10:15:00Z",
                link: "#"
            },
            // Multimodal AI Articles
            {
                id: "gpt-4v-vision-upgrade",
                title: "GPT-4V vision capabilities expanded with real-time video analysis",
                titleJa: "GPT-4Vビジョン機能、リアルタイム動画解析で拡張",
                summary: "Enhanced vision model can now process and analyze live video streams in real-time.",
                summaryJa: "強化されたビジョンモデルがライブ動画ストリームをリアルタイムで処理・解析可能。",
                source: "OpenAI",
                category: "multimodal",
                importance: 90,
                pubDate: "2025-06-19T09:30:00Z",
                link: "#"
            },
            {
                id: "google-gemini-multimodal",
                title: "Google Gemini Pro gains advanced multimodal reasoning capabilities",
                titleJa: "Google Gemini Pro、高度なマルチモーダル推論機能を獲得",
                summary: "New model can simultaneously process text, images, audio, and video for complex reasoning.",
                summaryJa: "新モデルが複雑な推論のためテキスト、画像、音声、動画を同時処理可能。",
                source: "Google",
                category: "multimodal",
                importance: 88,
                pubDate: "2025-06-19T08:45:00Z",
                link: "#"
            },
            // xAI Articles
            {
                id: "grok-3-reasoning",
                title: "xAI releases Grok-3 with enhanced reasoning and real-time data",
                titleJa: "xAI、強化された推論とリアルタイムデータ対応のGrok-3をリリース",
                summary: "Grok-3 combines advanced reasoning with live X (Twitter) data integration for current insights.",
                summaryJa: "Grok-3が高度な推論とライブX（Twitter）データ統合で最新インサイトを提供。",
                source: "xAI",
                category: "xai",
                importance: 86,
                pubDate: "2025-06-19T07:30:00Z",
                link: "#"
            },
            {
                id: "grok-image-generation",
                title: "Grok adds image generation capabilities powered by Flux",
                titleJa: "Grok、Flux駆動の画像生成機能を追加",
                summary: "xAI integrates advanced image generation directly into Grok for creative applications.",
                summaryJa: "xAIがクリエイティブアプリケーション用に高度な画像生成をGrokに直接統合。",
                source: "xAI",
                category: "xai",
                importance: 83,
                pubDate: "2025-06-18T20:15:00Z",
                link: "#"
            },
            // NVIDIA Articles
            {
                id: "nvidia-rtx-5090-ai",
                title: "NVIDIA RTX 5090 delivers breakthrough AI performance for creators",
                titleJa: "NVIDIA RTX 5090、クリエイター向けに画期的なAI性能を提供",
                summary: "New graphics card offers 2x faster AI workloads with enhanced memory for large model inference.",
                summaryJa: "新グラフィックカードが大型モデル推論用強化メモリで2倍高速なAIワークロードを提供。",
                source: "NVIDIA",
                category: "nvidia",
                importance: 85,
                pubDate: "2025-06-18T19:00:00Z",
                link: "#"
            },
            {
                id: "nvidia-ai-enterprise-5",
                title: "NVIDIA AI Enterprise 5.0 simplifies AI deployment at scale",
                titleJa: "NVIDIA AI Enterprise 5.0、大規模AI展開を簡素化",
                summary: "New platform provides unified AI infrastructure management for enterprise deployments.",
                summaryJa: "新プラットフォームが企業展開用の統一AIインフラ管理を提供。",
                source: "NVIDIA",
                category: "nvidia",
                importance: 81,
                pubDate: "2025-06-18T17:45:00Z",
                link: "#"
            },
            // Gaming AI Articles
            {
                id: "unity-ai-npc-generator",
                title: "Unity launches AI NPC generator for realistic game characters",
                titleJa: "Unity、リアルなゲームキャラクター用AI NPC生成器を開始",
                summary: "New tool automatically creates intelligent NPCs with unique personalities and behaviors.",
                summaryJa: "新ツールが独特の個性と行動を持つ知的NPCを自動作成。",
                source: "Unity",
                category: "gaming",
                importance: 82,
                pubDate: "2025-06-18T16:30:00Z",
                link: "#"
            },
            {
                id: "epic-games-metahuman-ai",
                title: "Epic Games MetaHuman Creator gains AI-powered facial animation",
                titleJa: "Epic Games MetaHuman Creator、AI駆動顔面アニメーションを獲得",
                summary: "Real-time facial animation generation brings photorealistic characters to life instantly.",
                summaryJa: "リアルタイム顔面アニメーション生成により写真のようにリアルなキャラクターが瞬時に生命を得る。",
                source: "Epic Games",
                category: "gaming",
                importance: 80,
                pubDate: "2025-06-18T15:15:00Z",
                link: "#"
            },
            // Translation AI Articles
            {
                id: "deepl-context-translation",
                title: "DeepL introduces context-aware translation with 99% accuracy",
                titleJa: "DeepL、99%精度のコンテキスト認識翻訳を発表",
                summary: "New model understands document context and cultural nuances for more accurate translations.",
                summaryJa: "新モデルが文書コンテキストと文化的ニュアンスを理解してより正確な翻訳を実現。",
                source: "DeepL",
                category: "translation",
                importance: 84,
                pubDate: "2025-06-18T14:00:00Z",
                link: "#"
            },
            {
                id: "google-translate-realtime",
                title: "Google Translate enables real-time conversation translation",
                titleJa: "Google翻訳、リアルタイム会話翻訳を実現",
                summary: "Live conversation mode translates speech instantly with natural voice synthesis.",
                summaryJa: "ライブ会話モードが自然な音声合成でスピーチを瞬時に翻訳。",
                source: "Google",
                category: "translation",
                importance: 87,
                pubDate: "2025-06-18T13:15:00Z",
                link: "#"
            },
            // Reasoning AI Articles
            {
                id: "deepmind-alphaproof-math",
                title: "DeepMind's AlphaProof achieves gold medal level in mathematical reasoning",
                titleJa: "DeepMindのAlphaProof、数学的推論で金メダルレベルを達成",
                summary: "AI system solves complex mathematical proofs at the level of International Mathematical Olympiad winners.",
                summaryJa: "AIシステムが国際数学オリンピック優勝者レベルで複雑な数学証明を解決。",
                source: "DeepMind",
                category: "reasoning",
                importance: 93,
                pubDate: "2025-06-18T12:30:00Z",
                link: "#"
            },
            {
                id: "openai-o1-pro-benchmark",
                title: "OpenAI o1-pro sets new benchmarks in complex reasoning tasks",
                titleJa: "OpenAI o1-pro、複雑推論タスクで新ベンチマークを設定",
                summary: "Latest reasoning model achieves human-level performance on challenging logic and mathematics problems.",
                summaryJa: "最新推論モデルが困難な論理・数学問題で人間レベルの性能を達成。",
                source: "OpenAI",
                category: "reasoning",
                importance: 91,
                pubDate: "2025-06-18T11:45:00Z",
                link: "#"
            },
            // Startup Articles
            {
                id: "ai-startup-funding-record",
                title: "AI startups raise record $50 billion in 2025 funding rounds",
                titleJa: "AIスタートアップ、2025年の資金調達ラウンドで記録的な500億ドルを調達",
                summary: "Venture capital investment in AI companies reaches unprecedented levels as adoption accelerates.",
                summaryJa: "AI導入加速に伴い、AI企業へのベンチャーキャピタル投資が前例のないレベルに到達。",
                source: "PitchBook",
                category: "startups",
                importance: 79,
                pubDate: "2025-06-18T10:20:00Z",
                link: "#"
            },
            {
                id: "perplexity-search-revenue",
                title: "Perplexity AI reaches $100M annual revenue with conversational search",
                titleJa: "Perplexity AI、対話型検索で年間収益1億ドルに到達",
                summary: "AI-powered search startup achieves major milestone in challenge to traditional search engines.",
                summaryJa: "AI駆動検索スタートアップが従来検索エンジンへの挑戦で主要マイルストーンを達成。",
                source: "Perplexity",
                category: "startups",
                importance: 83,
                pubDate: "2025-06-18T09:30:00Z",
                link: "#"
            },
            // Regulation Articles
            {
                id: "eu-ai-act-implementation",
                title: "EU AI Act implementation begins with first compliance deadlines",
                titleJa: "EU AI法の実装開始、最初のコンプライアンス期限到来",
                summary: "European Union's comprehensive AI legislation enters force with immediate requirements for high-risk systems.",
                summaryJa: "欧州連合の包括的AI法が高リスクシステムへの即時要件と共に発効。",
                source: "European Commission",
                category: "regulation",
                importance: 85,
                pubDate: "2025-06-18T08:15:00Z",
                link: "#"
            },
            {
                id: "us-ai-safety-institute",
                title: "US establishes National AI Safety Institute with $2B budget",
                titleJa: "米国、20億ドル予算で国立AI安全研究所を設立",
                summary: "New federal agency will oversee AI safety research and establish national AI safety standards.",
                summaryJa: "新連邦機関がAI安全研究を監督し、国家AI安全基準を確立。",
                source: "NIST",
                category: "regulation",
                importance: 88,
                pubDate: "2025-06-18T07:00:00Z",
                link: "#"
            }
        ]
    };
    
    newsData = embeddedData;
    mockNews = embeddedData.articles;
    allNews = [...embeddedData.articles]; // Store original dataset
    
    console.log('Embedded data loaded - Total articles:', allNews.length);
    console.log('Categories found:', [...new Set(allNews.map(a => a.category))]);
    
    // Update last updated time
    const lastUpdated = new Date(embeddedData.lastUpdated);
    document.getElementById('last-updated').textContent = 
        lastUpdated.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    
    // Update article count
    document.getElementById('article-count').textContent = mockNews.length;
    
    // Update category counts immediately after embedded data is loaded
    updateCategoryCounts();
    
    return mockNews;
}

// Debug Functions - available in browser console
window.debugAINews = {
    getAllNews: () => allNews,
    getCurrentNews: () => currentNews,
    getCurrentCategory: () => currentCategory,
    getCategories: () => categories,
    testFilter: (category) => {
        currentCategory = category;
        filterAndDisplayNews();
    },
    checkData: () => {
        console.log('All news count:', allNews.length);
        console.log('Current news count:', currentNews.length);
        console.log('Current category:', currentCategory);
        console.log('Categories:', Object.fromEntries(
            Object.entries(categories).map(([key, value]) => [key, value.count])
        ));
    }
};

// Error Handling
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    // Could implement user-friendly error display here
});

// Performance Optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Responsive utilities
function handleResize() {
    // Add any responsive JavaScript logic here
    const newsGrid = document.getElementById('news-grid');
    if (window.innerWidth < 768) {
        newsGrid.style.gridTemplateColumns = '1fr';
    }
}

window.addEventListener('resize', debounce(handleResize, 250));

// Create list item HTML
function createNewsListItem(article) {
    const importance = getImportanceBadge(article.importance);
    const categoryInfo = getCategoryLabel(article.category);
    const date = formatDate(article.pubDate);
    
    return `
        <article class="news-list-item">
            <div class="news-list-content">
                <h3 class="news-list-title">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer">
                        ${article.titleJa || article.title}
                    </a>
                </h3>
                <div class="news-list-meta">
                    <span class="category-badge ${article.category}">
                        ${categoryInfo}
                    </span>
                    ${importance}
                    <time class="news-list-date">${date}</time>
                    <span class="news-list-source">${article.source}</span>
                </div>
            </div>
        </article>
    `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Export for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        mockNews,
        formatDate,
        getCategoryLabel,
        getImportanceBadge,
        filterAndDisplayNews
    };
}