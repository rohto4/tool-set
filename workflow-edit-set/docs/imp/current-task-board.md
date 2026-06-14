# Current Task Board

## Active Objective

`workflow-edit-set` のセッション3残タスクを回収し、ビューポート操作まわりの確認と最小修正を完了する。
見た目正本は `site/ui-kit.html` のまま維持しつつ、`site/app.js` と関連文書を今回の状態へ追随させる。

## Session Scope

- 主対象: `site/app.js`
- 必要最小限の調整: `site/index.html`, `site/styles.css`
- セッション文書更新: `current-task-board.md`, `session-handoff.md`, `session-log.md`
- 対象外: CLI / core 分離、テスト導入、大規模なデータモデル再設計

## Done Criteria

- `Space+drag` または中ボタンドラッグでのハンドパン成立条件がコードと文書で一致している
- 背景グリッドがビューポート移動に追従する描画経路が維持されている
- ノード選択、複数選択、ドラッグ、接続、整列、スナップの既存経路に大きな回帰がない
- 次セッションで `テキストボックス追加` と `領域塗り` に進める状態が明文化されている

## Current Status

- `site/app.js` にビューポート座標、レイヤー translate、背景グリッド追従が入っている
- `site/app.js` で `Space+drag` / 中ボタンドラッグによるパン開始条件を扱っている
- ノード上でパン開始した直後の click 誤発火を抑える最小修正を追加した
- `site/index.html` のショートカット表示とクイックヘルプを現実装に合わせた

## Interaction Priority

1. ハンドパン
2. 背景グリッド追従
3. テキストボックス追加
4. 領域塗り

## Rationale

- ハンドパンを先に入れないと広い図面編集の基盤が定まらない
- 背景グリッド追従はハンドパンと同じビューポート変換に乗せるべき
- テキストボックスは注釈レイヤーの基礎として先に価値を出しやすい
- 領域塗りは領域コンテナと注釈の見え方を固めてから詰めるほうが手戻りが少ない
## Session 4 Result

- ビューポート移動のコード経路を確認し、背景グリッド追従は `background-position` とレイヤー translate の併用で成立していることを確認
- 既存操作の回帰観点を洗い、ノード上の `Space+drag` パン後に click が走りうる経路だけ最小修正
- 次セッションの主対象は `テキストボックス追加` と `領域塗り`
