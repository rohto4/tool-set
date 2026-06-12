# Autonomous Execution

## 目的

コンテキスト上限やセッション中断があっても、この PJ を継続実行しやすくする。

## 運用ルール

1. 大きな作業を始める前に `docs/imp/current-task-board.md` を更新する。
2. フェーズ完了ごとに `docs/imp/session-handoff.md` を更新する。
3. 仕様変更が入ったら `docs/spec/` を先に更新してから実装する。
4. 中断時は、未完了タスク、次の一手、注意点を `session-handoff.md` に残す。
5. 再開時は `AGENTS.md` → `PROJECT.md` → `current-task-board.md` → `session-handoff.md` の順に読む。

## 実行単位

- Phase 0: 運用、Git、引継ぎ基盤
- Phase 1: 入力操作とショートカット
- Phase 2: 選択、複製、整列
- Phase 3: コンポーネント拡張
- Phase 4: テキストDSL入出力
- Phase 5: ドキュメント整備
- Phase 6: 検証、仕上げ

## 中断時の最低記録

- 完了した項目
- 途中の項目
- 次にやる項目
- 既知の不具合
- 触ったファイル

