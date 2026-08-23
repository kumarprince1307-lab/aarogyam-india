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

function fetchLandingPageFromSupabase(lpId) {
  return new Promise((resolve) => {
    if (!lpId) return resolve(null);
    const cleanId = encodeURIComponent(String(lpId).trim());
    const apiUrl = `${SUPABASE_URL}/rest/v1/landing_pages?id=eq.${cleanId}&select=id,title,category,content_type,media_url,thumbnail_url,message,share_id,status`;

    const options = {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json'
      },
      timeout: 3500
    };

    const req = https.get(apiUrl, options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const parsed = JSON.parse(rawData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              return resolve(parsed[0]);
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

const CRAWLER_USER_AGENTS = /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|SkypeUriPreview|Google-Structured-Data-Testing-Tool|Googlebot|bingbot|Yahoo|DuckDuckBot|Baiduspider|YandexBot/i;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query || {};
  const lpId = (query.id || query.lp || '').trim();
  const queryShareId = (query.share_id || '').trim();
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
  const finalTitle = (lp?.title || queryTitle || 'Aarogyam India विशेष जानकारी').trim();
  const finalDesc = (lp?.message || queryDesc || 'Aarogyam India में आपका स्वागत है। प्रामाणिक जानकारी, समाधान और परामर्श के लिए अभी देखें।').slice(0, 160).trim();
  const finalShareId = lp?.share_id || queryShareId || '';
  const finalCategory = lp?.category || queryCat || 'agriculture';

  // 3. Determine Media & Thumbnail
  let finalOgImage = DEFAULT_FALLBACK_IMAGE;

  const detectedYtId = extractYoutubeVideoId(queryYt) ||
                       extractYoutubeVideoId(lp?.media_url) ||
                       extractYoutubeVideoId(lp?.thumbnail_url) ||
                       extractYoutubeVideoId(queryThumb);

  const isYouTube = Boolean(detectedYtId || lp?.content_type === 'youtube');

  if (isYouTube && detectedYtId) {
    // YouTube Video Post: High-Quality reliable thumbnail
    finalOgImage = `https://i.ytimg.com/vi/${detectedYtId}/hqdefault.jpg`;
  } else {
    // Image Post
    const candidateImg = lp?.thumbnail_url || lp?.media_url || queryThumb;

    if (candidateImg && candidateImg.startsWith('data:image/')) {
      // User uploaded Base64 image: Served as real binary image by /api/image
      finalOgImage = `${HOST_ORIGIN}/api/image?id=${encodeURIComponent(lp?.id || lpId || 'default')}`;
    } else if (candidateImg && (candidateImg.startsWith('http://') || candidateImg.startsWith('https://'))) {
      finalOgImage = candidateImg;
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
  const isCrawler = CRAWLER_USER_AGENTS.test(userAgent);

  // 5. If Human Visitor, issue immediate 302 Redirect
  if (!isCrawler && !query.debug) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60');
    return res.redirect(302, destinationLandingUrl);
  }

  // 6. If Social Crawler (or debug request), return Pre-Rendered RAW HTML with real OG tags
  const cleanTitle = `${finalTitle} — Aarogyam India`;

  const html = `<!DOCTYPE html>
<html lang="hi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
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

  <!-- Instant Client-Side Fallback Redirect -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(destinationLandingUrl)}">
  <script>window.location.replace('${escapeHtml(destinationLandingUrl)}');</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(destinationLandingUrl)}">${escapeHtml(cleanTitle)}</a>...</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
  return res.status(200).send(html);
};
