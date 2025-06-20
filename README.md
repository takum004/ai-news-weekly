# AI週刊ニュース 自動更新システム

このプロジェクトは、AIに関するニュースを毎週自動的に収集・更新するWebサイトです。
GitHub ActionsとGitHub Pagesを使用して、完全無料で運用できます。

## 🚀 セットアップ手順

### 1. GitHubリポジトリの作成
1. GitHubにログインして新しいリポジトリを作成
2. リポジトリ名は任意（例：`ai-news-weekly`）

### 2. ファイルのアップロード
1. このプロジェクトの全ファイルをリポジトリにアップロード
2. または、以下のコマンドでプッシュ：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 3. GitHub Pagesの有効化
1. リポジトリの Settings > Pages に移動
2. Source を「Deploy from a branch」に設定
3. Branch を「main」、フォルダを「/docs」に設定
4. Save をクリック

### 4. GitHub Actionsの権限設定
1. Settings > Actions > General に移動
2. Workflow permissions で「Read and write permissions」を選択
3. Save をクリック

### 5. 初回実行
1. Actions タブに移動
2. 「Update AI News Weekly」をクリック
3. 「Run workflow」ボタンをクリックして手動実行

## 📅 自動更新スケジュール
- 毎日朝9時（日本時間）に自動更新
- 手動実行も可能（Actions タブから）

## 🌐 サイトへのアクセス
セットアップ完了後、以下のURLでアクセス可能：
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## 📰 ニュースソース

### AI研究・開発
- OpenAI Blog
- Google AI Blog  
- DeepMind Blog
- Anthropic Blog

### テクノロジーメディア
- MIT Technology Review AI
- AI News
- VentureBeat AI
- The Verge AI

### 医療・ヘルスケアAI
- Healthcare IT News AI
- Medical AI News

### 学術・論文
- arXiv AI
- arXiv Machine Learning

### ビジネス・投資
- TechCrunch AI
- Forbes AI

### 日本のAI
- AI-SCHOLAR

## 🎯 ニュース選定基準
- 重要度スコアリングシステムで自動判定
- 主要企業の発表、新技術、医療応用、規制・政策などを重視
- 上限なしで重要なニュースをすべて掲載

## 🛠️ カスタマイズ
- `scripts/fetch-news.js`: ニュースソースの追加・変更
- `scripts/build-page.js`: ページデザインの変更
- `.github/workflows/update-news.yml`: 更新スケジュールの変更

## 📝 ローカルでのテスト
```bash
npm install
npm run update
```

## ⚠️ 注意事項
- 初回はニュースデータがないため、手動で実行してください
- GitHub Pagesの反映には数分かかる場合があります