---
mode: agent
description: "Reactコンポーネントテスト雛形生成"
---

# Reactコンポーネントテスト雛形生成

${input:componentName:コンポーネント名} のテストファイルを生成してください。

## 生成要件
- React Testing Library使用
- TypeScript対応
- describe/it構造で整理
- モックとスパイの適切な活用

## 基本テストケース
### 正常系テスト
- コンポーネントの正常なレンダリング
- Propsによる表示内容の変化
- ユーザーインタラクションの正常動作
- 状態変更の正常フロー

### 異常系テスト
- 無効なPropsでのエラーハンドリング
- ネットワークエラー時の挙動
- 予期しない状態での動作確認
- エッジケースでの安全性

### アクセシビリティテスト
- ARIA属性の適切な設定
- キーボードナビゲーション
- フォーカス管理
- スクリーンリーダー対応

## ファイル配置
- テストファイル: src/components/__tests__/${componentName}.test.tsx
- 適切なimport文とsetup
