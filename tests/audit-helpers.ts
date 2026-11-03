import { expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import type { GlobalRole } from "../lib/types";

export async function english(page: Page) {
  await page.addInitScript(() => localStorage.setItem("digitiles_locale", "en"));
  if (page.url() === "about:blank") return;
  const languageButton = page.getByRole("button", { name: "Switch language to English" });
  if (await page.locator("html").getAttribute("lang") === "bn") await languageButton.click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
}

export async function signIn(page: Page, demoUserId: string, targetRole: GlobalRole) {
  const result = await page.request.post("/api/auth/session", { data: { demoUserId, targetRole } });
  await expect(result).toBeOK();
}

export async function auditTheme(page: Page, selector?: string) {
  const audit = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  if (selector) audit.include(selector);
  const result = await audit.analyze();
  expect(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
}

export async function auditBothThemes(page: Page) {
  const html = page.locator("html");
  for (const dark of [false, true]) {
    const isDark = await html.evaluate((element) => element.classList.contains("dark"));
    if (isDark !== dark) await page.getByLabel(isDark ? "Activate Light Mode" : "Activate Dark Mode").click();
    if (dark) await expect(html).toHaveClass(/dark/);
    else await expect(html).not.toHaveClass(/dark/);
    await auditTheme(page);
  }
}
