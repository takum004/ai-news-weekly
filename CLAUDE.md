# AI News Weekly - CLAUDE.md

## プロジェクト概要
このプロジェクトは、世界中のAI関連ニュースを自動収集し、日本語に翻訳して表示するウェブサイトです。

## 翻訳APIの設定

### 優先順位
1. **OpenAI API** (最高品質)
2. **DeepL API Free** (高品質、月50万文字まで無料) ⭐ 推奨
3. **MyMemory API** (無料、1日5000文字まで、APIキー不要)

### 環境変数の設定

#### DeepL API Free (推奨) 🎆 無料枠大

**無料枠**: 月間50万文字まで無料

**取得手順**:
1. [DeepL API Free](https://www.deepl.com/pro-api)にアクセス
2. 「Sign up for free」をクリック
3. メールアドレスとパスワードで登録
4. メール認証を完了
5. ログイン後、アカウント設定の「API Keys」からキーをコピー

**ローカルテスト**:
```bash
# 1. 環境変数を設定
export DEEPL_API_KEY="your-deepl-api-key-here"

# 2. テスト実行
node test-translation.js

# 3. ニュースを更新
node scripts/fetch-news.js
```

**GitHub Actionsでの設定**:
1. リポジトリのSettingsへ
2. Secrets and variables > Actionsを選択
3. 「New repository secret」をクリック
4. Name: `DEEPL_API_KEY`
5. Secret: DeepL APIキーを入力
6. 「Add secret」をクリック

#### OpenAI API (オプション、有料)
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

#### APIキーなしで使用
環境変数を設定しない場合、自動的にMyMemory APIを使用します。
ただし、日量制限があるため、DeepL APIの使用を強く推奨します。

### ニュースの更新
```bash
node scripts/fetch-news.js
```

### ローカルサーバーの起動
```bash
python -m http.server 8000
```

## 主要ファイル
- `scripts/fetch-news.js` - ニュース取得と翻訳
- `index.html` - メインページ
- `search.html` - 検索・フィルタページ
- `article.html` - 記事詳細ページ
- `data/news.json` - ニュースデータ

## カテゴリ
### 企業別
- OpenAI, Google/Gemini, Anthropic/Claude, Microsoft/Copilot, Meta/Llama, xAI/Grok, NVIDIA

### 技術別
- 動画生成, 画像生成, 音声生成, 音楽生成, 音声クローン, 3Dモデリング
- エージェントAI, 自動化・RPA, コード生成, 翻訳
- マルチモーダル, 推論AI, ロボティクス, ゲーミング

### 業界別
- ヘルスケア, 金融, 教育, 小売, 製造業, 交通, 農業
- エネルギー, 法務, 不動産, エンタメ, 防衛, 宇宙, バイオ

### その他
- AI研究, 論文・学術, ビジネス・投資, 規制・政策
- セキュリティ, データサイエンス, スタートアップ
- 量子コンピューティング, エッジAI・IoT

## トラブルシューティング

### 翻訳が英語のままの場合
1. 環境変数が正しく設定されているか確認
2. MyMemory APIの日次制限(5000文字)に達していないか確認
3. `node scripts/fetch-news.js`を再実行

### カテゴリが表示されない場合
1. `data/news.json`が最新か確認
2. ブラウザのキャッシュをクリア
3. コンソールでエラーを確認