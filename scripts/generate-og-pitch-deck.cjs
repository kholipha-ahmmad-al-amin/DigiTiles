const fs = require("fs");
const path = require("path");
const { chromium } = require("@playwright/test");

async function generatePitchDeckOG() {
  console.log("Generating Dual-Safe 1200x630 OG Image for Pitch Deck...");

  // Load font & logo base64
  const fontPathBold = path.join(__dirname, "..", "public", "fonts", "hind-siliguri-bengali-700.woff2");
  const fontPathMedium = path.join(__dirname, "..", "public", "fonts", "hind-siliguri-bengali-500.woff2");
  const fontBase64Bold = fs.existsSync(fontPathBold)
    ? fs.readFileSync(fontPathBold).toString("base64")
    : "";
  const fontBase64Medium = fs.existsSync(fontPathMedium)
    ? fs.readFileSync(fontPathMedium).toString("base64")
    : "";

  const logoPath = path.join(__dirname, "..", "public", "brand", "digitiles-mark.png");
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString("base64")
    : "";

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<style>
  @font-face {
    font-family: 'Hind Siliguri';
    src: url('data:font/woff2;base64,${fontBase64Bold}') format('woff2');
    font-weight: 700;
    font-style: normal;
  }
  @font-face {
    font-family: 'Hind Siliguri';
    src: url('data:font/woff2;base64,${fontBase64Medium}') format('woff2');
    font-weight: 500;
    font-style: normal;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    width: 1200px;
    height: 630px;
    background: #0b0f14;
    color: #f3f4f6;
    font-family: 'Hind Siliguri', system-ui, -apple-system, sans-serif;
    position: relative;
    overflow: hidden;
  }

  /* Architectural Grid Background */
  .grid-bg {
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(#b45309 1.2px, transparent 1.2px), 
      radial-gradient(#0f766e 1.2px, transparent 1.2px);
    background-size: 24px 24px;
    background-position: 0 0, 12px 12px;
    opacity: 0.12;
  }

  /* Subtle Warm Ambient Glow */
  .ambient-glow {
    position: absolute;
    width: 600px;
    height: 600px;
    left: 300px;
    top: 15px;
    background: radial-gradient(circle, rgba(180, 83, 9, 0.22) 0%, rgba(15, 118, 110, 0.14) 45%, transparent 70%);
    pointer-events: none;
  }

  /* LEFT ARCHITECTURAL WING (x: 26..268, w: 242px) */
  .left-wing {
    position: absolute;
    left: 26px;
    top: 18px;
    width: 246px;
    height: 594px;
    background: rgba(18, 24, 32, 0.88);
    border: 1px solid rgba(214, 211, 205, 0.18);
    border-radius: 14px;
    padding: 24px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    backdrop-filter: blur(12px);
  }

  /* RIGHT ARCHITECTURAL WING (x: 932..1174, w: 242px) */
  .right-wing {
    position: absolute;
    left: 928px;
    top: 18px;
    width: 246px;
    height: 594px;
    background: rgba(18, 24, 32, 0.88);
    border: 1px solid rgba(214, 211, 205, 0.18);
    border-radius: 14px;
    padding: 24px 18px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    backdrop-filter: blur(12px);
  }

  /* CENTRAL SQUARE VAULT - WHATSAPP 1:1 SAFE ZONE (x: 302..898, y: 18..612, 596x594 px) */
  .square-vault {
    position: absolute;
    left: 302px;
    top: 18px;
    width: 596px;
    height: 594px;
    background: rgba(18, 24, 32, 0.95);
    border: 2px solid #b45309;
    border-radius: 16px;
    padding: 26px 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 20px 45px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(180, 83, 9, 0.25);
  }

  /* Corner Accent Marks */
  .corner-tl { position: absolute; top: -2px; left: -2px; width: 14px; height: 14px; border-top: 3px solid #fb923c; border-left: 3px solid #fb923c; border-top-left-radius: 16px; }
  .corner-tr { position: absolute; top: -2px; right: -2px; width: 14px; height: 14px; border-top: 3px solid #fb923c; border-right: 3px solid #fb923c; border-top-right-radius: 16px; }
  .corner-bl { position: absolute; bottom: -2px; left: -2px; width: 14px; height: 14px; border-bottom: 3px solid #fb923c; border-left: 3px solid #fb923c; border-bottom-left-radius: 16px; }
  .corner-br { position: absolute; bottom: -2px; right: -2px; width: 14px; height: 14px; border-bottom: 3px solid #fb923c; border-right: 3px solid #fb923c; border-bottom-right-radius: 16px; }

  /* Typography */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(180, 83, 9, 0.15);
    border: 1px solid rgba(251, 146, 60, 0.45);
    color: #fb923c;
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .vault-title {
    font-size: 27px;
    font-weight: 700;
    line-height: 1.25;
    color: #ffffff;
    margin-top: 10px;
    margin-bottom: 6px;
    letter-spacing: -0.01em;
  }

  .vault-sub {
    font-size: 13.5px;
    font-weight: 500;
    color: #cbd5e1;
    line-height: 1.45;
  }

  /* 3 Pillars Grid inside vault */
  .pillars-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin: 12px 0;
  }

  .pillar-box {
    background: rgba(26, 34, 45, 0.9);
    border: 1px solid rgba(214, 211, 205, 0.16);
    border-radius: 10px;
    padding: 10px 8px;
    text-align: center;
  }

  .pillar-num {
    font-family: monospace;
    font-size: 11px;
    font-weight: 700;
    color: #fb923c;
    margin-bottom: 3px;
  }

  .pillar-text {
    font-size: 12px;
    font-weight: 700;
    color: #f3f4f6;
    line-height: 1.35;
  }

  /* Presenter Bar inside vault */
  .presenter-bar {
    background: rgba(26, 34, 45, 0.85);
    border: 1px solid rgba(251, 146, 60, 0.3);
    border-radius: 10px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .presenter-name {
    font-size: 13.5px;
    font-weight: 700;
    color: #ffffff;
  }

  .presenter-role {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 2px;
  }

  .url-badge {
    font-family: monospace;
    font-size: 11px;
    font-weight: 700;
    color: #2dd4bf;
    background: rgba(15, 118, 110, 0.2);
    border: 1px solid rgba(45, 212, 191, 0.4);
    padding: 4px 8px;
    border-radius: 6px;
  }

  /* Wing Cards */
  .wing-title {
    font-size: 13px;
    font-weight: 700;
    color: #fb923c;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid rgba(214, 211, 205, 0.15);
    padding-bottom: 6px;
    margin-bottom: 12px;
  }

  .stat-card {
    background: rgba(26, 34, 45, 0.6);
    border: 1px solid rgba(214, 211, 205, 0.12);
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 10px;
  }

  .stat-val {
    font-family: monospace;
    font-size: 20px;
    font-weight: 700;
    color: #ffffff;
  }

  .stat-label {
    font-size: 11.5px;
    color: #94a3b8;
    line-height: 1.35;
    margin-top: 2px;
  }
</style>
</head>
<body>

<div class="grid-bg"></div>
<div class="ambient-glow"></div>

<!-- LEFT ARCHITECTURAL WING -->
<div class="left-wing">
  <div>
    <div class="wing-title">বাজার সম্ভাবনা (Market)</div>
    <div class="stat-card">
      <div class="stat-val">৬৬%</div>
      <div class="stat-label">কর্মক্ষম তরুণ জনগোষ্ঠী (UNFPA ২০২৫)</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">৭২.৪%</div>
      <div class="stat-label">পরিবারে স্মার্টফোন ব্যবহারকারী (BBS ২০২৫)</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">$৩.২B+</div>
      <div class="stat-label">বাংলাদেশ নির্মাণ ও টাইলস সামগ্রী বাজার</div>
    </div>
  </div>
  <div style="font-size: 11px; color: #64748b; font-family: monospace; border-top: 1px solid rgba(214,211,205,0.12); padding-top: 8px;">
    EquiSaaS BD Research · 2026
  </div>
</div>

<!-- CENTRAL SQUARE VAULT (100% Core Content - WhatsApp 1:1 Safe) -->
<div class="square-vault">
  <div class="corner-tl"></div>
  <div class="corner-tr"></div>
  <div class="corner-bl"></div>
  <div class="corner-br"></div>

  <!-- Header -->
  <div>
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <img src="data:image/png;base64,${logoBase64}" width="38" height="38" style="border-radius: 8px;" />
        <div>
          <span style="font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; display: block; line-height: 1;">DigiTiles</span>
          <span style="font-size: 10.5px; font-family: monospace; color: #fb923c;">Connected Construction Hub</span>
        </div>
      </div>
      <span class="badge">Executive Pitch Deck</span>
    </div>

    <!-- Title -->
    <h1 class="vault-title">
      ডিজিটাইলস: বাংলাদেশের কনস্ট্রাকশন কমার্স ও সার্ভিসেস ইকোসিস্টেম
    </h1>
    <p class="vault-sub">
      টাইলস ও নির্মাণসামগ্রীর সনাতন কেনাকাটাকে একটি স্বচ্ছ, যাচাইকৃত এবং প্রযুক্তিচালিত ডিজিটাল প্ল্যাটফর্মে রূপান্তর।
    </p>
  </div>

  <!-- 3 Pillars Grid -->
  <div class="pillars-grid">
    <div class="pillar-box">
      <div class="pillar-num">স্তম্ভ ০১</div>
      <div class="pillar-text">যাচাইকৃত শোরুম ক্যাটালগ</div>
    </div>
    <div class="pillar-box">
      <div class="pillar-num">স্তম্ভ ০২</div>
      <div class="pillar-text">অপরিবর্তনীয় আরএফকিউ কোটেশন</div>
    </div>
    <div class="pillar-box">
      <div class="pillar-num">স্তম্ভ ০৩</div>
      <div class="pillar-text">সুরক্ষিত ডেলিভারি স্টেট মেশিন</div>
    </div>
  </div>

  <!-- Presenter Footer -->
  <div class="presenter-bar">
    <div>
      <div style="font-size: 10.5px; color: #fb923c; font-weight: 700; text-transform: uppercase;">উপস্থাপক ও প্রতিষ্ঠাতা</div>
      <div class="presenter-name">খলিফা আহম্মেদ আল-আমিন</div>
      <div class="presenter-role">Founder & Lead Systems Architect · EquiSaaS BD</div>
    </div>
    <div class="url-badge">
      /pitch-deck/
    </div>
  </div>
</div>

<!-- RIGHT ARCHITECTURAL WING -->
<div class="right-wing">
  <div>
    <div class="wing-title">সক্ষমতা (Capabilities)</div>
    <div class="stat-card">
      <div class="stat-val">১৫টি মডিউল</div>
      <div class="stat-label">FR-01 থেকে FR-15 এন্টারপ্রাইজ কার্যপদ্ধতি</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">৩ডি ভিজ্যুয়ালাইজার</div>
      <div class="stat-label">রিয়েল-টাইম সারফেস ও কার্টুন ক্যালকুলেটর</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">১০০% টেস্টেড</div>
      <div class="stat-label">Next.js 14, Playwright E2E & WCAG 2.1 AA</div>
    </div>
  </div>
  <div style="font-size: 11px; color: #64748b; font-family: monospace; border-top: 1px solid rgba(214,211,205,0.12); padding-top: 8px;">
    Architecture by Kholipha
  </div>
</div>

</body>
</html>`;

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2, // High-DPI crisp rendering
  });

  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  const outputPath = path.join(__dirname, "..", "public", "og-pitch-deck.png");
  await page.screenshot({ path: outputPath, type: "png" });

  await browser.close();
  console.log("Successfully generated:", outputPath);
}

generatePitchDeckOG().catch((err) => {
  console.error("Failed to generate OG image:", err);
  process.exit(1);
});
