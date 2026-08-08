# 后端联调说明

业务逻辑、状态机、计费、权限、数据模型与验收标准以 [`PRD_V2.0_BACKEND_READY.md`](./PRD_V2.0_BACKEND_READY.md) 为准；HTTP 请求和响应结构以 `openapi/openapi.json` 为准。

## 运行模式

- `VITE_API_MODE=mock`：默认模式，使用浏览器内存 Mock 后端，便于产品和前端独立验收。
- `VITE_API_MODE=http`：真实联调模式，所有领域数据通过 HTTP API 获取。
- `VITE_API_BASE_URL=http://localhost:8080/api/v1`：后端 API 根地址。

复制 `.env.example` 为本机环境文件并修改变量即可切换。前端接口实现位于 `src/api/`，接口契约位于 `openapi/openapi.json`。

## 后端必须满足的安全约束

1. API Key 只允许在创建或更新连接时提交；服务端加密保存，响应只返回脱敏标识和末四位。
2. 刷新令牌使用 `Secure + HttpOnly + SameSite` Cookie；前端内存中只持有短期访问令牌。
3. 创建任务必须处理 `Idempotency-Key`，避免重复扣点和重复创建。
4. 扣点、任务创建和失败退款必须具备事务一致性或可靠补偿机制。
5. 播放、下载和上传地址必须是短期签名地址，不返回对象存储永久公开地址。
6. 服务端返回或透传 `X-Request-ID`，便于前后端和日志系统定位错误。

## 前端已经接入的流程

- 手机号验证码发送、登录和退出。
- 当前账户、AID、余额和交易记录读取。
- 模型连接读取、新增、更新、启停和删除。
- 素材预签名直传。
- 创建任务、分页读取任务、轮询进度、删除任务和获取播放地址。
- 统一超时、网络异常和业务错误提示。

## 建议联调顺序

1. `/auth/sms-codes`、`/auth/sessions`、`/me`。
2. `/wallet`、`/wallet/transactions`。
3. `/providers` 全套 CRUD 与验证。
4. `/uploads/presign` 和对象存储 CORS。
5. `/tasks` 创建、列表、状态更新和结果播放。
6. 余额不足、重复请求、模型失败、上传失败和签名过期等异常场景。

## 状态同步

当前前端每 4 秒轮询任务列表。后端可以先按轮询实现；如切换 SSE 或 WebSocket，应保持 `Task` 数据结构和状态枚举不变，以减少前端改造成本。

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

- 禁止在构建产物、日志、埋点或错误监控中出现完整 API Key。
- 配置上传大小、MIME 白名单、病毒扫描和内容安全检查。
- 对验证码、登录、任务创建和连接验证实施限流。
- 覆盖跨租户越权、任务结果越权和 AID 枚举攻击测试。
- 建立任务消费、退款、交易记录三方对账机制。
