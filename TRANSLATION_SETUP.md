# 翻訳品質改善ガイド

## 現在の問題

スクリーンショットのような低品質な翻訳が表示される理由：
- 「Accenture is すでに cashing でで生成AI」
- 「Agent-to-Agent (A2A) protocol is 新しい standard によってGoogle」

これは単純な単語置換による翻訳が原因です。

## 解決方法

### 1. OpenAI APIキーの設定

GitHubリポジトリに以下の手順でAPIキーを設定してください：

1. OpenAIアカウントでAPIキーを取得
   - https://platform.openai.com/api-keys
   - 「Create new secret key」をクリック

2. GitHubリポジトリに設定
   - https://github.com/takum004/ai-news-weekly/settings/secrets/actions
   - 「New repository secret」をクリック
   - Name: `OPENAI_API_KEY`
   - Value: `sk-...`（取得したAPIキー）
   - 「Add secret」をクリック

### 2. 実装済みの改善内容

```javascript
// scripts/fetch-news.js の改善された翻訳関数
async function translateText(text, apiKey) {
  if (apiKey && process.env.OPENAI_API_KEY) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "あなたは優秀な技術翻訳者です。英語のAIニュースを自然な日本語に翻訳してください。"
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      // APIエラーの場合は基本翻訳にフォールバック
    }
  }
  // フォールバック処理...
}
```

### 3. 翻訳品質の違い

**改善前（単純置換）**:
```
Input: "Accenture is already cashing in on generative AI"
Output: "Accenture is すでに cashing でで生成AI"
```

**改善後（AI翻訳）**:
```
Input: "Accenture is already cashing in on generative AI"
Output: "アクセンチュアは既に生成AIで収益を上げている"
```

### 4. コスト目安

- 1記事あたり約0.002ドル（タイトル＋要約）
- 80記事/日 × 30日 = 月額約4.8ドル

### 5. 即座に反映させる方法

```bash
# 1. ローカルでテスト（要.envファイル）
echo "OPENAI_API_KEY=sk-..." > .env
npm run update-news

# 2. GitHub Actionsで手動実行
# https://github.com/takum004/ai-news-weekly/actions
# "Run workflow" をクリック
```

### 6. トラブルシューティング

**APIキーが設定されているか確認**:
```bash
# GitHub Actionsのログで確認
echo "API Key exists: $(if [ -n "$OPENAI_API_KEY" ]; then echo "Yes"; else echo "No"; fi)"
```

**翻訳が改善されない場合**:
1. GitHub Secretsが正しく設定されているか確認
2. APIキーの利用制限を確認
3. ワークフローのログでエラーを確認

## まとめ

OpenAI APIキーを設定することで、以下が改善されます：
- ✅ 自然な日本語翻訳
- ✅ 専門用語の適切な翻訳
- ✅ 文法的に正しい文章
- ✅ 読みやすい要約

設定後、次回の自動更新（毎日6時/12時）から高品質な翻訳が反映されます。