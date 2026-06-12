# workflow-edit-set Agent Instructions

## 最優先ルール

1. 日本語で対応する。
2. UTF-8 で読み書きする。
3. この PJ の作業正本は `G:\devwork\tool-set\workflow-edit-set` 配下とする。
4. この PJ の文書正本は `G:\devwork\tool-set\workflow-edit-set\docs` 配下とする。
5. ルートの `tool-set/docs` はこの PJ では使わない。
6. `AGENTS.md` と `PROJECT.md` は一般テンプレートより優先する。
7. 一次回答は短くし、必要時だけ詳細化する。

## 読み込み順

1. `AGENTS.md`
2. `PROJECT.md`
3. `docs/README.md`
4. 必要な `docs/guide/*`
5. 必要な `docs/spec/*`
6. 必要な `docs/condi-ref/*`
7. 必要な `docs/imp/*`
8. 中断再開時は `docs/imp/current-task-board.md` と `docs/imp/session-handoff.md` を優先確認する

## 文書配置ルール

- 恒久運用ガイド: `docs/guide/`
- 確定仕様: `docs/spec/`
- 条件付き参考、比較、未確定案: `docs/condi-ref/`
- 実装メモ、進捗、変更記録: `docs/imp/`
- 一時メモ: `docs/memo.md`
- 現在タスク管理: `docs/imp/current-task-board.md`
- セッション引継ぎ: `docs/imp/session-handoff.md`

## 実装ルール

- 依存追加前に、まず依存なしで成立する実装を検討する。
- 大きな構成変更時は関連する文書も同じターンで更新する。
- `docs/` 配下の構成を変えたら `docs/README.md` を更新する。
- `docs/guide/` を大きく変えたら `docs/guide/guide-summary.md` を更新する。
- `docs/spec/` を大きく変えたら `docs/spec/spec-summary.md` を更新する。
- `docs/condi-ref/` を大きく変えたら `docs/condi-ref/condi-ref-summary.md` を更新する。
