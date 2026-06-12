# Workflow Text DSL Reference

## 目的

ワークフローをテキストで保存し、編集し、再インポートできるようにする。

## 基本構文

```text
workflow LR
node web "Web Service" type=ecs x=300 y=120 color=#f59e0b
node db "Aurora Cluster" type=aurora x=760 y=120 color=#0ea5e9
edge web -> db
```

## ルール

- 1 行目は任意で `workflow <direction>`
- `direction` は `LR`, `RL`, `TB`, `BT` を想定
- ノードは `node`
- 接続は `edge`
- コメント行は `#` から始める
- ラベルはダブルクオートで囲む

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
workflow LR
node edge "CloudFront" type=cloudfront x=110 y=140
node api "API Gateway" type=apigw x=390 y=140
node web "Web Service" type=ecs x=690 y=100
node worker "Event Worker" type=lambda x=690 y=270
node queue "Job Queue" type=sqs x=985 y=270
node db "Aurora Cluster" type=aurora x=985 y=90
node bucket "Asset Bucket" type=s3 x=1260 y=110
edge edge -> api
edge api -> web
edge api -> worker
edge worker -> queue
edge web -> db
edge web -> bucket
```

## エラーになりやすい点

- `edge` が未定義ノードを参照している
- ラベルのダブルクオートが閉じていない
- `type=` が存在しない
- `color=` が 6 桁 HEX になっていない

