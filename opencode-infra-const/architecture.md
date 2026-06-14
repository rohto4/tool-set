# OpenCode-Link — システム設計書

## 1. アーキテクチャ

```
┌─────────────────────────────────────────────────┐
│ ブラウザ (PC / スマホ)                          │
│ http://<host>:3002                               │
│ packages/app (SolidJS)                           │
└──────────────┬──────────────────────────────────┘
               │ HTTP (Vite proxy)
               ▼
┌─────────────────────────────────────────────────┐
│ opencode serve                                   │
│ http://127.0.0.1:4096                            │
│ セッション管理 / API / 認証                      │
└─────────────────────────────────────────────────┘
```

## 2. ポート定義

| 役割 | ポート | 起動コマンド |
|---|---|---|
| API サーバー | 4096 | `opencode serve --port 4096` |
| Web UI (Vite) | 3002 | `bun run --cwd packages/app dev --port 3002` |

## 3. 接続方法

### 方法A: Vite プロキシ（開発用）

`packages/app/vite.config.ts` に追加:

```ts
server: {
  proxy: {
    "/api": {
      target: "http://127.0.0.1:4096",
      changeOrigin: true,
    },
  },
},
```

### 方法B: 環境変数（開発用）

`entry.tsx` の `getCurrentUrl()` が参照する環境変数:

```
VITE_OPENCODE_SERVER_HOST=localhost
VITE_OPENCODE_SERVER_PORT=4096
```

### 方法C: 同一オリジン（本番用）

`opencode web` コマンドでフロントエンドと API を同一オリジンで配信。

## 4. 認証

- API サーバー: Basic Auth (`OPENCODE_SERVER_PASSWORD`)
- Web UI: `auth_token` パラメータ or デフォルト設定

## 5. 正しい起動手順

```bash
# Step 1: API サーバー起動
cd /g/devwork
opencode serve --port 4096 --cors http://localhost:3002

# Step 2: Web UI 起動（別ターミナル）
cd /g/devwork/opencode
VITE_OPENCODE_SERVER_PORT=4096 bun run --cwd packages/app dev --port 3002

# Step 3: ブラウザでアクセス
open http://localhost:3002
```

## 6. 未解決事項

| 問題 | 現状 | 解決策 |
|---|---|---|
| ポート競合 | 複数の opencode serve プロセスが残る | 起動前に kill、固定ポート使用 |
| Vite プロキシ未設定 | フロントが API に接続できない | vite.config.ts に追加 |
| 環境変数未設定 | デフォルトポート 4096 を参照 | VITE_OPENCODE_SERVER_PORT を設定 |
