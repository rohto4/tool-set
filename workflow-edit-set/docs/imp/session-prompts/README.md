# Session Prompts

このディレクトリには、各セッションを開始するときの基準プロンプトを保存する。`workflow-edit-set` のセッション開始時は、ここを唯一の正本として扱う。

## Purpose

- 今どのセッションかを厳密に監視する
- セッションごとの対象範囲を固定する
- レビューしながら直列に進める
- ローカル docs 運用と `G:\Knowledge-vault` 運用の境界を崩さない

## Usage

1. 対象セッションの prompt を読み込む
2. そのセッションの `Scope / Avoid / Done When` を守る
3. 終了時に `current-task-board.md` と `session-handoff.md` を更新する
4. 長期判断や横断履歴を残す必要がある場合は `G:\Knowledge-vault` 側へ追記する
