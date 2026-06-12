# workflow-edit-set Project Context

## 目的

この PJ は、AWS で作れる構成図エディターを参考にしつつ、構成図やワークフロー図を素早く作れる Web サイトを作るための作業領域として扱う。

初期フェーズでは、依存を増やさずにブラウザだけで動く編集 UI を作り、以下を満たすことを目標にする。

- ノードを配置できる
- ノード同士を線で接続できる
- ラベルや色を調整できる
- JSON と SVG に書き出せる
- AWS 風の見た目で、構成図のラフを短時間で作れる

## 情報配置

- 最上位ルール: `AGENTS.md`
- PJ 文脈と運用正本: `PROJECT.md`
- 文書総覧: `docs/README.md`
- 恒久運用ガイド: `docs/guide/`
- 仕様: `docs/spec/`
- 条件付き参考: `docs/condi-ref/`
- 実装記録: `docs/imp/`
- セッション開始プロンプト: `docs/imp/session-prompts/`
- グローバル Knowledge Vault 正本: `G:\Knowledge-vault`

## docs 配下の扱い

通常 `tool-set/docs` 配下に展開する文書も、この PJ では必ず `tool-set/workflow-edit-set/docs` 配下に置く。

- 正しい配置先: `G:\devwork\tool-set\workflow-edit-set\docs\...`
- この PJ で使わない配置先: `G:\devwork\tool-set\docs\...`

今後この PJ 用にドキュメントを追加する場合も、必ず `workflow-edit-set/docs` を正本とする。

## ローカル docs と Knowledge Vault の責務分離

- `workflow-edit-set/docs` は、この PJ のローカル運用文書、仕様、セッション進行管理の正本とする。
- `docs/imp/session-prompts/` は、各セッション開始時に読む基準プロンプトの置き場とする。
- `G:\Knowledge-vault` は、PJ 横断で参照する判断履歴、長期メモ、Knowledge Vault 本体の正本とする。
- `workflow-edit-set/docs` 配下には `knowledge-vault` ディレクトリやその複製を再作成しない。
- `tool-set/docs` はこの PJ の文書置き場として使わない。

## 実装方針

- まずは静的 HTML/CSS/JavaScript で成立させる。
- UI はデスクトップ中心だが、モバイルでも閲覧できるようにする。
- AWS アイコンそのものは同梱せず、AWS 風のカテゴリー色とカード表現で近い操作感を狙う。
- 将来的に React や永続化を導入できるよう、状態構造は JSON ベースで設計する。

## 今回の初期スコープ

1. PJ の運用文書とディレクトリ規約を確立する。
2. `workflow-edit-set/docs` を正本にする。
3. 構成図エディターの最小実装を作る。
4. ローカルで開いて試せる README と仕様書を用意する。
