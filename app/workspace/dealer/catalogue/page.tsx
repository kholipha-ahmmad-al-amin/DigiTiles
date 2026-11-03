"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Layers, Pause, Play, Plus } from "lucide-react";
import { useApp } from "@/components/providers/AppProvider";
import { StockLedger } from "@/components/dealer/StockLedger";
import { TileSwatchPreview } from "@/components/ui/TileSwatchPreview";
import { formatBdt, getModerationLabel, INVENTORY_COPY } from "@/lib/i18n";
import {
  Category,
  DealerListing,
  Organization,
  SwatchPattern,
} from "@/lib/types";

export default function DealerCataloguePage() {
  const { locale, user, quickSwitchPersona, organizationContext } = useApp();
  const canSetInitialStock = organizationContext?.membership.memberRole === "OWNER" ||
    organizationContext?.membership.memberRole === "MANAGER";

  const [listings, setListings] = useState<DealerListing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Listing Form State (FR-05, FR-06)
  const [categoryId, setCategoryId] = useState("cat_floor");
  const [sku, setSku] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [brand, setBrand] = useState("RAK Ceramics");
  const [dimensionsMm, setDimensionsMm] = useState("600x600 mm (24x24 inch)");
  const [surfaceFinish, setSurfaceFinish] = useState(
    "High Gloss Nano-Polished"
  );
  const [sqftPerBox, setSqftPerBox] = useState<number>(15.5);
  const [piecesPerBox, setPiecesPerBox] = useState<number>(4);
  const [pricePerSqftBdt, setPricePerSqftBdt] = useState<number>(95);
  const [minOrderBoxes, setMinOrderBoxes] = useState<number>(10);
  const [stockBoxes, setStockBoxes] = useState<number>(300);
  const [peiRating, setPeiRating] = useState("");
  const [slipResistance, setSlipResistance] = useState("");
  const [swatchPattern, setSwatchPattern] =
    useState<SwatchPattern>("carrara-marble");

  const loadCatalogue = useCallback(async () => {
    setLoading(true);
    try {
      if (!user || !user.roles.includes("DEALER")) {
        await quickSwitchPersona("usr_dealer_01", "DEALER");
      }
      const res = await fetch("/api/dealer/listings", { cache: "no-store" });
      const json = await res.json();
      if (json.ok && json.data) {
        setListings(json.data.listings || []);
        setCategories(json.data.categories || []);
        setOrganization(json.data.organization || null);
      }
    } finally {
      setLoading(false);
    }
  }, [user, quickSwitchPersona]);

  useEffect(() => {
    loadCatalogue();
  }, [loadCatalogue]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/dealer/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          sku: sku.trim() || `RAK-${Date.now().toString().slice(-4)}`,
          titleEn,
          titleBn: titleBn.trim() || titleEn,
          descriptionEn: `${brand} ${dimensionsMm} ${surfaceFinish} architectural grade tile.`,
          descriptionBn: `${brand} ${dimensionsMm} ${surfaceFinish} উন্নত মানের টাইলস।`,
          brand,
          materialType: "Glazed Vitrified Porcelain",
          dimensionsMm,
          surfaceFinish,
          grade: "Grade A Premium",
          waterAbsorption: "< 0.05%",
          peiRating: peiRating || undefined,
          slipResistance: slipResistance || undefined,
          sqftPerBox,
          piecesPerBox,
          pricePerSqftBdt,
          minOrderBoxes,
          stockBoxes: canSetInitialStock ? stockBoxes : 0,
          servicingDistricts: ["Dhaka", "Gazipur", "Narayanganj"],
          swatchPattern,
          visibilityStatus: "ACTIVE",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Failed to publish listing.");
      }

      setTitleEn("");
      setTitleBn("");
      setSku("");
      setPeiRating("");
      setSlipResistance("");
      setFeedback(
        locale === "bn"
          ? `নতুন পণ্য (${json.data.listing.sku}) সফলভাবে ক্যাটালগে যুক্ত হয়েছে!`
          : `New listing (${json.data.listing.sku}) created and added to showroom catalogue!`
      );
      await loadCatalogue();
    } catch (err) {
      setFeedback(
        err instanceof Error ? err.message : "Failed to create listing."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (listing: DealerListing) => {
    const nextStatus =
      listing.visibilityStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    await fetch("/api/dealer/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: listing.id,
        categoryId: listing.categoryId,
        sku: listing.sku,
        titleEn: listing.titleEn,
        titleBn: listing.titleBn,
        descriptionEn: listing.descriptionEn,
        descriptionBn: listing.descriptionBn,
        brand: listing.brand,
        materialType: listing.materialType,
        dimensionsMm: listing.dimensionsMm,
        surfaceFinish: listing.surfaceFinish,
        grade: listing.grade,
        waterAbsorption: listing.waterAbsorption,
        sqftPerBox: listing.sqftPerBox,
        piecesPerBox: listing.piecesPerBox,
        pricePerSqftBdt: listing.pricePerSqftBdt,
        minOrderBoxes: listing.minOrderBoxes,
        servicingDistricts: listing.servicingDistricts,
        visibilityStatus: nextStatus,
      }),
    });
    await loadCatalogue();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-surface border border-hairline rounded-lg p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/workspace/dealer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {locale === "bn"
                ? "ডিলার ড্যাশবোর্ডে ফিরুন (SCR-08)"
                : "Back to Dealer Dashboard (SCR-08)"}
            </span>
          </Link>
          <span className="block text-xs font-mono uppercase tracking-wider text-subtle">
            SCR-10 | DEALER CATALOGUE & LISTING MANAGEMENT (FR-05, FR-06)
          </span>
          <h1 className="text-2xl font-bold text-ink mt-1">
            {locale === "bn"
              ? "শোরুম ক্যাটালগ ও পণ্য ব্যবস্থাপনা"
              : "Showroom Catalogue & Listing Management"}
          </h1>
        </div>
        <div className="text-xs font-mono text-secondary">
          Showroom: <strong>{organization?.tradeNameEn}</strong>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="p-4 rounded-lg bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border border-emerald-300 text-xs font-semibold"
        >
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Columns: Add New Listing Form (FR-05, FR-06) */}
        <div className="lg:col-span-5 bg-surface border border-hairline rounded-lg p-6 space-y-4">
          <h2 className="text-base font-bold text-ink flex items-center gap-2 border-b border-hairline pb-3">
            <Plus className="w-5 h-5 text-accent" />
            <span>
              {locale === "bn"
                ? "নতুন টাইলস বা পণ্য যুক্ত করুন (FR-06)"
                : "Publish New Product Listing (FR-06)"}
            </span>
          </h2>

          <form onSubmit={handleCreateListing} className="space-y-3.5 text-xs">
            <div>
              <label
                htmlFor="lst-cat"
                className="block font-semibold text-ink mb-1"
              >
                {locale === "bn" ? "ক্যাটাগরি" : "Material Category"}
              </label>
              <select
                id="lst-cat"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-ink"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {locale === "bn" ? c.nameBn : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="lst-sku"
                  className="block font-semibold text-ink mb-1"
                >
                  SKU / Model Code
                </label>
                <input
                  id="lst-sku"
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="RAK-STATUARIO-6060"
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas font-mono text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="lst-brand"
                  className="block font-semibold text-ink mb-1"
                >
                  Brand
                </label>
                <input
                  id="lst-brand"
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-ink"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="lst-title-en"
                className="block font-semibold text-ink mb-1"
              >
                Product Title (English)
              </label>
              <input
                id="lst-title-en"
                type="text"
                required
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g., RAK Statuario White Porcelain Floor Tile (600x600 mm)"
                className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-ink"
              />
            </div>

            <div>
              <label
                htmlFor="lst-title-bn"
                className="block font-semibold text-ink mb-1"
              >
                পণ্যের নাম (বাংলা)
              </label>
              <input
                id="lst-title-bn"
                type="text"
                value={titleBn}
                onChange={(e) => setTitleBn(e.target.value)}
                placeholder="আরএকে স্ট্যাচুয়ারিও হোয়াইট পোর্সেলিন ফ্লোর টাইলস"
                className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-ink"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="lst-dim"
                  className="block font-semibold text-ink mb-1"
                >
                  Dimensions (mm)
                </label>
                <input
                  id="lst-dim"
                  type="text"
                  value={dimensionsMm}
                  onChange={(e) => setDimensionsMm(e.target.value)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas font-mono text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="lst-finish"
                  className="block font-semibold text-ink mb-1"
                >
                  Surface Finish
                </label>
                <input
                  id="lst-finish"
                  type="text"
                  value={surfaceFinish}
                  onChange={(e) => setSurfaceFinish(e.target.value)}
                  className="w-full min-h-[38px] px-3 py-1.5 rounded border border-hairline bg-canvas text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="font-semibold text-ink">
                {INVENTORY_COPY.peiRating[locale]}
                <select value={peiRating} onChange={(event) => setPeiRating(event.target.value)} className="mt-1 block min-h-[44px] w-full rounded border border-hairline bg-canvas px-3 py-2 text-ink">
                  <option value="">{INVENTORY_COPY.unrated[locale]}</option>
                  {["0", "1", "2", "3", "4", "5"].map((rating) => <option key={rating}>{rating}</option>)}
                </select>
              </label>
              <label className="font-semibold text-ink">
                {INVENTORY_COPY.slipResistance[locale]}
                <select value={slipResistance} onChange={(event) => setSlipResistance(event.target.value)} className="mt-1 block min-h-[44px] w-full rounded border border-hairline bg-canvas px-3 py-2 text-ink">
                  <option value="">{INVENTORY_COPY.unrated[locale]}</option>
                  {["R9", "R10", "R11", "R12"].map((rating) => <option key={rating}>{rating}</option>)}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  htmlFor="lst-sqft"
                  className="block font-semibold text-ink mb-1"
                >
                  sq.ft / Box
                </label>
                <input
                  id="lst-sqft"
                  type="number"
                  step="0.01"
                  value={sqftPerBox}
                  onChange={(e) => setSqftPerBox(Number(e.target.value))}
                  className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="lst-pcs"
                  className="block font-semibold text-ink mb-1"
                >
                  Pcs / Box
                </label>
                <input
                  id="lst-pcs"
                  type="number"
                  value={piecesPerBox}
                  onChange={(e) => setPiecesPerBox(Number(e.target.value))}
                  className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono text-ink"
                />
              </div>
              <div>
                <label
                  htmlFor="lst-price"
                  className="block font-semibold text-ink mb-1"
                >
                  BDT / sq.ft
                </label>
                <input
                  id="lst-price"
                  type="number"
                  value={pricePerSqftBdt}
                  onChange={(e) => setPricePerSqftBdt(Number(e.target.value))}
                  className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  htmlFor="lst-min"
                  className="block font-semibold text-ink mb-1"
                >
                  Min Boxes
                </label>
                <input
                  id="lst-min"
                  type="number"
                  value={minOrderBoxes}
                  onChange={(e) => setMinOrderBoxes(Number(e.target.value))}
                  className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono text-ink"
                />
              </div>
              {canSetInitialStock && <div>
                <label
                  htmlFor="lst-stock"
                  className="block font-semibold text-ink mb-1"
                >
                  {INVENTORY_COPY.initialBoxes[locale]}
                </label>
                <input
                  id="lst-stock"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  value={stockBoxes}
                  onChange={(e) => setStockBoxes(Number(e.target.value))}
                  className="w-full min-h-[38px] px-2.5 py-1 rounded border border-hairline bg-canvas font-mono text-ink"
                />
              </div>}
              <div>
                <label
                  htmlFor="lst-swatch"
                  className="block font-semibold text-ink mb-1"
                >
                  Surface Swatch
                </label>
                <select
                  id="lst-swatch"
                  value={swatchPattern}
                  onChange={(e) =>
                    setSwatchPattern(e.target.value as SwatchPattern)
                  }
                  className="w-full min-h-[38px] px-2 py-1 rounded border border-hairline bg-canvas text-ink"
                >
                  <option value="carrara-marble">Carrara Marble</option>
                  <option value="concrete-matt">Concrete Matt</option>
                  <option value="travertine-warm">Warm Travertine</option>
                  <option value="terracotta-rustic">Terracotta Punch</option>
                  <option value="wood-oak-plank">Wood Plank</option>
                  <option value="mosaic-teal">Nordic Teal</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full min-h-[42px] px-4 py-2 rounded bg-accent hover:bg-accent-hover text-white font-semibold text-xs cursor-pointer transition-colors"
            >
              {saving
                ? "Publishing..."
                : locale === "bn"
                ? "পণ্য ক্যাটালগে প্রকাশ করুন"
                : "Publish Listing to Catalogue"}
            </button>
          </form>
        </div>

        {/* Right 7 Columns: Existing Showroom Listings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-ink flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent-teal" />
              <span>
                {locale === "bn"
                  ? `আপনার শোরুমের পণ্য তালিকা (${listings.length})`
                  : `Your Organization's Listings (${listings.length})`}
              </span>
            </h2>
          </div>

          {loading ? (
            <p className="text-xs text-secondary">Loading catalogue...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface border border-hairline rounded-lg overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <TileSwatchPreview
                      pattern={item.swatchPattern}
                      dimensionsMm={item.dimensionsMm}
                      surfaceFinish={item.surfaceFinish}
                      brand={item.brand}
                      className="h-36"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="font-mono text-subtle">{item.sku}</span>
                        <span className="px-2 py-0.5 rounded bg-muted border border-hairline font-semibold text-ink">
                          {getModerationLabel(item.moderationStatus, locale)}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-ink leading-snug">
                        {locale === "bn" ? item.titleBn : item.titleEn}
                      </h3>
                      <div className="text-xs font-mono text-secondary">
                        {formatBdt(item.pricePerSqftBdt, locale)} / sq.ft |{" "}
                        {formatBdt(item.pricePerBoxBdt, locale)} / box | Stock:{" "}
                        {item.stockBoxes}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-muted border-t border-hairline flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-ink">
                      Visibility: {item.visibilityStatus}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className="px-3 py-1 rounded border border-hairline bg-surface hover:bg-canvas font-semibold text-ink flex items-center gap-1 cursor-pointer"
                    >
                      {item.visibilityStatus === "ACTIVE" ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Activate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <StockLedger refreshKey={listings.map((listing) => listing.id).join(",")} onSaved={loadCatalogue} />
    </div>
  );
}
