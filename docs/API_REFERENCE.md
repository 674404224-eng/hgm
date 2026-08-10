# 策量智算 API 联调参考

> 契约版本：OpenAPI 1.1.0（P0 冻结版）
> 更新日期：2026-08-10
> 机器可读契约：[`openapi/openapi.json`](../openapi/openapi.json)
> 生成类型：[`src/types/openapi.d.ts`](../src/types/openapi.d.ts)

本文供后端开发和联调快速查阅。字段、枚举、必填项和状态码以 OpenAPI 为最终依据；本文不重复替代机器契约。

## 1. 通用约定

- API 根路径：`/api/v1`。
- 除发送验证码、登录和刷新会话外，接口使用 `Authorization: Bearer <access_token>`。
- Refresh Token 只通过 `Secure + HttpOnly + SameSite` Cookie 传递，不返回给前端 JavaScript。
- 客户端每次请求发送 `X-Request-ID`；服务端应原样返回或生成新值。
- 创建任务必须携带 UUID 格式的 `Idempotency-Key`。
- 所有时间使用 RFC 3339，例如 `2026-08-10T10:00:00+08:00`。
- 创作点使用整数；正数表示入账，负数表示扣减。
- 429 响应必须返回 `Retry-After`，单位为秒。

统一错误体：

```json
{
  "code": "TASK_INVALID_PARAMETERS",
  "message": "所选模型不支持该参数组合",
  "request_id": "req_01J...",
  "details": {
    "fields": { "duration": "unsupported" }
  }
}
```

## 2. P0 接口

| 方法 | 路径 | 用途 | 关键约束 |
|---|---|---|---|
| POST | `/auth/sms-codes` | 发送登录验证码 | 手机号/IP 限流；429 返回 `Retry-After` |
| POST | `/auth/sessions` | 手机号验证码登录 | 验证码单次消费；下发 Refresh Cookie |
| POST | `/auth/sessions/refresh` | 刷新会话 | Refresh Token 旋转 |
| DELETE | `/auth/session` | 退出登录 | 撤销会话并清 Cookie |
| GET | `/me` | 当前账户与 AID | `phone` 仅返回本人，禁止共享缓存和日志 |
| GET | `/wallet` | 创作点余额与本月用量 | 服务端账本为唯一事实来源 |
| GET | `/wallet/transactions` | 分页交易记录 | 稳定排序，不因任务删除而删除流水 |
| GET | `/models` | 当前用户可用的平台模型目录 | 不返回 Endpoint、凭证或内部连接 ID |
| POST | `/uploads/presign` | 获取素材直传地址 | MIME、大小、对象键和所有权校验 |
| GET | `/tasks` | 分页、搜索和筛选任务 | 默认 20 条，最大 100 条 |
| POST | `/tasks` | 创建生成任务 | 幂等、服务端计价、钱包预留、Outbox |
| GET | `/tasks/{task_id}` | 获取任务详情 | 必须校验当前用户所有权 |
| DELETE | `/tasks/{task_id}` | 软删除任务记录 | 状态冲突返回 409 |
| GET | `/tasks/{task_id}/result` | 获取短期播放/下载地址 | 未完成 409；已清理 410 |

## 3. 任务创建

前端明确提交用户从 `/models` 选择的 `model_id`。后端只解析该平台模型的内部 Adapter 和凭证，不进行模型推荐或二次路由。

```json
{
  "prompt": "雨夜霓虹街道，镜头贴近地面缓慢推进",
  "mode": "video",
  "model_id": "seedance-1-0-pro",
  "aspect": "16:9",
  "resolution": "1080P",
  "duration": "10s",
  "sound": true,
  "watermark": "策量智算",
  "reference_asset_id": "asset_01J...",
  "max_points": 28
}
```

服务端校验顺序：会话 → 幂等 → 基础参数 → 平台模型与能力 → 素材 → 服务端计价 → 余额 → 事务与 Outbox。

## 4. Task 响应

`Task` 使用结构化参数，不返回拼接后的 `meta`；前端自行组合展示文案。

```json
{
  "id": "task_01J...",
  "title": "雨夜霓虹产品宣传片",
  "mode": "video",
  "model_id": "seedance-1-0-pro",
  "parameters": {
    "aspect": "16:9",
    "resolution": "1080P",
    "duration": "10s",
    "sound": true,
    "watermark": "策量智算",
    "reference_asset_id": "asset_01J..."
  },
  "cost": 28,
  "status": "queued",
  "progress": 0,
  "thumbnail_url": null,
  "created_at": "2026-08-10T10:00:00+08:00",
  "finished_at": null,
  "error": null
}
```

状态枚举：`queued`、`generating`、`done`、`failed`、`cancelled`。

失败时 `error` 使用结构化对象：

```json
{
  "code": "PROVIDER_TIMEOUT",
  "message": "模型服务响应超时",
  "retryable": true,
  "details": null
}
```

## 5. 任务结果

视频和多图片统一使用 `items[]`。每个地址都是短期签名地址，默认有效期 10 分钟。

```json
{
  "task_id": "task_01J...",
  "items": [
    {
      "id": "result_01J...",
      "playback_url": "https://cdn.example.com/signed/play",
      "download_url": "https://cdn.example.com/signed/download",
      "poster_url": "https://cdn.example.com/signed/poster",
      "media_type": "video/mp4",
      "width": 1920,
      "height": 1080,
      "duration_seconds": 10
    }
  ],
  "expires_at": "2026-08-10T10:10:00+08:00"
}
```

## 6. 分页

任务和交易记录统一返回：

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0,
  "has_next": false
}
```

服务端必须使用稳定排序和唯一游标兜底；当前 P0 外部协议仍采用页码分页。

## 7. 契约变更规则

1. 先修改 `openapi/openapi.json`。
2. 运行 `npm run generate:api-types`。
3. 运行 `npm run typecheck`、`npm test`、`npm run test:contract`。
4. 破坏性变更必须提升 OpenAPI `info.version`，同步本参考、PRD 和联调说明。
5. CI 会校验生成类型是否与 OpenAPI 一致，禁止手工编辑 `src/types/openapi.d.ts`。
