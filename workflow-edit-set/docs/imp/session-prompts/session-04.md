# Session 04 Prompt

## Name

責務分割本体

## Focus

`app.js` の巨大責務を分割し、state、render、input、history、dsl などへ責務を分ける。

## Avoid

- コンポーネント大増量
- DSL 拡張

## Done When

- 分割後も既存編集画面が維持されている
- 単一巨大ファイル依存が減っている
- 主要責務が独立モジュールとして読める

## Start Prompt

このセッションでは `app.js` の巨大責務を分割してください。state、render、input、history、dsl などへ責務を分け、UI を壊さずに単一巨大ファイル依存を減らしてください。コンポーネント大増量や DSL 拡張は次セッションへ回し、このセッションでは構造改善を優先してください。
