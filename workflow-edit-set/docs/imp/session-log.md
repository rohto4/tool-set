# Session Log

## 2026-06-13 UI Kit Session

- `site/ui-kit.html` を新規作成し、UI キット正本ページを追加
- タイポグラフィ、ノード寸法、余白、角丸、カラートークン、パレット項目、インスペクター項目、ラベル、注釈、領域コンテナ、統合キャンバス見本を配置
- `site/styles.css` を大きく更新し、UI トークンと共通部品スタイルを定義
- `site/index.html` を UI キット導線付きの編集画面として整理
- `site/app.js` にグリッド寸法とノード寸法の定数を追加し、ヒット判定と SVG / PNG 書き出しにも反映
- 操作改善の優先順位を `ハンドパン -> 背景グリッド追従 -> テキストボックス追加 -> 領域塗り` として明文化
## 2026-06-13 Viewport Session

- Added viewport offset state in `site/app.js`
- Switched canvas navigation from scroll-based coordinates to translated layers
- Updated grid tracking to follow viewport movement

## 2026-06-13 Session 4 Follow-up

- `PROJECT.md`、`README.md`、`docs/spec/architecture-editor-spec.md` を確認し、今回の実装前提が依存追加なしの静的 HTML/CSS/JavaScript であることを再確認
- `site/app.js` のビューポート座標、`getCanvasPoint()`、`renderViewport()`、パン開始条件、既存ドラッグ経路を読み、ハンドパンと背景グリッド追従のコード経路を点検
- ノード上で `Space+drag` パンを始めた場合に click が誤発火しうるため、パン直後のノード click を短時間抑制する最小修正を追加
- `site/index.html` のステータスバーとクイックヘルプに `Space+drag` / 中ボタンドラッグの案内を追記
- Codex の in-app Browser では `file://` 制限と `localhost` の `ERR_BLOCKED_BY_CLIENT` により実ブラウザ確認が完了できず、今回はコード経路の確認結果を引き継ぎ文書へ明記
