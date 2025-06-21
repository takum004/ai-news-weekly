// Categories Page JavaScript

let allArticles = [];
let filteredArticles = [];
let currentCategory = 'all';
let currentPage = 1;
const articlesPerPage = 12;

// Initialize categories page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load article data
        await loadArticleData();
        
        // Get category from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        if (categoryParam) {
            currentCategory = categoryParam;
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Update category stats
        updateCategoryStats();
        
        // Display articles for selected category
        filterArticlesByCategory(currentCategory);
        
    } catch (error) {
        console.error('Error loading categories:', error);
        showError('カテゴリーの読み込みに失敗しました。');
    }
});

// Load article data from JSON
async function loadArticleData() {
    try {
        // Try to load from JSON file
        const response = await fetch('data/news.json');
        if (response.ok) {
            const data = await response.json();
            allArticles = data.articles || [];
            
            // Update last updated time
            const lastUpdatedElement = document.getElementById('last-updated');
            if (lastUpdatedElement && data.lastUpdated) {
                lastUpdatedElement.textContent = formatDate(data.lastUpdated);
            }
        }
    } catch (error) {
        console.warn('Failed to load from JSON, using embedded data');
    }
    
    // Fallback to embedded data if JSON fails
    if (allArticles.length === 0 && typeof loadEmbeddedNews === 'function') {
        const embeddedData = loadEmbeddedNews();
        allArticles = embeddedData.articles || [];
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.getAttribute('data-category');
            selectCategory(category);
        });
    });
    
    // Search input
    const searchInput = document.getElementById('category-search');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreArticles);
    }
}

