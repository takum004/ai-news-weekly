# AI Weekly News - シンプル版

## 📌 プロジェクト概要

**AI Weekly News**は、最新のAI関連ニュースを自動収集し、日本語翻訳・要約付きで毎日更新するWebサイトです。

## 🚀 特徴

- ✅ **毎日自動更新**: GitHub Actionsで自動実行
- ✅ **日本語翻訳**: AI自動翻訳・要約機能
- ✅ **カテゴリ分類**: 技術・研究・ビジネス・医療・学術
- ✅ **レスポンシブデザイン**: PC・タブレット・スマホ対応
- ✅ **高速表示**: シンプルなHTML/CSS/JS構成
- ✅ **無料運用**: GitHub Pages + GitHub Actions

## 🏗️ システム構成

### フロントエンド
- **HTML5**: セマンティックマークアップ
- **CSS3**: グリッドレイアウト + Flexbox
- **JavaScript (ES6+)**: バニラJS、フレームワークなし
- **Google Fonts**: Noto Sans JP (日本語フォント)

### データ管理
- **news.json**: ニュースデータストレージ
- **GitHub**: バージョン管理・ホスティング
- **GitHub Actions**: 自動化ワークフロー

## 📁 ファイル構成

```
ai-news-simple/
├── index.html          # メインページ
├── style.css           # スタイルシート  
├── script.js           # JavaScript機能
├── data/               # データディレクトリ
│   └── news.json       # ニュースデータ (自動生成)
├── scripts/            # 自動化スクリプト
│   ├── fetch-news.js   # ニュース収集
│   └── translate.js    # 翻訳処理
├── .github/
│   └── workflows/
│       └── daily-update.yml  # 自動更新設定
├── README.md           # このファイル
└── SYSTEM_OVERVIEW.md  # システム全体概要
```

## 🎨 デザイン仕様

### カラーパレット
- **プライマリ**: #06b6d4 (シアン)
- **セカンダリ**: #3b82f6 (ブルー)
- **アクセント**: #6366f1 (インディゴ)
- **背景**: #f8fafc (ライトグレー)
- **テキスト**: #1f2937 (ダークグレー)

### タイポグラフィ
- **メインフォント**: Noto Sans JP
- **サイズ**: レスポンシブ対応
- **ウェイト**: 300, 400, 500, 700

### レイアウト
- **グリッドシステム**: CSS Grid + Flexbox
- **ブレークポイント**: 
  - モバイル: ~768px
  - タブレット: 768px~1024px
  - デスクトップ: 1024px~

## 🔧 機能詳細

### 1. ニュース表示
```javascript
// ニュースカード表示
function createNewsCard(article) {
    // HTMLテンプレート生成
    // カテゴリバッジ
    // 重要度表示
    // 日本語翻訳タイトル・要約
}
```

### 2. フィルタリング・検索
```javascript
// カテゴリフィルタ
currentCategory = 'tech|research|business|healthcare|academic|all'

// 検索機能  
currentSearch = 'キーワード'

// ソート機能
sortBy = 'date-desc|date-asc|importance-desc'
```

### 3. レスポンシブ対応
```css
/* モバイルファースト */
@media (max-width: 768px) {
    .news-grid {
        grid-template-columns: 1fr;
    }
}
```

## 📊 データフォーマット

### news.json 構造
```json
{
  "lastUpdated": "2025-06-21T00:00:00Z",
  "articles": [
    {
      "id": "unique-identifier",
      "title": "Original English Title",
      "titleJa": "日本語タイトル",
      "summary": "English summary text...",
      "summaryJa": "日本語要約文...",
      "source": "VentureBeat",
      "category": "tech",
      "importance": 85,
      "pubDate": "2025-06-21T10:30:00Z",
      "link": "https://original-article-url.com"
    }
  ]
}
```

### カテゴリ分類
- **tech**: テクノロジー・製品
- **research**: AI研究・開発
- **business**: ビジネス・投資
- **healthcare**: 医療・ヘルスケア
- **academic**: 論文・学術研究

## 🤖 自動化システム

### GitHub Actions ワークフロー
```yaml
name: Daily AI News Update
on:
  schedule:
    - cron: "0 0 * * *"  # 毎日0時実行
  workflow_dispatch:      # 手動実行可能

jobs:
  update-news:
    runs-on: ubuntu-latest
    steps:
      - name: ニュース収集・翻訳・更新
        # RSS/API から AI ニュース取得
        # 重要度判定・フィルタリング
        # 日本語翻訳・要約生成  
        # news.json 更新・コミット
```

## 🚀 デプロイ方法

### 1. GitHub Pages設定
```bash
# リポジトリ設定 > Pages
# Source: Deploy from a branch
# Branch: main / (root)
```

### 2. カスタムドメイン (オプション)
```bash
# CNAME ファイル作成
echo "ai-news.your-domain.com" > CNAME
```

### 3. 自動デプロイ確認
- GitHub Actions が正常実行されているか
- Pages デプロイが成功しているか
- サイトが正常表示されているか

## 🔍 トラブルシューティング

### よくある問題

#### 1. ニュースが表示されない
**原因**: news.json読み込み失敗  
**解決**: 
```javascript
// script.js で mock data を確認
console.log('Mock news loaded:', mockNews);
```

#### 2. スタイルが適用されない  
**原因**: CSS読み込み失敗
**解決**:
```html
<!-- index.html でパス確認 -->
<link rel="stylesheet" href="style.css">
```

#### 3. GitHub Actions失敗
**原因**: API制限・権限エラー
**解決**: 
- GitHub token 権限確認
- API rate limit 確認
- workflow_dispatch で手動実行テスト

## 📈 パフォーマンス最適化

### 1. 画像最適化
```html
<!-- 遅延読み込み -->
<img loading="lazy" src="image.jpg" alt="description">
```

### 2. JavaScript最適化
```javascript
// デバウンス実装
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
```

### 3. CSS最適化
```css
/* Critical CSS inlining */
/* 未使用CSS削除 */
/* CSS Grid + Flexbox 活用 */
```

## 🧪 テスト方法

### 1. 手動テスト
- [ ] 全カテゴリ表示確認
- [ ] 検索機能動作確認  
- [ ] ソート機能動作確認
- [ ] レスポンシブ表示確認
- [ ] リンク動作確認

### 2. 自動化テスト (将来実装)
```javascript
// Jest or similar framework
describe('News filtering', () => {
    test('Category filter works correctly', () => {
        // テストコード
    });
});
```

## 🔐 セキュリティ

### 1. XSS対策
```javascript
// HTMLエスケープ実装
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### 2. CSP設定
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com;">
```

## 📝 今後の改善予定

### Phase 1: 基本機能完成
- [x] HTML/CSS/JS基本実装
- [ ] GitHub Pages デプロイ
- [ ] 自動ニュース収集実装

### Phase 2: 機能拡張  
- [ ] PWA対応
- [ ] ダークモード
- [ ] お気に入り機能 (localStorage)
- [ ] 通知機能

### Phase 3: 高度化
- [ ] AI要約品質向上
- [ ] 多言語対応
- [ ] アナリティクス実装
- [ ] コメント機能

## 🤝 コントリビューション

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 ライセンス

MIT License - 詳細は `LICENSE` ファイルを参照

## 📞 サポート

- **Issues**: GitHub Issues でバグ報告・機能要求
- **Documentation**: README.md + SYSTEM_OVERVIEW.md
- **Updates**: GitHub Releases で変更履歴確認

---

**作成日**: 2025-06-21  
**最終更新**: 2025-06-21  
**バージョン**: 1.0.0  
**ステータス**: ✅ 基本実装完了