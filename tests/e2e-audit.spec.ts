import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { auditBothThemes, auditTheme, english, signIn } from "./audit-helpers";
import { registerInventoryAudit } from "./inventory-audit";
import { registerVisualizerAudit } from "./visualizer-audit";

const pageErrors = new WeakMap<import("@playwright/test").Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(pageErrors.get(page)).toEqual([]);
});
registerInventoryAudit();
registerVisualizerAudit();

test.describe("DigiTiles MVP End-to-End & WCAG 2.1 AA Audit (FR-01 to FR-15)", () => {
  test("SCR-01 Landing, Bilingual Toggle, Dark Mode & WCAG AA Contrast", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("header")).toContainText("DigiTiles");
    await expect(page.locator("main")).toContainText("66%");
    await expect(page.locator("main")).toContainText("72.4%");

    // Run Axe-Core WCAG 2.1 AA check in Light Mode
    const lightAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(lightAxe.violations).toEqual([]);

    // Toggle to Dark Mode and verify WCAG 2.1 AA
    await page.getByLabel("Activate Dark Mode").click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    const darkAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(darkAxe.violations).toEqual([]);
  });

  test("SCR-02 Marketplace Discovery, Public Visibility Gate & SCR-03 Listing Detail", async ({
    page,
  }) => {
    await page.goto("/marketplace");
    // Approved listing from Verified org is visible
    await expect(page.locator("main")).toContainText("RAK-CARRARA-6060-GL");
    // Unapproved listing (lst_09_pending) is strictly hidden from public discovery (Business Rule 3)
    await expect(page.locator("main")).not.toContainText("AKIJ-ONYX-8080-GL");
    expect((await page.request.get("/api/listings/lst_09_pending")).status()).toBe(404);

    // Navigate to SCR-03 Listing Detail
    await page.goto("/marketplace/lst_01");
    await expect(page.locator("main")).toContainText("RAK-CARRARA-6060-GL");
    await expect(page.locator("main")).toContainText("15.5 sq.ft");
  });

  test("End-to-End API & Business Rules: Firebase Email Auth, RFQ, Immutable Quote, Atomic Idempotent Order, Tenant Isolation & Admin Audit", async ({
    request,
  }) => {
    // 1. Firebase Email/Password Authentication (FR-01, FR-02)
    const authRes = await request.post("/api/auth/firebase", {
      data: {
        email: "customer@digitiles.equisaas-bd.com",
        password: "Customer#DigiTiles2026!",
        requestedRole: "CUSTOMER",
      },
    });
    expect(authRes.ok()).toBeTruthy();

    // 2. Customer submits RFQ (FR-08)
    const rfqRes = await request.post("/api/rfqs", {
      data: {
        items: [{ listingId: "lst_01", requestedBoxes: 40 }],
        deliveryDistrict: "Dhaka",
        deliveryAddress: "House 12, Road 5, Uttara, Dhaka",
        preferredWindow: "Within 3 days",
        projectNotes: "E2E automated verification RFQ",
      },
    });
    expect(rfqRes.ok()).toBeTruthy();
    const rfqData = (await rfqRes.json()).data.rfq;
    expect(rfqData.status).toBe("OPEN");

    // 3. Switch to Verified Dealer (org_hatirpool_01) and issue Immutable Quotation (FR-09)
    await request.post("/api/auth/firebase", {
      data: {
        email: "dealer@digitiles.equisaas-bd.com",
        password: "Dealer#DigiTiles2026!",
        requestedRole: "DEALER",
      },
    });

    const quoteRes = await request.post(`/api/rfqs/${rfqData.id}/quotes`, {
      data: {
        itemPrices: [
          {
            listingId: "lst_01",
            quotedBoxes: 40,
            unitPricePerBoxBdt: 1400,
          },
        ],
        deliveryFeeBdt: 2000,
        vatBdt: 300,
        discountBdt: 500,
        validUntil: "2027-12-31T23:59:59.000Z",
        paymentTerms: "30% advance, 70% on site delivery",
        deliveryTerms: "Covered pickup delivery",
      },
    });
    expect(quoteRes.ok()).toBeTruthy();
    const quoteData = (await quoteRes.json()).data.quotation;
    expect(quoteData.versionNumber).toBe(1);
    expect(quoteData.totalAmountBdt).toBe(40 * 1400 + 2000 + 300 - 500);

    // 4. Tenant Isolation Check (Business Rule 8): Dealer 2 (org_uttara_02) cannot quote Dealer 1's RFQ
    await request.post("/api/auth/firebase", {
      data: {
        email: "staff@digitiles.equisaas-bd.com",
        password: "Staff#DigiTiles2026!",
        requestedRole: "DEALER",
      },
    });
    const crossTenantQuote = await request.post(
      `/api/rfqs/${rfqData.id}/quotes`,
      {
        data: {
          itemPrices: [],
          deliveryFeeBdt: 1000,
          discountBdt: 0,
        },
      }
    );
    expect(crossTenantQuote.status()).toBe(403);

    // 5. Customer Atomically & Idempotently Accepts Quote -> Creates Exactly One Order (FR-10, Business Rule 5)
    await request.post("/api/auth/firebase", {
      data: {
        email: "customer@digitiles.equisaas-bd.com",
        password: "Customer#DigiTiles2026!",
        requestedRole: "CUSTOMER",
      },
    });

    const acceptUrl = `/api/quotes/${quoteData.id}/accept`;
    const responses = await Promise.all([request.post(acceptUrl), request.post(acceptUrl)]);
    for (const response of responses) await expect(response).toBeOK();
    const acceptances = await Promise.all(responses.map(async (response) => (await response.json()).data));
    expect(acceptances.map((entry) => entry.idempotentHit).sort()).toEqual([false, true]);
    expect(acceptances[0].order.id).toBe(acceptances[1].order.id);
    expect(acceptances[0].order.commercialSnapshot).toEqual(quoteData.commercialSnapshot);

    // 6. Admin Moderation & Audit Log Verification (FR-14, Business Rule 9)
    await request.post("/api/auth/firebase", {
      data: {
        email: "admin@digitiles.equisaas-bd.com",
        password: "Admin#DigiTiles2026!",
        requestedRole: "ADMIN",
      },
    });
    const adminRes = await request.get("/api/admin/moderate");
    expect(adminRes.ok()).toBeTruthy();
    const adminJson = await adminRes.json();
    expect(adminJson.data.auditLogs.length).toBeGreaterThan(0);
  });
});

