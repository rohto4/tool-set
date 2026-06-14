# OpenCode-Link — システム構成書

## 1. 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│ ユーザー層                                                   │
│  ├─ PC ブラウザ                                             │
│  ├─ スマホブラウザ                                          │
│  └─ PWA（スマホ/タブレット）                                │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/WSS
┌──────────────────────▼──────────────────────────────────────┐
│ ネットワーク層                                               │
│  ├─ Tailscale（外出先からの接続）                           │
│  └─ ローカルネットワーク（自宅内）                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────────┐
│ アプリケーション層                                           │
│  ├─ packages/app (SolidJS + Vite)                           │
│  │   └─ Web UI                                              │
│  └─ packages/opencode (CLI + Server)                        │
│      └─ API サーバー                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ ファイル/DB
┌──────────────────────▼──────────────────────────────────────┐
│ データ層                                                     │
│  ├─ ~/.codex/sessions/（セッションデータ）                  │
│  ├─ ~/.local/share/opencode/（DB/ログ）                     │
│  └─ プロジェクトディレクトリ（作業ファイル）                │
└─────────────────────────────────────────────────────────────┘
```

## 2. モジュール構成

```
anomalyco/opencode (fork: rohto4/opencode)
├── packages/
│   ├── app/          # Web UI 改修対象
│   ├── ui/           # 共有 UI コンポーネント
│   ├── opencode/     # サーバー（改修不要）
│   ├── sdk/js/       # TypeScript SDK
│   └── desktop/      # Electron（使用しない）
└── sdks/vscode/      # VS Code 拡張（使用しない）
```

## 3. ポート構成

| 用途 | ポート | プロトコル |
|---|---|---|
| Web UI | 3002 | HTTP (Vite dev) |
| API サーバー | 4096 | HTTP |
| Tailscale | 4096 | HTTPS/WSS |

## 4. 起動構成

### 4.1 開発環境

```bash
# 1. API サーバー
cd /g/devwork
opencode serve --hostname 0.0.0.0 --port 4096 --cors http://localhost:3002

# 2. Web UI
cd /g/devwork/opencode
VITE_OPENCODE_SERVER_PORT=4096 bun run --cwd packages/app dev --port 3002

# 3. ブラウザ
open http://localhost:3002
```

### 4.2 本番環境（Tailscale）

```bash
# 1. Tailscale 起動
tailscale up

# 2. API サーバー起動（Tailscale IP でバインド）
opencode serve --hostname 0.0.0.0 --port 4096 --cors https://your-tailnet

# 3. Web UI 配信
opencode web

# 4. スマホからアクセス
open http://<Tailscale-IP>:4096
```

## 5. データフロー

### 5.1 セッション共有

1. PC でセッション作成
2. セッションデータは `~/.codex/sessions/` に保存
3. スマホから同じ `opencode serve` に接続
4. 同一のセッションデータにアクセス

### 5.2 モデル切替

1. ユーザーがトップバーでモデルを選択
2. `config.set()` または `session.update()` で保存
3. 次回メッセージから新しいモデルを使用

## 6. セキュリティ

| 項目 | 対策 |
|---|---|
| 認証 | Basic Auth + `auth_token` |
| 通信 | Tailscale WireGuard 暗号化 |
| ポート開放 | 不要（Tailscale 利用） |
| コード改変 | 入力検証、サニタイズ |

## 7. 監視/ログ

| 項目 | 場所 |
|---|---|
| アプリログ | `~/.local/share/opencode/log/` |
| DB | `~/.local/share/opencode/opencode.db` |
| セッション | `~/.codex/sessions/` |

## 8. 障害対応

| 障害 | 対応 |
|---|---|
| API サーバー停止 | `opencode serve` を再起動 |
| Web UI 切断 | ブラウザをリロード |
| ポート競合 | 別ポートを指定 |
| 認証エラー | `OPENCODE_SERVER_PASSWORD` を確認 |
