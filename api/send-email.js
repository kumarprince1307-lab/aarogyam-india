// Vercel Serverless Function: Resend Email Delivery Engine for Aarogyam India
// Handles: E-Book Access Delivery, Word (.docx) Bonus Links, Google Drive Folder Links, and Admin Logs

const https = require('https');

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qjhjrzsnrtahmhswxyvb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_6vM_e1EWiYhKdzDP02pKTg_0wJWoLGU';

function sendViaResend(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'AarogyamIndia-Mailer/1.0'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode || 500, data: { raw: data } });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Resend API timeout after 15s'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Background Supabase Logging (Non-blocking)
function logEmailToSupabase(logEntry) {
  try {
    const postData = JSON.stringify(logEntry);
    const host = SUPABASE_URL.replace('https://', '').replace('/', '');
    const options = {
      hostname: host,
      port: 443,
      path: '/rest/v1/email_logs',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 8000
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  } catch (_) {}
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Return recent email logs for Admin Panel Tracker
  if (req.method === 'GET') {
    try {
      const host = SUPABASE_URL.replace('https://', '').replace('/', '');
      const options = {
        hostname: host,
        port: 443,
        path: '/rest/v1/email_logs?select=*&order=created_at.desc&limit=50',
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        timeout: 10000
      };

      const getReq = https.request(options, (getRes) => {
        let body = '';
        getRes.on('data', chunk => { body += chunk; });
        getRes.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            return res.status(200).json({ success: true, logs: Array.isArray(parsed) ? parsed : [] });
          } catch (_) {
            return res.status(200).json({ success: true, logs: [] });
          }
        });
      });
      getReq.on('error', () => res.status(200).json({ success: true, logs: [] }));
      getReq.end();
      return;
    } catch (_) {
      return res.status(200).json({ success: true, logs: [] });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  if (!RESEND_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'RESEND_API_KEY is not configured in Vercel Environment Variables.'
    });
  }

  try {
    const {
      to,
      name = 'किसान साथी',
      bookTitle = 'आरोग्यम इंडिया विशेष ई-बुक',
      bookUrl = 'https://aarogyamindia.online/my-library.html',
      wordDocUrl = '',
      driveUrl = '',
      emailType = 'ebook_access'
    } = req.body || {};

    if (!to || !to.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid recipient email is required.' });
    }

    const cleanName = String(name).trim() || 'किसान साथी';
    const subject = `🎉 बधाई! आपकी ${bookTitle} + VIP बोनस फाइल्स अनलॉक हो चुकी हैं`;

    // High-Converting, Responsive HTML Email Template (Works on Gmail, Outlook & Apple Mail)
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
      </head>
      <body style="margin:0; padding:0; background:#f1f5f9; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; color:#0f172a;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9; padding:20px 0;">
          <tr>
            <td align="center">
              <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; box-shadow:0 8px 24px rgba(0,0,0,0.06);">
                <!-- Header -->
                <tr>
                  <td style="background:#047857; padding:22px 24px; text-align:center;">
                    <h1 style="margin:0; font-size:22px; font-weight:900; color:#ffffff; letter-spacing:0.5px;">🌾 आरोग्यम इंडिया (Aarogyam India)</h1>
                    <p style="margin:6px 0 0; font-size:13px; color:#dcfce7; font-weight:700;">आधिकारिक ई-बुक व डिजिटल ज्ञान केंद्र</p>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding:28px 24px;">
                    <h2 style="margin:0 0 12px; font-size:18px; font-weight:800; color:#0f172a;">
                      नमस्ते, <strong>${cleanName} जी!</strong> 🙏
                    </h2>
                    <p style="margin:0 0 18px; font-size:15px; line-height:1.6; color:#334155;">
                      बधाई हो! आपकी <strong>${bookTitle}</strong> और संबंधित VIP बोनस फाइल्स सफलतापूर्वक आपके खाते में एक्टिवेट कर दी गई हैं।
                    </p>

                    <!-- Main Access Button -->
                    <div style="text-align:center; margin:24px 0;">
                      <a href="${bookUrl}" target="_blank" style="display:inline-block; background:#047857; color:#ffffff; font-weight:900; font-size:16px; padding:14px 28px; text-decoration:none; border-radius:8px; box-shadow:0 4px 12px rgba(4,120,87,0.35);">
                        📖 ई-बुक अभी पढ़ें (Open in Library) ➔
                      </a>
                    </div>

                    ${(wordDocUrl || driveUrl) ? `
                      <!-- Bonus Assets Card -->
                      <div style="background:#f8fafc; border:1.5px solid #cbd5e1; border-radius:10px; padding:18px; margin:22px 0;">
                        <h3 style="margin:0 0 12px; font-size:15px; font-weight:800; color:#1e293b;">
                          🎁 आपके अतिरिक्त VIP डिजिटल बोनस:
                        </h3>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          ${wordDocUrl ? `
                            <tr>
                              <td style="padding:6px 0;">
                                <a href="${wordDocUrl}" target="_blank" style="display:inline-block; background:#2563eb; color:#ffffff; font-weight:700; font-size:13.5px; padding:9px 16px; text-decoration:none; border-radius:6px;">
                                  📝 Word गाइड डाउनलोड करें (.docx)
                                </a>
                              </td>
                            </tr>
                          ` : ''}
                          ${driveUrl ? `
                            <tr>
                              <td style="padding:6px 0;">
                                <a href="${driveUrl}" target="_blank" style="display:inline-block; background:#059669; color:#ffffff; font-weight:700; font-size:13.5px; padding:9px 16px; text-decoration:none; border-radius:6px;">
                                  📁 Google Drive वीडियो व नोट्स फोल्डर खोलें
                                </a>
                              </td>
                            </tr>
                          ` : ''}
                        </table>
                      </div>
                    ` : ''}

                    <!-- Help / Security Note -->
                    <div style="background:#ecfdf5; border-left:4px solid #10b981; padding:12px 14px; border-radius:4px; margin-top:20px;">
                      <p style="margin:0; font-size:13px; color:#065f46; font-weight:600; line-height:1.5;">
                        💡 <strong>महत्वपूर्ण:</strong> यह ई-बुक हमेशा आपकी <strong>'My Library'</strong> में सुरक्षित रहेगी। किसी भी सहायता के लिए हमारी WhatsApp हेल्पलाइन <strong>7974422572</strong> पर संपर्क करें।
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc; padding:16px 24px; text-align:center; border-top:1px solid #e2e8f0; font-size:12px; color:#64748b;">
                    <p style="margin:0 0 4px;">© 2026 Aarogyam India. सम्पूर्ण अधिकार सुरक्षित।</p>
                    <p style="margin:0;">जय जवान • जय किसान • समृद्ध भारत 🇮🇳</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const resendPayload = {
      from: 'Aarogyam India <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: emailHtml
    };

    const resendResult = await sendViaResend(resendPayload);

    const isSuccess = resendResult.status >= 200 && resendResult.status < 300;
    const resendId = resendResult.data && resendResult.data.id ? resendResult.data.id : '';

    // Log to Supabase
    logEmailToSupabase({
      recipient_email: to,
      recipient_name: cleanName,
      subject: subject,
      email_type: emailType,
      status: isSuccess ? 'sent' : 'failed',
      resend_id: resendId,
      meta: { bookTitle, bookUrl, wordDocUrl, driveUrl }
    });

    if (isSuccess) {
      return res.status(200).json({
        success: true,
        message: 'Email delivered successfully via Resend',
        id: resendId
      });
    } else {
      return res.status(resendResult.status || 500).json({
        success: false,
        error: resendResult.data || 'Failed to send email via Resend'
      });
    }
  } catch (error) {
    console.error('Email API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
};
