import { expect, test } from "@playwright/test";
import { auditBothThemes, auditTheme, english } from "./audit-helpers";

export function registerVisualizerAudit() {
  test("Surface visualizer updates both views and carries the calculated box count into the RFQ", async ({ page }) => {
    await english(page);
    await page.goto("/visualizer?listingId=lst_01");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#visualizer-listing")).toHaveValue("lst_01");
    await page.locator("#visualizer-listing").selectOption("lst_02");
    await expect(page.getByRole("img", { name: /Living Room Floor, Straight Grid/ })).not.toHaveAccessibleName(/Bianco Carrara/);
    await page.locator("#visualizer-listing").selectOption("lst_01");
    await page.locator("#visualizer-preset").selectOption("kitchen");
    await page.locator("#visualizer-view").selectOption("plan");
    const gridTile = page.getByRole("img", { name: /Kitchen Backwall, Straight Grid/ }).locator("polygon").nth(2);
    const gridPoints = await gridTile.getAttribute("points");
    await page.locator("#visualizer-pattern").selectOption("brick");
    await expect(page.locator("#calc-wastage")).toHaveValue("10");
    await page.locator("#visualizer-pattern").selectOption("diagonal");
    await expect(page.locator("#calc-wastage")).toHaveValue("15");
    await page.locator("#visualizer-pattern").selectOption("herringbone");
    await expect(page.locator("#calc-wastage")).toHaveValue("15");
    await page.locator("#visualizer-grout-width").selectOption("5");
    await page.locator("#visualizer-grout-color").selectOption("charcoal");
    await page.locator("#visualizer-lighting").selectOption("warm");
    const planScene = page.getByRole("img", { name: /Kitchen Backwall, Herringbone, 2D surface, 5 mm, Charcoal, Warm 3000K/ });
    await expect(planScene).toBeVisible();
    await expect(planScene.locator("polygon").nth(2)).not.toHaveAttribute("points", gridPoints ?? "");
    await page.locator("#visualizer-view").selectOption("perspective");
    await expect(page.getByRole("img", { name: /Herringbone, 3D room/ })).toBeVisible();
    await expect(page.locator("#calculated-boxes")).toHaveText("23");
    await auditBothThemes(page);

    await page.locator("#open-rfq").click();
    await expect(page).toHaveURL(/marketplace\/lst_01\?/);
    const dialog = page.getByRole("dialog", { name: "Request Quotation" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("#rfq-boxes")).toHaveValue("23");
    await auditTheme(page, "dialog[open]");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.locator("#visualizer-pattern")).toHaveValue("herringbone");
    await expect(page.locator("#visualizer-lighting")).toHaveValue("warm");

    const themeBefore = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
    await page.getByLabel(themeBefore ? "Activate Light Mode" : "Activate Dark Mode").click();
    await page.locator("#open-rfq").click();
    await expect(dialog).toBeVisible();
    await auditTheme(page, "dialog[open]");
  });

  test("Marketplace compares four tiles with technical ratings and landed BDT cost", async ({ page }) => {
    await english(page);
    await page.goto("/marketplace");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#compare-listing-lst_01")).toBeVisible();
    await auditBothThemes(page);
    for (const id of ["lst_01", "lst_02", "lst_03", "lst_04"]) {
      await page.locator(`#compare-listing-${id}`).click();
      await expect(page.locator(`#compare-listing-${id}`)).toHaveAttribute("aria-pressed", "true");
    }
    await expect(page.locator("#compare-listing-lst_05")).toBeDisabled();
    await page.locator("#open-comparison").click();
    const drawer = page.getByRole("dialog", { name: "Technical & Commercial Comparison" });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("columnheader")).toHaveCount(5);
    const rating = drawer.getByRole("row", { name: /PEI wear rating/ });
    await expect(rating.getByRole("cell").first()).toHaveText("3");
    await expect(drawer.getByRole("row", { name: /Slip resistance/ }).getByRole("cell").first()).toHaveText("R9");
    await expect(drawer.getByRole("row", { name: /Water absorption/ }).getByRole("cell").first()).toHaveText("< 0.05%");
    await expect(drawer.getByRole("row", { name: /Coverage per box/ }).getByRole("cell").first()).toHaveText("15.5 sq.ft");
    await drawer.locator("#compare-area").fill("300");
    const landed = drawer.getByRole("row", { name: /Estimated landed cost/ }).getByRole("cell").first();
    const initial = Number((await landed.innerText()).replace(/[^0-9.]/g, ""));
    await drawer.locator("#compare-delivery-lst_01").fill("3000");
    await expect.poll(async () => Number((await landed.innerText()).replace(/[^0-9.]/g, ""))).toBeCloseTo(initial + 10);
    await auditTheme(page, "dialog[open]");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();

    const themeBefore = await page.locator("html").evaluate((element) => element.classList.contains("dark"));
    await page.getByLabel(themeBefore ? "Activate Light Mode" : "Activate Dark Mode").click();
    await page.locator("#open-comparison").click();
    await expect(drawer).toBeVisible();
    await auditTheme(page, "dialog[open]");
    await drawer.getByRole("button", { name: /Remove from comparison:/ }).first().click();
    await expect(drawer.getByRole("columnheader")).toHaveCount(4);
  });
}
