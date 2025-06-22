# カスタムドメイン設定ガイド

## 独自ドメインでAI News Weeklyを公開する方法

### 1. ドメインの購入

おすすめのドメイン登録サービス：
- **お名前.com**: https://www.onamae.com/
- **ムームードメイン**: https://muumuu-domain.com/
- **Google Domains**: https://domains.google/

おすすめドメイン例：
- `ai-news.jp` （日本向け）
- `ainews-weekly.com` （グローバル）
- `ai-weekly.net`
- `ainews.io` （技術系）

料金目安：年間1,000円〜5,000円

### 2. GitHub Pagesでのカスタムドメイン設定

1. **CNAMEファイルを作成**
   ```bash
   echo "あなたのドメイン.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **GitHubリポジトリの設定**
   - https://github.com/takum004/ai-news-weekly/settings/pages
   - 「Custom domain」に購入したドメインを入力
   - 「Save」をクリック

### 3. DNS設定（ドメイン側）

お名前.comの場合：
1. ドメインNaviにログイン
2. 「DNS設定」を選択
3. 以下のレコードを追加：

**Aレコード**（4つすべて追加）:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAMEレコード**（wwwサブドメイン用）:
```
ホスト名: www
値: takum004.github.io
```

### 4. HTTPS設定

GitHub Pagesで自動的にHTTPS証明書が発行されます（Let's Encrypt）。
設定後、1時間程度でHTTPSが有効になります。

### 5. 確認方法

```bash
# DNS設定が反映されているか確認
dig あなたのドメイン.com

# HTTPSが有効か確認
curl -I https://あなたのドメイン.com
```

## Vercelを使う場合（代替案）

### メリット
- より高速（エッジネットワーク）
- プレビューデプロイ機能
- 詳細なアナリティクス
- 自動HTTPS

### 手順
1. https://vercel.com でアカウント作成
2. GitHubリポジトリを連携
3. 「Import Project」でai-news-weeklyを選択
4. デプロイ設定：
   - Framework Preset: Other
   - Build Command: なし（静的サイト）
   - Output Directory: ./

### Vercel独自ドメイン
```
https://ai-news-weekly.vercel.app
```

## Google検索に登録する

### 1. Google Search Consoleに登録
1. https://search.google.com/search-console
2. プロパティを追加（ドメインを入力）
3. 所有権を確認（DNSレコード追加）

### 2. サイトマップを送信
```xml
<!-- sitemap.xml を作成 -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://あなたのドメイン.com/</loc>
    <lastmod>2025-06-22</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://あなたのドメイン.com/categories.html</loc>
    <lastmod>2025-06-22</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 3. robots.txtを作成
```
User-agent: *
Allow: /
Sitemap: https://あなたのドメイン.com/sitemap.xml
```

## SNSでの共有設定

### Open Graphタグを追加（index.html）
```html
<meta property="og:title" content="AI Weekly News - 最新のAIニュースを日本語で">
<meta property="og:description" content="世界中のAI関連ニュースを毎日自動収集・翻訳してお届け">
<meta property="og:image" content="https://あなたのドメイン.com/og-image.png">
<meta property="og:url" content="https://あなたのドメイン.com">
<meta property="og:type" content="website">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="AI Weekly News">
<meta name="twitter:description" content="最新のAIニュースを日本語で毎日配信">
<meta name="twitter:image" content="https://あなたのドメイン.com/twitter-card.png">
```

## 推奨される公開戦略

1. **第1段階**（現在）
   - GitHub Pages（takum004.github.io/ai-news-weekly）
   - 基本機能の確認とテスト

2. **第2段階**
   - 独自ドメインを購入・設定
   - Google Search Consoleに登録
   - 基本的なSEO対策

3. **第3段階**
   - SNSでの定期的な共有
   - ニュースレター機能の追加
   - アクセス解析の導入

4. **第4段階**
   - Vercelへの移行検討
   - PWA化
   - 有料プランの検討

## まとめ

現在のGitHub Pagesでも十分公開されていますが、独自ドメインを設定することで：
- ✅ プロフェッショナルな印象
- ✅ SEO効果の向上
- ✅ ブランディング強化
- ✅ 覚えやすいURL

年間1,000円程度の投資で、大きな効果が期待できます。