import { describe, expect, it } from "vitest";
import { createMockApi } from "../src/api/mock";

describe("Mock API matches OpenAPI 1.1.0", () => {
  it("返回结构化任务与统一分页元数据", async () => {
    const api = createMockApi();
    const page = await api.tasks.list({ page: 1, pageSize: 2 });

    expect(page).toMatchObject({ page: 1, page_size: 2, total: 5, has_next: true });
    expect(page.items[0]).toMatchObject({
      mode: "video",
      model_id: "seedance-1-0-pro",
      parameters: { aspect: "16:9", resolution: "1080P", duration: "30s" },
      created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
    });
    expect(page.items[0]).not.toHaveProperty("meta");
    expect(page.items[0]).not.toHaveProperty("created");
  });

  it("视频和图片结果统一返回 items 数组", async () => {
    const api = createMockApi();
    const result = await api.tasks.getResult("task-1");

    expect(result.task_id).toBe("task-1");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toEqual(expect.objectContaining({
      playback_url: expect.any(String),
      media_type: expect.any(String),
    }));
  });
});
