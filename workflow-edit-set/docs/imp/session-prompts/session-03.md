# Session 03 Prompt

## Name

ターミナル操作層実装

## Focus

ターミナルからワークフロー図を操作できる入口を作る。主対象は DSL / state / history の純粋ロジックと、それを呼ぶ CLI もしくはスクリプト層。

## Avoid

- UI の大規模変更
- ブラウザ画面の再設計

## Done When

- `import`、`export`、`node` 追加、`edge` 追加、`layout` 実行の最低限をターミナルから操作できる
- ブラウザを開かずに図状態を読み書きできる

## Start Prompt

このセッションでは、ターミナルからワークフロー図を操作できる入口を作ってください。主対象は DSL / state / history の純粋ロジックと、それを呼ぶ CLI もしくはスクリプト層です。UI の大規模変更は行わず、import、export、node 追加、edge 追加、layout 実行の最低限をターミナルから操作可能にしてください。
