---
mode: 'agent'
tools: ['changes', 'codebase', 'editFiles']
description: 'Generate Jest + Testing Library test for a React component'
---

# React コンポーネント向けテスト

対象コンポーネント：`${input:componentName:MyComponent}` をテストします。
既に、テストファイルが存在する場合は、最新の仕様に合わせて更新してください。
テストファイルを作成したら作ったテストを実行してください。

- 初期レンダリングテスト  
- ユーザーインタラクション（クリック、入力）テスト  
- Props のバリデーションテスト  
