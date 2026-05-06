# プログラミングランド 🎮

子供向けプログラミング学習ゲームスイート（5アプリ）。最大4人の子供が動物スロットで切り替えて遊べる。

## 起動コマンド
```bash
npm run dev    # port 5000, base /jjmou/
npx tsc --noEmit  # 型チェック
npm run build  # 本番ビルド → dist/
```

## スタック
- React 19 + TypeScript + Vite 6 (base: `/jjmou/`)
- Framer Motion, canvas-confetti, M PLUS Rounded 1c
- Supabase（オプション、env設定時に有効）

## プロジェクト構成
```
src/
  main.tsx / root/Root.tsx    - 4スロットユーザー管理・ホーム
  App.tsx                     - コードにゃんこ (50問)
  lib/supabase.ts             - Supabase REST クライアント
  apps/music/   dotart/   hiragana/   shapes/   - 各50問アプリ
  data/levels.ts              - 100問定義（export時に50問フィルタ済み）
  components/                 - GameGrid, LevelSelect, WinScreen 等
docs/
  ORG.md                      - 組織体制（オーナー/CEO/リン）
  decisions/                  - ADR技術決定ログ
  lin-reports/                - リンのUXレビュー報告
supabase/schema.sql           - DB スキーマ（profiles, progress）
vercel.json                   - Vercel SPA routing設定
.github/workflows/ci.yml      - TypeCheck + Build CI
```

## 組織体制（ver 3.0）
- **オーナー** → CEOとのみ直接やり取り
- **CEO/Rep** (Replitエージェント) → 実装・運営
- **リン** (UXレビュアーAI) → 子供目線レビュー、docs/lin-reports/ に報告

## ユーザー管理（4スロット式）
- `pg_land_slots_v2` / `pg_land_current_slot_v2`
- アニマル: 🐱🐶🐸🐰 / storageキーは replit.md旧版参照

## ゲーム仕様
- 全アプリ: **10レベル × 5問 = 50問**（コードにゃんこも5問/レベル）
- 評価 ★1〜3 / confetti win演出 / per-user localStorage保存

## インフラ連携
| サービス | 状態 | 必要なこと |
|---------|------|-----------|
| GitHub CI | ✅ 設定済み | push時に自動実行 |
| Vercel | 📋 設定ファイル作成済み | オーナーがvercel.comで接続 |
| Supabase | 📋 スキーマ・クライアント作成済み | シークレット設定が必要 |

## Vercel連携手順（オーナー操作）
1. vercel.com → "Add New Project" → `mtk-ctrl/jjmou` をimport
2. Framework: Vite, Build: `npm run build`, Output: `dist`

## Supabase連携手順（オーナー操作）
1. supabase.com でプロジェクト作成
2. SQL Editor で `supabase/schema.sql` を実行
3. Replit環境変数に設定: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Gotchas
- `noUnusedLocals: true` — 未使用変数でビルドエラー
- music/levels.ts の空文字ヒント `''` は構文エラー → 必ず文字列を入れる
- supabase.ts はenv未設定でもビルド可（isSupabaseEnabled=false でスキップ）
- git commit/push は background Project Task で行う（main agentはブロックされる）