test("Construction service filters, district fares and order crew preference", async ({ page }) => {
  await english(page);
  await page.goto("/services");
  await expect(page.getByRole("heading", { name: "Dhaka Slab Crew" })).toBeVisible();
  await page.getByLabel("Specialty").selectOption("MOSAIC");
  await expect(page.getByRole("heading", { name: "Old Dhaka Mosaic Crew" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dhaka Slab Crew" })).toHaveCount(0);
  await page.getByLabel("Maximum rate (BDT)").fill("2000");
  await expect(page.getByRole("heading", { name: "Old Dhaka Mosaic Crew" })).toHaveCount(0);
  await page.getByLabel("Maximum rate (BDT)").clear();
  await page.getByLabel("Minimum completed projects").fill("20");
  await expect(page.getByRole("heading", { name: "Old Dhaka Mosaic Crew" })).toHaveCount(0);
  await page.getByLabel("Route distance (km)").fill("20");
  await expect(page.getByTestId("fare-fleet_pickup")).toHaveText("BDT 1,510");
  await page.getByLabel("Service district").selectOption("Chattogram");
  await expect(page.getByTestId("fare-fleet_pickup")).toHaveCount(0);
  await expect(page.getByTestId("fare-fleet_truck")).toHaveText("BDT 6,020");
  await auditBothThemes(page);

  await signIn(page, "usr_customer_01", "CUSTOMER");
  await page.goto("/workspace/customer/orders");
  const order = page.locator("section").filter({ has: page.getByText("Dhaka Metro-Na-14-8821", { exact: true }) }).filter({
    has: page.getByRole("combobox", { name: "Preferred installation crew" }),
  });
  await order.getByRole("combobox", { name: "Preferred installation crew" }).selectOption("crew_slab");
  await order.getByRole("button", { name: "Save crew preference" }).click();
  await expect(order.getByText("Crew preference saved.")).toBeVisible();
  await page.reload();
  await expect(order.getByRole("combobox", { name: "Preferred installation crew" })).toHaveValue("crew_slab");
  await auditBothThemes(page);
});

test("Commercial documents render in both workspaces and both themes", async ({ page }) => {
  test.setTimeout(90000);
  await english(page);
  for (const [role, user, workspace] of [
    ["CUSTOMER", "usr_customer_01", "customer"],
    ["DEALER", "usr_dealer_01", "dealer"],
  ] as const) {
    await signIn(page, user, role);
    for (const [screen, button, title] of [
      ["rfqs", "View proforma quotation", "Proforma quotation"],
      ["orders", "View delivery challan", "Delivery challan"],
    ]) {
      await page.goto(`/workspace/${workspace}/${screen}`);
      await expect(page.getByRole("button", { name: button }).first()).toBeVisible();
      await auditBothThemes(page);
      for (let pass = 0; pass < 2; pass++) {
        await page.getByRole("button", { name: button }).first().click();
        const dialog = page.getByRole("dialog", { name: title });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByText("VAT", { exact: true })).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Print document" })).toBeVisible();
        await auditTheme(page, "dialog[open]");
        await page.emulateMedia({ media: "print" });
        await expect(page.locator("header").first()).toBeHidden();
        await expect(dialog.locator("article")).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Print document" })).toBeHidden();
        await page.emulateMedia({ media: null });
        await page.keyboard.press("Escape");
        await page.getByLabel(pass === 0 ? "Activate Light Mode" : "Activate Dark Mode").click();
      }
    }
  }
});

test("Dealer and platform analytics have scoped, accessible operational data", async ({ page }) => {
  await english(page);
  await signIn(page, "usr_dealer_01", "DEALER");
  const privateCheck = await page.request.get("/api/analytics?scope=ADMIN");
  expect(privateCheck.status()).toBe(403);
  const dealerAnalytics = await page.request.get("/api/analytics?scope=DEALER");
  await expect(dealerAnalytics).toBeOK();
  const dealer = (await dealerAnalytics.json()).data;
  expect(dealer.branchScores.every((branch: { id: string }) => !branch.id.includes("uttara"))).toBeTruthy();
  await page.goto("/workspace/dealer");
  await expect(page.getByTestId("quote-response-time")).toBeVisible();
  await expect(page.getByRole("table", { name: "Category price index" })).toBeVisible();
  await auditBothThemes(page);
  await signIn(page, "usr_admin_01", "ADMIN");
  await page.goto("/workspace/admin");
  await expect(page.getByRole("table", { name: "Branch fulfilment score" })).toBeVisible();
  await expect(page.getByRole("row", { name: /Uttara/ }).first()).toBeVisible();
  await auditBothThemes(page);
});

test("Public canonical metadata, discovery files and bilingual guide markup", async ({ page, request }) => {
  const canonical = "https://digitiles.equisaas-bd.com";
  const path = "/guides/tile-box-calculator";
  await page.goto(path);
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", canonical + path);
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", canonical + path);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", canonical + "/brand/digitiles-social.jpg");
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  const graphs = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((json) => JSON.parse(json));
  expect(graphs.flatMap((graph) => graph["@graph"] ?? []).some((node) => node["@type"] === "FAQPage")).toBeTruthy();
  await english(page);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How to calculate tile boxes and wastage");
  await auditBothThemes(page);
  for (const url of ["/robots.txt", "/sitemap.xml", "/llms.txt", "/llms-full.txt"]) {
    const response = await request.get(url);
    await expect(response).toBeOK();
    expect(await response.text()).toContain(canonical);
  }
  const privatePage = await request.get("/workspace/dealer/orders");
  expect(await privatePage.text()).toContain("noindex");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain(`${canonical}/marketplace/lst_01`);
  expect(sitemap).not.toMatch(/lst_09_pending|\/workspace|\/auth/);
  const product = await request.get("/marketplace/lst_01");
  const productHtml = await product.text();
  expect(productHtml).toContain('"@type":"Product"');
  expect(productHtml).toContain('"priceCurrency":"BDT"');
  const socialCard = await request.get("/brand/digitiles-social.jpg");
  await expect(socialCard).toBeOK();
  expect(socialCard.headers()["content-type"]).toContain("image/jpeg");
  await expect(await request.get("/favicon.ico")).toBeOK();
  await expect(await request.get("/apple-icon.png")).toBeOK();
  expect((await request.get("/_next/image?url=%2Ficon.png&w=640&q=75")).status()).toBe(404);
});
