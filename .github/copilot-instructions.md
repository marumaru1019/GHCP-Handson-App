# GitHub Copilot Instructions - Todo App

## プロジェクト概要
Next.js 15 (App Router) + TypeScript + Tailwind CSS で構築されたモダンなTodoアプリケーション。

## アーキテクチャ特徴

### データ管理パターン
- **ローカルストレージ中心**：`localStorage`でTodoデータとフィルター状態を永続化
- **状態管理**：React Hooksのみ（Redux等は使用しない）
- **データ同期**：`isInitialLoad`フラグで初回読み込み時の保存を制御

### コンポーネント設計
- **機能別ディレクトリ構成**：`src/components/list/`でリスト機能を集約
- **Props型安全性**：すべてのコンポーネントに明示的な型定義
- **モーダル管理**：親コンポーネント（TodoApp）で状態管理、子に伝播

### 型システム
- **共通型**：`src/types/shared/todo.ts`に基盤型定義
- **機能別型**：`src/types/list/`、`src/types/kanban/`で機能固有型
- **エクスポート統合**：`src/types/index.ts`で一元管理

## 開発ワークフロー

### 必須コマンド
```bash
# 開発サーバー（Turbopack使用）
pnpm dev

# テスト実行
pnpm test

# ビルド
pnpm build
```

### テスト戦略
- **Jest + React Testing Library**：`jest.config.js`でTypeScript対応設定済み
- **パスエイリアス**：`@/`でsrcディレクトリを参照
- **setupTests.ts**：テスト環境初期化

## プロジェクト固有パターン

### 絵文字コメント規約（必須）
コメントの視認性向上のため、用途別絵文字を使用：
- `// 📝 説明・仕様`: 重要な説明
- `// 🐞 デバッグ`: デバッグ用ログ
- `// 🔄 状態管理`: 状態変更の説明
- `// 📊 計算・分析`: 数値計算やデータ処理
- `// 🚫 制約・注意`: 制限事項や注意点

### ローカルストレージパターン
```typescript
// 📝 保存キー定数定義
const STORAGE_KEY = 'todos';

// 🔄 初回読み込み制御
const [isInitialLoad, setIsInitialLoad] = useState(true);

// 📦 データ復元時の型安全性
const todosWithDates = data.map(todo => ({
  ...todo,
  createdAt: new Date(todo.createdAt)
}));
```

### モーダル実装パターン
```typescript
// 📝 モーダル状態管理
const [modal, setModal] = useState<{
  isOpen: boolean;
  id: string;
  title: string;
}>({ isOpen: false, id: '', title: '' });

// 📝 モーダル表示・非表示処理
const showModal = (id: string, title: string) => {
  setModal({ isOpen: true, id, title });
};
```

### 日時ユーティリティ活用
- **相対時間表示**：`getRelativeTime()`で「3分前」「2時間前」形式
- **日付フォーマット**：`formatDate()`で統一された日付表示

## 品質保証

### ESLint + TypeScript
- **設定**：`eslint.config.mjs`でNext.js標準設定
- **型チェック**：`strict: true`で厳密型チェック有効
- **パスエイリアス**：`@/`でインポートパス簡潔化

### コーディング規約
- **コメント必須**：複雑なロジックには絵文字付きコメント
- **Tailwind優先**：カスタムCSS最小限
- **Props型定義**：すべてのコンポーネントプロパティに型指定
- **エラーハンドリング**：localStorage操作時はtry-catch必須

## 重要ファイル
- `src/components/list/TodoApp.tsx`: メインアプリケーションロジック
- `src/types/shared/todo.ts`: 基盤型定義
- `src/utils/dateUtils.ts`: 日時処理ユーティリティ
- `jest.config.js`: テスト環境設定
