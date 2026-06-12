# Workflow Text DSL Reference

## 目的

ワークフローをテキストで保存し、編集し、再インポートできるようにする。

## 基本構文

このエディターは 2 つの書式を読めます。

1. 独自DSL
2. Mermaid 風書式

### Mermaid 風の推奨例

```text
flowchart LR
edge["CloudFront"]
api["API Gateway"]
edge --> api
%% type edge cloudfront
%% type api apigw
%% pos edge 110 140
%% pos api 390 140
%% color edge #10b981
```

### 独自DSLの例

```text
workflow LR
node web "Web Service" type=ecs x=300 y=120 color=#f59e0b
node db "Aurora Cluster" type=aurora x=760 y=120 color=#0ea5e9
edge web -> db
```

## ルール

- 1 行目は `flowchart <direction>` または `workflow <direction>`
- `direction` は `LR`, `RL`, `TB`, `BT` を想定
- ノードは `node`
- 接続は `edge`
- コメント行は `#` から始める
- ラベルはダブルクオートで囲む
- Mermaid 風では `%%` コメントディレクティブで type / pos / color を追加する

## ノード行

```text
node <id> "<label>" type=<componentType> x=<x> y=<y> color=<hex>
```

### 必須

- `id`
- `label`
- `type`

### 任意

- `x`
- `y`
- `color`

### 例

```text
node edge "CloudFront" type=cloudfront x=110 y=140 color=#10b981
node api "API Gateway" type=apigw x=390 y=140
node web "Web Service" type=ecs
```

## 接続行

```text
edge <from> -> <to>
```

### 例

```text
edge edge -> api
edge api -> web
edge web -> db
```

## Mermaid 風ノード行

```text
<id>["<label>"]
```

### 例

```text
edge["CloudFront"]
api["API Gateway"]
db["Aurora Cluster"]
```

## Mermaid 風接続行

```text
<from> --> <to>
```

### 例

```text
edge --> api
api --> web
web --> db
```

## Mermaid 風ディレクティブ

### type

```text
%% type <id> <componentType>
```

### pos

```text
%% pos <id> <x> <y>
```

### color

```text
%% color <id> <hex>
```

## コンポーネント種別

利用可能な主な `type`:

- `ec2`
- `ecs`
- `eks`
- `fargate`
- `lambda`
- `batch`
- `s3`
- `aurora`
- `rds`
- `dynamodb`
- `redshift`
- `elasticache`
- `vpc`
- `alb`
- `apigw`
- `cloudfront`
- `route53`
- `transitgw`
- `iam`
- `cognito`
- `kms`
- `waf`
- `secrets`
- `sqs`
- `sns`
- `eventbridge`
- `stepfunctions`
- `appflow`
- `cloudwatch`
- `xray`
- `config`

## サンプル

```text
flowchart LR
edge["CloudFront"]
api["API Gateway"]
web["Web Service"]
worker["Event Worker"]
queue["Job Queue"]
db["Aurora Cluster"]
bucket["Asset Bucket"]
edge --> api
api --> web
api --> worker
worker --> queue
web --> db
web --> bucket
%% type edge cloudfront
%% type api apigw
%% type web ecs
%% type worker lambda
%% type queue sqs
%% type db aurora
%% type bucket s3
%% pos edge 110 140
%% pos api 390 140
%% pos web 690 100
%% pos worker 690 270
%% pos queue 985 270
%% pos db 985 90
%% pos bucket 1260 110
```

## エラーになりやすい点

- `edge` が未定義ノードを参照している
- ラベルのダブルクオートが閉じていない
- `type=` が存在しない
- `color=` が 6 桁 HEX になっていない
