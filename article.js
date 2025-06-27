// Get article ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const articleId = urlParams.get('id');
// Decode the article ID in case it was URL encoded
const decodedArticleId = articleId ? decodeURIComponent(articleId) : null;

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
    security: '🔒 セキュリティ',
    data_science: '📊 データサイエンス',
    startups: '🚀 スタートアップ',
    quantum: '⚛️ 量子コンピューティング',
    edge_ai: '📱 エッジAI',
    climate: '🌍 気候・環境',
    retail: '🛒 小売・コマース',
    manufacturing: '🏭 製造業',
    transportation: '🚗 交通・運輸',
    agriculture: '🌾 農業',
    energy: '⚡ エネルギー',
    legal: '⚖️ 法務',
    real_estate: '🏢 不動産',
    entertainment: '🎬 エンタメ',
    defense: '🛡️ 防衛',
    space: '🚀 宇宙',
    biotech: '🧬 バイオ',
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
    console.log('Loading article with ID:', decodedArticleId);
    const contentDiv = document.getElementById('article-content');
    
    if (!contentDiv) {
        console.error('article-content element not found!');
        return;
    }
    
    if (!decodedArticleId) {
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
        console.log('Loaded data:', data);
        console.log('Data type:', typeof data);
        console.log('Has articles property:', 'articles' in data);
        console.log('Articles is array:', Array.isArray(data.articles));
        console.log('Loaded articles count:', data.articles?.length || 0);
        
        // データ構造を確認
        if (!data || typeof data !== 'object') {
            console.error('Data is not an object:', data);
            throw new Error('データが正しいオブジェクトではありません');
        }
        
        if (!data.articles) {
            console.error('No articles property in data:', data);
            throw new Error('データにarticlesプロパティがありません');
        }
        
        if (!Array.isArray(data.articles)) {
            console.error('Articles is not an array:', data.articles);
            throw new Error('articlesが配列ではありません');
        }
        
        // Debug: Show first few article IDs
        if (data.articles.length > 0) {
            console.log('First 5 article IDs:', data.articles.slice(0, 5).map(a => a.id));
        }
        console.log('Looking for article ID:', decodedArticleId);
        console.log('Raw article ID from URL:', articleId);
        
        // 記事を柔軟に検索（IDが完全一致、またはURLエンコードされた形式）
        const article = data.articles.find(a => {
            return a.id === decodedArticleId || 
                   a.id === articleId ||
                   decodeURIComponent(a.id) === decodedArticleId;
        });
        
        if (!article) {
            console.error('Article not found with ID:', decodedArticleId);
            console.error('Raw ID:', articleId);
            console.error('Total articles in data:', data.articles?.length || 0);
            if (data.articles && data.articles.length > 0) {
                console.error('First 10 available IDs:', data.articles.slice(0, 10).map(a => a.id));
            }
            
            contentDiv.innerHTML = `
                <div class="error">
                    <h2>記事が見つかりません</h2>
                    <p>リクエストされた記事が見つかりませんでした。</p>
                    <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">この記事は削除されたか、まだ更新されていない可能性があります。</p>
                    <div style="margin-top: 30px;">
                        <a href="index.html" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
                            ← ホームに戻る
                        </a>
                    </div>
                    <details style="margin-top: 20px; font-size: 0.85rem; color: #999;">
                        <summary style="cursor: pointer;">デバッグ情報</summary>
                        <p style="margin-top: 10px;">Article ID: ${decodedArticleId}</p>
                        <p>Raw ID: ${articleId}</p>
                    </details>
                </div>
            `;
            return;
        }
        
        console.log('Article found:', article.title);
        console.log('Article object:', article);
        
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
        console.error('Error stack:', error.stack);
        
        // より詳細なエラー情報を表示
        contentDiv.innerHTML = `
            <div class="error">
                <h2>エラーが発生しました</h2>
                <p>${error.message}</p>
                <p>しばらく経ってから再度お試しください。</p>
                <div style="margin-top: 30px;">
                    <a href="index.html" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">
                        ← ホームに戻る
                    </a>
                </div>
                <details style="margin-top: 20px; font-size: 0.85rem; color: #999;">
                    <summary style="cursor: pointer;">デバッグ情報</summary>
                    <pre style="margin-top: 10px; white-space: pre-wrap; word-wrap: break-word;">
Error: ${error.message}
URL: ${window.location.href}
Article ID: ${decodedArticleId}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
                    </pre>
                </details>
            </div>
        `;
    }
}

