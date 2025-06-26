# AI Weekly News - 最新AIニュース自動収集サイト

## 📌 プロジェクト概要

**AI Weekly News**は、最新のAI関連ニュースを自動収集し、日本語翻訳・要約付きで毎日更新するWebサイトです。RSS feedsとTwitter/X APIを使用して、180-200件の記事を収集し、カテゴリ別に整理して表示します。

**デモサイト**: https://takum004.github.io/ai-news-weekly/

## 🚀 主な特徴

- ✅ **毎日自動更新**: GitHub Actionsで1日2回（日本時間 6:00, 12:00）自動実行
- ✅ **豊富な情報源**: 67のRSSフィード + 5つの主要AIアカウント（Twitter/X）
- ✅ **日本語翻訳**: パターンベースの高品質翻訳システム
- ✅ **詳細なカテゴリ分類**: 33以上のカテゴリで分類
- ✅ **動的な記事詳細ページ**: 各記事の内容に基づいた詳細レポート生成
- ✅ **レスポンシブデザイン**: PC・タブレット・スマホ対応
- ✅ **高速表示**: シンプルなHTML/CSS/JS構成
- ✅ **無料運用**: GitHub Pages + GitHub Actions

## 🏗️ システム構成

### フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS3**: グリッドレイアウト + Flexbox
- **JavaScript (ES6+)**: バニラJS、フレームワークなし
- **Google Fonts**: Noto Sans JP (日本語フォント)

### バックエンド処理
- **Node.js**: ニュース収集・翻訳処理
- **RSS Parser**: RSSフィード解析
- **Twitter API v2**: ツイート収集
- **GitHub Actions**: 自動化ワークフロー

### データソース
- **RSSフィード**: 67の主要AI関連ニュースサイト
- **Twitter/X**: @OpenAI, @AnthropicAI, @GoogleAI, @midjourney, @cursor_ai

## 📁 ファイル構成

```
ai-news-weekly/
├── index.html          # メインページ
├── article.html        # 記事詳細ページ
├── style.css           # メインスタイル
├── script.js           # メインページJS
├── article.js          # 記事詳細ページJS  
├── data/               
│   ├── news.json       # ニュースデータ (自動生成)
│   └── tweets.json     # ツイートデータ (自動生成)
├── scripts/            
│   ├── fetch-news.js   # RSS収集・翻訳
│   └── fetch-tweets.js # Twitter収集
├── .github/
│   └── workflows/
│       └── update-and-deploy.yml
├── package.json        # 依存関係
└── README.md           # このファイル
```

## 🔧 セットアップ手順

### 1. リポジトリの準備
```bash
# リポジトリをクローン
git clone https://github.com/yourusername/ai-news-weekly.git
cd ai-news-weekly

# 依存関係をインストール
npm install
```

### 2. GitHub設定

#### Actions権限設定
1. Settings > Actions > General へ移動
2. "Workflow permissions" で "Read and write permissions" を選択
3. "Allow GitHub Actions to create and approve pull requests" にチェック
4. Save をクリック

#### GitHub Pages設定
1. Settings > Pages へ移動
2. Source: "GitHub Actions" を選択
3. Save をクリック

### 3. APIキー設定（オプション）

#### OpenAI API（翻訳品質向上用）
1. Settings > Secrets and variables > Actions
2. "New repository secret" をクリック
3. Name: `OPENAI_API_KEY`、Value: あなたのAPIキー
4. Add secret をクリック

#### Twitter API（ツイート収集用）
1. 同様に "New repository secret" をクリック
2. Name: `TWITTER_BEARER_TOKEN`、Value: あなたのBearer Token
3. Add secret をクリック

## 📊 データフォーマット

### news.json 構造
```json
{
  "lastUpdated": "2025-06-25T12:00:00Z",
  "articles": [
    {
      "id": "unique-identifier",
      "title": "Original English Title",
      "titleJa": "日本語タイトル（自動翻訳）",
      "summary": "English summary text...",
      "summaryJa": "日本語要約文（自動翻訳）",
      "source": "TechCrunch",
      "category": "openai",
      "importance": 85,
      "pubDate": "2025-06-25T10:30:00Z",
      "link": "https://original-article-url.com",
      "isTweet": false
    }
  ]
}
```

### カテゴリ一覧
```javascript
// 企業カテゴリ
openai, google, anthropic, microsoft, meta, xai, nvidia

// 生成AIカテゴリ  
video_generation    // 動画生成
image_generation    // 画像生成
audio_generation    // 音声生成
music_generation    // 音楽生成
voice_cloning       // 音声クローン
3d_modeling         // 3Dモデリング

// 技術カテゴリ
agents              // AIエージェント
automation          // 自動化
code_generation     // コード生成
translation         // 翻訳
multimodal          // マルチモーダル
reasoning           // 推論AI

// 産業カテゴリ
robotics            // ロボティクス
gaming              // ゲーミング
healthcare          // ヘルスケア
education           // 教育
finance             // 金融

// その他
research            // 研究
academic            // 学術
business            // ビジネス
regulation          // 規制・政策
presentation        // プレゼン
tech                // テクノロジー
other               // その他
```

