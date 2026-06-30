# 未来メモ ランディングページ

## ファイル構成

```text
landing-page/
  index.html
  config.js
  styles.css
  script.js
  assets/
    favicon.png
    ui-home-current.png
    ui-calendar-month.png
    ui-calendar-today.png
    ui-search.png
    notification-lockscreen.jpg
```

## 実行方法

`landing-page/index.html` をブラウザで開くと表示できます。

PowerShellで簡易サーバーを使う場合:

```powershell
cd "E:\script\作成中\codex\未来メモ\landing-page"
python -m http.server 4173
```

その後、`http://localhost:4173` を開いてください。

## LP内容

`未来メモ_仕様書.md` と現在のアプリUIに合わせて、以下を中心に整理しています。

- 音声またはテキスト入力
- AIによる予定・買い物・支払い・勉強の自動分類
- ホームでの今日の通知、未完了、登録枠確認
- カレンダー月表示、今日表示、メモ検索
- ロック画面に届く通知例
- 登録枠とプラン
- アラームアプリではないこと

## 使用画像

`UIイメージ` フォルダの画像は使用していません。
ユーザー指定の4枚のアプリ画面スクリーンショットをコピーして使用しています。

使用ファイル:

- `assets/ui-home-current.png`
- `assets/ui-calendar-month.png`
- `assets/ui-calendar-today.png`
- `assets/ui-search.png`
- `assets/notification-lockscreen.jpg`

## 待機列フォーム仕様

- 未入力時: `メールアドレスを入力してください。`
- メール形式不正時: `正しいメールアドレス形式で入力してください。`
- 送信中: ボタンを `送信中...` に変更し、二重送信を防止
- 成功時: `登録ありがとうございます。未来メモのリリース情報をお届けします。`
- 送信処理: `script.js` の `submitWaitlist(email, source)` に集約
- Formspree送信先: `config.js` の `window.MIRAI_MEMO_FORMSPREE_ENDPOINT`
- Formspree未設定時: `localStorage` の `mirai-memo-waitlist` に保存
- API利用時: `window.MIRAI_MEMO_WAITLIST_USE_API = true` を設定すると `/api/waitlist` に送信

## Formspree設定

1. Formspreeでフォームを作成します。
2. フォームのendpointを取得します。形式は `https://formspree.io/f/xxxxxxxx` です。
3. `config.js` を開き、以下のように差し替えます。

```js
window.MIRAI_MEMO_FORMSPREE_ENDPOINT = "https://formspree.io/f/xxxxxxxx";
```

JavaScriptから `Accept: application/json` 付きで送信しています。
endpoint未設定時や送信失敗時は、確認用として `localStorage` に保存します。

## 公開方法

このLPは静的サイトなので、`landing-page/` フォルダだけで公開できます。

### GitHub Pages

1. GitHubで新規リポジトリを作成します。例: `mirai-memo-landing-page`
2. PowerShellで以下を実行します。

```powershell
cd "E:\script\作成中\codex\未来メモ\landing-page"
git init
git branch -M main
git add .
git commit -m "Publish Mirai Memo landing page"
git remote add origin https://github.com/<your-account>/mirai-memo-landing-page.git
git push -u origin main
```

3. GitHubのリポジトリ画面で `Settings` → `Pages` を開きます。
4. `Build and deployment` の `Source` を `Deploy from a branch` にします。
5. `Branch` を `main`、フォルダを `/root` にして保存します。
6. 数分後に `https://<your-account>.github.io/mirai-memo-landing-page/` で公開されます。

## Google検索に出すための設定

このLPには検索エンジン向けに以下を入れています。

- `robots.txt`
- `sitemap.xml`
- canonical URL
- OGP / Twitter Card
- `meta name="robots" content="index,follow"`

Googleに早く認識させる場合は、Google Search Consoleで以下を行ってください。

1. `https://haru861017.github.io/mirai-memo-landing-page/` をプロパティとして追加
2. 所有権確認を行う
3. サイトマップに `https://haru861017.github.io/mirai-memo-landing-page/sitemap.xml` を送信
4. URL検査からトップページのインデックス登録をリクエスト

### Netlify Drop

1. `landing-page/` フォルダ、または作成済みzipをNetlify Dropへアップロードします。
2. 公開URLが発行されたら、Formspree側の許可ドメイン設定を確認します。

### Vercel CLI

```powershell
npx vercel .\landing-page --prod
```

初回はVercelログインが必要です。

### 本番APIへ差し替える場合

`config.js` のFormspree endpointを空にし、`window.MIRAI_MEMO_WAITLIST_USE_API = true` を設定してください。
その場合は `script.js` の `/api/waitlist` に接続されます。
DB保存、重複登録チェック、レート制限、同意ログ、配信停止導線はAPI側で実装する想定です。

## 変更しやすい箇所

- 色: `styles.css` の `:root` にある `--color-*`
- 影と角丸: `--shadow-*`、`--radius-*`
- メインコピーや各セクション文言: `index.html`
- Formspree endpoint: `config.js` の `MIRAI_MEMO_FORMSPREE_ENDPOINT`
- フォーム成功文言: `script.js` の `SUCCESS_MESSAGE`
- APIエンドポイント: `script.js` の `WAITLIST_API_ENDPOINT`
