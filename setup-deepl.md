# DeepL API 設定ガイド

## DeepL API Free の取得方法（完全無料）

### 1. アカウント作成
1. https://www.deepl.com/pro-api にアクセス
2. 「Sign up for free」ボタンをクリック
3. メールアドレスとパスワードを入力して登録

### 2. メール認証
1. DeepLから確認メールが届きます
2. メール内のリンクをクリックして認証を完了

### 3. APIキーの取得
1. DeepLにログイン
2. 右上のアカウントメニューから「Account」を選択
3. 左側のメニューから「API Keys」を選択
4. 「Authentication Key for DeepL API Free」をコピー

### 4. ローカルテスト

```bash
# APIキーを環境変数に設定
export DEEPL_API_KEY="ここにコピーしたAPIキーを貼り付け"

# 翻訳テスト
node test-translation.js

# 成功したらニュースを更新
node scripts/fetch-news.js
```

### 5. GitHub での設定

1. GitHubリポジトリの「Settings」タブを開く
2. 左メニューの「Secrets and variables」→「Actions」を選択
3. 「New repository secret」をクリック
4. 以下を入力:
   - Name: `DEEPL_API_KEY`
   - Secret: DeepLのAPIキー
5. 「Add secret」をクリック

## 無料枠の制限
- 月間50万文字まで無料
- 1日約200記事の翻訳が可能
- クレジットカード不要

## トラブルシューティング

### 403エラーが出る場合
- APIキーが正しくコピーされているか確認
- 環境変数が正しく設定されているか確認
- DeepLアカウントでAPIキーが有効か確認

### 翻訳されない場合
- `echo $DEEPL_API_KEY` でAPIキーが設定されているか確認
- test-translation.js でテストを実行
- エラーメッセージを確認