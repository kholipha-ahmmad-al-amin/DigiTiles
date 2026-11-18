import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start -- -p 3100 -H 127.0.0.1",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    env: { DIGITILES_TEST_DB_PATH: join(tmpdir(), `digitiles-audit-${randomUUID()}.json`) },
    timeout: 60000,
  },
});
