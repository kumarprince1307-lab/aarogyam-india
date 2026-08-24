// Vercel Serverless Function: Social Share & Open Graph Pre-Renderer for UCAS Landing Pages
const https = require('https');

const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';
const DEFAULT_FALLBACK_IMAGE = 'https://aarogyamindia.online/images/banners/farmer-community-banner.jpeg';
const HOST_ORIGIN = 'https://aarogyamindia.online';

function extractYoutubeVideoId(url) {
  if (!url) return null;
  const str = String(url).trim();
  if (!str || str.startsWith('data:')) return null;

  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  const thumbMatch = str.match(/(?:img\.youtube\.com|i\.ytimg\.com)\/vi\/([a-zA-Z0-9_-]{11})/i);
  if (thumbMatch && thumbMatch[1] && thumbMatch[1].length === 11) {
    return thumbMatch[1];
  }

  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/i,
    /[?&]v=([a-zA-Z0-9_-]{11})/i,
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  ];

  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  return null;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function fetchOpenGraphImage(targetUrl, maxRedirects = 2) {
  return new Promise((resolve) => {
    if (!targetUrl || (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://'))) {
      return resolve(null);
    }
    try {
      const parsed = new URL(targetUrl);
      const isHttps = parsed.protocol === 'https:';
      const client = isHttps ? https : require('http');

      const req = client.get(targetUrl, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        timeout: 3000
      }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
          const nextUrl = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, targetUrl).toString();
          return fetchOpenGraphImage(nextUrl, maxRedirects - 1).then(resolve);
        }

        if (res.statusCode < 200 || res.statusCode >= 300) {
          return resolve(null);
        }

        let raw = '';
        res.on('data', (chunk) => {
          raw += chunk;
          if (raw.length > 500000) req.destroy();
        });
        res.on('end', () => {
          try {
            let m = raw.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
            if (!m) m = raw.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
            if (m && m[1]) {
              let imgUrl = m[1].replace(/&amp;/g, '&');
              return resolve(imgUrl);
            }
            resolve(null);
          } catch (e) {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
    } catch (e) {
      resolve(null);
    }
  });
}

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 25,
  keepAliveMsecs: 60000
});

const _lpShareMemoryCache = new Map();
const LP_SHARE_CACHE_TTL = 300000; // 5 minutes cache

