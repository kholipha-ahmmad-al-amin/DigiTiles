import { expect, test } from "@playwright/test";
import { randomInt, randomUUID } from "crypto";
import { auditBothThemes, english, signIn } from "./audit-helpers";
import type { StockLot } from "../lib/types";

export function registerInventoryAudit() {
  test("Branch stock is scoped, reserved from one production lot, and restored on cancellation", async ({ page }) => {
    test.setTimeout(90_000);
    await english(page);
    await signIn(page, "usr_dealer_01", "DEALER");
    const sku = `AUDIT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const branchId = "brn_mirpur_wh";
    const listingResponse = await page.request.post("/api/dealer/listings", {
      data: {
        categoryId: "cat_floor", branchId: "brn_hatirpool_main", sku,
        titleEn: "Inventory audit tile", titleBn: "মজুত পরীক্ষার টাইলস",
        descriptionEn: "", descriptionBn: "", brand: "DigiTiles",
        materialType: "Porcelain", dimensionsMm: "600x600 mm", surfaceFinish: "Matt",
        grade: "A", waterAbsorption: "< 0.5%", sqftPerBox: 15.5, piecesPerBox: 4,
        pricePerSqftBdt: 90, minOrderBoxes: 1, stockBoxes: 150, servicingDistricts: ["Dhaka"],
      },
    });
    await expect(listingResponse).toBeOK();
    const listingId: string = (await listingResponse.json()).data.listing.id;

    await page.goto("/workspace/dealer/catalogue");
    await page.getByTestId("inventory-listing").selectOption(listingId);
    await page.getByTestId("inventory-branch").selectOption(branchId);
    await page.getByTestId("inventory-batch").fill("PROD-A");
    await page.getByTestId("inventory-shade").fill("TONE-1");
    await page.getByTestId("inventory-caliber").fill("599.5");
    await page.getByTestId("inventory-quantity").fill("40");
    await page.getByTestId("inventory-save").click();
    await expect(page.getByRole("row").filter({ hasText: sku })).toContainText("PROD-A");
    await auditBothThemes(page);

    await page.goto("/workspace/dealer/organization");
    await expect(page.getByRole("row").filter({ hasText: sku })).toContainText("PROD-A");
    await auditBothThemes(page);

    const putLot = (batchCode: string, availableBoxes: number, extra?: object) =>
      page.request.put("/api/dealer/inventory", {
        data: { listingId, branchId, batchCode, shadeCode: "TONE-1", caliberMm: 599.5, availableBoxes, ...extra },
      });
    await expect(await putLot("PROD-B", 40)).toBeOK();
    const crossBranch = await putLot("PROD-X", 40, { branchId: "brn_uttara_main" });
    expect(crossBranch.status()).toBe(403);

    await signIn(page, "usr_admin_01", "ADMIN");
    await expect(await page.request.post("/api/admin/moderate", {
      data: { targetType: "LISTING", targetId: listingId, decision: "APPROVED", note: "Inventory workflow fixture." },
    })).toBeOK();

    await signIn(page, "usr_customer_01", "CUSTOMER");
    const rfq = await page.request.post("/api/rfqs", {
      data: {
        items: [{ listingId, requestedBoxes: 65 }],
        deliveryDistrict: "Dhaka",
        deliveryAddress: "House 12, Road 5, Uttara, Dhaka",
      },
    });
    await expect(rfq).toBeOK();
    const rfqId: string = (await rfq.json()).data.rfq.id;

    await signIn(page, "usr_dealer_01", "DEALER");
    const quote = await page.request.post(`/api/rfqs/${rfqId}/quotes`, {
      data: { itemPrices: [], deliveryFeeBdt: 0, discountBdt: 0 },
    });
    await expect(quote).toBeOK();
    const quoteId: string = (await quote.json()).data.quotation.id;

    await signIn(page, "usr_customer_01", "CUSTOMER");
    const accept = await page.request.post(`/api/quotes/${quoteId}/accept`);
    await expect(accept).toBeOK();
    const orderId: string = (await accept.json()).data.order.id;

    await signIn(page, "usr_dealer_02", "DEALER");
    const tenantInventory = await page.request.get("/api/dealer/inventory");
    await expect(tenantInventory).toBeOK();
    expect((await tenantInventory.json()).data.lots.some((lot: StockLot) => lot.listingId === listingId)).toBe(false);
    expect((await putLot("PROD-X", 10, { actorUserId: "usr_dealer_01" })).status()).toBe(403);

    await signIn(page, "usr_dealer_01", "DEALER");
    const transitionUrl = `/api/orders/${orderId}/transition`;
    const confirmation = { actorRole: "DEALER", toState: "CONFIRMED", dispatchBranchId: branchId };
    const mixedLot = await page.request.post(transitionUrl, { data: confirmation });
    expect(mixedLot.status()).toBe(400);
    expect((await mixedLot.json()).error.code).toBe("SINGLE_LOT_REQUIRED");
    await expect(await putLot("PROD-C", 70)).toBeOK();

    await page.goto("/workspace/dealer/orders");
    await page.getByTestId(`dispatch-branch-${orderId}`).selectOption(branchId);
    await page.getByTestId(`advance-order-${orderId}`).click();
    const reservation = page.getByTestId(`stock-reservation-${orderId}`);
    await expect(reservation).toContainText("PROD-C");
    await expect(reservation).toContainText("TONE-1");
    await auditBothThemes(page);

    await expect(await page.request.post(transitionUrl, { data: confirmation })).toBeOK();
    const readLots = async () => {
      const response = await page.request.get("/api/dealer/inventory");
      await expect(response).toBeOK();
      const { lots } = (await response.json()).data as { lots: StockLot[] };
      return lots.filter((lot) => lot.listingId === listingId).map((lot) => [lot.batchCode, lot.availableBoxes]);
    };
    expect(await readLots()).toEqual([["PROD-A", 40], ["PROD-B", 40], ["PROD-C", 5]]);

    await signIn(page, "usr_customer_01", "CUSTOMER");
    await page.goto("/workspace/customer/orders");
    await expect(page.getByTestId(`stock-reservation-${orderId}`)).toContainText("PROD-C");
    await auditBothThemes(page);

    await signIn(page, "usr_dealer_01", "DEALER");
    const cancellation = { actorRole: "DEALER", toState: "CANCELLED", note: "Inventory audit cancellation." };
    await expect(await page.request.post(transitionUrl, { data: cancellation })).toBeOK();
    await expect(await page.request.post(transitionUrl, { data: cancellation })).toBeOK();
    expect(await readLots()).toEqual([["PROD-A", 40], ["PROD-B", 40], ["PROD-C", 70]]);
  });

  test("Verification transitions protect reviewed credentials and record admin reasons", async ({ page, request }) => {
    const phone = `017${randomInt(10_000_000, 100_000_000)}`;
    const legalName = `Audit Showroom ${randomUUID().slice(0, 8)}`;
    const challenge = await request.post("/api/auth/otp/request", { data: { phone } });
    await expect(challenge).toBeOK();
    const { pilotOtpCode: otpCode } = (await challenge.json()).data;
    const login = await request.post("/api/auth/otp/verify", {
      data: { phone, otpCode, requestedRole: "DEALER", organizationTradeName: legalName },
    });
    await expect(login).toBeOK();
    const privateUserId: string = (await login.json()).data.user.id;

    const session = await page.request.get("/api/auth/session");
    await expect(session).toBeOK();
    expect((await session.json()).data.demoAccounts).not.toContainEqual(expect.objectContaining({ id: privateUserId }));
    expect((await page.request.post("/api/auth/session", { data: { demoUserId: privateUserId } })).status()).toBe(404);

    const profile = await request.get("/api/dealer/organization");
    await expect(profile).toBeOK();
    const orgId: string = (await profile.json()).data.organization.id;
    await english(page);
    await signIn(page, "usr_admin_01", "ADMIN");
    const adminDecision = (decision: string, note: string) => page.request.post("/api/admin/moderate", {
      data: { targetType: "ORGANIZATION", targetId: orgId, decision, note },
    });
    expect((await adminDecision("VERIFIED", "Skipped review")).status()).toBe(400);

    const submit = await request.put("/api/dealer/organization", {
      data: { tradeLicenseNo: "AUDIT-TL", tinNumber: "AUDIT-TIN", submitForVerification: true },
    });
    await expect(submit).toBeOK();
    expect((await request.put("/api/dealer/organization", { data: { tradeLicenseNo: "ALTERED" } })).status()).toBe(403);
    expect((await adminDecision("VERIFIED", "Skipped review")).status()).toBe(400);

    await page.goto("/workspace/admin");
    const row = page.getByRole("row").filter({ hasText: legalName });
    await expect(row.getByRole("button", { name: "Verify", exact: true })).toHaveCount(0);
    await row.getByRole("textbox", { name: "Decision reason" }).fill("Credentials queued for manual review.");
    await row.getByRole("button", { name: "Start review" }).click();
    await expect(row.getByRole("button", { name: "Verify", exact: true })).toBeVisible();
    await row.getByRole("textbox", { name: "Decision reason" }).fill("Trade license and TIN checked.");
    await row.getByRole("button", { name: "Verify", exact: true }).click();
    await expect(row.getByRole("button", { name: "Suspend" })).toBeVisible();
    await auditBothThemes(page);

    expect((await request.put("/api/dealer/organization", { data: { tinNumber: "ALTERED" } })).status()).toBe(403);
    await expect(await request.put("/api/dealer/organization", {
      data: { tradeLicenseNo: "AUDIT-TL", tinNumber: "AUDIT-TIN", descriptionEn: "Updated showroom description." },
    })).toBeOK();
    const admin = await page.request.get("/api/admin/moderate");
    const { auditLogs } = (await admin.json()).data;
    expect(auditLogs).toContainEqual(expect.objectContaining({
      actorUserId: "usr_admin_01",
      actorRole: "ADMIN",
      entityId: orgId,
      action: "DEALER_VERIFICATION_VERIFIED",
      summary: expect.stringContaining("Trade license and TIN checked."),
    }));
  });
}
