# Tech Stack — OpenCode-Link

> OpenCode の既存コードベース（`anomalyco/opencode`）をフォークし、
> Codex ライクな GUI クライアントとして拡張するための技術スタック選定書。
>
> **前提**: ゼロからの開発ではなく、既存リポジトリのフォーク＋改修。

## 既存リポジトリ構造

```
anomalyco/opencode (dev branch)
├── packages/
│   ├── opencode/        # コアエンジン（CLI + Server + 全ビジネスロジック）
│   ├── app/             # Web フロントエンド（SolidJS + Vite）★ 改修対象
│   ├── ui/              # 共有 UI コンポーネントライブラリ（SolidJS）★ 改修対象
│   ├── desktop/         # ネイティブデスクトップアプリ（Tauri）★ 改修対象
│   ├── sdk/js/          # TypeScript SDK（OpenAPI から自動生成）
│   ├── plugin/          # プラグインインターフェース型定義
│   └── web/             # 公式サイト（opencode.ai）
└── sdks/vscode/         # VS Code 拡張
```

**フォーク元**: `https://github.com/anomalyco/opencode` (dev branch)
**ライセンス**: MIT

---

## 既存技術（フォーク時点で利用可能）

| 技術 | バージョン | 用途 | 改修方針 |
|---|---|---|---|
| **SolidJS** | — | Web UI フレームワーク | そのまま使用。React ではないので注意。 |
| **Tauri** | v2 | デスクトップシェル | そのまま使用。拡張は Rust で記述。 |
| **Vite** | — | バンドラ | そのまま使用。 |
| **TypeScript** | — | 型安全性 | そのまま使用。 |
| **@opencode-ai/sdk** | — | API クライアント | そのまま使用。全 API が型安全に利用可能。 |
| **OpenAPI 3.1** | — | サーバー API 定義 | `/doc` から自動生成。SDK に反映済み。 |
| **opentui** | — | TUI フレームワーク | TUI のみ。GUI には影響なし。 |

---

## 改修で追加する技術

| 技術 | 用途 | 選定理由 |
|---|---|---|
| **@opencode-ai/sdk** | 全 API 通信 | 既存 SDK をそのまま活用。`session.prompt()`, `config.providers()`, `app.agents()`, `event.subscribe()` 等、必要な API は全て網羅済み。 |
| **Tailwind CSS v4** | スタイリング拡張 | 既存 UI のスタイルを Codex ライクに改造する際に使用。既存のテーマシステムと統合。 |
| **Recharts** | 使用量チャート | プロバイダ別・モデル別のトークン使用量・コスト可視化。SolidJS との互換性は `solid-recharts` で対応。 |
| **CodeMirror 6** | コード表示 | コードブロックのシンタックスハイライト強化。既存の UI コンポーネントに統合。 |

---

## 不要になった技術（ゼロ開発前提からの変更点）

| 技術 | なぜ不要か |
|---|---|
| ~~React 19~~ | SolidJS が既に採用されている。React に変更する理由がない。 |
| ~~Zustand~~ | SolidJS のネイティブ reactivity（`createSignal`, `createStore`）で十分。 |
| ~~TanStack Query~~ | SDK が内部でデータ管理を行う。追加のクエリライブラリは冗長。 |
| ~~openapi-fetch~~ | `@opencode-ai/sdk` が同等の機能を提供。 |
| ~~Radix UI~~ | 既存の `packages/ui` にコンポーネントがある。Codex ライクにカスタマイズするだけ。 |

---

## 改修アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│  OpenCode-Link (Forked from anomalyco/opencode)              │
│                                                              │
│  packages/desktop (Tauri) ──────────────────────────────────┐│
│  ┌──────────────────────────────────────────────────────┐  ││
│  │  packages/app (SolidJS + Vite) ★ 改修中心            │  ││
│  │  ├─ /session/:id  セッション画面（既存）              │  ││
│  │  ├─ /settings     設定画面（★ 新規追加）             │  ││
│  │  │   ├─ プロバイダ管理                              │  ││
│  │  │   ├─ モデル一覧                                  │  ││
│  │  │   ├─ エージェント管理                            │  ││
│  │  │   └─ 使用量ダッシュボード                        │  ││
│  │  ├─ トップバー（★ 改修）                           │  ││
│  │  │   ├─ モデルセレクター                            │  ││
│  │  │   ├─ エージェント切替                            │  ││
│  │  │   └─ 使用量ミニウィジェット                      │  ││
│  │  └─ サイドバー（★ 改修）                           │  ││
│  │      ├─ セッション一覧                              │  ││
│  │      └─ エージェント on/off トグル                  │  ││
│  └──────────────────────────────────────────────────────┘  ││
│                          │                                   ││
│                  @opencode-ai/sdk                             ││
│                          │                                   ││
│  ┌───────────────────────▼───────────────────────────────┐  ││
│  │  packages/opencode (サーバー) — 改修不要              │  ││
│  │  /sessions, /config, /auth, /tui, /events             │  ││
│  └───────────────────────────────────────────────────────┘  ││
└─────────────────────────────────────────────────────────────┘
```

---

## SDK API マッピング（実装に必要な機能 → SDK メソッド）

| 必要機能 | SDK メソッド | 既存/新規 |
|---|---|---|
| セッション一覧取得 | `session.list()` | 既存 |
| セッション作成 | `session.create({ body })` | 既存 |
| セッション削除 | `session.delete({ path })` | 既存 |
| セッション更新 | `session.update({ path, body })` | 既存 |
| メッセージ送信 | `session.prompt({ path, body })` | 既存 |
| メッセージ一覧 | `session.messages({ path })` | 既存 |
| イベントストリーム | `event.subscribe()` | 既存 |
| プロバイダ一覧 | `config.providers()` | 既存 |
| 設定取得 | `config.get()` | 既存 |
| エージェント一覧 | `app.agents()` | 既存 |
| 認証設定 | `auth.set({ path, body })` | 既存 |
| TUI 制御 | `tui.*` | 既存 |
| ファイル検索 | `find.text()`, `find.files()` | 既存 |
| 使用量統計 | CLI: `opencode stats` | **★ API が未確認。CLI fallback 必要の可能性** |

---

## 開発環境構築手順

```bash
# 1. フォーク
gh repo fork anomalyco/opencode --clone
cd opencode

# 2. ブランチ切替（dev がデフォルト）
git checkout dev

# 3. 依存インストール（Bun）
bun install

# 4. 開発サーバー起動
bun dev serve           # API サーバー起動
bun run --cwd packages/app dev    # Web UI 開発サーバー

# 5. デスクトップアプリ起動
bun run --cwd packages/desktop tauri dev
```

---

## 注意点

1. **SolidJS の学習コスト**: React とは異なる reactivity モデル。`createSignal`, `createEffect`, `For` コンポーネント等の理解が必要。
2. **Bun パッケージマネージャ**: npm/yarn ではなく Bun を使用。`bun install`, `bun run` 等。
3. **モノレポ構造**: パッケージ間の依存関係を理解する必要がある。`workspace:*` プロトコル。
4. **デフォルトブランチが `dev`**: `main` ではない。フォーク元のブランチ戦略に従う。
5. **使用量統計の API 対応**: `opencode stats` は CLI コマンド。HTTP API で同等のデータが取得できるかは要確認。できない場合は `opencode stats --format json` の CLI 呼び出しを検討。
