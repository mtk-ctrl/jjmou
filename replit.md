# コードにゃんこ 🐱

子供向けプログラミング入門ゲーム。ネコのキャラクターをコマンドで動かしてゴールに導く。

## 技術スタック
- React 19 + TypeScript + Vite
- Framer Motion（アニメーション）
- canvas-confetti（花火エフェクト）
- フォント: M PLUS Rounded 1c
- ポート: 5000（webview）

## プロジェクト構成
```
src/
  App.tsx              - メインアプリ（ゲーム状態管理）
  types.ts             - 型定義
  index.css            - グローバルスタイル
  data/
    levels.ts          - 全100問のレベルデータ
  utils/
    gameEngine.ts      - コマンドシミュレーション・判定ロジック
  components/
    GameGrid.tsx       - グリッド描画（テーマ対応）
    CommandButton.tsx  - コマンドボタン
    CommandQueue.tsx   - コマンドキュー表示
    WinScreen.tsx      - クリア画面（花火付き）
    FailScreen.tsx     - 失敗画面
    LoopModal.tsx      - ループ回数設定モーダル
    LevelSelect.tsx    - レベル選択画面
logs/
  開発ログ.md          - 日本語による開発記録
```

## ゲーム仕様
- **全100問**（レベル1〜10、各10問）
- **コマンド**: 上・下・左・右・ジャンプ・攻撃・ループ
- **操作**: タップで追加、タップでキャンセル
- **テーマ**: 公園（Lv1-3）→ 宇宙（Lv4-5）→ 魔法（Lv6-7）→ ロボ（Lv8-10）
- **評価**: ★1〜★3（コマンド効率）
- **進捗**: localStorageに保存

## GitHub連携について
⚠️ ユーザーがGitHub OAuthインテグレーションを一時スキップ。
再度接続したい場合は「GitHubと連携して」と伝えるか、
Personal Access Token（PAT）を作成してシークレットに保存する方法もある。
再接続時は connector:ccfg_github_01K4B9XD3VRVD2F99YM91YTCAF を使用すること。

## 起動コマンド
```bash
npm run dev
```
