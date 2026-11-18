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

const ROLE_CREDENTIALS: Record<string, { email: string; password: string }> = {
  usr_customer_01: {
    email: "customer@digitiles.equisaas-bd.com",
    password: "Customer#DigiTiles2026!",
  },
  usr_dealer_01: {
    email: "dealer@digitiles.equisaas-bd.com",
    password: "Dealer#DigiTiles2026!",
  },
  usr_dealer_mgr_01: {
    email: "manager@digitiles.equisaas-bd.com",
    password: "Manager#DigiTiles2026!",
  },
  usr_dealer_02: {
    email: "staff@digitiles.equisaas-bd.com",
    password: "Staff#DigiTiles2026!",
  },
  usr_dealer_03: {
    email: "agrabad@digitiles.equisaas-bd.com",
    password: "Agrabad#DigiTiles2026!",
  },
  usr_dealer_04_pending: {
    email: "sylhet.dealer@digitiles.equisaas-bd.com",
    password: "Sylhet#DigiTiles2026!",
  },
  usr_admin_01: {
    email: "admin@digitiles.equisaas-bd.com",
    password: "Admin#DigiTiles2026!",
  },
  usr_founder_admin: {
    email: "kholifaahmadalamin@gmail.com",
    password: "DigiTiles@Admin2026!",
  },
};

export async function signIn(page: Page, userKey: string, targetRole: GlobalRole) {
  const creds = ROLE_CREDENTIALS[userKey];
  expect(creds).toBeDefined();
  const result = await page.request.post("/api/auth/firebase", {
    data: {
      email: creds.email,
      password: creds.password,
      requestedRole: targetRole,
    },
  });
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
