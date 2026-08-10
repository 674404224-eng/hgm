# 后端联调说明

> 文档版本：V1.1
> 更新日期：2026-08-10
> 接口基线：OpenAPI 1.1.0（P0 冻结版）

业务逻辑、状态机、计费、权限、数据模型与验收标准以 [`PRD_V2.0_BACKEND_READY.md`](./PRD_V2.0_BACKEND_READY.md) 为准；HTTP 请求和响应结构以 [`openapi/openapi.json`](../openapi/openapi.json) 为准；接口示例见 [`API_REFERENCE.md`](./API_REFERENCE.md)。

## 运行模式

- `VITE_API_MODE=mock`：默认模式，使用浏览器内存 Mock 后端，便于产品和前端独立验收。
- `VITE_API_MODE=http`：真实联调模式，所有领域数据通过 HTTP API 获取。
- `VITE_API_BASE_URL=http://localhost:8080/api/v1`：后端 API 根地址。

复制 `.env.example` 为本机环境文件并修改变量即可切换。前端接口实现位于 `src/api/`，接口契约位于 `openapi/openapi.json`。

## 前端联调架构

- React Router 负责 `/`、`/tasks`、`/settings/account`、`/settings/balance`、`/login` 的真实 URL 路由。
- TanStack Query 负责账户、钱包、交易记录、平台模型和任务数据；任务列表每 4 秒轮询。
- React Hook Form + Zod 负责登录表单校验。
- `src/api/index.ts` 是 HTTP/Mock 双模式入口，`src/api/hooks.ts` 是 Query 访问层。
- `src/types/openapi.d.ts` 必须由 OpenAPI 生成，禁止手工修改；`src/types/domain.ts` 只做领域别名。

## 后端必须满足的安全约束

1. 第一期 API Key 仅由平台在 Secret Manager/KMS 中托管；用户 API 不接收、读取或管理第三方 Key，只有 Provider Adapter Worker 可按内部引用读取。
2. 刷新令牌使用 `Secure + HttpOnly + SameSite` Cookie；前端内存中只持有短期访问令牌。
3. 创建任务必须处理 `Idempotency-Key`，避免重复扣点和重复创建。
4. 扣点、任务创建和失败退款必须具备事务一致性或可靠补偿机制。
5. 播放、下载和上传地址必须是短期签名地址，不返回对象存储永久公开地址。
6. 服务端返回或透传 `X-Request-ID`，便于前后端和日志系统定位错误。

## 前端已经接入的流程

- 手机号验证码发送、登录和退出。
- 当前账户、AID、余额和交易记录读取。
- 平台开放模型目录读取；前端只提交平台 `model_id`。
- 素材预签名直传。
- 创建任务、分页读取任务、轮询进度、删除任务和获取播放地址。
- 统一超时、网络异常和业务错误提示。

任务响应已采用 P0 结构化契约：

- `Task.parameters` 保存画幅、清晰度、时长/数量、音频、水印和素材引用；不再返回展示字符串 `meta`。
- 时间字段统一为 `created_at`、`finished_at`，使用 RFC 3339。
- 失败信息使用 `TaskError { code, message, retryable, details }`。
- 视频和多图片结果统一使用 `TaskResult.items[]`。
- 任务和交易分页统一返回 `has_next`。

## 建议联调顺序

1. `/auth/sms-codes`、`/auth/sessions`、`/me`。
2. `/wallet`、`/wallet/transactions`。
3. `/models` 平台模型目录、能力、状态和点数价格。
4. `/uploads/presign` 和对象存储 CORS。
5. `/tasks` 创建、列表、状态更新和结果播放。
6. 余额不足、重复请求、模型失败、上传失败和签名过期等异常场景。

## 状态同步

当前前端每 4 秒轮询任务列表。后端可以先按轮询实现；如切换 SSE 或 WebSocket，应保持 `Task` 数据结构和状态枚举不变，以减少前端改造成本。

## 契约与 CI

后端或前端修改接口时必须按顺序执行：

```bash
npm run generate:api-types
npm run typecheck
npm test
npm run test:contract
npm run build
npm run test:sites
npm run test:e2e
```

GitHub Actions 会校验生成类型无漂移、OpenAPI 关键字段、单元测试、生产构建、Sites 产物和浏览器核心流程。

## 错误格式

所有非 2xx 响应统一返回：

```json
{
  "code": "INSUFFICIENT_BALANCE",
  "message": "创作点不足",
  "request_id": "req_01H...",
  "details": {}
}
```

## 生产发布前检查

- 禁止在浏览器请求、构建产物、普通数据库、日志、埋点、消息和错误监控中出现平台 API Key。
- 配置上传大小、MIME 白名单、病毒扫描和内容安全检查。
- 对验证码、登录、任务创建和连接验证实施限流。
- 覆盖跨租户越权、任务结果越权和 AID 枚举攻击测试。
- 建立任务消费、退款、交易记录三方对账机制。