// Generate detailed report based on article content
function generateDetailedReport(article) {
    try {
        if (!article) {
            console.error('generateDetailedReport: article is undefined');
            return '<p>詳細レポートの生成中にエラーが発生しました。</p>';
        }
        
        const sections = [];
        const summary = article.summaryJa || article.summary;
        const title = article.titleJa || article.title;
        const originalTitle = article.title;
        const originalSummary = article.summary;
    
    // Extract key information from the article
    const keyInfo = extractKeyInformation(article);
    
    // 1. Introduction section - タイトルと要約に基づいた導入
    sections.push(`
        <div class="report-section">
            <h3>1. はじめに：なぜこのニュースが重要なのか</h3>
            <p>${summary}</p>
            <p>${generateIntroductionContext(article, keyInfo)}</p>
        </div>
    `);
    
    // 2. Background and Context - 記事固有の背景
    sections.push(`
        <div class="report-section">
            <h3>2. 背景と文脈</h3>
            ${generateDynamicBackground(article, keyInfo)}
        </div>
    `);
    
    // 3. Key Technical Details - 記事の内容に基づいた詳細分析
    sections.push(`
        <div class="report-section">
            <h3>3. ${getTechnicalSectionTitle(article, keyInfo)}</h3>
            ${generateTechnicalAnalysis(article, keyInfo)}
        </div>
    `);
    
    // 4. Impact Analysis - 記事固有の影響分析
    sections.push(`
        <div class="report-section">
            <h3>4. 想定される影響と波及効果</h3>
            ${generateSpecificImpactAnalysis(article, keyInfo)}
        </div>
    `);
    
    // 5. Challenges and Considerations - 記事に関連した具体的な課題
    sections.push(`
        <div class="report-section">
            <h3>5. 課題と今後の検討事項</h3>
            ${generateSpecificChallenges(article, keyInfo)}
        </div>
    `);
    
    // 6. Future Outlook - このニュースが示す将来
    sections.push(`
        <div class="report-section">
            <h3>6. 今後の展望と予測</h3>
            ${generateFutureOutlook(article, keyInfo)}
        </div>
    `);
    
    // 7. Expert Commentary - このニュースに対する業界の視点
    sections.push(`
        <div class="report-section">
            <h3>7. 専門家の視点と業界の反応</h3>
            ${generateExpertPerspective(article, keyInfo)}
        </div>
    `);
    
    // 8. Conclusion - このニュース固有の結論
    sections.push(`
        <div class="report-section">
            <h3>8. まとめ：このニュースから学ぶべきこと</h3>
            ${generateConclusion(article, keyInfo)}
        </div>
    `);
    
    // Add source information
    sections.push(`
        <div class="report-section source-info">
            <p class="source-note">情報源: ${article.source} (${formatDate(article.pubDate)})</p>
            <p class="source-note">カテゴリ: ${categoryLabels[article.category] || article.category}</p>
            ${article.importance >= 90 ? '<p class="source-note importance-note">🔥 このニュースは特に重要度が高いと判断されています</p>' : ''}
        </div>
    `);
    
    return sections.join('');
    } catch (error) {
        console.error('Error in generateDetailedReport:', error);
        console.error('Article data:', article);
        return '<p>詳細レポートの生成中にエラーが発生しました。</p>';
    }
}

// Helper function to get category context
function getCategoryContext(category) {
    const contexts = {
        'openai': 'OpenAIの最新動向と戦略',
        'google': 'Googleの技術展開とエコシステム構築',
        'anthropic': 'Anthropicの安全性重視のAI開発',
        'microsoft': 'Microsoftのエンタープライズ向けAI統合',
        'meta': 'Metaのオープンソース戦略',
        'video_generation': '動画生成技術の革新的進歩',
        'image_generation': '画像生成AIの品質向上',
        'code_generation': 'プログラミング支援AIの実用化',
        'agents': 'AIエージェントの自律性向上',
        'research': '基礎研究における新発見',
        'business': 'ビジネスモデルの変革',
        'academic': '学術的ブレークスルー'
    };
    return contexts[category] || 'AI技術の新たな展開';
}

// Helper function to get background context
function getBackgroundContext(article) {
    const category = article.category;
    let content = '<p>';
    
    if (category === 'openai' || category === 'anthropic' || category === 'google') {
        content += `近年のAI開発競争において、大手テック企業は凄まじいスピードで技術革新を進めています。
        特に大規模言語モデル（LLM）の分野では、わずか数ヶ月という期間で性能が飛躍的に向上し、
        新しいバージョンがリリースされるたびに業界の常識が更新されています。`;
    } else if (category.includes('generation')) {
        content += `生成AI技術は、2022年以降急速に発展し、今やクリエイティブ産業に革命をもたらしています。
        テキスト、画像、音声、動画など、あらゆるメディアフォーマットにおいて、
        AIが人間と見分けがつかないレベルのコンテンツを生成できるようになってきました。`;
    } else {
        content += `AI技術の進化は、単なる技術的な進歩にとどまらず、社会全体に大きな変革をもたらしています。
        産業構造の変化、労働市場への影響、倫理的な課題など、多面的な検討が必要な段階に入っています。`;
    }
    
    content += `</p><p>このような背景の中で、今回の発表は特に重要な意味を持ちます。
    技術の進歩だけでなく、それがもたらす社会的インパクトも含めて理解することが重要です。</p>`;
    
    return content;
}

// Helper function to get category-specific detail
function getCategorySpecificDetail(category) {
    const details = {
        'video_generation': '動画生成技術は、静止画像から一歩進んで、時間的な一貫性を保ちながら高品質な動画を生成する段階に到達しています',
        'image_generation': '画像生成AIは、フォトリアリスティックな画像から芸術的な作品まで、幅広いスタイルに対応できるようになっています',
        'audio_generation': '音声生成技術は、自然な発話から音楽制作まで、音響に関わるあらゆる分野で応用されています',
        'code_generation': 'コード生成AIは、プログラマーの生産性を大幅に向上させ、ソフトウェア開発のあり方を根本から変えつつあります'
    };
    return details[category] || '各分野で技術革新が加速しています';
}

// Helper function to get impact analysis
function getImpactAnalysis(article) {
    let content = '<p>この発表がもたらす影響は、複数の層で考察する必要があります：</p>';
    
    content += `
        <h4>技術的影響</h4>
        <ul>
            <li>既存技術との統合や置き換えによる技術スタックの変化</li>
            <li>新しい開発手法やベストプラクティスの確立</li>
            <li>関連技術分野への波及効果と相乗効果</li>
        </ul>
        
        <h4>経済的影響</h4>
        <ul>
            <li>新市場の創出と既存市場の再編</li>
            <li>投資動向の変化と資金の流れ</li>
            <li>雇用構造と必要スキルセットの変化</li>
        </ul>
        
        <h4>社会的影響</h4>
        <ul>
            <li>一般市民の生活様式への影響</li>
            <li>教育や医療など公共サービスへの応用</li>
            <li>デジタルデバイドや格差問題への対応</li>
        </ul>
    `;
    
    if (article.importance >= 90) {
        content += `<p class="highlight-box">この発表は特に重要度が高く、業界全体に大きな影響を与える可能性があります。
        関連企業や研究機関は、この動向を注視し、適切な対応戦略を検討する必要があります。</p>`;
    }
    
    return content;
}

// Extract key information from article with enhanced analysis
function extractKeyInformation(article) {
    const title = article.titleJa || article.title;
    const summary = article.summaryJa || article.summary;
    const originalSummary = article.summary || '';
    const fullText = title + ' ' + summary + ' ' + originalSummary;
    
    // Enhanced patterns for comprehensive extraction
    const patterns = {
        company: /(OpenAI|Google|Anthropic|Microsoft|Meta|NVIDIA|Amazon|Apple|IBM|Tesla|DeepMind|Stability AI|Midjourney|Runway|Adobe|Intel|AMD|Qualcomm|Samsung|Sony|ByteDance|Baidu|Alibaba|Tencent|Hugging Face|Cohere|Inflection|Character\.AI|Databricks|Scale AI|Weights & Biases|Together AI|Replicate|Vercel|Supabase)/gi,
        product: /(GPT-\d+\.?\d*|Claude \d+\.?\d*|Gemini \d+\.?\d*|Llama \d+|Copilot|ChatGPT|DALL-E|Midjourney|Stable Diffusion|Imagen|PaLM|BERT|T5|Whisper|Codex|GitHub Copilot|Cursor|Codeium|Tabnine|AlphaCode|Bard|Bing Chat|Perplexity|You\.com|Neeva|Phind|Poe|HuggingChat|OpenAssistant)/gi,
        version: /(\d+\.\d+|\d+\.x|v\d+|バージョン\d+|版|Version \d+|Release \d+|Update \d+)/gi,
        feature: /(API|SDK|プラットフォーム|フレームワーク|モデル|エンジン|ツール|サービス|アプリ|ソフトウェア|システム|機能|インターフェース|ダッシュボード|コンソール|ライブラリ|プラグイン|拡張機能|統合|連携|自動化|最適化|高速化|効率化|改善|強化|アップデート|リリース|ローンチ|発表|公開)/gi,
        metric: /(\d+[%％]|\d+倍|\d+億|\d+万|\$\d+[BMK]?|\d+[BMK]?\s*ドル|\d+兆|\d+千万|\d+百万|約\d+|以上|以下|超|未満)/gi,
        technology: /(機械学習|深層学習|ディープラーニング|ニューラルネットワーク|自然言語処理|コンピュータビジョン|音声認識|画像認識|生成AI|強化学習|転移学習|ファインチューニング|プロンプトエンジニアリング|RAG|Retrieval|Augmented|Generation|Transformer|Attention|RLHF|Constitutional AI|Chain of Thought|Few-shot|Zero-shot|マルチモーダル|クロスモーダル)/gi,
        action: /(発表|リリース|公開|導入|開始|提供|実装|統合|連携|買収|提携|投資|資金調達|契約|合意|承認|認可|取得|達成|突破|更新|改善|強化|拡張|追加|削除|終了|中止|延期|計画|予定|検討|開発|研究|実験|テスト|評価|分析|調査|報告|警告|批判|議論|懸念)/gi,
        benefit: /(向上|改善|効率化|高速化|自動化|簡素化|最適化|削減|節約|増加|拡大|成長|革新|変革|進化|ブレークスルー|画期的|革命的|先進的|最先端|業界初|世界初|初めて|新しい|最新|次世代)/gi,
        challenge: /(課題|問題|懸念|リスク|脅威|危険|困難|制限|制約|障壁|ハードル|コスト|費用|時間|労力|複雑|難しい|不足|欠如|エラー|バグ|脆弱性|セキュリティ|プライバシー|倫理|規制|法律|コンプライアンス)/gi,
        stakeholder: /(ユーザー|顧客|開発者|エンジニア|研究者|科学者|企業|組織|政府|規制当局|投資家|株主|パートナー|サプライヤー|コミュニティ|一般市民|消費者|学生|教育機関|医療機関|金融機関)/gi
    };
    
    // Extract all patterns
    const extracted = {};
    for (const [key, pattern] of Object.entries(patterns)) {
        const matches = fullText.match(pattern) || [];
        extracted[key] = [...new Set(matches)];
    }
    
    // Analyze key phrases and sentences
    const keyPhrases = extractKeyPhrases(fullText);
    const mainPoints = extractMainPoints(summary);
    
    // Determine article characteristics
    const characteristics = {
        isProductLaunch: /発表|リリース|公開|ローンチ|launch|release|announce/i.test(fullText),
        isResearch: /研究|論文|実験|study|research|paper/i.test(fullText),
        isBusiness: /買収|投資|資金|提携|acquisition|investment|partnership/i.test(fullText),
        isUpdate: /更新|アップデート|改善|update|improve|enhance/i.test(fullText),
        isCritical: /問題|懸念|批判|リスク|issue|concern|risk|problem/i.test(fullText),
        hasMetrics: extracted.metric.length > 0,
        hasTechnicalDetails: extracted.technology.length > 0,
        hasMultipleStakeholders: extracted.stakeholder.length > 2
    };
    
    return {
        ...extracted,
        companies: extracted.company,
        products: extracted.product,
        versions: extracted.version,
        features: extracted.feature,
        metrics: extracted.metric,
        technologies: extracted.technology,
        actions: extracted.action,
        benefits: extracted.benefit,
        challenges: extracted.challenge,
        stakeholders: extracted.stakeholder,
        keyPhrases,
        mainPoints,
        characteristics,
        mainFocus: determineMainFocus(title, summary),
        sentiment: analyzeSentiment(fullText),
        complexity: analyzeComplexity(fullText)
    };
}

// Extract key phrases from text
function extractKeyPhrases(text) {
    const phrases = [];
    
    // Extract quoted phrases
    const quotedPhrases = text.match(/「([^」]+)」|"([^"]+)"/g) || [];
    phrases.push(...quotedPhrases.map(p => p.replace(/[「」""]/g, '')));
    
    // Extract phrases with specific patterns
    const importantPatterns = [
        /により(.{5,30})が可能/g,
        /(.{5,30})を実現/g,
        /(.{5,30})を提供/g,
        /(.{5,30})を開発/g,
        /(.{5,30})を発表/g,
        /(.{5,30})に成功/g,
        /(.{5,30})を達成/g
    ];
    
    for (const pattern of importantPatterns) {
        const matches = text.match(pattern) || [];
        phrases.push(...matches);
    }
    
    return [...new Set(phrases)];
}

// Extract main points from summary
function extractMainPoints(summary) {
    // Split by sentences
    const sentences = summary.split(/[。．.!?！？]/).filter(s => s.trim().length > 10);
    
    // Extract sentences with key information
    const mainPoints = sentences.filter(sentence => {
        // Check if sentence contains important information
        return /発表|開発|導入|実現|達成|改善|提供|可能|成功|初めて|新しい|画期的/.test(sentence) ||
               /\d+[%％倍]/.test(sentence) || // Contains metrics
               /により|ため|よって/.test(sentence); // Contains reasoning
    });
    
    return mainPoints.slice(0, 5); // Return top 5 main points
}

// Analyze sentiment of the article
function analyzeSentiment(text) {
    const positive = (text.match(/成功|達成|改善|向上|革新|画期的|素晴らしい|優れた|良い|ポジティブ|前進|進歩|breakthrough|success|improve|achieve|innovative/gi) || []).length;
    const negative = (text.match(/失敗|問題|懸念|リスク|批判|困難|悪い|ネガティブ|後退|failure|problem|concern|risk|criticism|difficult/gi) || []).length;
    const neutral = (text.match(/発表|報告|説明|紹介|検討|分析|announce|report|explain|introduce|consider|analyze/gi) || []).length;
    
    const total = positive + negative + neutral;
    if (total === 0) return 'neutral';
    
    if (positive > negative * 1.5) return 'positive';
    if (negative > positive * 1.5) return 'negative';
    return 'neutral';
}

// Analyze complexity of the article
function analyzeComplexity(text) {
    const technicalTerms = (text.match(/API|SDK|アーキテクチャ|アルゴリズム|プロトコル|インフラ|フレームワーク|ライブラリ|コンパイラ|ランタイム|デプロイ|スケーラビリティ|レイテンシ|スループット/gi) || []).length;
    const longSentences = text.split(/[。．.!?！？]/).filter(s => s.length > 100).length;
    const metrics = (text.match(/\d+[%％倍]|\d+[BMK]/gi) || []).length;
    
    const complexityScore = technicalTerms + longSentences + metrics;
    
    if (complexityScore > 10) return 'high';
    if (complexityScore > 5) return 'medium';
    return 'low';
}

// Determine main focus of the article
function determineMainFocus(title, summary) {
    const text = (title + ' ' + summary).toLowerCase();
    
    if (text.includes('発表') || text.includes('リリース') || text.includes('公開')) {
        return 'release';
    } else if (text.includes('研究') || text.includes('論文') || text.includes('実験')) {
        return 'research';
    } else if (text.includes('買収') || text.includes('投資') || text.includes('資金')) {
        return 'business';
    } else if (text.includes('更新') || text.includes('アップデート') || text.includes('改善')) {
        return 'update';
    } else if (text.includes('問題') || text.includes('課題') || text.includes('批判')) {
        return 'issue';
    }
    return 'general';
}

// Generate introduction context based on article
function generateIntroductionContext(article, keyInfo) {
    let context = '';
    
    // Build introduction based on extracted information
    if (keyInfo.companies.length > 0) {
        context += `${keyInfo.companies.join('と')}による今回の`;
        if (keyInfo.actions.length > 0) {
            context += `${keyInfo.actions[0]}は、`;
        } else {
            context += '発表は、';
        }
    } else {
        context += 'この';
        if (keyInfo.actions.length > 0) {
            context += `${keyInfo.actions[0]}は、`;
        } else {
            context += 'ニュースは、';
        }
    }
    
    // Add specific context based on characteristics
    if (keyInfo.characteristics.isProductLaunch && keyInfo.products.length > 0) {
        context += `${keyInfo.products[0]}という新たな`;
        if (keyInfo.technologies.length > 0) {
            context += `${keyInfo.technologies[0]}技術を活用した`;
        }
        context += 'ソリューションの登場を意味します。';
    } else if (keyInfo.characteristics.isResearch) {
        if (keyInfo.technologies.length > 0) {
            context += `${keyInfo.technologies[0]}分野における`;
        }
        context += '重要な研究成果であり、';
        if (keyInfo.metrics.length > 0) {
            context += `${keyInfo.metrics[0]}という`;
        }
        context += '顕著な成果を示しています。';
    } else if (keyInfo.characteristics.isBusiness) {
        if (keyInfo.metrics.length > 0) {
            context += `${keyInfo.metrics[0]}規模の`;
        }
        context += 'ビジネス展開であり、';
        if (keyInfo.stakeholders.length > 0) {
            context += `${keyInfo.stakeholders[0]}にとって重要な意味を持ちます。`;
        } else {
            context += '業界に大きな影響を与える可能性があります。';
        }
    } else if (keyInfo.characteristics.isUpdate) {
        if (keyInfo.features.length > 0) {
            context += `${keyInfo.features.slice(0, 2).join('や')}の`;
        }
        context += '改善により、';
        if (keyInfo.benefits.length > 0) {
            context += `${keyInfo.benefits[0]}が期待されます。`;
        } else {
            context += 'ユーザー体験の向上が期待されます。';
        }
    }
    
    // Add impact based on sentiment and complexity
    if (keyInfo.sentiment === 'positive' && keyInfo.complexity === 'high') {
        context += 'この技術的に高度な成果は、業界に新たな可能性をもたらすでしょう。';
    } else if (keyInfo.sentiment === 'negative') {
        context += 'ただし、いくつかの課題も指摘されており、慎重な検討が必要です。';
    }
    
    // Add key phrases if available
    if (keyInfo.keyPhrases.length > 0) {
        context += `特に「${keyInfo.keyPhrases[0]}」という点が注目されています。`;
    }
    
    return context;
}

// Generate dynamic background based on article content
function generateDynamicBackground(article, keyInfo) {
    let content = '<p>';
    const summary = article.summaryJa || article.summary;
    
    // Company-specific background
    if (keyInfo.companies.includes('OpenAI')) {
        content += 'OpenAIは、2015年の設立以来、AGI（汎用人工知能）の実現を目指して革新的な研究開発を続けています。';
    } else if (keyInfo.companies.includes('Google')) {
        content += 'Googleは、検索技術から始まり、現在では包括的なAIエコシステムを構築する巨大テック企業として、';
    } else if (keyInfo.companies.includes('Anthropic')) {
        content += 'Anthropicは、AI安全性研究に特化した企業として、より信頼性の高いAIシステムの開発を目指しています。';
    } else {
        content += '現在のAI業界は、急速な技術革新と激しい競争が特徴となっています。';
    }
    
    // Add context about the specific technology mentioned
    if (summary.includes('言語モデル') || summary.includes('LLM')) {
        content += '大規模言語モデル（LLM）の分野では、パラメータ数の増加だけでなく、効率性や特定タスクへの最適化が重要な競争軸となっています。';
    } else if (summary.includes('画像') || summary.includes('動画')) {
        content += 'マルチモーダルAIの発展により、テキストだけでなく視覚情報も扱えるシステムが主流になりつつあります。';
    }
    
    content += '</p><p>';
    
    // Add specific context based on the article's focus
    if (keyInfo.metrics.length > 0) {
        content += `今回発表された${keyInfo.metrics[0]}という数値は、技術の進歩の速さを物語っています。`;
    }
    
    if (keyInfo.versions.length > 0) {
        content += `${keyInfo.versions[0]}への進化は、継続的な改善の取り組みの成果と言えるでしょう。`;
    }
    
    content += 'このような背景の中で、今回の発表の意義を正しく理解することが重要です。</p>';
    
    return content;
}

// Get technical section title based on article
function getTechnicalSectionTitle(article, keyInfo) {
    if (keyInfo.characteristics.isResearch) {
        return '技術的詳細と研究の核心';
    } else if (keyInfo.characteristics.isBusiness) {
        return 'ビジネスモデルと市場戦略';
    } else if (article.category.includes('generation')) {
        return '生成技術の革新と特徴';
    } else if (keyInfo.mainFocus === 'update') {
        return '改善点と技術的進歩';
    }
    return '技術仕様と革新性';
}

// Generate technical analysis based on article
function generateTechnicalAnalysis(article, keyInfo) {
    const summary = article.summaryJa || article.summary;
    let content = '<p>';
    
    // Start with article-specific introduction
    if (keyInfo.products.length > 0) {
        content += `${keyInfo.products[0]}における技術的な進歩は、`;
    } else {
        content += 'この発表における技術的な進歩は、';
    }
    
    // Extract and discuss specific features mentioned
    const features = extractSpecificFeatures(summary);
    if (features.length > 0) {
        content += `特に${features.join('、')}の面で顕著です。`;
    } else {
        content += '複数の面で革新的な要素を含んでいます。';
    }
    
    content += '</p>';
    
    // Add specific technical details based on what's mentioned in the article
    if (summary.includes('性能') || summary.includes('速度') || summary.includes('精度')) {
        content += '<h4>性能面での進化</h4><p>';
        content += generatePerformanceAnalysis(summary, keyInfo);
        content += '</p>';
    }
    
    if (summary.includes('機能') || summary.includes('新しい') || summary.includes('追加')) {
        content += '<h4>新機能と改善点</h4><p>';
        content += generateFeatureAnalysis(summary, keyInfo);
        content += '</p>';
    }
    
    if (keyInfo.characteristics.isResearch) {
        content += '<h4>研究手法と検証</h4><p>';
        content += generateResearchMethodology(summary, keyInfo);
        content += '</p>';
    }
    
    return content;
}

// Extract specific features from summary
function extractSpecificFeatures(summary) {
    const features = [];
    
    if (summary.includes('コード') || summary.includes('プログラ')) features.push('コーディング能力');
    if (summary.includes('推論') || summary.includes('論理')) features.push('推論能力');
    if (summary.includes('翻訳')) features.push('多言語対応');
    if (summary.includes('画像') || summary.includes('視覚')) features.push('視覚認識');
    if (summary.includes('音声') || summary.includes('音楽')) features.push('音声処理');
    if (summary.includes('リアルタイム')) features.push('リアルタイム処理');
    if (summary.includes('効率') || summary.includes('最適化')) features.push('処理効率');
    
    return features;
}

// Generate performance analysis (deprecated - use generateDynamicPerformanceAnalysis)
function generatePerformanceAnalysis(summary, keyInfo) {
    return generateDynamicPerformanceAnalysis(summary, keyInfo);
}

// Generate feature analysis (deprecated - use generateDynamicFeatureAnalysis)
function generateFeatureAnalysis(summary, keyInfo) {
    return generateDynamicFeatureAnalysis(summary, keyInfo);
}

// Generate research methodology (deprecated - use generateDynamicResearchMethodology)
function generateResearchMethodology(summary, keyInfo) {
    return generateDynamicResearchMethodology(summary, keyInfo);
}

// Generate specific impact analysis
function generateSpecificImpactAnalysis(article, keyInfo) {
    if (!article) {
        console.error('generateSpecificImpactAnalysis: article is undefined');
        return '<p>影響分析の生成中にエラーが発生しました。</p>';
    }
    const summary = article.summaryJa || article.summary;
    let content = '<p>「' + (article.titleJa || article.title) + '」がもたらす影響を、具体的に検討してみましょう。</p>';
    
    // Technical impact specific to the article
    content += '<h4>技術的影響</h4><ul>';
    
    if (keyInfo.products.length > 0) {
        content += `<li>${keyInfo.products[0]}の登場により、関連技術の開発が加速される可能性</li>`;
    }
    
    if (summary.includes('オープンソース') || summary.includes('公開')) {
        content += '<li>技術の民主化による、より多くの開発者の参入</li>';
    }
    
    if (keyInfo.companies.length > 0) {
        content += `<li>${keyInfo.companies[0]}のエコシステム内での新たな統合可能性</li>`;
    }
    
    content += '</ul>';
    
    // Economic impact
    content += '<h4>経済的影響</h4><ul>';
    
    if (keyInfo.mainFocus === 'business') {
        content += '<li>新たなビジネスモデルの創出と既存市場の再編</li>';
    }
    
    if (summary.includes('コスト') || summary.includes('価格') || summary.includes('無料')) {
        content += '<li>技術へのアクセスコストの変化による市場構造の変革</li>';
    }
    
    content += '<li>関連産業への波及効果と新規雇用の創出</li></ul>';
    
    // Social impact
    content += '<h4>社会的影響</h4><ul>';
    content += generateSocialImpact(summary, keyInfo);
    content += '</ul>';
    
    if (article.importance >= 90) {
        content += `<p class="highlight-box">この発表は重要度${article.importance}と評価されており、業界全体に大きなインパクトを与える可能性が高いと考えられます。</p>`;
    }
    
    return content;
}

// Generate social impact based on article
function generateSocialImpact(summary, keyInfo) {
    let impacts = '';
    
    if (summary.includes('教育') || summary.includes('学習')) {
        impacts += '<li>教育分野での活用による学習機会の拡大</li>';
    }
    
    if (summary.includes('医療') || summary.includes('健康')) {
        impacts += '<li>医療・ヘルスケア分野での応用可能性</li>';
    }
    
    if (summary.includes('アクセシビリティ') || summary.includes('誰でも')) {
        impacts += '<li>技術へのアクセスの民主化</li>';
    }
    
    if (article.category.includes('generation')) {
        impacts += '<li>クリエイティブ産業への影響と新たな表現手法の創出</li>';
    }
    
    return impacts || '<li>日常生活における AI 活用の新たな可能性</li>';
}

// Generate specific challenges
function generateSpecificChallenges(article, keyInfo) {
    const summary = article.summaryJa || article.summary;
    let content = '<p>この技術や発表に関連する具体的な課題を整理します：</p>';
    
    // Extract challenges from the summary itself
    const challenges = extractChallengesFromSummary(summary);
    
    if (challenges.length > 0) {
        content += '<h4>記事で言及されている課題</h4><ul>';
        challenges.forEach(challenge => {
            content += `<li>${challenge}</li>`;
        });
        content += '</ul>';
    }
    
    // Add category-specific challenges
    content += '<h4>技術分野特有の課題</h4><ul>';
    
    if (article.category.includes('generation')) {
        content += '<li>生成コンテンツの品質管理と著作権問題</li>';
        content += '<li>悪用防止のための技術的・制度的対策</li>';
    } else if (keyInfo.characteristics.isResearch) {
        content += '<li>理論と実装のギャップを埋める必要性</li>';
        content += '<li>研究成果の再現性と検証可能性の確保</li>';
    } else if (keyInfo.companies.length > 0) {
        content += `<li>${keyInfo.companies[0]}のプラットフォームへの依存リスク</li>`;
        content += '<li>競合他社との技術格差への対応</li>';
    }
    
    content += '</ul>';
    
    // Implementation challenges
    content += '<h4>実装・導入における課題</h4><ul>';
    content += generateImplementationChallenges(summary, keyInfo);
    content += '</ul>';
    
    return content;
}

// Extract challenges from summary
function extractChallengesFromSummary(summary) {
    const challenges = [];
    
    if (summary.includes('課題') || summary.includes('問題')) {
        const sentences = summary.split('。');
        sentences.forEach(sentence => {
            if (sentence.includes('課題') || sentence.includes('問題')) {
                challenges.push(sentence.trim() + '。');
            }
        });
    }
    
    return challenges;
}

// Generate implementation challenges
function generateImplementationChallenges(summary, keyInfo) {
    let challenges = '';
    
    if (summary.includes('大規模') || summary.includes('スケール')) {
        challenges += '<li>大規模展開時のインフラストラクチャ要件</li>';
    }
    
    if (summary.includes('コスト') || keyInfo.metrics.some(m => m.includes('$'))) {
        challenges += '<li>導入・運用コストと投資対効果のバランス</li>';
    }
    
    if (summary.includes('データ') || summary.includes('プライバシー')) {
        challenges += '<li>データプライバシーとセキュリティの確保</li>';
    }
    
    challenges += '<li>既存システムとの統合と移行戦略</li>';
    
    return challenges;
}

// Generate future outlook
function generateFutureOutlook(article, keyInfo) {
    const title = article.titleJa || article.title;
    const summary = article.summaryJa || article.summary;
    
    let content = `<p>「${title}」という発表を踏まえ、今後予想される展開を時系列で整理します。</p>`;
    
    // Short-term outlook
    content += '<h4>短期的展望（3-6ヶ月）</h4><ul>';
    content += generateShortTermOutlook(summary, keyInfo);
    content += '</ul>';
    
    // Medium-term outlook
    content += '<h4>中期的展望（6ヶ月-1年）</h4><ul>';
    content += generateMediumTermOutlook(summary, keyInfo);
    content += '</ul>';
    
    // Long-term outlook
    content += '<h4>長期的展望（1-3年）</h4><ul>';
    content += generateLongTermOutlook(summary, keyInfo);
    content += '</ul>';
    
    return content;
}

// Generate short-term outlook
function generateShortTermOutlook(summary, keyInfo) {
    let outlook = '';
    
    if (keyInfo.products.length > 0) {
        outlook += `<li>${keyInfo.products[0]}の初期ユーザーからのフィードバックと改善</li>`;
    }
    
    if (summary.includes('ベータ') || summary.includes('プレビュー') || summary.includes('試験')) {
        outlook += '<li>ベータ版から正式版への移行と機能の安定化</li>';
    }
    
    if (keyInfo.companies.length > 0) {
        outlook += `<li>競合他社による類似技術・サービスの発表</li>`;
    }
    
    outlook += '<li>開発者コミュニティでの実験的な応用事例の登場</li>';
    
    return outlook;
}

// Generate medium-term outlook
function generateMediumTermOutlook(summary, keyInfo) {
    let outlook = '';
    
    if (keyInfo.mainFocus === 'release' || keyInfo.mainFocus === 'update') {
        outlook += '<li>企業での本格的な導入事例の増加</li>';
    }
    
    if (summary.includes('API') || summary.includes('SDK')) {
        outlook += '<li>サードパーティ製アプリケーションの充実</li>';
    }
    
    outlook += '<li>技術の成熟化と最適化の進展</li>';
    outlook += '<li>規制当局との対話と業界標準の形成</li>';
    
    return outlook;
}

// Generate long-term outlook
function generateLongTermOutlook(summary, keyInfo) {
    let outlook = '';
    
    if (article.category.includes('generation')) {
        outlook += '<li>創造的産業における標準ツールとしての定着</li>';
    } else if (keyInfo.characteristics.isResearch) {
        outlook += '<li>研究成果の実用化と商業展開</li>';
    }
    
    outlook += '<li>次世代技術への進化と paradigm shift</li>';
    outlook += '<li>社会インフラへの統合と日常生活での当たり前の存在に</li>';
    
    if (keyInfo.companies.length > 1) {
        outlook += '<li>業界再編と新たなエコシステムの形成</li>';
    }
    
    return outlook;
}

// Generate expert perspective
function generateExpertPerspective(article, keyInfo) {
    const summary = article.summaryJa || article.summary;
    let content = '<p>この発表に対して、各分野の専門家からは以下のような視点が提示されることが予想されます：</p>';
    
    // Technical experts
    content += '<h4>技術専門家の視点</h4><p>';
    content += generateTechnicalExpertView(summary, keyInfo);
    content += '</p>';
    
    // Business analysts
    content += '<h4>ビジネスアナリストの視点</h4><p>';
    content += generateBusinessAnalystView(summary, keyInfo);
    content += '</p>';
    
    // Ethical considerations
    if (article.category.includes('generation') || summary.includes('AI') || summary.includes('倫理')) {
        content += '<h4>倫理・社会学者の視点</h4><p>';
        content += generateEthicalView(summary, keyInfo);
        content += '</p>';
    }
    
    return content;
}

// Generate technical expert view
function generateTechnicalExpertView(summary, keyInfo) {
    let view = '';
    
    if (keyInfo.products.length > 0) {
        view += `${keyInfo.products[0]}の技術的アーキテクチャについて、`;
    }
    
    if (summary.includes('性能') || summary.includes('効率')) {
        view += 'パフォーマンスの改善は評価できるものの、実運用環境での検証が重要になるでしょう。';
    } else if (summary.includes('新しい') || summary.includes('革新')) {
        view += '革新的なアプローチは注目に値しますが、既存システムとの互換性が課題となる可能性があります。';
    } else {
        view += '技術的な実現可能性と拡張性について、慎重な評価が必要です。';
    }
    
    return view;
}

// Generate business analyst view
function generateBusinessAnalystView(summary, keyInfo) {
    let view = 'ビジネス的観点から見ると、';
    
    if (keyInfo.mainFocus === 'business') {
        view += 'この動きは市場の競争構造を大きく変える可能性があります。';
    } else if (summary.includes('無料') || summary.includes('オープン')) {
        view += 'オープン化戦略は市場拡大には有効ですが、収益化の道筋が重要になります。';
    } else {
        view += 'ROIの観点から、導入企業は慎重な cost-benefit 分析が必要でしょう。';
    }
    
    if (keyInfo.companies.length > 0) {
        view += `${keyInfo.companies[0]}の市場ポジショニングにも注目が集まります。`;
    }
    
    return view;
}

// Generate ethical view
function generateEthicalView(summary, keyInfo) {
    let view = 'AI倫理の観点から、';
    
    if (article.category.includes('generation')) {
        view += '生成コンテンツの真正性と責任の所在について、社会的合意形成が急務です。';
    } else if (summary.includes('データ') || summary.includes('学習')) {
        view += '学習データの透明性と公平性の確保が重要な課題となります。';
    } else {
        view += '技術の社会実装における倫理的ガイドラインの整備が求められます。';
    }
    
    return view;
}

// Generate conclusion
function generateConclusion(article, keyInfo) {
    const title = article.titleJa || article.title;
    const summary = article.summaryJa || article.summary;
    
    let content = `<p>「${title}」というニュースを詳細に分析してきました。`;
    
    // Key takeaways specific to this article
    content += 'この発表から得られる重要な示唆は以下の通りです：</p><ul>';
    
    // Generate specific takeaways based on article content
    if (keyInfo.products.length > 0) {
        content += `<li>${keyInfo.products[0]}は、${extractKeyValue(summary)}という点で画期的です</li>`;
    }
    
    if (keyInfo.companies.length > 0) {
        content += `<li>${keyInfo.companies[0]}の戦略は、業界全体の方向性を示唆しています</li>`;
    }
    
    if (keyInfo.mainFocus === 'research') {
        content += '<li>基礎研究の重要性と、その実用化への道筋が明確になりました</li>';
    } else if (keyInfo.mainFocus === 'business') {
        content += '<li>ビジネスモデルの転換が、技術革新と同じく重要であることが示されました</li>';
    }
    
    content += '</ul>';
    
    // Final thoughts
    content += '<p>';
    if (article.importance >= 90) {
        content += 'この発表は、AI業界における重要な転換点として記憶されることでしょう。';
    } else {
        content += 'この動きは、AI技術の着実な進歩を示す一例と言えます。';
    }
    
    content += '私たちは、このような技術革新がもたらす機会を最大限に活用しながら、同時に責任ある形でその発展に貢献していく必要があります。</p>';
    
    return content;
}

