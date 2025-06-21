// News Data - data/news.jsonから読み込み
let newsData = null;
let mockNews = [];

// Global Variables
let currentNews = [...mockNews];
let currentCategory = 'all';
let currentSearch = '';

// Category Configuration
const categories = {
    all: { name: '🌐 すべて', count: 0 },
    research: { name: '🔬 AI研究・開発', count: 0 },
    tech: { name: '💻 テクノロジー', count: 0 },
    business: { name: '💼 ビジネス・投資', count: 0 },
    healthcare: { name: '🏥 医療・ヘルスケア', count: 0 },
    academic: { name: '📚 論文・学術研究', count: 0 }
};

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCategoryLabel(category) {
    const labels = {
        tech: 'テクノロジー',
        research: 'AI研究',
        business: 'ビジネス',
        healthcare: '医療',
        academic: '学術'
    };
    return labels[category] || category;
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
    // Reset counts
    Object.keys(categories).forEach(key => {
        categories[key].count = 0;
    });
    
    // Count articles by category
    currentNews.forEach(article => {
        if (categories[article.category]) {
            categories[article.category].count++;
        }
        categories.all.count++;
    });
    
    // Update UI
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        const category = tab.dataset.category;
        const countElement = tab.querySelector('.count');
        if (countElement && categories[category]) {
            countElement.textContent = categories[category].count;
        }
    });
    
    // Update stats
    document.getElementById('article-count').textContent = categories.all.count;
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
    if (!mockNews || mockNews.length === 0) {
        console.warn('No news data available');
        return;
    }
    
    let filteredNews = [...mockNews];
    
    // Category filter
    if (currentCategory !== 'all') {
        filteredNews = filteredNews.filter(article => article.category === currentCategory);
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

// Display News in Grid
function displayNews() {
    const newsGrid = document.getElementById('news-grid');
    const noResults = document.getElementById('no-results');
    
    if (currentNews.length === 0) {
        newsGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        newsGrid.innerHTML = currentNews.map(article => createNewsCard(article)).join('');
        
        // Add staggered animation
        const cards = newsGrid.querySelectorAll('.news-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('slide-up');
            }, index * 100);
        });
    }
    
    updateCategoryCounts();
}

// Event Listeners
function setupEventListeners() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
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
        
        // Initial display
        filterAndDisplayNews();
        
        // Hide loading screen
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading');
            loadingScreen.classList.add('hidden');
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
            loadingScreen.classList.add('hidden');
        }, 1000);
    }
}

// Data Loading
async function loadNewsData() {
    try {
        // Try to load from news.json file
        const response = await fetch('data/news.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        newsData = data;
        mockNews = data.articles || [];
        
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
        totalArticles: 30,
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
            }
        ]
    };
    
    newsData = embeddedData;
    mockNews = embeddedData.articles;
    
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
    
    return mockNews;
}

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