# 第一期平台模型与凭证管理决策

> 文档版本：V1.1
>
> 决策状态：已确认，作为第一期开发基线
>
> 更新日期：2026-08-10
> 适用范围：Web 前台、用户中心、模型目录、任务创建、计费和供应商调用

## 1. 决策摘要

第一期只允许平台创建、保存和使用模型供应商 API Key。普通用户不能新增、编辑、删除、验证或使用第三方 API Key。

用户只负责：

1. 从平台开放的模型目录中选择模型。
2. 输入提示词、上传参考素材并选择生成参数。
3. 确认预计创作点后创建任务。

平台负责：

1. 供应商账号、API Key、Endpoint 和调用配额。
2. 模型目录、能力、状态和点数价格。
3. Agent、任务编排、供应商调用、结果存储和失败退款。

创作点覆盖平台提供的模型调用、Agent 智能处理、任务编排和结果存储成本。第一期不存在用户自带 Key（BYOK）和双重计费问题。

## 2. 用户界面范围

用户中心只保留：

- 账户：姓名、手机号、AID、系统头像。
- 余额：可用创作点、用量和交易记录。

第一期不向用户提供：

- API Keys 导航和页面。
- 新增、编辑、启停、验证或删除供应商连接。
- API Endpoint 输入。
- 完整或脱敏 API Key 展示与复制。
- 用户级供应商健康状态。

首页模型选择仍显示模型名称与供应商名称，例如“Seedance 1.0 Pro · 火山方舟”，但这里只代表平台开放的模型目录，不代表用户自己的连接。

## 3. 用户 API 契约

### 3.1 模型目录

```http
GET /api/v1/models
```

只返回可供当前用户选择的模型信息：

```json
{
  "items": [
    {
      "id": "seedance-1-0-pro",
      "name": "Seedance 1.0 Pro",
      "provider_name": "火山方舟",
      "mode": "video",
      "status": "available",
      "base_points": 28,
      "capabilities": {
        "aspects": ["16:9", "9:16", "1:1"],
        "resolutions": ["720P", "1080P"],
        "durations": [5, 10],
        "sound": true,
        "reference_image": true,
        "reference_video": false
      }
    }
  ],
  "total": 1
}
```

不得返回平台 Endpoint、凭证 ID、密钥尾号、配额和内部 Adapter 配置。

### 3.2 创建任务

```json
{
  "model_id": "seedance-1-0-pro",
  "mode": "video",
  "prompt": "银色汽车沿海岸公路行驶",
  "aspect": "16:9",
  "resolution": "1080P",
  "duration": "10s",
  "sound": true,
  "reference_asset_id": "asset_01H...",
  "max_points": 28
}
```

规则：

- `model_id` 必须来自平台模型目录，不能提交任意供应商模型名。
- `max_points` 是用户确认的最高点数，不是最终计价依据。
- 后端按模型和参数重新计价，最终费用不得超过 `max_points`。
- 前端不提交 Provider 连接 ID、Endpoint 或 API Key。
- 模型不可用时返回 `MODEL_UNAVAILABLE`，不得静默切换模型。

### 3.3 移除的用户接口

第一期公开 OpenAPI 不包含：

```text
GET    /providers
POST   /providers
PATCH  /providers/{provider_id}
DELETE /providers/{provider_id}
POST   /providers/{provider_id}/verify
```

供应商配置属于内部运维能力，不与用户 API 共用权限和路由。

## 4. 后端内部模型

建议使用平台级数据结构：

### provider_credentials

| 字段 | 说明 |
|---|---|
| id | 内部随机 ID |
| provider_code | 供应商代码 |
| environment | development / staging / production |
| secret_reference | Secret Manager/KMS 引用，不保存明文 |
| enabled | 是否允许新任务使用 |
| health_status | unknown / valid / invalid / degraded |
| quota_snapshot | 可选配额摘要 |
| last_verified_at | 最近健康验证时间 |

### platform_models

| 字段 | 说明 |
|---|---|
| id | 对用户稳定的 `model_id` |
| credential_id | 内部凭证关联，不向用户返回 |
| provider_model_key | 供应商真实模型标识 |
| name / provider_name | 用户展示字段，与 OpenAPI 1.1.0 保持一致 |
| mode | video / image |
| capabilities | 画幅、分辨率、时长、音频和素材能力 |
| pricing_rule | 服务端点数价格规则 |
| status | available / maintenance / offline |
| adapter_type | 内部适配器类型 |
| enabled | 平台运营开关 |

任务创建时保存模型名称、供应商、能力、价格和 Adapter 版本快照，避免后续配置变化影响历史解释与对账。

## 5. 密钥安全边界

- API Key 只存储在平台 Secret Manager/KMS，不进入前端、普通数据库字段、日志、消息或错误响应。
- API 服务只保存和传递 `credential_id/secret_reference`，不能读取完整密钥。
- 只有 Provider Adapter Worker 的运行身份拥有按引用解密权限。
- 开发、预发布和生产使用不同密钥与权限。
- 密钥轮换不需要修改前端或历史任务。
- 内部管理操作必须记录操作者、时间、供应商、环境和变更类型，但不记录密钥值。
- 第一阶段可用受控脚本或云控制台维护凭证，不要求建设运营后台。

## 6. 计费与退款

第一期统一采用平台计费模式：

```text
用户创作点 = 模型调用 + Agent + 编排 + 存储等平台服务成本的产品化计价
```

建议流程：

1. 创建任务时按服务端价格预留点数。
2. 供应商确认受理后结算任务消耗。
3. Agent 或平台在调用供应商前失败：全部释放，不产生任务消耗。
4. 供应商受理前失败：全部释放。
5. 供应商受理后失败：第一期默认等额退款。
6. 平台技术重试不重复向用户扣点。
7. 实际平台成本和用户点数分开记录，便于毛利与供应商对账。

交易流水建议增加或内部保留：`model_id`、`provider_code`、`task_id`、`pricing_version` 和 `provider_cost`。

## 7. 模型选择与 Agent

用户在前端明确选择 `model_id`。Agent 不做模型路由，只针对选定模型完成：

- 提示词优化。
- 参考素材理解。
- 负向提示词和镜头约束。
- 模型能力范围内的参数建议。
- 可选结果质量评估。

后端 `Selected Model Resolver` 负责：

- 校验平台模型存在且 `status=available`。
- 校验模式和参数符合能力集合。
- 解析内部 Credential、Adapter 和供应商模型标识。
- 获取创建时能力与价格快照。

选定模型不可用时明确失败，不能在用户不知情时改用其他模型。

## 8. 内部运维能力

第一期至少需要：

- 平台模型和价格配置的受控发布流程。
- Provider Key 轮换和撤销流程。
- 定时健康检查和配额预警。
- Provider 认证失败、限流和余额不足告警。
- 模型状态开关，异常时可从 `/models` 隐藏或标记维护。
- 每日任务、创作点、平台模型成本和供应商账单对账。

运营后台可作为后续阶段。第一期可通过 Secret Manager、数据库迁移和受控运维脚本完成。

## 9. 验收标准

- [ ] 用户中心不存在 API Keys 页面和入口。
- [ ] 浏览器请求和构建产物不存在 API Key、Endpoint 或凭证标识。
- [ ] `GET /models` 只返回公开模型目录。
- [ ] `POST /tasks` 必须使用 `model_id`，任意模型名无法绕过校验。
- [ ] `Task.parameters` 仅回显用户确认并经平台终审的公开参数，不包含 Provider 内部请求或凭证引用。
- [ ] `TaskResult.items[]` 只返回短期签名媒体地址，不暴露供应商原始地址。
- [ ] 停用或维护中的模型不能创建新任务。
- [ ] 模型不可用时不静默切换。
- [ ] Agent 无权读取 Provider Key、修改余额或替换用户模型。
- [ ] Provider Key 仅由 Adapter Worker 的受控身份读取。
- [ ] Agent/平台调用失败不会重复扣点。
- [ ] 任务模型、价格、能力和 Adapter 版本可追溯。
- [ ] 平台账本和供应商账单可按任务对账。

## 10. 后续范围

以下能力不属于第一期：

- 用户自带 API Key（BYOK）。
- 用户级 Provider 连接与 Endpoint。
- 用户连接验证、启停、删除和健康状态。
- 智能模型路由。
- 供应商凭证运营后台。

未来若引入 BYOK，必须作为新的计费和权限模式单独设计，不能复用第一期用户接口直接开放。
