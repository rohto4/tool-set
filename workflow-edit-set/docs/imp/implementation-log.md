# Implementation Log

## 2026-06-12

- `workflow-edit-set` を対象 PJ として初期整理
- `AGENTS.md` と `PROJECT.md` を追加
- `workflow-edit-set/docs` 配下のドキュメント構成を整理
- AWS 風のワークフローエディター初期版を構築
- `assets/icons/` に自前 PNG アイコン群を追加
- パレットとノードにアイコン表示を実装
- GitHub 連携と task board の初期運用を整備
- 主要ショートカット、範囲選択、複数選択、テキスト DSL 対応を追加
- 整列、均等配置、パレット検索を追加
- Mermaid 風 `flowchart` 記法の import / export とテキストファイル入出力を追加
- Snap to Grid と配置補助を追加
- PNG 出力、Quick Help、localStorage 自動保存、エッジ削除を追加
- Progress Review パネルと進捗要約コピーを追加

## 2026-06-13

- Progress Review を右カラムに統合
- SNS 投稿向けの進捗サマリー文字列を生成する処理を追加
- Web App / Event Mesh / Data Pipeline のデモテンプレート切り替えを追加
- 文字化けしていた運用ドキュメントを UTF-8 前提で正規化
