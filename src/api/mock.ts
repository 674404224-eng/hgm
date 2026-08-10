import type { AppApi, Model, Task, Transaction } from "../types/domain";

const wait = (ms = 90) => new Promise((resolve) => window.setTimeout(resolve, ms));
const clone = <T,>(value: T): T => structuredClone(value);

const models: Model[] = [
  { id: "seedance-1-0-pro", name: "Seedance 1.0 Pro", provider_name: "火山方舟", mode: "video", status: "available", base_points: 28, capabilities: { aspects: ["16:9", "9:16", "1:1"], resolutions: ["1080P", "720P"], durations: [5, 10, 15, 30], sound: true, watermark: true } },
  { id: "seedance-1-0-lite", name: "Seedance 1.0 Lite", provider_name: "火山方舟", mode: "video", status: "available", base_points: 18, capabilities: { aspects: ["16:9", "9:16", "1:1"], resolutions: ["720P"], durations: [5, 10], sound: false, watermark: true } },
  { id: "vidu-q2-pro", name: "Vidu Q2 Pro", provider_name: "Vidu", mode: "video", status: "available", base_points: 24, capabilities: { aspects: ["16:9", "9:16"], resolutions: ["1080P", "720P"], durations: [5, 10, 15], sound: true, watermark: false } },
  { id: "seedream-4-0", name: "Seedream 4.0", provider_name: "火山方舟", mode: "image", status: "available", base_points: 12, capabilities: { aspects: ["1:1", "16:9", "9:16", "4:3"], resolutions: ["2K", "1K"], counts: [1, 2, 4] } },
  { id: "seedream-3-0", name: "Seedream 3.0", provider_name: "火山方舟", mode: "image", status: "available", base_points: 8, capabilities: { aspects: ["1:1", "16:9", "4:3"], resolutions: ["1K"], counts: [1, 2] } },
  { id: "flux-1-1-pro", name: "Flux 1.1 Pro", provider_name: "Flux", mode: "image", status: "maintenance", base_points: 14, capabilities: { aspects: ["1:1", "16:9", "9:16"], resolutions: ["2K", "1K"], counts: [1] } },
];

type MockTask = Task & { result?: { playback_url: string; media_type: string; expires_at: string } };

let tasks: MockTask[] = [
  { id: "task-1", title: "新品发布宣传片", meta: "16:9 · 1080P · 30s", cost: 32, status: "done", progress: 100, image: "/assets/neon-city.png", created: "刚刚", result: { playback_url: "/assets/neon-city.png", media_type: "video/mp4", expires_at: "2026-08-09T00:00:00+08:00" } },
  { id: "task-2", title: "产品功能演示", meta: "16:9 · 720P · 20s", cost: 18, status: "queued", progress: 0, image: "/assets/smart-speaker.png", created: "2 分钟前" },
  { id: "task-3", title: "品牌故事短片", meta: "16:9 · 1080P · 45s", cost: 45, status: "generating", progress: 32, image: "/assets/alpine-travel.png", created: "5 分钟前" },
  { id: "task-4", title: "社媒推广视频", meta: "9:16 · 720P · 15s", cost: 16, status: "queued", progress: 0, image: "/assets/warm-interior.png", created: "8 分钟前" },
  { id: "task-5", title: "节日促销海报视频", meta: "1:1 · 1080P · 10s", cost: 14, status: "queued", progress: 0, image: "/assets/warm-interior.png", created: "12 分钟前" },
];

const transactions: Transaction[] = [
  { id: "TX-20260808-001", occurred_at: "2026-08-08 14:32", type: "任务消耗", reference: "新品发布宣传片", detail: "Seedance 1.0 Pro", amount: -32 },
  { id: "TX-20260801-001", occurred_at: "2026-08-01 09:00", type: "套餐发放", reference: "月度创作额度", detail: "有效期至 2026-08-31", amount: 16000 },
  { id: "TX-20260728-115", occurred_at: "2026-07-28 16:15", type: "任务消耗", reference: "品牌故事短片", detail: "Seedance 1.0 Pro", amount: -45 },
  { id: "TX-20260720-006", occurred_at: "2026-07-20 11:20", type: "活动奖励", reference: "夏季创作活动", detail: "奖励已到账", amount: 500 },
  { id: "TX-20260718-103", occurred_at: "2026-07-18 18:06", type: "任务消耗", reference: "产品功能演示", detail: "Vidu Q2 Pro", amount: -18 },
];

const paginate = <T,>(items: T[], page = 1, pageSize = 20) => ({ items: clone(items.slice((page - 1) * pageSize, page * pageSize)), page, page_size: pageSize, total: items.length });

export function createMockApi(): AppApi {
  return {
    isMock: true,
    auth: {
      async sendSmsCode() { await wait(); return { request_id: crypto.randomUUID(), expires_in: 300 }; },
      async login({ phone }) { await wait(); return { access_token: "mock-access-token", expires_in: 3600, user: { aid: "clzs-7F3A9C2E-20260808", name: "林溪", phone, email: "linxi@example.com", avatar_seed: 1 } }; },
      async refresh() { await wait(40); return { access_token: "mock-access-token", expires_in: 3600, user: { aid: "clzs-7F3A9C2E-20260808", name: "林溪", phone: "15905818327", email: "linxi@example.com", avatar_seed: 1 } }; },
      async logout() { await wait(40); return null; },
    },
    account: {
      async get() { await wait(); return { aid: "clzs-7F3A9C2E-20260808", name: "林溪", phone: "15905818327", email: "linxi@example.com", avatar_seed: 1 }; },
    },
    wallet: {
      async get() { await wait(); return { available: 12560, used_this_month: 3440, usage_percent: 28 }; },
      async listTransactions({ page = 1, pageSize = 20 } = {}) { await wait(); return paginate(transactions, page, pageSize); },
    },
    models: { async list() { await wait(); return { items: clone(models), total: models.length }; } },
    tasks: {
      async list({ page = 1, pageSize = 100 } = {}) {
        await wait();
        tasks = tasks.map((task) => task.status === "generating" ? { ...task, progress: Math.min(100, task.progress + 2), status: task.progress >= 98 ? "done" : "generating" } : task);
        return paginate(tasks, page, pageSize);
      },
      async create(payload) { await wait(160); const item: MockTask = { id: `task-${Date.now()}`, title: payload.prompt.slice(0, 14), mode: payload.mode, model_id: payload.model_id, meta: `${payload.aspect} · ${payload.resolution}${payload.duration ? ` · ${payload.duration}` : payload.count ? ` · ${payload.count} 张` : ""}`, cost: payload.max_points || 28, status: "queued", progress: 0, image: "/assets/neon-city.png", created: "刚刚" }; tasks = [item, ...tasks]; return clone(item); },
      async remove(id) { await wait(); tasks = tasks.filter((item) => item.id !== id); return null; },
      async getResult(id) { await wait(); const task = tasks.find((item) => item.id === id); return task?.result || { playback_url: task?.image || "/assets/neon-city.png", media_type: "video/mp4", expires_at: "2026-08-09T00:00:00+08:00" }; },
    },
    uploads: {
      async createPresignedUpload({ file_name: fileName, content_type: contentType }) { await wait(); return { asset_id: `asset-${Date.now()}`, upload_url: "https://upload.example.invalid/presigned", headers: { "Content-Type": contentType }, file_name: fileName, expires_in: 600 }; },
    },
  };
}
