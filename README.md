# 策量智算 Video Studio

面向 AI 视频与图片生成的前端联调项目。当前版本已经从纯 HTML 原型升级为 React + Vite 应用，内置 Mock 数据层，并提供可供后端直接实现的 OpenAPI 3.1 契约。

## 本地运行

```bash
npm install
cp .env.example .env
npm run dev
```

默认使用 Mock API，可独立体验登录、创作、任务中心、账户设置、余额交易和模型 API 配置等流程。

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

API Key 只会通过写入接口提交，前端不持久化或回显完整密钥；生产环境应由后端密钥库加密托管。

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

