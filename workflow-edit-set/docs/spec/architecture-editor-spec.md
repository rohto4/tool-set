# Architecture Editor Spec

## 概要

AWS の構成図エディターを参考にした、ブラウザ完結型のワークフロー編集サイトを実装する。
`workflow-edit-set/site/` 配下の静的ファイルで動作し、サンプルワークフローの編集、テキスト入出力、画像出力までを可能にする。

## 主要機能

- パレットからノードを追加
- ノードの移動
- ノードの複数選択
- 範囲選択
- ノード間接続
- ノード削除
- 接続削除
- Undo / Redo
- 一般的なショートカット
- 整列、均等配置、レイヤー移動
- テキスト DSL Import / Export
- JSON 保存
- JSON 読み込み
- SVG 出力
- PNG 出力
- localStorage 自動保存
- 進捗レビュー表示
- 複数サンプルテンプレート読み込み

## 画面構成

- 左: サービスパレット
- 中央: 編集キャンバス
- 右: プロパティパネル
- 右下: テキスト DSL パネル
- 右中: Progress Review パネル

## データモデル

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "ec2",
      "label": "EC2",
      "x": 120,
      "y": 120,
      "color": "#f59e0b"
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "from": "node-1",
      "to": "node-2"
    }
  ]
}
```

## 操作仕様

- 追加時はグリッドに合わせて配置する
- 最新状態をブラウザの localStorage に保存する
- 接続は一方向エッジとして扱う

## ショートカット

- `Ctrl/Cmd+Z`: Undo
- `Ctrl/Cmd+Y`, `Ctrl/Cmd+Shift+Z`: Redo
- `Ctrl/Cmd+A`: Select All
- `Ctrl/Cmd+C`: Copy
- `Ctrl/Cmd+X`: Cut
- `Ctrl/Cmd+V`: Paste
- `Ctrl/Cmd+D`: Duplicate
- `Ctrl/Cmd+S`: JSON Export
- `Ctrl/Cmd+E`: Text Panel
- `Ctrl/Cmd+[`: Send Back
- `Ctrl/Cmd+]`: Bring Front
- `Delete` / `Backspace`: Delete
- `Arrow`: 1px nudge
- `Shift+Arrow`: 10px nudge
- `Escape`: 選択解除、接続解除、パネルを閉じる

## 編集補助

- 複数ノードの整列
- 複数ノードの均等配置
- Snap to Grid の ON/OFF
- Connect Mode の ON/OFF

## デモ補助

- サンプルワークフロー読み込み
- Web App / Event Mesh / Data Pipeline のテンプレート切り替え
- Quick Help パネル
- ブラウザの localStorage に自動保存
- 右カラムの Progress Review と SNS 向け要約コピー

## テキスト DSL

- Mermaid `flowchart` を参考にした独自 DSL を採用する
- 仕様は `workflow-text-dsl-reference.md`
- ノード定義、接続定義、位置定義をテキストで表現する

## ビジュアル方針

- AWS 風の情報設計を参考にしつつ、少しソリッドな印象の UI にする
- ダークネイビー基調のノードカードを使う
- アクセントカラーは種別ごとに調整する
