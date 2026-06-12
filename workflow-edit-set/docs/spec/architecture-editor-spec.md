# Architecture Editor Spec

## 目的

AWS 風の構成図を手早く組めるローカル Web エディターを提供する。

## 必須機能

- パレットからノードを追加
- ノード移動
- ノード選択
- 複数選択
- 範囲選択
- ノード名変更
- ノード色変更
- ノード種別ごとのアイコン表示
- ノード削除
- 接続線の作成
- Undo / Redo
- 一般的ショートカット
- テキストDSL Import / Export
- JSON 保存
- JSON 読み込み
- SVG 書き出し

## 画面構成

- 左: サービスパレット
- 中央: 編集キャンバス
- 右: プロパティパネル
- 上: 操作ツールバー
- 右下: テキストDSL パネル

## データモデル

```json
{
  "nodes": [
    {
      "id": "node-1",
      "type": "compute",
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

## 非機能

- 依存なしで動作する
- 最新主要ブラウザで閲覧可能
- 単一フォルダの静的配信で開ける

## 操作方針

- `Ctrl/Cmd+Z`: Undo
- `Ctrl/Cmd+Y`, `Ctrl/Cmd+Shift+Z`: Redo
- `Ctrl/Cmd+A`: Select All
- `Ctrl/Cmd+C`: Copy
- `Ctrl/Cmd+X`: Cut
- `Ctrl/Cmd+V`: Paste
- `Ctrl/Cmd+D`: Duplicate
- `Delete` / `Backspace`: Delete
- `Arrow`: 1px nudge
- `Shift+Arrow`: 10px nudge

## テキストDSL

- Mermaid 記法を参考にした独自DSLを採用する
- 正本は `workflow-text-dsl-reference.md`
- ノード行、接続行、全体方向行で構成する

## ビジュアル方針

- AWS 公式アイコンは使わず、自前のPNGアイコンを採用する
- ダークネイビー基調のソリッドなノードカードを使う
- アクセント色は種別ごとに維持する
