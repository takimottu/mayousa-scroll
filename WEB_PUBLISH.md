# ブラウザ公開とランキング設定

## できるようになったこと

- リザルト後に今回のSCOREを表示
- 到達SCOREをランキング登録
- 登録日時、名前、SCORE、残り人数をランキング表示
- 同じ名前は最高SCOREだけランキング表示
- X/Twitter投稿ボタン
- Supabase未設定時は、この端末だけのローカルランキングで動作確認

## Supabase設定

1. Supabaseで新しいProjectを作成
2. SQL Editorで `supabase-leaderboard.sql` の内容を実行
3. Project Settings > API から以下を確認
   - Project URL
   - anon public key
4. `leaderboard-config.js` を編集

```js
window.MAYOUSA_LEADERBOARD = {
  supabaseUrl: "https://YOUR_PROJECT_ID.supabase.co",
  supabaseAnonKey: "YOUR_ANON_PUBLIC_KEY",
  table: "mayousa_scores",
};
```

## 公開

静的サイトとして公開できます。GitHub Pages、Cloudflare Pages、Netlify、Vercelなどで、リポジトリまたはこのフォルダをそのまま公開してください。

公開後に `leaderboard-config.js` の設定が入っていれば、全員共通のランキングになります。
