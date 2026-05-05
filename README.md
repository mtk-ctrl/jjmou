# 🐱 コードにゃんこ

> 子供向けプログラミング入門ゲーム — ネコをコードで動かしてゴールへ導こう！

![コードにゃんこ](https://img.shields.io/badge/React-19-61dafb?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)

---

## 🎮 ゲーム概要

**コードにゃんこ**は、子供がプログラミングの基礎概念を楽しく学べるブラウザゲームです。

- **コマンドをタップ**して順番に並べる
- **じっこうボタン**を押すと、ネコがコマンド通りに動く
- ゴール🎯に到達したら**花火でお祝い！**

---

## ✨ 特徴

| 機能 | 内容 |
|------|------|
| 🗺️ 全100問 | レベル1〜10、各10問 |
| 🔁 ループ機能 | コマンドをまとめて繰り返す |
| ⭐ 評価システム | コマンド効率で★1〜★3 |
| 🎆 花火エフェクト | クリア時にど派手に祝福 |
| 💾 進捗保存 | ユーザーごとにブラウザ保存 |
| 📱 タップ操作 | スマホ・タブレット対応 |

---

## 🌍 ステージテーマ

| レベル | テーマ | 新要素 |
|--------|--------|--------|
| Lv.1-2 | 🌳 公園 | 上下左右の基本移動 |
| Lv.3-4 | 🌿 公園（発展） | ループコマンド |
| Lv.5-6 | 🚀 宇宙 | 穴・障害物 |
| Lv.6-7 | 🔮 魔法世界 | ジャンプ（川を越える） |
| Lv.8-10 | 🤖 ロボ世界 | 敵・攻撃コマンド |

---

## 🛠️ 技術スタック

- **React 19** + **TypeScript** + **Vite 6**
- **Framer Motion** — アニメーション
- **canvas-confetti** — 花火エフェクト
- **M PLUS Rounded 1c** — 子供向けフォント

---

## 🚀 ローカル起動

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5000` を開く

---

## 📁 プロジェクト構成

```
src/
├── App.tsx              # メインアプリ
├── types.ts             # 型定義
├── data/
│   └── levels.ts        # 全100問レベルデータ
├── utils/
│   └── gameEngine.ts    # ゲームロジック
└── components/
    ├── GameGrid.tsx      # グリッド描画
    ├── CommandButton.tsx # コマンドボタン
    ├── CommandQueue.tsx  # コマンドキュー
    ├── WinScreen.tsx     # クリア画面
    ├── FailScreen.tsx    # 失敗画面
    ├── LoopModal.tsx     # ループ設定
    └── LevelSelect.tsx   # レベル選択
logs/
└── 開発ログ.md           # 日本語開発記録
```

---

## 📜 ライセンス

MIT
