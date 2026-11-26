/**
 * Automated Safety Validator for Aarogyam India Pages
 * Validates JSON structure, required dynamic shells, and HTML tag balance.
 */
const fs = require('fs');
const path = require('path');

let errors = 0;
let warnings = 0;

function logError(msg) {
  console.error(`❌ [ERROR] ${msg}`);
  errors++;
}

function logWarn(msg) {
  console.warn(`⚠️ [WARN] ${msg}`);
  warnings++;
}

function logPass(msg) {
  console.log(`✅ [PASS] ${msg}`);
}

console.log('--- Starting Safety Validation ---');

// 1. Validate data/site-pages-config.json
let config = null;
try {
  const raw = fs.readFileSync('data/site-pages-config.json', 'utf8');
  config = JSON.parse(raw);
  if (!config.sitePages || !Array.isArray(config.sitePages)) {
    logError('data/site-pages-config.json does not contain sitePages array!');
  } else {
    logPass(`data/site-pages-config.json is valid (${config.sitePages.length} pages configured)`);
  }
} catch (e) {
  logError(`data/site-pages-config.json JSON parse failed: ${e.message}`);
}

// 2. Validate Core Landing Pages (25 Target Pages: 13 Health, 7 Agriculture, 5 Pashu Palan)
const targetPages = [
  // Health (13)
  { path: 'health/diabetes.html', type: 'health' },
  { path: 'health/weight-loss.html', type: 'health' },
  { path: 'health/joint-care.html', type: 'health' },
  { path: 'health/womens-care.html', type: 'health' },
  { path: 'health/hair-care.html', type: 'health' },
  { path: 'health/skin-care.html', type: 'health' },
  { path: 'health/kids-care.html', type: 'health' },
  { path: 'health/home-care.html', type: 'health' },
  { path: 'health/sexual-wellness.html', type: 'health' },
  { path: 'health/dental-care.html', type: 'health' },
  { path: 'health/liver-care.html', type: 'health' },
  { path: 'health/thyroid-care.html', type: 'health' },
  { path: 'health/heart-care.html', type: 'health' },
  // Agriculture (7)
  { path: 'agriculture/kharif-crops.html', type: 'agri' },
  { path: 'agriculture/rabi-crops.html', type: 'agri' },
  { path: 'agriculture/jayad-summer-crops.html', type: 'agri' },
  { path: 'agriculture/fruit-orchards.html', type: 'agri' },
  { path: 'agriculture/floriculture.html', type: 'agri' },
  { path: 'agriculture/crop-doctor.html', type: 'agri' },
  { path: 'agriculture/medicinal-farming.html', type: 'agri' },
  // Pashu Palan (5)
  { path: 'pashu-palan.html', type: 'pashu' },
  { path: 'pashu-palan/bakra-palan.html', type: 'pashu' },
  { path: 'pashu-palan/machhli-palan.html', type: 'pashu' },
  { path: 'pashu-palan/murgi-palan.html', type: 'pashu' },
  { path: 'pashu-palan/dog-care.html', type: 'pashu' }
];

targetPages.forEach(item => {
  const relPath = item.path;
  if (!fs.existsSync(relPath)) {
    logError(`Page missing: ${relPath}`);
    return;
  }

  const html = fs.readFileSync(relPath, 'utf8');

  // Verify Hero Section Container
  if (!html.includes('id="sec-hero-slider"')) {
    logError(`${relPath}: Missing dynamic hero container #sec-hero-slider!`);
  }

  // Verify KPI Badges Section Container (for Agri & Pashu pages)
  if (item.type === 'agri' || item.type === 'pashu') {
    if (!html.includes('id="sec-kpi-badges"')) {
      logError(`${relPath}: Missing dynamic KPI container #sec-kpi-badges!`);
    }
  }

  // Check balanced divs inside sec-hero-slider
  const heroMatch = html.match(/<section[^>]*id="sec-hero-slider"[\s\S]*?<\/section>/);
  if (heroMatch) {
    const heroHtml = heroMatch[0];
    const opens = (heroHtml.match(/<div(\s|>)/gi) || []).length;
    const closes = (heroHtml.match(/<\/div>/gi) || []).length;
    if (opens !== closes) {
      logError(`${relPath}: Unbalanced <div> tags inside #sec-hero-slider! (opens: ${opens}, closes: ${closes})`);
    }
  }

  // Check live-page-cms-bridge script inclusion
  if (!html.includes('live-page-cms-bridge.js')) {
    logWarn(`${relPath}: live-page-cms-bridge.js not included!`);
  }
});

if (errors === 0) {
  logPass(`All ${targetPages.length} landing pages passed structural integrity check!`);
  console.log(`\n🎉 Validation Succeeded with 0 errors (${warnings} warnings).`);
  process.exit(0);
} else {
  console.error(`\n💥 Validation Failed with ${errors} errors! Fix issues before deploying.`);
  process.exit(1);
}
