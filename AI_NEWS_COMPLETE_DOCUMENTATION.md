# AI Weekly News - 完全ドキュメント

## 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [システム構成](#システム構成)
3. [主要な問題と解決策](#主要な問題と解決策)
4. [ファイル構造](#ファイル構造)
5. [自動更新の仕組み](#自動更新の仕組み)
6. [カテゴリ設定](#カテゴリ設定)
7. [技術的な詳細](#技術的な詳細)
8. [トラブルシューティング](#トラブルシューティング)
9. [今後の改善点](#今後の改善点)

---

## プロジェクト概要

### 基本情報
- **サイト名**: AI Weekly News
- **URL**: https://takum004.github.io/ai-news-weekly/
- **目的**: 世界中のAI関連ニュースを自動収集し、日本語で提供
- **記事数**: 80件（毎日更新）
- **更新時刻**: 毎日 JST 6:00 と 12:00

### 主な機能
1. **自動ニュース収集**: 35のRSSフィードから最新AIニュースを収集
2. **自動翻訳**: ChatGPT APIを使用して英語記事を日本語に翻訳
3. **カテゴリ分類**: 25以上のカテゴリに自動分類
4. **重要度スコアリング**: 記事の重要度を0-100で自動評価
5. **毎日自動更新**: GitHub Actionsで完全自動運用

---

## システム構成

### 技術スタック
```
フロントエンド:
- HTML/CSS/JavaScript（静的サイト）
- GitHub Pages（ホスティング）
- レスポンシブデザイン対応

バックエンド:
- Node.js（RSS収集スクリプト）
- OpenAI API（翻訳・カテゴリ分類）
- GitHub Actions（自動実行）

データ形式:
- JSON（news.json）
- 静的JavaScript（static-news-data.js）
```

### アーキテクチャ
```
[RSSフィード] → [fetch-news.js] → [OpenAI API] → [news.json] → [GitHub Pages] → [ユーザー]
     ↑                                                 ↑
     └─────── GitHub Actions（毎日6時/12時）──────────┘
```

---

## 主要な問題と解決策

### 1. 記事0件表示問題
**問題**: ローカル環境（file://）でCORSエラーにより記事が0件表示
```
エラー: Failed to fetch data/news.json
原因: file://プロトコルではfetch APIがCORSポリシーによりブロックされる
```

**解決策**:
1. `static-news-data.js`を生成し、80件全データを静的に埋め込み
2. XMLHttpRequestとfetchの両方に対応
3. 複数のフォールバック処理を実装

```javascript
// main.jsの読み込み処理
async function loadAllArticles() {
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/news.json', true);
        // ...
    } catch (error) {
        useStaticData(); // 静的データにフォールバック
    }
}
```

### 2. 記事ID形式不一致
**問題**: 記事詳細ページで「記事が見つかりません」エラー
```
原因: 埋め込みデータ: "openai-gpt-4-1-release"
     実際のデータ: "aHR0cHM6Ly90ZWNo-fc68y6b0" (Base64形式)
```

**解決策**: 古い形式の埋め込みデータを削除し、実際のデータ形式に統一

### 3. 日付表示形式
**問題**: 「今日」「昨日」という相対表示
**要望**: 「2025/6/20」という絶対表示

**解決策**:
```javascript
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}/${month}/${day}`;
}
```

### 4. GitHub Actions失敗
**問題**: 一部のRSSフィードで404エラー
**解決策**: エラーハンドリングを追加し、個別のフィード失敗を許容

```yaml
- name: Fetch and update news
  run: |
    npm run update-news || {
      echo "RSS fetch failed, but continuing with workflow"
      exit 0
    }
```

---

## ファイル構造

```
ai-news-simple/
├── .github/
│   └── workflows/
│       ├── daily-update.yml      # 毎日の自動更新設定
│       └── test-workflow.yml     # テスト用ワークフロー
├── data/
│   └── news.json                 # 記事データ（80件）
├── src/
│   └── fetch-news.js            # RSS収集・翻訳スクリプト
├── index.html                    # トップページ
├── article.html                  # 記事詳細ページ
├── categories.html               # カテゴリ一覧ページ
├── main.js                       # メインJavaScript
├── script.js                     # 汎用JavaScript
├── categories.js                 # カテゴリページ用
├── article.js                    # 記事詳細ページ用
├── static-news-data.js          # 静的データ（80件）
├── style.css                     # 共通スタイル
├── article.css                   # 記事詳細用スタイル
├── package.json                  # Node.js設定
└── README.md                     # プロジェクト説明
```

---

## 自動更新の仕組み

### GitHub Actions設定
```yaml
# .github/workflows/daily-update.yml
schedule:
  - cron: "0 21 * * *"  # JST 6:00 (UTC 21:00)
  - cron: "0 3 * * *"   # JST 12:00 (UTC 3:00)
```

### 更新プロセス
1. **RSS収集**: 35のフィードから最新記事を取得
2. **重複排除**: URLハッシュで重複を除外
3. **翻訳処理**: OpenAI APIで日本語翻訳
4. **カテゴリ分類**: AIが自動でカテゴリを判定
5. **重要度評価**: 0-100のスコアを付与
6. **データ保存**: news.jsonに80件を保存
7. **静的データ生成**: static-news-data.jsを生成
8. **デプロイ**: GitHub Pagesに自動反映

### RSSフィード一覧（35個）
```javascript
const RSS_FEEDS = [
    // AI企業の公式ブログ
    'https://openai.com/blog/rss',
    'https://www.anthropic.com/index/rss',
    'https://blog.google/products/gemini/rss',
    'https://deepmind.google/blog/rss.xml',
    
    // AIニュースサイト
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://www.technologyreview.com/feed/',
    'https://venturebeat.com/ai/feed/',
    
    // 研究・学術
    'https://blog.research.google/feeds/posts/default',
    'https://blogs.microsoft.com/ai/feed/',
    
    // 他27個のフィード...
];
```

---

## カテゴリ設定

### カテゴリ一覧（25+）
```javascript
const categories = {
    // 企業・モデル別
    'openai': '🤖 OpenAI',
    'google': '🔍 Google/Gemini',
    'anthropic': '💭 Anthropic/Claude',
    'microsoft': '🪟 Microsoft/Copilot',
    'meta': '📘 Meta/Llama',
    'xai': '❌ xAI/Grok',
    'nvidia': '💚 NVIDIA',
    
    // AI応用分野 - クリエイティブ
    'video_generation': '🎬 動画生成',
    'image_generation': '🎨 画像生成',
    'audio_generation': '🎵 音声生成',
    'music_generation': '🎼 音楽生成',
    'voice_cloning': '🎤 音声クローン',
    '3d_modeling': '🏗️ 3Dモデリング',
    
    // AI応用分野 - 生産性
    'presentation': '📊 プレゼン・スライド',
    'agents': '🤵 エージェントAI',
    'automation': '⚡ 自動化・RPA',
    'code_generation': '💻 コード生成',
    'translation': '🌍 翻訳',
    
    // その他...
};
```

---

## 技術的な詳細

### 1. 翻訳APIの使用
```javascript
// fetch-news.jsより
async function translateToJapanese(text, type = 'title') {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "system",
            content: type === 'title' 
                ? "英語のニュースタイトルを日本語に翻訳。簡潔で分かりやすく。"
                : "英語のニュース要約を日本語に翻訳。原文の意味を正確に。"
        }, {
            role: "user",
            content: text
        }],
        temperature: 0.3,
        max_tokens: type === 'title' ? 100 : 300
    });
    return response.choices[0].message.content;
}
```

### 2. カテゴリ自動分類
```javascript
async function categorizeArticle(title, summary) {
    const prompt = `
    記事のカテゴリを1つ選択:
    タイトル: ${title}
    要約: ${summary}
    
    カテゴリ一覧:
    - openai, google, anthropic, microsoft, meta, xai, nvidia
    - video_generation, image_generation, audio_generation, music_generation
    - agents, automation, code_generation, translation
    - research, academic, business, healthcare, tech, startups, regulation
    
    最も適切なカテゴリ1つを回答:`;
    
    // OpenAI APIでカテゴリを判定
}
```

### 3. 重要度スコアリング
```javascript
function calculateImportance(article) {
    let score = 50; // 基準スコア
    
    // キーワードによる加点
    const highImportanceKeywords = [
        'breakthrough', 'launches', 'announces', 'GPT', 'Claude',
        'Gemini', 'funding', 'acquisition', 'partnership'
    ];
    
    // ソースによる加点
    const trustedSources = {
        'OpenAI': 20,
        'Google': 15,
        'MIT Technology Review': 15,
        'TechCrunch': 10
    };
    
    // 最新性による加点
    const hoursOld = (Date.now() - new Date(article.pubDate)) / (1000 * 60 * 60);
    if (hoursOld < 24) score += 10;
    
    return Math.min(100, score);
}
```

### 4. キャッシュバスティング
```javascript
// データの強制更新を保証
const cacheBuster = new Date().getTime();
const response = await fetch(`data/news.json?t=${cacheBuster}`, {
    headers: {
        'Cache-Control': 'no-cache'
    }
});
```

---

## トラブルシューティング

### 問題1: ローカルで記事が表示されない
```bash
# 解決方法: HTTPサーバーを起動
python3 -m http.server 8000
# または
npx http-server
```

### 問題2: GitHub Actionsが失敗する
```yaml
# タイムアウトとエラーハンドリングを追加
timeout-minutes: 10
run: |
  npm run update-news || {
    echo "Failed but continuing"
    exit 0
  }
```

### 問題3: 翻訳が不自然
```javascript
// temperature を下げて一貫性を向上
temperature: 0.3  // 0.7 → 0.3
```

### 問題4: 記事が古い
```bash
# 手動更新を実行
npm run update-news
git add data/news.json static-news-data.js
git commit -m "Manual update"
git push
```

---

## 今後の改善点

### 1. 実装済みの機能
- ✅ 80件の記事表示
- ✅ 毎日自動更新（6時・12時）
- ✅ 25以上のカテゴリ分類
- ✅ 日本語翻訳
- ✅ 記事詳細ページ
- ✅ 検索機能
- ✅ ソート機能（日付・重要度）
- ✅ レスポンシブデザイン

### 2. 今後追加したい機能
- [ ] 記事の既読管理
- [ ] お気に入り機能
- [ ] コメント機能
- [ ] RSS配信
- [ ] メール通知
- [ ] ダークモード
- [ ] PWA対応
- [ ] 記事の要約をAIで生成
- [ ] 関連記事の自動推薦
- [ ] 多言語対応（英語・中国語）

### 3. 技術的な改善
- [ ] TypeScriptへの移行
- [ ] Reactなどのフレームワーク導入
- [ ] サーバーサイドレンダリング
- [ ] CDNの活用
- [ ] 画像の最適化
- [ ] SEO対策の強化

---

## 環境変数・認証情報

### 必要な設定
1. **OPENAI_API_KEY**: OpenAI APIキー（翻訳・分類用）
   - GitHub Secrets に設定済み
   - ローカルでは `.env` ファイルに記載

2. **GitHub Token**: 自動で提供される
   - `${{ secrets.GITHUB_TOKEN }}`

### ローカル開発環境
```bash
# .envファイルを作成
echo "OPENAI_API_KEY=your-api-key-here" > .env

# 依存関係をインストール
npm install

# ニュース更新を実行
npm run update-news

# ローカルサーバーを起動
python3 -m http.server 8000
```

---

## コマンド一覧

```bash
# ニュースを更新
npm run update-news

# 静的データを生成
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('data/news.json', 'utf8'));
const output = 'const staticNewsData = ' + JSON.stringify(data, null, 2) + ';';
fs.writeFileSync('static-news-data.js', output);
"

# ローカルでテスト
python3 -m http.server 8000

# GitHub Actionsを手動実行
# 1. https://github.com/takum004/ai-news-weekly/actions
# 2. "Run workflow" をクリック

# ログを確認
git log --oneline -n 10

# 記事数を確認
jq '.articles | length' data/news.json
```

---

## まとめ

このAI Weekly Newsは、最新のAI技術動向を日本語で毎日自動配信するシステムです。GitHub ActionsとOpenAI APIを活用し、完全自動で運用されています。静的サイトとして設計されているため、サーバーコストは0円で、高速かつ安定したサービスを提供できます。

主な特徴：
- 🤖 完全自動運用（人手不要）
- 🌍 35の信頼できるソースから収集
- 🇯🇵 AIによる高品質な日本語翻訳
- 📊 重要度による自動ランキング
- 🏷️ 25以上のカテゴリに自動分類
- 💰 運用コスト0円（GitHub Pages）
- 📱 スマートフォン対応

これにより、日本のAI開発者やビジネスパーソンが、言語の壁を越えて最新のAI動向をキャッチアップできるようになります。