function fetchLandingPageFromSupabase(lpId) {
  return new Promise((resolve) => {
    if (!lpId) return resolve(null);
    const cleanId = String(lpId).trim();

    // Check memory cache first
    const cached = _lpShareMemoryCache.get(cleanId);
    if (cached && (Date.now() - cached.timestamp < LP_SHARE_CACHE_TTL)) {
      return resolve(cached.data);
    }

    const apiUrl = `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${encodeURIComponent(cleanId)}&select=id,title,category,content_type,media_url,thumbnail_url,message,share_id,status,og_title,og_description,og_image_url`;

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
              _lpShareMemoryCache.set(cleanId, { data: record, timestamp: Date.now() });
              if (_lpShareMemoryCache.size > 500) {
                const firstKey = _lpShareMemoryCache.keys().next().value;
                _lpShareMemoryCache.delete(firstKey);
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

const CRAWLER_USER_AGENTS = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|WhatsApp|Slackbot|Discordbot|SkypeUriPreview|Google-Structured-Data-Testing-Tool|Googlebot|bingbot|DuckDuckBot|Baiduspider|YandexBot/i;

function isBotScraper(userAgent) {
  if (!userAgent) return true; // Default to serving crawler HTML for unknown scrapers
  if (/WhatsApp/i.test(userAgent)) return true;
  if (/facebookexternalhit|Facebot|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot/i.test(userAgent)) return true;
  const isHumanBrowser = /Mozilla\/5\.0.*(Mobile|Android|iPhone|iPad|Safari|Chrome)/i.test(userAgent) && !/facebookexternalhit|Facebot|Twitterbot|WhatsApp/i.test(userAgent);
  if (isHumanBrowser) return false;
  return CRAWLER_USER_AGENTS.test(userAgent);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const lpId = (query.id || query.lp || '').trim();
  const queryShareId = (query.share_id || query.ref || '').trim();
  const queryYt = (query.yt || query.v || query.video || '').trim();
  const queryThumb = (query.thumb || query.img || query.thumbnail || '').trim();
  const queryTitle = (query.title || '').trim();
  const queryDesc = (query.desc || query.msg || query.message || '').trim();
  const queryCat = (query.cat || query.category || '').trim();

  // 1. Fetch record from Supabase if ID provided
  let lp = null;
  if (lpId) {
    try {
      lp = await fetchLandingPageFromSupabase(lpId);
    } catch (e) {
      console.warn('Supabase fetch notice:', e);
    }
  }

  // 2. Resolve Content Details
  const rawTitle = (lp?.title || queryTitle || 'Aarogyam India विशेष जानकारी').trim();
  const finalTitle = lp?.og_title || (rawTitle.includes('Aarogyam India') ? rawTitle : `${rawTitle} | Aarogyam India`);
  const finalDesc = (lp?.og_description || lp?.message || queryDesc || 'Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी, समाधान और परामर्श के लिए अभी देखें।').slice(0, 160).trim();
  const finalShareId = lp?.share_id || queryShareId || '';
  const finalCategory = lp?.category || queryCat || 'agriculture';

  // 3. Determine Media & Thumbnail
  let finalOgImage = DEFAULT_FALLBACK_IMAGE;

  const detectedYtId = extractYoutubeVideoId(queryYt) ||
                       extractYoutubeVideoId(lp?.media_url) ||
                       extractYoutubeVideoId(lp?.thumbnail_url) ||
                       extractYoutubeVideoId(queryThumb);

  const isYouTube = Boolean(detectedYtId || lp?.content_type === 'youtube');

  // Check if custom thumbnail (Base64 data URI) was uploaded
  const customThumbData = (lp?.thumbnail_url && lp.thumbnail_url.startsWith('data:image/'))
    ? lp.thumbnail_url
    : (lp?.media_url && lp.media_url.startsWith('data:image/'))
    ? lp.media_url
    : null;

  if (customThumbData) {
    // User explicitly uploaded custom thumbnail image: Served as real binary image by /api/image
    finalOgImage = `${HOST_ORIGIN}/api/image?id=${encodeURIComponent(lp?.id || lpId || 'default')}`;
  } else if (isYouTube && detectedYtId) {
    // YouTube Video Post: High-Quality reliable thumbnail directly from YouTube HQ CDN
    finalOgImage = `https://i.ytimg.com/vi/${detectedYtId}/hqdefault.jpg`;
  } else if (lp?.og_image_url && (lp.og_image_url.startsWith('http://') || lp.og_image_url.startsWith('https://')) && !lp.og_image_url.includes('farmer-community-banner')) {
    finalOgImage = lp.og_image_url;
  } else {
    const candidateImg = lp?.thumbnail_url || queryThumb;
    if (candidateImg && candidateImg.startsWith('data:image/')) {
      finalOgImage = `${HOST_ORIGIN}/api/image?id=${encodeURIComponent(lp?.id || lpId || 'default')}`;
    } else if (candidateImg && (candidateImg.startsWith('http://') || candidateImg.startsWith('https://')) && !candidateImg.includes('farmer-community-banner')) {
      finalOgImage = candidateImg;
    } else if (lp?.media_url && (lp.media_url.startsWith('http://') || lp.media_url.startsWith('https://'))) {
      // Dynamically extract real OG Image from Facebook / Instagram / Web link!
      try {
        const dynamicOg = await fetchOpenGraphImage(lp.media_url);
        if (dynamicOg) {
          finalOgImage = dynamicOg;
        } else {
          finalOgImage = DEFAULT_FALLBACK_IMAGE;
        }
      } catch (ogErr) {
        finalOgImage = DEFAULT_FALLBACK_IMAGE;
      }
    } else {
      finalOgImage = DEFAULT_FALLBACK_IMAGE;
    }
  }

  // 4. Construct Clean Destination URL for Human Visitors
  const destParams = new URLSearchParams();
  if (lpId) destParams.set('id', lpId);
  if (finalShareId) destParams.set('share_id', finalShareId);

  const destinationLandingUrl = `${HOST_ORIGIN}/ucas/landing.html?${destParams.toString()}`;
  const canonicalShareUrl = `${HOST_ORIGIN}/api/share?id=${encodeURIComponent(lpId || '')}${finalShareId ? '&share_id=' + encodeURIComponent(finalShareId) : ''}`;

  const userAgent = String(req.headers['user-agent'] || '');
  const isCrawler = isBotScraper(userAgent);

  // 5. If Human Visitor, issue immediate 302 Redirect
  if (!isCrawler && !query.debug) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    return res.redirect(302, destinationLandingUrl);
  }

  // 6. If Social Crawler (or in-app webview fallback), return Pre-Rendered RAW HTML with real OG tags + instant client redirect
  const cleanTitle = finalTitle.includes('Aarogyam India') ? finalTitle : `${finalTitle} — Aarogyam India`;

  const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanTitle)}</title>

  <!-- Open Graph / WhatsApp & Facebook Crawlers -->
  <meta property="fb:app_id" content="966242223397117">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Aarogyam India">
  <meta property="og:title" content="${escapeHtml(finalTitle)}">
  <meta property="og:description" content="${escapeHtml(finalDesc)}">
  <meta property="og:image" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(finalOgImage)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(finalTitle)}">
  <meta property="og:url" content="${escapeHtml(canonicalShareUrl)}">
  <link rel="image_src" href="${escapeHtml(finalOgImage)}">

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@AarogyamIndia">
  <meta name="twitter:title" content="${escapeHtml(finalTitle)}">
  <meta name="twitter:description" content="${escapeHtml(finalDesc)}">
  <meta name="twitter:image" content="${escapeHtml(finalOgImage)}">
  <link rel="canonical" href="${escapeHtml(canonicalShareUrl)}">

  <!-- Instant Client-Side Redirection for human visitors -->
  <script>
    (function() {
      try {
        window.location.replace("${destinationLandingUrl}");
      } catch (e) {}
    })();
  </script>
  <noscript>
    <meta http-equiv="refresh" content="0;url=${escapeHtml(destinationLandingUrl)}">
  </noscript>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#FFFFFF;max-width:440px;width:90%;margin:20px auto;padding:28px 20px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.08);text-align:center;border:1px solid #E2E8F0;">
    <img src="https://aarogyamindia.online/images/logo/logo.png" alt="Aarogyam India" style="height:44px;margin-bottom:14px;object-fit:contain;">
    <h2 style="font-size:1.15rem;font-weight:800;color:#0F172A;margin:0 0 10px 0;line-height:1.35;">${escapeHtml(cleanTitle)}</h2>
    <p style="font-size:0.88rem;color:#475569;margin:0 0 20px 0;line-height:1.45;">${escapeHtml(finalDesc)}</p>
    <a href="${escapeHtml(destinationLandingUrl)}" style="display:block;padding:14px;background:#0B7A3E;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:800;font-size:1rem;box-shadow:0 4px 12px rgba(11,122,62,0.3);">यहाँ क्लिक करके पूरी जानकारी देखें →</a>
    <div style="margin-top:16px;font-size:0.75rem;color:#94A3B8;">Aarogyam India • सुरक्षित व प्रामाणिक जानकारी</div>
  </div>
  <script>
    setTimeout(function() {
      try { window.location.href = "${destinationLandingUrl}"; } catch(e) {}
    }, 150);
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
};