## 🎨 デザイン仕様

### カラーパレット
- **プライマリ**: #6366f1 (インディゴ)
- **セカンダリ**: #3b82f6 (ブルー)  
- **アクセント**: #8b5cf6 (パープル)
- **背景**: #fafafa (ライトグレー)
- **カード背景**: #ffffff (ホワイト)
- **テキスト**: #111827 (ダークグレー)

### レスポンシブブレークポイント
- モバイル: ~768px
- タブレット: 768px~1024px
- デスクトップ: 1024px~

## 🤖 自動化システム

### GitHub Actions ワークフロー
```yaml
name: Update News and Deploy
on:
  schedule:
    - cron: '0 21 * * *'  # JST 6:00 AM
    - cron: '0 3 * * *'   # JST 12:00 PM
  workflow_dispatch:      # 手動実行可能

jobs:
  update-news:
    # RSS/Twitter から AI ニュース取得
    # パターンベース日本語翻訳
    # カテゴリ分類・重要度判定
    # news.json 更新・コミット
  
  deploy:
    # GitHub Pages へデプロイ
```

## 🔍 主な機能

### 1. ニュース収集機能
- 67のRSSフィードから記事を収集
- Twitter API v2で主要AIアカウントのツイートを収集
- 重複除去とAI関連フィルタリング
- 重要度スコアリング（0-100）

### 2. 日本語翻訳機能
- パターンベースの高品質翻訳
- 会社名・製品名の適切な翻訳
- 技術用語の統一翻訳
- 文脈を考慮した自然な日本語生成

### 3. 記事詳細ページ
- 記事内容から重要情報を自動抽出
- 動的なレポート生成（8つのセクション）
  - はじめに：なぜこのニュースが重要なのか
  - 背景と文脈
  - 技術的詳細
  - 想定される影響と波及効果
  - 課題と今後の検討事項
  - 今後の展望と予測
  - 専門家の視点と業界の反応
  - まとめ：このニュースから学ぶべきこと

### 4. フィルタリング・検索
- カテゴリ別表示
- キーワード検索
- 日付範囲フィルター
- 重要度でのソート

## 🚀 カスタマイズ方法

### RSS フィードの追加
```javascript
// scripts/fetch-news.js の RSS_FEEDS 配列に追加
const RSS_FEEDS = [
  'https://example.com/ai/feed.xml',
  // 新しいフィードをここに追加
];
```

### 新しいカテゴリの追加
```javascript
// script.js と article.js の categoryLabels に追加
const categoryLabels = {
  new_category: '🆕 新カテゴリ',
  // 既存のカテゴリ...
};
```

### 翻訳パターンの改善
```javascript
// scripts/fetch-news.js の translateByPattern 関数に追加
const patterns = [
  [/新しいパターン/, (match) => '翻訳結果'],
  // 既存のパターン...
];
```

## 📈 パフォーマンス最適化

### 実装済みの最適化
- データの差分更新（最新100件のみ保持）
- 遅延読み込み（スクロールに応じて表示）
- キャッシュバスティング（更新時の確実な反映）
- 効率的なDOM操作（DocumentFragment使用）

## 🔐 セキュリティ

### 実装済みの対策
- XSS対策：textContent使用によるHTMLエスケープ
- APIキーの保護：GitHub Secretsで管理
- CORS対応：同一オリジンでのデータ取得

## 📝 トラブルシューティング

### よくある問題と解決方法

#### ニュースが表示されない
```javascript
// ブラウザコンソールで確認
console.log('Loaded articles:', data.articles.length);
// キャッシュクリア: Ctrl+Shift+R
```

#### GitHub Actions が失敗する
- Secrets設定を確認
- ワークフロー権限を確認
- Actions タブでエラーログを確認

#### 翻訳が不自然
- translateByPattern関数のパターンを調整
- 新しいパターンを追加

## 🤝 コントリビューション

1. このリポジトリをFork
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにPush (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## 📄 ライセンス

MIT License - 詳細は `LICENSE` ファイルを参照

## 📞 サポート

- **Issues**: GitHub Issues でバグ報告・機能要求
- **Discussions**: GitHub Discussions で質問・議論

---

**作成日**: 2025-06-21  
**最終更新**: 2025-06-25  
**バージョン**: 2.0.0  
**ステータス**: ✅ 本番稼働中