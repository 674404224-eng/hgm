import { readFile } from "node:fs/promises";

const document = JSON.parse(await readFile(new URL("../openapi/openapi.json", import.meta.url), "utf8"));
const requiredPaths = ["/auth/sms-codes", "/auth/sessions", "/auth/sessions/refresh", "/me", "/wallet", "/wallet/transactions", "/models", "/uploads/presign", "/tasks", "/tasks/{task_id}/result"];
if (document.openapi !== "3.1.0") throw new Error("OpenAPI version must be 3.1.0");
if (document.info.version !== "1.1.0") throw new Error("P0 frozen API version must be 1.1.0");
for (const path of requiredPaths) if (!document.paths[path]) throw new Error(`Missing OpenAPI path: ${path}`);
if (!document.components?.schemas?.Error) throw new Error("Missing shared Error schema");
if (!document.components?.securitySchemes?.bearerAuth) throw new Error("Missing bearerAuth security scheme");
if (document.paths["/providers"]) throw new Error("User-facing provider management must not exist in phase one");
if (!document.components?.schemas?.CreateTaskRequest?.required?.includes("model_id")) throw new Error("CreateTaskRequest must require model_id");
if (!document.components.schemas.CreateTaskRequest.required.includes("max_points")) throw new Error("CreateTaskRequest must require max_points");
if (!document.components.schemas.CreateTaskRequest.properties.count) throw new Error("CreateTaskRequest must support image count");
const task = document.components.schemas.Task;
for (const field of ["mode", "model_id", "parameters", "created_at"]) if (!task.required.includes(field)) throw new Error(`Task must require ${field}`);
if (task.properties.meta || task.properties.created) throw new Error("Task must not expose legacy meta/created fields");
if (!task.properties.finished_at || !task.properties.error) throw new Error("Task must expose finished_at and structured error");
if (!document.components.schemas.TaskResult.required.includes("items")) throw new Error("TaskResult must require items[]");
if (!document.components.schemas.PageMeta.required.includes("has_next")) throw new Error("PageMeta must require has_next");
const aid = document.components.schemas.Account.properties.aid;
if (!new RegExp(aid.pattern).test(aid.examples[0])) throw new Error("Account AID example must match the public format");
if (!document.components.headers?.RequestId) throw new Error("Missing shared X-Request-ID header");
for (const [path, item] of Object.entries(document.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    if (!["get", "post", "patch", "delete"].includes(method)) continue;
    for (const [status, response] of Object.entries(operation.responses || {})) {
      if (!/^2\d\d$/.test(status) || response.$ref) continue;
      if (!response.headers?.["X-Request-ID"]) throw new Error(`${method.toUpperCase()} ${path} ${status} must return X-Request-ID`);
    }
  }
}
const tooManyRequests = document.components.responses.TooManyRequests;
if (!tooManyRequests.headers?.["Retry-After"]) throw new Error("429 responses must expose Retry-After");
console.log(`OpenAPI contract valid: ${Object.keys(document.paths).length} paths, ${Object.keys(document.components.schemas).length} schemas`);
