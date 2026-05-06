# プログラミングランド 🎮

子供向けプログラミング学習ゲームスイート（5アプリ）。最大4人の子供がどうぶつスロットで切り替えて遊べる。

## 起動コマンド
```bash
npm run dev
```
- ポート: 5000  /  ベースパス: `/jjmou/`
- GitHub push: `git push "https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/mtk-ctrl/jjmou.git" main`

## スタック
- React 19 + TypeScript + Vite 6
- Framer Motion（アニメーション）
- canvas-confetti（花火エフェクト）
- フォント: M PLUS Rounded 1c

## プロジェクト構成
```
src/
  main.tsx             - エントリ（basename=/jjmou/）
  root/Root.tsx        - 4スロットユーザー管理 + ホーム + 統計画面
  App.tsx              - コードにゃんこ（props: onHome, presetUser?）
  apps/
    music/
      MusicApp.tsx     - おんがくプログラミング（props: onHome, currentUser）
      levels.ts        - 50問（10レベル×5問）
    dotart/
      DotArtApp.tsx    - ドット絵プログラミング（props: onHome, currentUser）
      levels.ts        - 50問
    hiragana/
      HiraganaApp.tsx  - ひらがなかきかた canvas tracing（props: onHome, currentUser）
      characters.ts    - 50文字
    shapes/
      ShapesApp.tsx    - かたちパズル SVG択一（props: onHome, currentUser）
      puzzles.ts       - 50問
  data/levels.ts       - コードにゃんこ 全100問
  utils/gameEngine.ts  - コマンドシミュレーション
  components/          - GameGrid, CommandButton, CommandQueue, WinScreen, FailScreen, LoopModal, LevelSelect
```

## ユーザー管理（ver 3.0 4スロット式）
- `pg_land_slots_v2` — 4つのスロット（name, animalIdx）
- `pg_land_current_slot_v2` — 現在選択中のスロット番号
- アニマル: 🐱ネコ / 🐶イヌ / 🐸カエル / 🐰ウサギ
- 各スロット: 名前入力 + どうぶつ選択 + 星数表示

## ゲーム仕様
| アプリ | 問題数 | storageキー |
|--------|--------|-------------|
| コードにゃんこ | 100問 | `codenyanko_users_v1`（nested） |
| おんがくプログラミング | 50問 | `musicprog_stars_${user}_v1` |
| ドット絵プログラミング | 50問 | `dotart_stars_${user}_v1` |
| ひらがなかきかた | 50問 | `hiragana_stars_${user}_v1` |
| かたちパズル | 50問 | `shapes_stars_${user}_v1` |

- **評価**: ★1〜★3  /  **花火**: canvas-confetti（両サイド + バースト）
- **合計最大**: 750星（コードにゃんこ除くと600）

## アーキテクチャ決定
- `noUnusedLocals: true` のため未使用変数に注意
- 全アプリは `currentUser: string` prop でユーザーを受け取る
- ひらがなはcanvas pixel比較、かたちはSVG選択式
- ベースパス `/jjmou/` は vite.config.ts の `base` で設定

## User preferences
- 子供向け：大きいボタン、カラフル、ひらがな優先
- 最大4人のスロット、メール不要

## Gotchas
- music/levels.ts の空文字ヒント `''` は構文エラーになる → 必ずヒント文字列を入れる
- git commit は background task で行う（main agentはブロックされる）
