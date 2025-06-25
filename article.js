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
    
    // 1. Introduction section - より詳細な導入
    sections.push(`
        <div class="report-section">
            <h3>1. はじめに：なぜこのニュースが重要なのか</h3>
            <p>${summary}</p>
            <p>このニュースは、AI業界における最新の動向を示すものであり、技術の進化がもたらす可能性と課題の両面を理解する上で重要な意味を持ちます。特に、${getCategoryContext(article.category)}という観点から注目に値します。</p>
        </div>
    `);
    
    // 2. Background and Context - 背景と文脈
    sections.push(`
        <div class="report-section">
            <h3>2. 背景と文脈</h3>
            ${getBackgroundContext(article)}
        </div>
    `);
    
    // 3. Key Technical Details - カテゴリに応じた詳細分析
    if (article.category === 'research' || article.category === 'academic') {
        sections.push(`
            <div class="report-section">
                <h3>3. 研究の詳細と意義</h3>
                <p>この研究発表は、AI分野の基礎研究における重要な一歩を示しています。従来のアプローチでは解決が困難だった問題に対して、新しい視点からの解決策を提示している可能性があります。</p>
                <p>学術的な観点から見ると、この研究は以下のような点で重要性を持ちます：</p>
                <ul>
                    <li><strong>理論的貢献</strong>：既存の理論的枠組みを拡張し、新しい理解の地平を開く可能性</li>
                    <li><strong>実験的検証</strong>：提案された手法の有効性を実証し、再現可能な結果を提供</li>
                    <li><strong>応用可能性</strong>：研究成果が実世界の問題解決にどのように適用できるかの示唆</li>
                </ul>
                <p>また、この研究が他の研究者たちの今後の研究方向に与える影響も注目されます。新しい研究の道筋を示すことで、AI分野全体の発展に寄与する可能性があります。</p>
            </div>
        `);
    } else if (article.category === 'business' || article.category === 'tech') {
        sections.push(`
            <div class="report-section">
                <h3>3. ビジネスインパクトと市場への影響</h3>
                <p>この技術革新やビジネス展開は、業界構造に大きな変化をもたらす可能性を秘めています。短期的には既存のビジネスモデルに影響を与え、長期的には新しい市場の創出につながる可能性があります。</p>
                <p>具体的なビジネスへの影響として以下が考えられます：</p>
                <ul>
                    <li><strong>競争環境の変化</strong>：新技術の導入により、業界内の競争力学が大きく変わる可能性</li>
                    <li><strong>顧客価値の向上</strong>：エンドユーザーにとってより価値の高いサービスや製品の提供が可能に</li>
                    <li><strong>新規参入の機会</strong>：技術革新により、新しいプレイヤーが市場に参入する機会が生まれる</li>
                    <li><strong>既存企業の対応</strong>：従来の大手企業も、この変化に適応するための戦略転換が必要</li>
                </ul>
            </div>
        `);
    } else if (article.category.includes('generation') || article.category === 'multimodal') {
        sections.push(`
            <div class="report-section">
                <h3>3. 生成AI技術の進化と特徴</h3>
                <p>この発表は、生成AI技術の急速な進化を示す重要な例です。${getCategorySpecificDetail(article.category)}</p>
                <p>技術的な観点から見た主な特徴：</p>
                <ul>
                    <li><strong>性能向上</strong>：従来モデルと比較して、品質・速度・効率性の大幅な改善</li>
                    <li><strong>新機能</strong>：これまで不可能だったタスクの実現や、新しい使用方法の提案</li>
                    <li><strong>アクセシビリティ</strong>：より多くのユーザーが利用できるようになる工夫や改善</li>
                    <li><strong>倫理的配慮</strong>：生成コンテンツの品質管理や悪用防止のための対策</li>
                </ul>
            </div>
        `);
    } else {
        sections.push(`
            <div class="report-section">
                <h3>3. 技術的な詳細と革新性</h3>
                <p>この発表における技術的な進歩は、AI分野の現在の発展段階を象徴するものです。特に注目すべきは、実用性と革新性のバランスが取れている点です。</p>
                <p>主な技術的特徴：</p>
                <ul>
                    <li><strong>アーキテクチャ</strong>：新しい設計思想に基づく効率的なシステム構成</li>
                    <li><strong>スケーラビリティ</strong>：大規模な展開にも対応できる拡張性</li>
                    <li><strong>パフォーマンス</strong>：実用的な速度と精度の両立</li>
                </ul>
            </div>
        `);
    }
    
    // 4. Impact Analysis - 影響分析
    sections.push(`
        <div class="report-section">
            <h3>4. 想定される影響と波及効果</h3>
            ${getImpactAnalysis(article)}
        </div>
    `);
    
    // 5. Challenges and Considerations - 課題と考慮事項
    sections.push(`
        <div class="report-section">
            <h3>5. 課題と今後の検討事項</h3>
            <p>この技術や発表には大きな可能性がある一方で、実装や普及に向けていくつかの課題も存在します：</p>
            <ul>
                <li><strong>技術的課題</strong>：スケーラビリティ、信頼性、性能の更なる向上</li>
                <li><strong>倫理的配慮</strong>：AIの公平性、透明性、プライバシー保護の確保</li>
                <li><strong>規制対応</strong>：各国の法規制への適合と、新しい規制枠組みへの対応</li>
                <li><strong>社会的受容</strong>：一般ユーザーや企業による技術の理解と受け入れ</li>
            </ul>
            <p>これらの課題に対して、業界全体での協力と継続的な改善が求められます。</p>
        </div>
    `);
    
    // 6. Future Outlook - 将来展望
    sections.push(`
        <div class="report-section">
            <h3>6. 今後の展望と予測</h3>
            <p>この発表を踏まえて、今後のAI業界の発展について以下のような展開が予想されます：</p>
            <p><strong>短期的展望（6ヶ月〜1年）</strong></p>
            <ul>
                <li>関連技術の急速な進化と、競合他社による類似技術の発表</li>
                <li>実証実験やパイロットプロジェクトの増加</li>
                <li>開発者コミュニティでの活発な議論と改善提案</li>
            </ul>
            <p><strong>中長期的展望（1〜3年）</strong></p>
            <ul>
                <li>実用化の進展と、一般ユーザーへの普及</li>
                <li>新しいビジネスモデルやサービスの登場</li>
                <li>技術標準の確立と、業界エコシステムの形成</li>
                <li>社会インフラへの組み込みと、日常生活での活用拡大</li>
            </ul>
        </div>
    `);
    
    // 7. Expert Commentary - 専門家の視点
    sections.push(`
        <div class="report-section">
            <h3>7. 専門家の視点と業界の反応</h3>
            <p>この発表に対して、AI業界の専門家や関係者からは様々な反応が予想されます。技術的な革新性を評価する声がある一方で、実装面での課題を指摘する意見も出てくるでしょう。</p>
            <p>特に注目されるのは、この技術が既存の技術スタックとどのように統合されるか、また、競合他社がどのような対抗策を打ち出すかという点です。業界全体の技術水準の向上につながることが期待されています。</p>
        </div>
    `);
    
    // 8. Conclusion - まとめ
    sections.push(`
        <div class="report-section">
            <h3>8. まとめ：このニュースから学ぶべきこと</h3>
            <p>「${title}」というニュースは、AI技術の現在地と将来の方向性を示す重要な指標となります。技術の進歩がもたらす可能性を最大限に活用しながら、同時に潜在的な課題にも適切に対処していく必要があります。</p>
            <p>私たちは、このような技術革新が社会にもたらす変化を注視し、建設的な形でその発展に貢献していくことが求められています。AI技術の民主化と責任ある利用を通じて、より良い未来の構築に向けて歩みを進めていくことが重要です。</p>
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadArticle);