# OpenCode-Link — API 連携設計書

## 1. SDK

- **使用 SDK**: `@opencode-ai/sdk`
- **インポート**: `import type { Session } from "@opencode-ai/sdk/v2/client"`
- **接続方式**: HTTP + SSE（Server-Sent Events）

## 2. 接続設定

### 2.1 開発環境

```ts
const getCurrentUrl = () => {
  if (location.hostname.includes("opencode.ai")) return "http://localhost:4096"
  if (import.meta.env.DEV)
    return `http://${import.meta.env.VITE_OPENCODE_SERVER_HOST ?? "localhost"}:${import.meta.env.VITE_OPENCODE_SERVER_PORT ?? "4096"}`
  return location.origin
}
```

### 2.2 本番環境

`opencode web` コマンドで同一オリジン配信。

## 3. 主要 API 一覧

| 機能 | SDK メソッド | HTTP エンドポイント |
|---|---|---|
| ヘルスチェック | - | `GET /global/health` |
| 設定取得 | `config.get()` | `GET /global/config` |
| プロバイダ一覧 | `config.providers()` | `GET /config/providers` |
| セッション一覧 | `session.list()` | `GET /session` |
| セッション作成 | `session.create()` | `POST /session` |
| セッション更新 | `session.update()` | `PATCH /session/:id` |
| セッション削除 | `session.delete()` | `DELETE /session/:id` |
| メッセージ送信 | `session.prompt()` | `POST /session/:id/prompt` |
| メッセージ一覧 | `session.messages()` | `GET /session/:id/messages` |
| エージェント一覧 | `app.agents()` | `GET /app/agents` |
| イベント購読 | `event.subscribe()` | `GET /events` |
| 認証設定 | `auth.set()` | `PUT /auth/:id` |

## 4. 認証

### 4.1 サーバー認証

- タイプ: Basic Auth
- ユーザー名: `opencode`
- パスワード: `OPENCODE_SERVER_PASSWORD` 環境変数

### 4.2 Web UI 認証

- `auth_token` URL パラメータ
- `localStorage` に保存されたデフォルトサーバー URL

## 5. データモデル

### 5.1 Session

```ts
interface Session {
  id: string
  title: string
  directory: string
  createdAt: string
  updatedAt: string
  model?: {
    providerID: string
    modelID: string
  }
}
```

### 5.2 Provider

```ts
interface Provider {
  id: string
  name: string
  source: string
  env: string[]
  models: Record<string, Model>
}
```

### 5.3 Agent

```ts
interface Agent {
  id: string
  name: string
  mode: "primary" | "subagent" | "all"
  description?: string
  permissions?: Permission[]
}
```

## 6. エラーハンドリング

| ステータス | 原因 | 対応 |
|---|---|---|
| 401 | 認証エラー | ログイン画面表示 |
| 404 | リソース不在 | エラーメッセージ表示 |
| 500 | サーバーエラー | リトライ + エラー通知 |
| 503 | メンテナンス | 再接続待機 |

## 7. ポーリング/ストリーミング

- イベント: SSE 経由 `/events`
- 接続断: 自動再接続
- 再接続間隔: 指数関数的バックオフ
