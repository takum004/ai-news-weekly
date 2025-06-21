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
            console.log(`Loaded ${allArticles.length} articles from JSON`);
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.warn('Failed to load from JSON:', error.message);
        
        // Fallback to embedded data
        console.log('Using embedded fallback data');
        allArticles = [
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
        console.log(`Loaded ${allArticles.length} articles from fallback data`);
    }
    
    if (allArticles.length === 0) {
        console.error('No articles loaded from any source');
    }
}

// Display article details
function displayArticle(articleId) {
    console.log(`Looking for article with ID: ${articleId}`);
    console.log(`Available article IDs:`, allArticles.map(a => a.id));
    
    const article = allArticles.find(a => a.id === articleId);
    
    if (!article) {
        console.error(`Article not found. Searched for ID: ${articleId}`);
        console.error(`Available articles: ${allArticles.length}`);
        showError(`指定された記事が見つかりませんでした。記事ID: ${articleId}`);
        return;
    }
    
    console.log(`Found article: ${article.title}`);
    
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
    
    // Load detailed analysis
    updateDetailedAnalysis(article);
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

// Update detailed analysis section
function updateDetailedAnalysis(article) {
    const analysisData = getDetailedAnalysisData(article);
    
    // Update key points
    const keyPointsList = document.getElementById('key-points-list');
    if (keyPointsList && analysisData.keyPoints) {
        keyPointsList.innerHTML = analysisData.keyPoints
            .map(point => `<li>${point}</li>`)
            .join('');
    }
    
    // Update impact analysis
    const impactText = document.getElementById('impact-text');
    if (impactText && analysisData.impact) {
        impactText.textContent = analysisData.impact;
    }
    
    // Update technical details
    const technicalDetailsText = document.getElementById('technical-details-text');
    if (technicalDetailsText && analysisData.technical) {
        technicalDetailsText.textContent = analysisData.technical;
    }
}

// Get detailed analysis data based on article content
function getDetailedAnalysisData(article) {
    // ChatGPTの記事専用の詳細分析
    if (article.title && article.title.includes('ChatGPT')) {
        return {
            keyPoints: [
                '2022年11月にリリースされ、わずか数ヶ月で世界的現象となった',
                '週間3億人のアクティブユーザーを抱える史上最速の成長を記録',
                'OpenAIのGPTアーキテクチャを基盤とした大規模言語モデル',
                '文章作成、コード生成、翻訳、質疑応答など多様なタスクに対応',
                'API提供により企業向けサービスとしても広く活用されている',
                'プラグイン機能により外部サービスとの連携が可能',
                '教育、ビジネス、クリエイティブ分野で革新的な変化をもたらしている'
            ],
            impact: 'ChatGPTは生成AIの民主化を実現し、AI技術の一般普及において歴史的な転換点となった。企業の業務効率化、教育現場での学習支援、コンテンツ制作の自動化など、あらゆる分野でデジタル変革を加速させている。一方で、著作権問題、学術不正、雇用への影響など、社会的課題も浮上しており、適切な規制と利用ガイドラインの策定が急務となっている。',
            technical: 'ChatGPTはTransformerアーキテクチャを基盤とし、数千億個のパラメータを持つ大規模言語モデルである。強化学習による人間フィードバック（RLHF）技術により、人間の価値観に沿った回答を生成するよう調整されている。推論処理にはクラウドコンピューティングを活用し、リアルタイムでの対話を実現。最新版では画像認識、音声対話、外部ツール連携などのマルチモーダル機能も搭載している。'
        };
    }
    
    // OpenAI関連記事の一般的な分析
    if (article.category === 'openai') {
        return {
            keyPoints: [
                'OpenAIの最新技術革新に関する重要な発表',
                'AI業界全体への影響力を持つ画期的な進歩',
                '技術的ブレークスルーとその実用化への道筋',
                '競合他社への波及効果と市場動向の変化'
            ],
            impact: 'OpenAIの技術革新は、AI業界全体の発展方向を左右する重要な意味を持っています。この発表により、他の企業や研究機関も同様の技術開発を加速させ、業界全体の競争が激化することが予想されます。',
            technical: '最先端のAI技術を活用した革新的なアプローチにより、従来の限界を超える性能向上を実現。技術的な詳細については元記事をご参照ください。'
        };
    }
    
    // Google関連記事の分析
    if (article.category === 'google') {
        return {
            keyPoints: [
                'Googleの先進的AI技術とその実用化',
                'Geminiモデルの能力向上と新機能',
                '既存サービスとの統合による利便性向上',
                '企業向けソリューションの拡充'
            ],
            impact: 'Googleの技術革新は、検索、広告、クラウドサービスなど幅広い分野で影響を与え、ユーザー体験の向上と新たなビジネス機会の創出に貢献しています。',
            technical: 'Geminiモデルやその他の先進技術を活用し、マルチモーダル処理能力とリアルタイム応答性能の向上を実現。詳細な技術仕様は元記事をご確認ください。'
        };
    }
    
    // Anthropic関連記事の分析
    if (article.category === 'anthropic') {
        return {
            keyPoints: [
                'AI安全性研究の最前線での重要な発見',
                'Claudeモデルの技術的進歩と信頼性向上',
                'Constitutional AIによる価値観の整合性',
                '責任あるAI開発への貢献'
            ],
            impact: 'AnthropicのAI安全性研究は、業界全体のAI開発指針に大きな影響を与え、より安全で信頼できるAIシステムの構築に向けた重要な知見を提供しています。',
            technical: 'Constitutional AIや強化学習手法を活用し、人間の価値観により適合した AI システムの開発を推進。詳細な研究内容については元記事をご参照ください。'
        };
    }
    
    // その他の記事の一般的な分析
    return {
        keyPoints: [
            'AI技術の最新動向に関する重要な情報',
            '業界の発展に影響を与える技術革新',
            '実用化への具体的な取り組み',
            '今後の展望と課題'
        ],
        impact: 'この技術革新は、AI業界の発展と社会実装において重要な意味を持ち、関連分野での新たな可能性を開拓する契機となることが期待されます。',
        technical: '最新のAI技術とアルゴリズムを活用した革新的なアプローチ。技術的な詳細については元記事をご確認ください。'
    };
}