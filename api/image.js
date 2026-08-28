// Vercel Serverless Function: High-Performance Binary Image Server for Base64 Landing Pages
const https = require('https');

const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
const DEFAULT_FALLBACK_IMAGE = 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 25,
  keepAliveMsecs: 60000
});

const _lpImageMemoryCache = new Map();
const LP_IMAGE_CACHE_TTL = 300000; // 5 minutes cache

function fetchLandingPageFromSupabase(lpId) {
  return new Promise((resolve) => {
    if (!lpId) return resolve(null);
    const cleanId = String(lpId).trim();

    // Check memory cache first
    const cached = _lpImageMemoryCache.get(cleanId);
    if (cached && (Date.now() - cached.timestamp < LP_IMAGE_CACHE_TTL)) {
      return resolve(cached.data);
    }

    const apiUrl = `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${encodeURIComponent(cleanId)}&select=id,media_url,thumbnail_url`;

    const options = {
      agent: httpsAgent,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 3000
    };

    const req = https.get(apiUrl, options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const record = parsed[0];
              _lpImageMemoryCache.set(cleanId, { data: record, timestamp: Date.now() });
              if (_lpImageMemoryCache.size > 500) {
                const firstKey = _lpImageMemoryCache.keys().next().value;
                _lpImageMemoryCache.delete(firstKey);
              }
              return resolve(record);
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

// Master Landing Page Runtime Switch (Set true to enable, false for Egress Safe Mode)
const LANDING_PAGES_ENABLED = true;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. If Landing Pages are temporarily OFF, immediately serve the fallback banner with ZERO DB query
  if (!LANDING_PAGES_ENABLED) {
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
  }

  const { id } = req.query || {};

  if (!id) {
    return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
  }

  try {
    const lp = await fetchLandingPageFromSupabase(id);
    const rawImage = lp?.media_url || lp?.thumbnail_url;

    if (!rawImage) {
      return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
    }

    // 1. If stored as Base64 Data URI
    if (rawImage.startsWith('data:image/')) {
      const parts = rawImage.split(';base64,');
      const mimeType = parts[0].replace('data:', '') || 'image/jpeg';
      const base64Data = parts[1];

      if (!base64Data) {
        return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }

      const imgBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', imgBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      return res.status(200).send(imgBuffer);
    }

    // 2. If stored as external HTTP/HTTPS URL
    if (rawImage.startsWith('http://') || rawImage.startsWith('https://')) {
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      return res.redirect(302, rawImage);
    }

    return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
  } catch (error) {
    console.error('Image proxy error:', error);
    return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
  }
};
