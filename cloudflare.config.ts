import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  accountId: "f097993c07d8490e4744dfeac7519066",
  worker: defineWorker({
    name: "digitiles-web",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-12",
    workersDev: true,
    observability: {
      enabled: true,
      logs: { enabled: true, persist: true },
      traces: { enabled: true, persist: true },
    },
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
