// api/send-wake-up-push.js
// Vercel Serverless Function: Dispatches True Web Push to wake up locked / sleeping Android phones via Google FCM

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDosaDIayZKVLvPuuSk5he5fb_Q9aNBOruOkB_Elw_Wk1VMnpwZk3ZyipaCUbWs_i54HBjwe_uxn9-A5lMJZKG8';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'po6Yxh4mRWiNQ0PaAmNu5iFTQ0h3lSmwwOF4IWKFrw0';
const VAPID_SUBJECT = 'mailto:admin@aarogyamindia.online';

const SUPABASE_URL = 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const webpushModule = await import('web-push');
    const webpush = webpushModule.default || webpushModule;
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const body = req.body || {};
    const toasts = Array.isArray(body.toasts) && body.toasts.length > 0 ? body.toasts : (body.toast ? [body.toast] : []);
    const targetMobile = body.targetMobile ? String(body.targetMobile).replace(/\D/g, '').slice(-10) : null;

    if (toasts.length === 0) {
      return res.status(400).json({ error: 'No toasts provided to dispatch' });
    }

    // Pick target toast (first in queue or specified)
    const targetToast = toasts[0];
    const payload = JSON.stringify({
      title: targetToast.title || 'आरोग्यम इंडिया 🌾',
      body: targetToast.message || 'फसल सुरक्षा, मौसम व नई सलाह देखें!',
      icon: targetToast.image || '/images/icons/pwa-icon-192x192.png',
      badge: '/images/icons/pwa-icon-96x96.png',
      image: targetToast.image || undefined,
      url: targetToast.action_url || '/',
      id: targetToast.id || ('notif_' + Date.now())
    });

    // Query subscriber profiles from Supabase
    let queryUrl = `${SUPABASE_URL}/rest/v1/profiles?select=id,mobile,push_subscription&notifications_enabled=eq.true&push_subscription=not.is.null`;
    if (targetMobile) {
      queryUrl += `&mobile=eq.${targetMobile}`;
    }

    const sbRes = await fetch(queryUrl, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });

    if (!sbRes.ok) {
      return res.status(500).json({ error: 'Failed to fetch subscribers from Supabase' });
    }

    const profiles = await sbRes.json();
    if (!Array.isArray(profiles) || profiles.length === 0) {
      return res.status(200).json({
        success: true,
        sent: 0,
        message: 'No subscribers with active push_subscription found yet'
      });
    }

    let successCount = 0;
    let failedCount = 0;

    // Send push to all active subscriptions in parallel
    await Promise.all(profiles.map(async (p) => {
      let sub = p.push_subscription;
      if (typeof sub === 'string') {
        try { sub = JSON.parse(sub); } catch(e) { sub = null; }
      }
      if (!sub || !sub.endpoint) return;

      try {
        await webpush.sendNotification(sub, payload, {
          TTL: 86400, // Keep in Google queue for 24 hours if phone is currently offline
          urgency: 'high' // Wake up Android screen / Heads-up
        });
        successCount++;
      } catch (err) {
        failedCount++;
        // If 410 or 404, subscription has expired / user blocked
        if (err.statusCode === 410 || err.statusCode === 404) {
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${p.id}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({ push_subscription: null, notifications_enabled: false })
            });
          } catch(e) {}
        }
      }
    }));

    return res.status(200).json({
      success: true,
      sent: successCount,
      failed: failedCount,
      total_subscribers: profiles.length
    });
  } catch (error) {
    console.error('Wake-up push error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
