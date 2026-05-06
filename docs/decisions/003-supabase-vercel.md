# ADR 003: Vercel デプロイ + Supabase データ永続化

- **日付**: 2026-05-06
- **決定者**: オーナー指示 → CEO実装
- **ステータス**: 設定ファイル作成済み・接続待ち

## 背景
オーナーより「GitHubのほうをVercel/Supabaseと連携させてほしい」との指示。

## 決定事項

### Vercel（ホスティング）
**構成**: GitHub main ブランチ → Vercel 自動デプロイ  
**設定ファイル**: `vercel.json`  
**ルーティング**: SPA rewrites で `/jjmou/*` → `index.html`  
**キャッシュ**: assets は1年キャッシュ（immutable）

**連携手順（オーナーが実施）**:
1. https://vercel.com にログイン
2. "Add New Project" → "Import Git Repository"
3. `mtk-ctrl/jjmou` を選択
4. Framework: Vite, Build: `npm run build`, Output: `dist`
5. Deploy

### Supabase（データ永続化）
**目的**: デバイスをまたいだ進捗保存  
**スキーマ**: `supabase/schema.sql`  
**アクセス方式**: anon key（認証なし、device_id で識別）  

**テーブル構成**:
- `profiles`: スロット情報（name, animal_idx, device_id）
- `progress`: アプリごとの進捗（stars, level_index, unlocked_count）

**連携手順（オーナーが実施）**:
1. https://supabase.com でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Settings → API から URL と anon key を取得
4. Replit の環境変数に設定:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### GitHub Actions CI
**設定ファイル**: `.github/workflows/ci.yml`  
**トリガー**: main ブランチへの push/PR  
**チェック内容**: TypeScript型チェック → ビルド → dist artifact保存

## 優先度
1. **GitHub Actions CI**: すぐに有効（push時に自動実行）
2. **Vercel**: オーナーがVercel.comで設定すれば即デプロイ可能
3. **Supabase**: シークレット設定後にクライアントコード有効化
