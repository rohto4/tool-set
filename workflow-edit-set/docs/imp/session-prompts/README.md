# Session Prompts

このディレクトリには、各セッションを開始するときの基準プロンプトを保存する。`workflow-edit-set` のセッション開始時は、ここを唯一の正本として扱う。

## Purpose

- 今どのセッションかを厳密に監視する
- セッションごとの対象範囲を固定する
- レビューしながら直列に進める
- ローカル docs 運用と `G:\Knowledge-vault` 運用の境界を崩さない

## Session Map

| Session | Name | Focus | Done When |
| --- | --- | --- | --- |
| 01 | 画面安定化 | 既存 UI の破綻修正、初回モーダル、日本語表示 | 編集画面が安定して開き、ヘルプを複数経路で閉じられ、日本語主要導線が成立している |
| 02 | UI キット整備と操作改善の下準備 | `ui-kit.html` を正本にした見た目ルール整理と次段操作改善の優先順位付け | 主要部品見本が並び、見た目基準と次アプローチが明文化されている |
| 03 | ターミナル操作層実装 | DSL / state / history を使う CLI や script 入口 | ブラウザを開かずに図状態を読み書きできる |
| 04 | 責務分割本体 | `app.js` の state / render / input / history / dsl 分割 | 既存画面を壊さず、主要責務が独立モジュールとして読める |
| 05 | コンポーネント定義拡張 | コンポーネント辞書、カテゴリ、アイコン資産の拡張 | 部品数が大きく増え、定義追加だけで拡張しやすい |
| 06 | レイアウト / 選択 / 接続高度化 | selection、alignment、routing、snap、layout の改善 | 編集体験が明確に改善し、回帰しやすい形で整理されている |
| 07 | DSL / バリデーション強化 | parser、serializer、validator、不正入力 handling | 不正入力を検出し、理由を示し、安定した round-trip ができる |
| 08 | 設定 / 右ペイン / 検索整理 | 設定 UI、モーダル、右ペイン、検索、ショートカット導線 | 右ペインと設定系の役割が明確になり、検索とショートカットが分かりやすい |
| 09 | テスト導入 | CLI / core 層前提の unit test と回帰確認導線 | 主要ロジックに機械的な回帰確認手段があり、破壊検出ができる |

## Recommended Reading Order

1. この `README.md` でセッション番号と役割を確認する
2. 対象セッションの `session-XX.md` を読む
3. `../session-tracker.md` で計画、実績、残アプローチ、通過判定を確認する
4. そのセッションの `Scope / Avoid / Done When` を守る
5. 終了時に `current-task-board.md` と `session-handoff.md` と必要なら `session-log.md` を更新する
6. 長期判断や横断履歴を残す必要がある場合は `G:\Knowledge-vault` 側へ追記する

## Notes

- 今後セッションの役割を見直すときは、この一覧表と個別 `session-XX.md` を同じターンで更新する
- 実装実態が変わって一覧表と個別 prompt がズレた場合は、一覧表を放置せずすぐ揃える
