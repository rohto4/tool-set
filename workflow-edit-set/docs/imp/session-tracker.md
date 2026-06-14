# Session Tracker

## Status Legend

- `planned`: 未着手
- `in_progress`: 作業中
- `pass`: セッション完了条件を満たした
- `hold`: 保留

## Session Table

| Session | Plan | Actual | Remaining | Status |
| --- | --- | --- | --- | --- |
| UI kit foundation | `site/ui-kit.html` を見た目正本として整備し、本体を軽く寄せる | UI キット正本、共通スタイル、本体導線、優先順位整理まで完了 | ハンドパン以降の実装は次セッション | `pass` |
| Viewport controls | ハンドパンと背景グリッド追従を実装する | 未着手 | カメラ座標、グリッド追従、描画更新 | `planned` |
| Annotation layer | テキストボックス追加を実装する | 未着手 | テキスト選択、編集、保存形式 | `planned` |
| Region layer | 領域塗りを実装する | 未着手 | 領域作成、塗り、ラベル、重なり制御 | `planned` |

## Current Recommendation

次セッションは `site/app.js` のビュー座標を整えて、ハンドパンと背景グリッド追従をまとめて着手する。
