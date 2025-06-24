// Get article ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');

// Category labels
const categoryLabels = {
    openai: '🤖 OpenAI',
    google: '🔍 Google',
    anthropic: '💭 Anthropic',
    microsoft: '🪟 Microsoft',
    meta: '📘 Meta',
    xai: '❌ xAI',
    nvidia: '💚 NVIDIA',
    video_generation: '🎬 動画生成',
    image_generation: '🎨 画像生成',
    audio_generation: '🎵 音声生成',
    music_generation: '🎼 音楽生成',
    voice_cloning: '🎤 音声クローン',
    '3d_modeling': '🏗️ 3Dモデリング',
    presentation: '📊 プレゼン',
    agents: '🤵 エージェント',
    automation: '⚡ 自動化',
    code_generation: '💻 コード生成',
    translation: '🌍 翻訳',
    multimodal: '🌐 マルチモーダル',
    reasoning: '🧠 推論AI',
    robotics: '🤖 ロボティクス',
    gaming: '🎮 ゲーミング',
    research: '🔬 研究',
    academic: '📚 学術',
    business: '💼 ビジネス',
    healthcare: '🏥 ヘルスケア',
    tech: '💻 テクノロジー',
    regulation: '⚖️ 規制・政策',
    education: '🎓 教育',
    finance: '💰 金融',
    other: '📌 その他'
};

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get importance badge
function getImportanceBadge(importance) {
    if (importance >= 90) {
        return '<span class="importance-badge high">🔥 重要</span>';
    } else if (importance >= 70) {
        return '<span class="importance-badge medium">⭐ 注目</span>';
    }
    return '';
}

// Load and display article
async function loadArticle() {
    const contentDiv = document.getElementById('article-content');
    
    if (!articleId) {
        contentDiv.innerHTML = '<div class="error">記事が見つかりません</div>';
        return;
    }
    
    try {
        // Load news data
        const response = await fetch(`data/news.json?t=${Date.now()}`);
        if (!response.ok) {
            throw new Error('データの読み込みに失敗しました');
        }
        
        const data = await response.json();
        const article = data.articles.find(a => a.id === articleId);
        
        if (!article) {
            contentDiv.innerHTML = '<div class="error">記事が見つかりません</div>';
            return;
        }
        
        // Update page title
        document.title = `${article.titleJa || article.title} - AI Weekly News`;
        
        // Display article
        contentDiv.innerHTML = `
            <article class="article-header">
                <div class="article-meta">
                    <span class="category-badge ${article.category}">
                        ${categoryLabels[article.category] || article.category}
                    </span>
                    ${getImportanceBadge(article.importance)}
                    <time>${formatDate(article.pubDate)}</time>
                    <span class="source">出典: ${article.source}</span>
                </div>
                
                <h1 class="article-title">${article.titleJa || article.title}</h1>
                ${article.titleJa && article.title !== article.titleJa ? 
                    `<div class="article-title-original">${article.title}</div>` : ''}
            </article>
            
            <article class="article-content">
                <div class="article-summary">
                    <h2>要約</h2>
                    <p>${article.summaryJa || article.summary}</p>
                </div>
                
                ${article.summaryJa && article.summary !== article.summaryJa ? `
                    <div class="article-summary-original">
                        <h3>Original Summary</h3>
                        <p>${article.summary}</p>
                    </div>
                ` : ''}
                
                <div class="article-actions">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-link">
                        <span>元記事を読む</span>
                        <span>↗</span>
                    </a>
                </div>
            </article>
        `;
        
    } catch (error) {
        console.error('Error loading article:', error);
        contentDiv.innerHTML = '<div class="error">記事の読み込み中にエラーが発生しました</div>';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadArticle);