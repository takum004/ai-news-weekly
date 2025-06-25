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

// Extract key information from article
function extractKeyInformation(article) {
    const title = article.titleJa || article.title;
    const summary = article.summaryJa || article.summary;
    
    // Extract company names, product names, version numbers, etc.
    const patterns = {
        company: /(OpenAI|Google|Anthropic|Microsoft|Meta|NVIDIA|Amazon|Apple|IBM|Tesla)/gi,
        product: /(GPT-\d+\.?\d*|Claude \d+\.?\d*|Gemini \d+\.?\d*|Llama \d+|Copilot|ChatGPT|DALL-E|Midjourney)/gi,
        version: /(\d+\.\d+|\d+\.x|v\d+|バージョン\d+|版)/gi,
        feature: /(API|SDK|プラットフォーム|フレームワーク|モデル|エンジン|ツール|サービス)/gi,
        metric: /(\d+[%％]|\d+倍|\d+億|\d+万|\$\d+)/gi
    };
    
    const keyInfo = {
        companies: [...new Set((title + ' ' + summary).match(patterns.company) || [])],
        products: [...new Set((title + ' ' + summary).match(patterns.product) || [])],
        versions: [...new Set((title + ' ' + summary).match(patterns.version) || [])],
        features: [...new Set((title + ' ' + summary).match(patterns.feature) || [])],
        metrics: [...new Set((title + ' ' + summary).match(patterns.metric) || [])],
        isResearch: article.category === 'research' || article.category === 'academic',
        isBusiness: article.category === 'business' || article.category === 'tech',
        isGeneration: article.category.includes('generation') || article.category === 'multimodal',
        mainFocus: determineMainFocus(title, summary)
    };
    
    return keyInfo;
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
    
    if (keyInfo.companies.length > 0) {
        context += `${keyInfo.companies[0]}による今回の発表は、`;
    } else {
        context += 'この発表は、';
    }
    
    if (keyInfo.mainFocus === 'release') {
        context += '新たな技術やサービスの市場投入を意味し、業界の競争力学に大きな影響を与える可能性があります。';
    } else if (keyInfo.mainFocus === 'research') {
        context += 'AI技術の基礎研究における重要な進展を示しており、将来の応用可能性を大きく広げるものです。';
    } else if (keyInfo.mainFocus === 'business') {
        context += 'ビジネス戦略の転換点を示しており、市場構造の変化をもたらす可能性があります。';
    } else if (keyInfo.mainFocus === 'update') {
        context += '既存技術の継続的な改善を示しており、ユーザー体験の向上に寄与します。';
    } else {
        context += 'AI分野における重要な動向を示しています。';
    }
    
    if (keyInfo.products.length > 0) {
        context += `特に${keyInfo.products[0]}は、${getCategoryContext(article.category)}という観点から注目に値します。`;
    } else {
        context += `特に、${getCategoryContext(article.category)}という観点から注目に値します。`;
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
    if (keyInfo.isResearch) {
        return '技術的詳細と研究の核心';
    } else if (keyInfo.isBusiness) {
        return 'ビジネスモデルと市場戦略';
    } else if (keyInfo.isGeneration) {
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
    
    if (keyInfo.isResearch) {
        content += '<h4>研究手法と検証</h4><p>';
        content += generateResearchMethodology(summary);
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

// Generate performance analysis
function generatePerformanceAnalysis(summary, keyInfo) {
    let analysis = '';
    
    if (keyInfo.metrics.length > 0) {
        analysis += `報告されている${keyInfo.metrics[0]}という改善は、従来の技術と比較して大幅な進歩を示しています。`;
    }
    
    if (summary.includes('高速') || summary.includes('速い')) {
        analysis += '処理速度の向上により、より実用的なアプリケーションへの応用が可能になります。';
    }
    
    if (summary.includes('精度') || summary.includes('正確')) {
        analysis += '精度の向上は、より信頼性の高いシステムの構築を可能にし、実世界での導入を促進します。';
    }
    
    return analysis || '性能面での改善により、より幅広い用途での活用が期待されます。';
}

// Generate feature analysis
function generateFeatureAnalysis(summary, keyInfo) {
    const title = keyInfo.products.length > 0 ? keyInfo.products[0] : 'このシステム';
    let analysis = `${title}に追加された新機能は、ユーザーのニーズに応える形で設計されています。`;
    
    if (summary.includes('API')) {
        analysis += '特にAPI経由でのアクセスが可能になることで、開発者コミュニティでの活用が促進されるでしょう。';
    }
    
    if (summary.includes('インターフェース') || summary.includes('UI')) {
        analysis += 'ユーザーインターフェースの改善により、技術的な知識が少ないユーザーでも活用しやすくなっています。';
    }
    
    return analysis;
}

// Generate research methodology
function generateResearchMethodology(summary) {
    let methodology = '本研究では、';
    
    if (summary.includes('データセット') || summary.includes('データ')) {
        methodology += '大規模なデータセットを用いた実証的なアプローチが取られています。';
    } else if (summary.includes('実験') || summary.includes('検証')) {
        methodology += '厳密な実験設計に基づいて、提案手法の有効性が検証されています。';
    } else {
        methodology += '新しいアプローチにより、従来の限界を突破する試みがなされています。';
    }
    
    return methodology;
}

// Generate specific impact analysis
function generateSpecificImpactAnalysis(article, keyInfo) {
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
    
    if (keyInfo.isGeneration) {
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
    
    if (keyInfo.isGeneration) {
        content += '<li>生成コンテンツの品質管理と著作権問題</li>';
        content += '<li>悪用防止のための技術的・制度的対策</li>';
    } else if (keyInfo.isResearch) {
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
    
    if (keyInfo.isGeneration) {
        outlook += '<li>創造的産業における標準ツールとしての定着</li>';
    } else if (keyInfo.isResearch) {
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
    if (keyInfo.isGeneration || summary.includes('AI') || summary.includes('倫理')) {
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
    
    if (keyInfo.isGeneration) {
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadArticle);