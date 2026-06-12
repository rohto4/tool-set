# Codex Context Monitor

Codex CLI のローカルログ (`~/.codex`) を読み取り、現在セッションの `token_count` を VS Code のステータスバーにリアルタイム表示する拡張です。

表示例:

`Codex 7.0% 18,095/258,400`

## Features

- `history.jsonl` の最新 `session_id` を自動追跡
- `sessions/**/*.jsonl` から `token_count` を抽出
- `Pin Session By ID` で指定したセッションを常時表示（非アクティブでも維持）
- 使用率に応じて警告/危険色を表示
- `Codex Context Monitor: Show Details` で詳細情報を表示
- Explorer ビューに `Codex Context Overlay` 小窓を表示

## Settings

- `codexContextMonitor.enabled`
- `codexContextMonitor.refreshIntervalMs`
- `codexContextMonitor.maxSessions` (1-3)
- `codexContextMonitor.activeWithinSec`
- `codexContextMonitor.warningThreshold`
- `codexContextMonitor.criticalThreshold`
- `codexContextMonitor.codexHome`

## Run (Extension Development Host)

1. このフォルダ (`codex-context-monitor`) を VS Code で開く
2. `F5` を押して Extension Development Host を起動
3. 新しいウィンドウのステータスバー右側で `Codex ...` を確認

## Commands

- `Codex Context Monitor: Start`
- `Codex Context Monitor: Stop`
- `Codex Context Monitor: Show Details`
- `Codex Context Monitor: Pin Session By ID`
- `Codex Context Monitor: Unpin Session`
- `Codex Context Monitor: Focus Overlay View`
