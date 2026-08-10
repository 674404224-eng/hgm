import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean((globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  projects: [{
    name: "chromium",
    use: { ...devices["Desktop Chrome"], ...(isCI ? {} : { channel: "chrome" as const }) },
  }],
});
