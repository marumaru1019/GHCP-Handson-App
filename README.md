# 📝 Todo App - Next.js Project

GitHub CopilotとNext.jsを使って構築されたモダンなTodoアプリケーションです。

## 🚀 技術スタック

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint
- **Package Manager**: pnpm

## 🛠️ セットアップ & 立ち上げ方

### 前提条件
- Node.js 20.0以上
- pnpm (推奨) または npm

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd GHCP-TodoApp
```

### 2. 依存関係のインストール
```bash
# pnpmを使用する場合（推奨）
pnpm install

# npmを使用する場合
npm install
```

### 3. 開発サーバーの起動
```bash
# pnpmを使用する場合
pnpm dev

# npmを使用する場合
npm run dev
```

### 4. ブラウザでアクセス
開発サーバーが起動したら、ブラウザで以下のURLにアクセスしてください：

📱 **リスト表示**: [http://localhost:3000](http://localhost:3000)

## 🧪 テストの実行

```bash
# 全テストを実行
pnpm test
# または
npm test

# テストをwatch モードで実行
pnpm test:watch
# または
npm run test:watch
```

## 🏗️ ビルドとデプロイ

```bash
# プロダクション用ビルド
pnpm build
# または
npm run build

# ビルド後のアプリケーションを起動
pnpm start
# または
npm start
```

## 📋 仕様

### タスク入力

- タスクの前後の空白は自動的に除去されます（trim処理）
- 空白のみの入力はタスクとして追加されません
