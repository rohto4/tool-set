# workflow-edit-set

`site/index.html` をブラウザで開くと、依存なしで動く構成図エディターを試せます。

## この PJ のルール

- 文書は `workflow-edit-set/docs` 配下をローカル正本にする
- セッション開始プロンプトは `workflow-edit-set/docs/imp/session-prompts/` を使う
- Knowledge Vault の正本は `G:\Knowledge-vault` とする
- `workflow-edit-set/docs` 配下に `knowledge-vault` を再作成しない
- `tool-set/docs` は使わない
- 仕様は `docs/spec/architecture-editor-spec.md` を参照する
- 自前アイコン資産は `assets/icons/` 配下を使う
- テキストDSLは `docs/spec/workflow-text-dsl-reference.md` を正本にする

## 初版でできること

- パレットからノード追加
- ノード移動
- ノード接続
- ラベル編集
- 色変更
- AWS 風の自前PNGアイコン表示
- 複数選択と範囲選択
- Mermaid 風テキストDSLの Import / Export
- JSON 入出力
- SVG 書き出し