// Update category statistics
function updateCategoryStats() {
    const categories = ['all', 'tech', 'business', 'research', 'healthcare', 'academic'];
    const categoryStats = {};
    
    // Count articles by category
    categories.forEach(category => {
        if (category === 'all') {
            categoryStats[category] = allArticles.length;
        } else {
            categoryStats[category] = allArticles.filter(article => article.category === category).length;
        }
    });
    
    // Update tab counts
    categories.forEach(category => {
        const countElement = document.getElementById(`count-${category}`);
        if (countElement) {
            countElement.textContent = categoryStats[category] || 0;
        }
    });
    
    // Update stats grid
    const statsGrid = document.getElementById('category-stats-grid');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">💻</div>
                <div class="stat-number">${categoryStats.tech || 0}</div>
                <div class="stat-label">技術</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💼</div>
                <div class="stat-number">${categoryStats.business || 0}</div>
                <div class="stat-label">ビジネス</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔬</div>
                <div class="stat-number">${categoryStats.research || 0}</div>
                <div class="stat-label">研究</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏥</div>
                <div class="stat-number">${categoryStats.healthcare || 0}</div>
                <div class="stat-label">ヘルスケア</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎓</div>
                <div class="stat-number">${categoryStats.academic || 0}</div>
                <div class="stat-label">学術</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📰</div>
                <div class="stat-number">${categoryStats.all || 0}</div>
                <div class="stat-label">総記事数</div>
            </div>
        `;
    }
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    currentPage = 1;
    
    // Update active tab
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-category') === category) {
            tab.classList.add('active');
        }
    });
    
    // Update URL
    const url = new URL(window.location);
    if (category === 'all') {
        url.searchParams.delete('category');
    } else {
        url.searchParams.set('category', category);
    }
    window.history.replaceState({}, '', url);
    
    // Filter and display articles
    filterArticlesByCategory(category);
}

// Filter articles by category
function filterArticlesByCategory(category) {
    if (category === 'all') {
        filteredArticles = [...allArticles];
    } else {
        filteredArticles = allArticles.filter(article => article.category === category);
    }
    
    // Apply search filter if active
    const searchInput = document.getElementById('category-search');
    if (searchInput && searchInput.value.trim()) {
        applySearchFilter(searchInput.value.trim());
    }
    
    // Apply sort
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        applySorting(sortSelect.value);
    }
    
    // Update category info
    updateCategoryInfo();
    
    // Display articles
    displayArticles();
}

// Handle search
function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    applySearchFilter(searchTerm);
    displayArticles();
}

// Apply search filter
function applySearchFilter(searchTerm) {
    if (!searchTerm) {
        filterArticlesByCategory(currentCategory);
        return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    filteredArticles = filteredArticles.filter(article => {
        return (
            article.title.toLowerCase().includes(searchLower) ||
            (article.titleJa && article.titleJa.toLowerCase().includes(searchLower)) ||
            article.summary.toLowerCase().includes(searchLower) ||
            (article.summaryJa && article.summaryJa.toLowerCase().includes(searchLower)) ||
            article.source.toLowerCase().includes(searchLower)
        );
    });
}

// Handle sort change
function handleSortChange(event) {
    applySorting(event.target.value);
    displayArticles();
}

// Apply sorting
function applySorting(sortBy) {
    switch (sortBy) {
        case 'importance':
            filteredArticles.sort((a, b) => b.importance - a.importance);
            break;
        case 'date':
            filteredArticles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
            break;
        case 'title':
            filteredArticles.sort((a, b) => (a.titleJa || a.title).localeCompare(b.titleJa || b.title));
            break;
    }
}

// Update category info
function updateCategoryInfo() {
    const categoryTitle = document.getElementById('category-title');
    const categoryDescription = document.getElementById('category-description');
    const currentCount = document.getElementById('current-count');
    
    const categoryInfo = getCategoryInfo(currentCategory);
    
    if (categoryTitle) {
        categoryTitle.textContent = categoryInfo.title;
    }
    
    if (categoryDescription) {
        categoryDescription.textContent = categoryInfo.description;
    }
    
    if (currentCount) {
        currentCount.textContent = filteredArticles.length;
    }
}

// Get category information
function getCategoryInfo(category) {
    const categoryInfoMap = {
        'all': {
            title: '📰 すべてのニュース',
            description: '全カテゴリのAI関連ニュースを表示しています'
        },
        
        // Company/Model Categories
        'openai': {
            title: '🤖 OpenAI関連ニュース',
            description: 'OpenAI、ChatGPT、GPT、DALL-E、Soraなどに関するニュースを表示しています'
        },
        'google': {
            title: '🔍 Google AI関連ニュース',
            description: 'Google AI、Gemini、Bard、DeepMindなどに関するニュースを表示しています'
        },
        'anthropic': {
            title: '💭 Anthropic関連ニュース',
            description: 'Anthropic、Claude、Constitutional AIなどに関するニュースを表示しています'
        },
        'microsoft': {
            title: '🪟 Microsoft AI関連ニュース',
            description: 'Microsoft、Copilot、Azure AIなどに関するニュースを表示しています'
        },
        'meta': {
            title: '📘 Meta AI関連ニュース',
            description: 'Meta、Llama、Facebook AIなどに関するニュースを表示しています'
        },
        
        // AI Application Areas
        'video_generation': {
            title: '🎬 動画生成AI',
            description: 'AI動画生成、Runway、Pika、映像合成技術に関するニュースを表示しています'
        },
        'image_generation': {
            title: '🎨 画像生成AI',
            description: 'AI画像生成、Midjourney、Stable Diffusion、アート生成に関するニュースを表示しています'
        },
        'audio_generation': {
            title: '🎵 音声生成AI',
            description: 'AI音声生成、音楽AI、音声合成、TTS技術に関するニュースを表示しています'
        },
        'presentation': {
            title: '📊 プレゼンテーションAI',
            description: 'AIスライド生成、プレゼン作成ツール、Gamma、Tomeなどに関するニュースを表示しています'
        },
        'agents': {
            title: '🤵 エージェントAI',
            description: 'AIエージェント、自律AI、マルチエージェント、ワークフロー自動化に関するニュースを表示しています'
        },
        'automation': {
            title: '⚡ AI自動化・RPA',
            description: 'AI自動化、RPA、ワークフロー最適化、ノーコードツールに関するニュースを表示しています'
        },
        
        // Traditional Categories
        'research': {
            title: '🔬 AI研究ニュース',
            description: 'AI研究、ブレークスルー、アルゴリズム、モデル開発に関するニュースを表示しています'
        },
        'academic': {
            title: '🎓 学術ニュース',
            description: '大学、論文、学術機関のAI研究、カンファレンスに関するニュースを表示しています'
        },
        'business': {
            title: '💼 AIビジネスニュース',
            description: 'AI企業、投資、市場動向、スタートアップに関するニュースを表示しています'
        },
        'healthcare': {
            title: '🏥 医療AIニュース',
            description: '医療AI、診断技術、ヘルステック、臨床応用に関するニュースを表示しています'
        },
        'tech': {
            title: '💻 AI技術ニュース',
            description: 'AI技術、プロダクト、開発ツール、プラットフォームに関するニュースを表示しています'
        }
    };
    
    return categoryInfoMap[category] || categoryInfoMap['all'];
}

// Display articles
function displayArticles() {
    const articlesContainer = document.getElementById('category-articles');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (!articlesContainer) return;
    
    if (filteredArticles.length === 0) {
        articlesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>記事が見つかりません</h3>
                <p>検索条件を変更するか、別のカテゴリをお試しください。</p>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    // Calculate articles to show
    const startIndex = 0;
    const endIndex = currentPage * articlesPerPage;
    const articlesToShow = filteredArticles.slice(startIndex, endIndex);
    
    // Render articles
    articlesContainer.innerHTML = articlesToShow.map(article => createArticleCard(article)).join('');
    
    // Show/hide load more button
    if (loadMoreBtn) {
        if (endIndex < filteredArticles.length) {
            loadMoreBtn.style.display = 'block';
            loadMoreBtn.textContent = `📄 さらに表示 (${filteredArticles.length - endIndex}件)`;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    // Add click handlers to article cards
    addArticleClickHandlers();
}

// Create article card HTML
function createArticleCard(article) {
    const importance = getImportanceLevel(article.importance);
    
    return `
        <div class="article-card" data-article-id="${article.id}">
            <div class="article-card-header">
                <div class="article-card-meta">
                    <span class="category-badge category-${article.category}">${getCategoryDisplayName(article.category)}</span>
                    <span class="importance-badge importance-${importance.level}" style="background: ${importance.color}">${importance.label}</span>
                </div>
                <div class="article-card-date">${formatDate(article.pubDate)}</div>
            </div>
            
            <h3 class="article-card-title">${article.title}</h3>
            ${article.titleJa ? `<h4 class="article-card-title-ja">${article.titleJa}</h4>` : ''}
            
            <p class="article-card-summary">${article.summaryJa || article.summary}</p>
            
            <div class="article-card-footer">
                <span class="article-card-source">${article.source}</span>
                <span class="article-card-date">${formatRelativeDate(article.pubDate)}</span>
            </div>
        </div>
    `;
}

// Add click handlers to article cards
function addArticleClickHandlers() {
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach(card => {
        card.addEventListener('click', () => {
            const articleId = card.getAttribute('data-article-id');
            window.location.href = `article.html?id=${articleId}`;
        });
    });
}

// Load more articles
function loadMoreArticles() {
    currentPage++;
    displayArticles();
}

// Utility functions
function getCategoryDisplayName(category) {
    const categoryNames = {
        // Company/Model Categories
        'openai': '🤖 OpenAI',
        'google': '🔍 Google/Gemini',
        'anthropic': '💭 Anthropic/Claude',
        'microsoft': '🪟 Microsoft/Copilot',
        'meta': '📘 Meta/Llama',
        
        // AI Application Areas
        'video_generation': '🎬 動画生成',
        'image_generation': '🎨 画像生成',
        'audio_generation': '🎵 音声生成',
        'presentation': '📊 プレゼン・スライド',
        'agents': '🤵 エージェントAI',
        'automation': '⚡ 自動化・RPA',
        
        // Traditional Categories
        'tech': '💻 技術',
        'business': '💼 ビジネス',
        'research': '🔬 研究',
        'healthcare': '🏥 ヘルスケア',
        'academic': '🎓 学術'
    };
    return categoryNames[category] || '📰 その他';
}

function getImportanceLevel(importance) {
    if (importance >= 90) {
        return { level: 'high', label: '🔥 重要', color: '#ef4444' };
    } else if (importance >= 70) {
        return { level: 'medium', label: '⚡ 注目', color: '#f59e0b' };
    } else {
        return { level: 'low', label: '📝 通常', color: '#10b981' };
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return '日時不明';
    }
}

function formatRelativeDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '昨日';
        } else if (diffDays < 7) {
            return `${diffDays}日前`;
        } else if (diffDays < 30) {
            return `${Math.ceil(diffDays / 7)}週間前`;
        } else {
            return `${Math.ceil(diffDays / 30)}ヶ月前`;
        }
    } catch (error) {
        return '日時不明';
    }
}

function showError(message) {
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #ef4444;">
                <h2>エラー</h2>
                <p>${message}</p>
                <a href="index.html" class="btn btn-primary" style="margin-top: 1rem;">
                    ← ホームに戻る
                </a>
            </div>
        `;
    }
}

// Debounce function
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