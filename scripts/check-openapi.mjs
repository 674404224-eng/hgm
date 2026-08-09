import { readFile } from "node:fs/promises";

const document = JSON.parse(await readFile(new URL("../openapi/openapi.json", import.meta.url), "utf8"));
const requiredPaths = ["/auth/sms-codes", "/auth/sessions", "/auth/sessions/refresh", "/me", "/wallet", "/wallet/transactions", "/models", "/uploads/presign", "/tasks", "/tasks/{task_id}/result"];
if (document.openapi !== "3.1.0") throw new Error("OpenAPI version must be 3.1.0");
for (const path of requiredPaths) if (!document.paths[path]) throw new Error(`Missing OpenAPI path: ${path}`);
if (!document.components?.schemas?.Error) throw new Error("Missing shared Error schema");
if (!document.components?.securitySchemes?.bearerAuth) throw new Error("Missing bearerAuth security scheme");
if (document.paths["/providers"]) throw new Error("User-facing provider management must not exist in phase one");
if (!document.components?.schemas?.CreateTaskRequest?.required?.includes("model_id")) throw new Error("CreateTaskRequest must require model_id");
if (!document.components.schemas.CreateTaskRequest.required.includes("max_points")) throw new Error("CreateTaskRequest must require max_points");
if (!document.components.schemas.CreateTaskRequest.properties.count) throw new Error("CreateTaskRequest must support image count");
console.log(`OpenAPI contract valid: ${Object.keys(document.paths).length} paths, ${Object.keys(document.components.schemas).length} schemas`);
