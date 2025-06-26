# DeepL API設定手順

## GitHubにDEEPL_API_KEYを設定する

1. GitHubでリポジトリ（https://github.com/takum004/ai-news-weekly）を開く
2. 「Settings」タブをクリック
3. 左メニューの「Secrets and variables」→「Actions」をクリック
4. 「New repository secret」ボタンをクリック
5. 以下を入力：
   - Name: `DEEPL_API_KEY`
   - Secret: `1c2cdb53-a7ac-420b-8240-c0cfc4a52325:fx`
6. 「Add secret」をクリック

## ワークフローを手動実行する

1. リポジトリの「Actions」タブをクリック
2. 「Update News and Deploy」ワークフローをクリック
3. 「Run workflow」ボタンをクリック
4. 「Run workflow」を確認

これでDeepL APIを使った高品質な日本語翻訳が有効になります。