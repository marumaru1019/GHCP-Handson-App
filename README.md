# 📝 Todo App - Next.js Project

GitHub CopilotとNext.jsを使って構築されたモダンなTodoアプリケーションです。

## ✨ 主な機能

- **Todoリスト管理**: タスクの追加・編集・削除・完了状態の切り替え
- **優先度設定**: タスクに低・中・高の優先度を設定可能
- **フィルター機能**: すべて・アクティブ・完了済みでタスクを絞り込み
- **ダークモード対応**: システム設定に応じた自動テーマ切り替え
- **ローカルストレージ保存**: ブラウザにデータを永続化

## 🚀 技術スタック

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint
- **Package Manager**: npm

## 📁 プロジェクト構造

```
src/
├── app/                  # App Router用ページ
│   ├── layout.tsx        # 共通レイアウト
│   ├── page.tsx          # メインページ
│   └── globals.css       # グローバルスタイル
├── components/           # UIコンポーネント
│   ├── list/             # リスト表示用コンポーネント
│   │   ├── TodoApp.tsx   # メインアプリケーション
│   │   ├── TodoInput.tsx # タスク入力
│   │   ├── TodoItem.tsx  # タスクアイテム
│   │   └── TodoFilter.tsx # フィルター機能
│   └── shared/           # 共通コンポーネント
├── types/                # 型定義
└── lib/                  # ユーティリティ
```

## 🛠️ セットアップ & 立ち上げ方

### 前提条件
- Node.js 20.0以上
- npm

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd GHCP-Handson-App
```

### 2. 依存関係のインストール
```bash
npm install
```

`npm install` で依存関係の解決に失敗する環境では、以下を使用してください。

```bash
npm install --legacy-peer-deps
```

### 3. 開発サーバーの起動
```bash
npm run dev
```

### 4. ブラウザでアクセス
開発サーバーが起動したら、ブラウザで以下のURLにアクセスしてください：

📱 **リスト表示**: [http://localhost:3000](http://localhost:3000)

## 🧪 テストの実行

```bash
# 全テストを実行
npm test
```

## 📜 利用可能なスクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm test` | Jestテストを実行 |
| `npm run build` | 本番ビルドを作成 |
| `npm start` | 本番ビルドを起動 |
| `npm run lint` | ESLintを実行 |

## 🏗️ ビルドとデプロイ

```bash
# プロダクション用ビルド
npm run build

# ビルド後のアプリケーションを起動
npm start
```

## 📋 コードスタイル

```bash
# ESLintによるコード検証
npm run lint
```

詳細なコーディング規約については [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) を参照してください。

## 🔧 トラブルシューティング

- `next/font` が Google Fonts を取得できずビルド失敗する場合は、ネットワーク制限のない環境で再実行してください。
