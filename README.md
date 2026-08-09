# 策量智算 Video Studio

面向 AI 视频与图片生成的前端联调项目。当前版本已经从纯 HTML 原型升级为 React + Vite 应用，内置 Mock 数据层，并提供可供后端直接实现的 OpenAPI 3.1 契约。

## 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

默认使用 Mock API，可独立体验登录、平台模型创作、任务中心、账户设置和余额交易等流程。

## 后端联调

将 `.env` 调整为：

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

然后重新启动开发服务。接口约定见：

- `openapi/openapi.json`：OpenAPI 3.1 接口文档
- `docs/BACKEND_INTEGRATION.md`：联调说明与安全边界
- `docs/PRD_V2.0_BACKEND_READY.md`：后端可执行版 PRD
- `docs/AGENT_ORCHESTRATION_BACKEND_DESIGN.md`：视频生成 Agent 编排后端设计
- `docs/PHASE1_PLATFORM_MODEL_POLICY.md`：第一期平台模型与凭证管理决策

第一期 API Key 仅由平台在服务端密钥库托管，用户端不提供第三方 Key 的新增、管理或回显能力。

## 质量检查

```bash
npm run test:contract
npm run test:sites
npm run build
```

## 目录

- `src/`：React 页面、交互与 API 适配层
- `src/api/`：Mock/HTTP 双模式数据访问层
- `openapi/`：后端接口契约
- `docs/`：PRD 与联调说明
- `worker/`：静态站点运行入口
- `tests/`：契约和运行时测试
