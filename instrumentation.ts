export async function register() {
  if (process.env.DIGITILES_TEST_DB_PATH) return;
  const { hydrateDatabaseFromCloudflareD1 } = await import("./lib/store");
  await hydrateDatabaseFromCloudflareD1();
}
