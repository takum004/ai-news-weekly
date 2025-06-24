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
    console.log('Loading article with ID:', articleId);
    const contentDiv = document.getElementById('article-content');
    
    if (!articleId) {
        console.error('No article ID provided in URL');
        contentDiv.innerHTML = '<div class="error">記事が見つかりません</div>';
        return;
    }
    
    try {
        // Load news data
        console.log('Fetching news data...');
        const dataUrl = `./data/news.json?t=${Date.now()}`;
        console.log('Fetching from:', dataUrl);
        
        const response = await fetch(dataUrl);
        if (!response.ok) {
            console.error('Failed to fetch news.json:', response.status, response.statusText);
            throw new Error('データの読み込みに失敗しました');
        }
        
        const data = await response.json();
        console.log('Loaded articles count:', data.articles?.length || 0);
        const article = data.articles.find(a => a.id === articleId);
        
        if (!article) {
            console.error('Article not found with ID:', articleId);
            contentDiv.innerHTML = '<div class="error">記事が見つかりません</div>';
            return;
        }
        
        console.log('Article found:', article.title);
        
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
                <!-- 引用元 -->
                <div class="article-source-link">
                    <h2>引用元</h2>
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer">${article.link}</a>
                </div>
                
                <!-- 概要 -->
                <div class="article-summary">
                    <h2>概要</h2>
                    <p>${article.summaryJa || article.summary}</p>
                </div>
                
                <!-- 詳細レポート -->
                <div class="article-detailed-report">
                    <h2>詳細レポート</h2>
                    ${generateDetailedReport(article)}
                </div>
                
                <!-- 原文セクション（日本語版がある場合のみ表示） -->
                ${article.summaryJa && article.summary !== article.summaryJa ? `
                    <div class="article-original-section">
                        <h2>原文情報</h2>
                        <div class="article-summary-original">
                            <h3>Original Title</h3>
                            <p>${article.title}</p>
                            <h3>Original Summary</h3>
                            <p>${article.summary}</p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="article-actions">
                    <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-link primary">
                        <span>元記事を詳しく読む</span>
                        <span>↗</span>
                    </a>
                    <a href="index.html" class="article-link secondary">
                        <span>ニュース一覧に戻る</span>
                        <span>←</span>
                    </a>
                </div>
            </article>
        `;
        
    } catch (error) {
        console.error('Error loading article:', error);
        contentDiv.innerHTML = '<div class="error">記事の読み込み中にエラーが発生しました</div>';
    }
}

// Generate detailed report based on article content
function generateDetailedReport(article) {
    // This function generates a more detailed analysis of the article
    // In a real implementation, this could use AI to expand the summary
    const sections = [];
    
    // Introduction section
    sections.push(`
        <div class="report-section">
            <h3>1. はじめに</h3>
            <p>${article.summaryJa || article.summary}</p>
        </div>
    `);
    
    // Key points section
    if (article.category === 'research' || article.category === 'academic') {
        sections.push(`
            <div class="report-section">
                <h3>2. 研究の意義</h3>
                <p>この研究は、AI分野における重要な進展を示しています。技術の発展により、これまで不可能だった応用が実現可能になることが期待されます。</p>
            </div>
        `);
    } else if (article.category === 'business' || article.category === 'tech') {
        sections.push(`
            <div class="report-section">
                <h3>2. ビジネスへの影響</h3>
                <p>この技術革新は、業界に大きな変革をもたらす可能性があります。企業は新しい機会を活用し、競争力を高めることができるでしょう。</p>
            </div>
        `);
    }
    
    // Technical details (if available)
    sections.push(`
        <div class="report-section">
            <h3>3. 技術的な詳細</h3>
            <p>この発表では、最新のAI技術が活用されており、従来の手法と比較して大幅な性能向上が報告されています。</p>
        </div>
    `);
    
    // Future outlook
    sections.push(`
        <div class="report-section">
            <h3>4. 今後の展望</h3>
            <p>この技術の発展により、AI分野はさらなる進化を遂げることが予想されます。今後数年間で、より実用的なアプリケーションが登場することでしょう。</p>
        </div>
    `);
    
    // Add source information
    sections.push(`
        <div class="report-section source-info">
            <p class="source-note">情報源: ${article.source} (${formatDate(article.pubDate)})</p>
        </div>
    `);
    
    return sections.join('');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadArticle);