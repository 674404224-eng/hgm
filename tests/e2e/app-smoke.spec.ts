import { expect, test } from "@playwright/test";

test("核心页面可通过真实 URL 导航", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "把灵感，变成下一帧。" })).toBeVisible();

  await page.getByRole("button", { name: "任务中心" }).click();
  await expect(page).toHaveURL(/\/tasks$/);
  await expect(page.getByRole("heading", { name: "任务中心" })).toBeVisible();

  await page.goto("/settings/account");
  await expect(page.getByRole("heading", { name: "账户" })).toBeVisible();
  await expect(page.getByText("AID · 唯一用户标识", { exact: true })).toBeVisible();
});

test("任务视频点击后打开播放窗口", async ({ page }) => {
  await page.goto("/tasks");
  await page.getByRole("button", { name: "播放 新品发布宣传片" }).click();
  await expect(page.getByRole("dialog", { name: "新品发布宣传片" })).toBeVisible();
});
