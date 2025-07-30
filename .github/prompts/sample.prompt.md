---
mode: agent
model: gpt-4
description: "Reactコンポーネント生成プロンプト"
tools: ["editFiles", "runTests"]
---

# React コンポーネントの生成

${input:componentName:コンポーネント名} コンポーネントを作成してください。

## 要件
- TypeScript対応
- styled-components使用
- テストファイルも生成