// Extract key value proposition from summary
function extractKeyValue(summary) {
    if (summary.includes('性能') && summary.includes('向上')) {
        return '性能の大幅な向上';
    } else if (summary.includes('コスト') && summary.includes('削減')) {
        return 'コスト効率の改善';
    } else if (summary.includes('新しい') || summary.includes('初めて')) {
        return '従来不可能だった機能の実現';
    } else if (summary.includes('統合') || summary.includes('連携')) {
        return 'シームレスな統合';
    }
    return '技術的な革新性';
}

// Generate architecture analysis
function generateArchitectureAnalysis(summary, keyInfo) {
    let analysis = '';
    
    if (keyInfo.technologies.length > 1) {
        analysis += `${keyInfo.technologies.slice(0, 3).join('、')}などの技術を組み合わせたアーキテクチャが採用されています。`;
    } else if (keyInfo.technologies.length === 1) {
        analysis += `${keyInfo.technologies[0]}をコア技術として活用しています。`;
    }
    
    if (summary.includes('スケール') || summary.includes('大規模')) {
        analysis += 'スケーラビリティを重視した設計により、大規模展開に対応できます。';
    }
    
    if (summary.includes('クラウド') || summary.includes('エッジ')) {
        analysis += 'クラウドネイティブなアプローチにより、柔軟なデプロイメントが可能です。';
    }
    
    return analysis || '最新のソフトウェアアーキテクチャに基づいた堅牢なシステム設計が採用されています。';
}

// Generate dynamic performance analysis
function generateDynamicPerformanceAnalysis(summary, keyInfo) {
    let analysis = '';
    
    // Start with specific metrics if available
    if (keyInfo.metrics.length > 0) {
        analysis += `${keyInfo.metrics.map(m => m).join('、')}という具体的な数値は、`;
        
        // Analyze what the metrics mean
        if (keyInfo.metrics.some(m => m.includes('%') || m.includes('倍'))) {
            analysis += '大幅な性能改善を示しています。';
        } else if (keyInfo.metrics.some(m => m.includes('億') || m.includes('万'))) {
            analysis += '大規模な展開を示唆しています。';
        } else {
            analysis += '重要な指標として注目されます。';
        }
    }
    
    // Add context based on summary content
    if (summary.includes('高速') || summary.includes('速い') || summary.includes('速度')) {
        if (analysis) analysis += '特に';
        analysis += '処理速度の面では、リアルタイム処理や大量データの迅速な処理が可能になります。';
    }
    
    if (summary.includes('精度') || summary.includes('正確')) {
        if (analysis) analysis += 'また、';
        analysis += '精度の向上は、実用的なアプリケーションでの信頼性を大幅に高めます。';
    }
    
    if (summary.includes('効率') || summary.includes('最適化')) {
        if (analysis) analysis += 'さらに、';
        analysis += '計算効率の改善により、コスト削減と環境負荷の低減にも貢献します。';
    }
    
    return analysis || 'この技術のパフォーマンス特性は、実用化に向けた重要なステップを示しています。';
}

// Generate dynamic feature analysis
function generateDynamicFeatureAnalysis(summary, keyInfo) {
    let analysis = '';
    
    // Analyze features mentioned in the article
    if (keyInfo.features.length > 0) {
        analysis += `主要機能として、${keyInfo.features.slice(0, 3).join('、')}などが挙げられます。`;
        
        // Add specific analysis based on feature types
        if (keyInfo.features.some(f => f.includes('API') || f.includes('SDK'))) {
            analysis += '開発者向けのツールが充実していることで、エコシステムの拡大が期待されます。';
        }
        
        if (keyInfo.features.some(f => f.includes('プラットフォーム') || f.includes('統合'))) {
            analysis += 'プラットフォーム統合により、既存のワークフローへの組み込みが容易になります。';
        }
    }
    
    // Add analysis based on key phrases
    if (keyInfo.keyPhrases.length > 1) {
        analysis += `また、「${keyInfo.keyPhrases[1]}」という点も注目に値します。`;
    }
    
    // Add user benefit analysis
    if (keyInfo.stakeholders.includes('ユーザー') || keyInfo.stakeholders.includes('開発者')) {
        const stakeholder = keyInfo.stakeholders[0];
        analysis += `${stakeholder}にとっては、`;
        
        if (keyInfo.benefits.length > 0) {
            analysis += `${keyInfo.benefits[0]}というメリットがあります。`;
        } else {
            analysis += '作業効率の大幅な改善が期待できます。';
        }
    }
    
    return analysis || 'この機能セットは、実用性と革新性のバランスを追求した結果と言えます。';
}

// Generate dynamic research methodology
function generateDynamicResearchMethodology(summary, keyInfo) {
    let methodology = '';
    
    // Extract research-specific information
    if (keyInfo.mainPoints.some(p => p.includes('研究') || p.includes('実験'))) {
        const researchPoint = keyInfo.mainPoints.find(p => p.includes('研究') || p.includes('実験'));
        methodology += `${researchPoint} `;
    }
    
    // Add methodology based on technologies mentioned
    if (keyInfo.technologies.length > 0) {
        methodology += `${keyInfo.technologies[0]}を活用したアプローチにより、`;
        
        if (keyInfo.metrics.length > 0) {
            methodology += `${keyInfo.metrics[0]}という成果を達成しています。`;
        } else {
            methodology += '新たな知見が得られています。';
        }
    }
    
    // Add validation approach
    if (summary.includes('データセット') || summary.includes('データ')) {
        methodology += 'データ駆動型の検証により、結果の信頼性が確保されています。';
    } else if (summary.includes('検証') || summary.includes('評価')) {
        methodology += '複数の評価基準を用いた包括的な検証が行われています。';
    }
    
    return methodology || 'この研究は、科学的な手法に基づいて慎重に実施されています。';
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing article page...');
        loadArticle();
    });
} else {
    // DOM is already loaded
    console.log('DOM already loaded, initializing article page...');
    loadArticle();
}