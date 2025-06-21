// Article Detail Page JavaScript

let currentArticle = null;
let allArticles = [];

// Initialize article page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load article data
        await loadArticleData();
        
        // Get article ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (articleId) {
            displayArticle(articleId);
        } else {
            showError('記事IDが指定されていません。');
        }
    } catch (error) {
        console.error('Error loading article:', error);
        showError('記事の読み込みに失敗しました。');
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

// Display article details
function displayArticle(articleId) {
    const article = allArticles.find(a => a.id === articleId);
    
    if (!article) {
        showError('指定された記事が見つかりませんでした。');
        return;
    }
    
    currentArticle = article;
    
    // Update page title
    document.title = `${article.titleJa || article.title} - AI Weekly News`;
    
    // Update breadcrumb
    const breadcrumbCategory = document.getElementById('breadcrumb-category');
    if (breadcrumbCategory) {
        breadcrumbCategory.textContent = getCategoryDisplayName(article.category);
    }
    
    // Update article header
    updateArticleHeader(article);
    
    // Update article body
    updateArticleBody(article);
    
    // Load related articles
    loadRelatedArticles(article);
}

// Update article header
function updateArticleHeader(article) {
    // Category badge
    const categoryElement = document.getElementById('article-category');
    if (categoryElement) {
        categoryElement.textContent = getCategoryDisplayName(article.category);
        categoryElement.className = `category-badge category-${article.category}`;
    }
    
    // Importance badge
    const importanceElement = document.getElementById('article-importance');
    if (importanceElement) {
        const importance = getImportanceLevel(article.importance);
        importanceElement.textContent = importance.label;
        importanceElement.className = `importance-badge importance-${importance.level}`;
        importanceElement.style.backgroundColor = importance.color;
    }
    
    // Date
    const dateElement = document.getElementById('article-date');
    if (dateElement) {
        dateElement.textContent = formatDate(article.pubDate);
        dateElement.setAttribute('datetime', article.pubDate);
    }
    
    // Titles
    const titleEnElement = document.getElementById('article-title-en');
    if (titleEnElement) {
        titleEnElement.textContent = article.title;
    }
    
    const titleJaElement = document.getElementById('article-title-ja');
    if (titleJaElement) {
        titleJaElement.textContent = article.titleJa || '日本語翻訳なし';
        if (!article.titleJa) {
            titleJaElement.style.opacity = '0.6';
            titleJaElement.style.fontStyle = 'italic';
        }
    }
    
    // Source
    const sourceElement = document.getElementById('article-source-name');
    if (sourceElement) {
        sourceElement.textContent = article.source;
    }
}

// Update article body
function updateArticleBody(article) {
    // Summaries
    const summaryEnElement = document.getElementById('article-summary-en');
    if (summaryEnElement) {
        summaryEnElement.textContent = article.summary || '要約が利用できません。';
    }
    
    const summaryJaElement = document.getElementById('article-summary-ja');
    if (summaryJaElement) {
        summaryJaElement.textContent = article.summaryJa || '日本語要約が利用できません。';
        if (!article.summaryJa) {
            summaryJaElement.style.opacity = '0.6';
            summaryJaElement.style.fontStyle = 'italic';
        }
    }
    
    // Details
    const importanceScoreElement = document.getElementById('importance-score');
    if (importanceScoreElement) {
        const importance = getImportanceLevel(article.importance);
        importanceScoreElement.innerHTML = `
            <span class="score-value">${article.importance}/100</span>
            <span class="score-bar">
                <span class="score-fill" style="width: ${article.importance}%; background: ${importance.color}"></span>
            </span>
        `;
    }
    
    const publicationDateElement = document.getElementById('publication-date');
    if (publicationDateElement) {
        publicationDateElement.textContent = formatDetailedDate(article.pubDate);
    }
    
    const articleIdElement = document.getElementById('article-id');
    if (articleIdElement) {
        articleIdElement.textContent = article.id;
    }
    
    // Original link
    const originalLinkElement = document.getElementById('original-link');
    if (originalLinkElement && article.link && article.link !== '#') {
        originalLinkElement.href = article.link;
    } else if (originalLinkElement) {
        originalLinkElement.style.display = 'none';
    }
}

// Load related articles
function loadRelatedArticles(article) {
    const relatedContainer = document.getElementById('related-articles-list');
    if (!relatedContainer) return;
    
    // Find related articles (same category, excluding current)
    const relatedArticles = allArticles
        .filter(a => a.id !== article.id && a.category === article.category)
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5);
    
    if (relatedArticles.length === 0) {
        relatedContainer.innerHTML = '<p style="color: #64748b; text-align: center;">関連記事はありません。</p>';
        return;
    }
    
    relatedContainer.innerHTML = relatedArticles.map(relatedArticle => `
        <a href="article.html?id=${relatedArticle.id}" class="related-item">
            <div class="related-item-content">
                <div class="related-item-title">${relatedArticle.titleJa || relatedArticle.title}</div>
                <div class="related-item-meta">
                    <span class="category-badge category-${relatedArticle.category}">${getCategoryDisplayName(relatedArticle.category)}</span>
                    <span>${formatRelativeDate(relatedArticle.pubDate)}</span>
                </div>
            </div>
        </a>
    `).join('');
}

// Utility functions
function getCategoryDisplayName(category) {
    const categoryNames = {
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
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '昨日';
        } else if (diffDays < 7) {
            return `${diffDays}日前`;
        } else {
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    } catch (error) {
        return dateString;
    }
}

function formatDetailedDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
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
    const articleContent = document.querySelector('.article-content');
    if (articleContent) {
        articleContent.innerHTML = `
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

// Share article function
function shareArticle() {
    if (!currentArticle) return;
    
    const shareData = {
        title: currentArticle.titleJa || currentArticle.title,
        text: currentArticle.summaryJa || currentArticle.summary,
        url: window.location.href
    };
    
    if (navigator.share) {
        navigator.share(shareData);
    } else {
        // Fallback: copy to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        navigator.clipboard.writeText(shareText).then(() => {
            alert('記事のリンクをクリップボードにコピーしました！');
        }).catch(() => {
            alert('シェア機能は利用できません。');
        });
    }
}

// Go back function
function goBack() {
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}