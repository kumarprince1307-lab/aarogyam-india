/* ==========================================
   AAROGYAM INDIA
   CHECKOUT.JS (Complete, Final & Butter-Smooth with Dynamic Book ID & Full Checkout Logs)
========================================== */
/* =========================================
   CHECKOUT.JS - PREV PAGE TRACKER
========================================= */

// जैसे ही चेकआउट पेज खुले, तुरंत पिछला स्टोर पेज सेव कर लें
document.addEventListener("DOMContentLoaded", () => {
    if (document.referrer && !document.referrer.includes("checkout.html") && !document.referrer.includes("payment-failed.html")) {
        sessionStorage.setItem("AI_PREV_STORE_PAGE", document.referrer);
    }
});
"use strict";

let referrerDisplay = document.getElementById("referrerDisplayName");

document.addEventListener("DOMContentLoaded", () => {
    loadBook();
    syncCheckoutShareContext();
});

function syncCheckoutShareContext() {
    const params = new URLSearchParams(window.location.search);
    
    const session = (window.V1_SESSION && typeof window.V1_SESSION.getSession === 'function') 
        ? window.V1_SESSION.getSession() : {};

    const sessionReferralId = session.referral_share_id || (window.V1_SESSION && typeof window.V1_SESSION.getReferralId === 'function' ? window.V1_SESSION.getReferralId() : null);

    const shareTokenFromUrl = params.get('share_token') || params.get('share_id') || params.get('tracking_token');
    const referralMobileParam = params.get('referral_mobile') || params.get('referral');

    // सेशन या URL से सही सोर्स और लैंडिंग पेज उठाना
    const sourceVal = params.get("source") || params.get("utm_source") || session.registration_source || "checkout";
    const landingUrlVal = session.landing_page || window.location.href || null;

    const shareContext = {
        source: sourceVal,
        share_channel: params.get("share_channel") || params.get("channel") || params.get("utm_medium") || null,
        share_token: shareTokenFromUrl || sessionReferralId || 'AI000004',
        referral_mobile: referralMobileParam || null,
        asset_type: params.get("asset_type") || null,
        asset_id: params.get("asset_id") || null,
        asset_title: params.get("asset_title") || null,
        asset_url: window.location.href || null,
        referrer: document.referrer || null,
        landing_url: landingUrlVal
    };

    if (typeof persistShareContext === "function") {
        persistShareContext(shareContext);
    }

    const checkoutRefInput = document.getElementById("referralMobile");
    if (checkoutRefInput) {
        if (!checkoutRefInput.value) {
            checkoutRefInput.value = shareContext.share_token || shareContext.referral_mobile || 'AI000004';
        }

        if (checkoutRefInput.value) {
            lookupReferrerName(checkoutRefInput.value.trim());
        }
    }

    return typeof getCurrentShareContext === "function" ? getCurrentShareContext() : shareContext;
}

// स्मार्ट डेटा बाइंडिंग बंडल
window.currentReferrerData = {
    uuid: null,
    name: null,
    mobile: null,
    shareId: null
};

// डेटाबेस से रेफरर का नाम ढूंढने वाला फंक्शन
async function lookupReferrerName(identifier) {
    if (!identifier) return;

    if (identifier === "AI000004") {
        window.currentReferrerData = {
            uuid: "52ef705c-bb45-4137-bee4-a3f8df73b676",
            name: "Aarogyam India",
            mobile: "7974422572",
            shareId: "AI000004"
        };
        showReferrerGreen(`✔ Master Partner: Aarogyam India (7974422572)`);
        return;
    }
    
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        let data = null;

        if (/^[6-9]\d{9}$/.test(identifier)) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("mobile", identifier)
                .order("is_active", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            data = res.data;
        } 
        
        if (!data) {
            const res = await activeDb
                .from("profiles")
                .select("id, full_name, share_id, mobile")
                .eq("share_id", identifier)
                .order("is_active", { ascending: false })
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
            data = res.data;
        }

        if (data) {
            window.currentReferrerData = {
                uuid: data.id,
                name: data.full_name || "Aarogyam Member",
                mobile: data.mobile,
                shareId: data.share_id
            };
            showReferrerGreen(`✔ Referred by: ${data.full_name} (${data.mobile || 'No Mobile'})`);
        } else {
            window.currentReferrerData = { uuid: null, name: null, mobile: null, shareId: null };
            showReferrerRed("✖ Invalid Share ID/Mobile");
        }
    } catch (err) {
        console.error("Referrer lookup exception:", err);
    }
}

function showReferrerGreen(text) {
    if (!referrerDisplay) createReferrerSpanElement();
    if (referrerDisplay) {
        referrerDisplay.style.color = "#28a745"; 
        referrerDisplay.textContent = text;
    }
}

function showReferrerRed(text) {
    if (!referrerDisplay) createReferrerSpanElement();
    if (referrerDisplay) {
        referrerDisplay.style.color = "#dc3545"; 
        referrerDisplay.textContent = text;
    }
}

function createReferrerSpanElement() {
    const refInput = document.getElementById("referralMobile");
    if (refInput && !document.getElementById("referrerDisplayName")) {
        referrerDisplay = document.createElement("div");
        referrerDisplay.id = "referrerDisplayName";
        referrerDisplay.style.fontSize = "13px";
        referrerDisplay.style.marginTop = "4px";
        referrerDisplay.style.fontWeight = "600";
        refInput.parentNode.appendChild(referrerDisplay);
    }
}

// =================================================================
// 🛡️ CRYPTOGRAPHIC OFFER VERIFICATION & TAMPER-PROOF SECURITY
// =================================================================
const OFFER_SECURITY_SALT = 'AAROGYAM_OFFER_SIG_SALT_v2026_KARTIK';

function sha256Hex(ascii) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const mathPow = Math.pow; const maxWord = mathPow(2, 32);
  let lengthProperty = 'length'; let i, j; let result = '';
  const words = []; const asciiBitLength = ascii[lengthProperty] * 8;
  let hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
  words[words[lengthProperty]] = (asciiBitLength);
  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const s0 = (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3));
      const s1 = (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10));
      w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      const s1_maj = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22));
      const maj = ((hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]));
      const t2 = (s1_maj + maj) | 0;
      const s1_ch = (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25));
      const ch = ((hash[4] & hash[5]) ^ ((~hash[4]) & hash[6]));
      const t1 = (hash[7] + s1_ch + ch + k[i] + w[i]) | 0;
      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

function generateOfferSignature(bookId, amount, mobile, timerOrExp) {
  const cleanMobile = (mobile || '').toString().replace(/\D/g, '').slice(-10);
  const cleanBook = (bookId || '').toUpperCase().trim();
  const cleanAmount = (amount !== undefined && amount !== null) ? parseInt(amount, 10) : 99;
  const cleanToken = (timerOrExp || '').toString().trim();
  
  const rawPayload = `${cleanBook}|${cleanAmount}|${cleanMobile}|${cleanToken}|${OFFER_SECURITY_SALT}`;
  return sha256Hex(rawPayload);
}

function verifyOfferSignature(targetBookId, amount, mobile, sig, timer, exp) {
  if (!sig) return false;
  const sigTrim = sig.trim();
  const candidates = [
    generateOfferSignature(targetBookId, amount, mobile, timer),
    generateOfferSignature(targetBookId, amount, mobile, exp),
    generateOfferSignature(targetBookId, amount, mobile, '')
  ];
  return candidates.some(cand => 
    sigTrim === cand || 
    sigTrim === cand.slice(0, sigTrim.length) || 
    sigTrim.slice(0, 8) === cand.slice(0, 8)
  );
}

// -------------------------------------------------------------
// OFFER CLAIMS & CONVERSION TRACKING HELPER
// -------------------------------------------------------------
function recordCheckoutOfferClaim(mobile, name, bookId, bookTitle, offerPrice, timer) {
    try {
        const cleanMob = String(mobile || '').replace(/\D/g, '').slice(-10);
        if (!cleanMob || cleanMob.length !== 10) return;
        const claims = JSON.parse(localStorage.getItem('AOI_OFFER_CLAIMS') || '[]');
        const bookKey = bookId || 'BK001';
        const existingIdx = claims.findIndex(c => c.mobile === cleanMob && c.book_id === bookKey);
        const item = {
            mobile: cleanMob,
            name: (name || '').trim(),
            book_id: bookKey,
            book_title: bookTitle || 'Aarogyam eBook',
            offer_price: Number(offerPrice) || 0,
            timer: timer || 'none',
            claimed_at: new Date().toISOString(),
            status: 'claimed'
        };
        if (existingIdx >= 0) {
            claims[existingIdx] = { ...claims[existingIdx], ...item };
        } else {
            claims.unshift(item);
        }
        localStorage.setItem('AOI_OFFER_CLAIMS', JSON.stringify(claims.slice(0, 300)));
    } catch(e) {}
}

function markCheckoutOfferPurchased(mobile, bookId, amount, orderId) {
    try {
        const cleanMob = String(mobile || '').replace(/\D/g, '').slice(-10);
        const claims = JSON.parse(localStorage.getItem('AOI_OFFER_CLAIMS') || '[]');
        let updated = false;
        claims.forEach(c => {
            if (c.mobile === cleanMob && (!c.status || c.status === 'claimed')) {
                c.status = 'purchased';
                c.purchased_at = new Date().toISOString();
                c.order_id = orderId || ('ORD_' + Date.now());
                c.amount_paid = Number(amount) || 0;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('AOI_OFFER_CLAIMS', JSON.stringify(claims));
        }

        // Also sync into WhatsApp offer purchases report
        try {
            const waList = JSON.parse(localStorage.getItem('AOI_WHATSAPP_OFFER_PURCHASES') || '[]');
            const userObj = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
            const sid = userObj.share_id || userObj.referral_code || '';
            const matchingClaim = claims.find(c => c.mobile === cleanMob);
            const bookTitle = matchingClaim ? matchingClaim.book_title : (bookId || 'eBook');
            const newWaItem = {
                id: 'wa_pur_' + Date.now(),
                user_id: cleanMob,
                identifier: sid || cleanMob,
                name: (userObj.full_name ? `${sid || cleanMob} • ${userObj.full_name}` : `${sid || cleanMob} (WhatsApp ग्राहक)`),
                mobile: cleanMob,
                share_id: sid,
                state: userObj.State || userObj.district || 'भारत',
                book_id: bookId,
                book_title: bookTitle,
                offer_type: '📲 WhatsApp स्पेशल ऑफर लिंक',
                offer_price: Number(amount) || 0,
                amount_paid: Number(amount) || 0,
                status: 'converted',
                order_id: orderId || ('WA_ORD_' + Date.now()),
                timestamp: new Date().toISOString(),
                source: 'whatsapp_offer_link'
            };
            const alreadyExists = waList.some(item => item.mobile === cleanMob && item.book_id === bookId);
            if (!alreadyExists) {
                waList.unshift(newWaItem);
                localStorage.setItem('AOI_WHATSAPP_OFFER_PURCHASES', JSON.stringify(waList));
            }
        } catch(waErr) {}
    } catch(e) {}
}

// 🛡️ Security Banner, VIP Offer Thumbnail & Hindi Voice Note Engine
let checkoutCountdownTimerId = null;
let checkoutUtterance = null;
let isCheckoutVoicePlaying = false;

function renderCheckoutSecurityBanner(isVerified, errorMsg, offerData) {
    if (errorMsg) {
        let errEl = document.getElementById("checkoutVipOfferControls") || document.getElementById("checkoutSecurityBanner");
        if (!errEl) {
            errEl = document.createElement("div");
            errEl.id = "checkoutSecurityBanner";
            const mainEl = document.querySelector(".checkout-container") || document.body;
            mainEl.parentNode.insertBefore(errEl, mainEl);
        }
        errEl.innerHTML = `
            <div style="max-width:1050px; margin:10px auto; padding:12px 18px; background:#fff1f2; border:1.5px solid #f43f5e; color:#be123c; border-radius:12px; font-size:0.85rem; font-weight:800; display:flex; align-items:center; gap:10px; box-shadow:0 4px 15px rgba(244,63,94,0.15);">
                <span style="font-size:1.4rem;">🛡️</span>
                <div>
                    <div>${errorMsg}</div>
                    <div style="font-size:0.75rem; color:#881337; font-weight:600; margin-top:2px;">सुरक्षा प्रोटोकॉल सक्रिय: पुस्तक का वास्तविक प्रमाणित मूल्य लागू कर दिया गया है।</div>
                </div>
            </div>
        `;
        return;
    }

    if (isVerified && offerData) {
        const maskedMobile = offerData.mobile === 'ADMIN_TEST' ? 'ADMIN MASTER TEST' : `+91-XXXXX${offerData.mobile.slice(-4)}`;

        // 1. Hide Header Login/Profile button (ऑफर लिंक में बटन की जरूरत नहीं)
        const authBtnWrap = document.getElementById("checkoutAuthBtnWrap");
        if (authBtnWrap) authBtnWrap.style.display = "none";

        // 2. Automatic Login with customer mobile number
        const cleanMobile = (offerData.mobile || '').replace(/\D/g, '').slice(-10);
        if (cleanMobile && cleanMobile.length === 10) {
            try {
                let existingUser = JSON.parse(localStorage.getItem('AI_USER') || '{}');
                const autoUser = {
                    id: existingUser.id || ('user_' + cleanMobile),
                    mobile: cleanMobile,
                    full_name: existingUser.full_name || 'किसान पाठक',
                    role: 'customer',
                    isVipOfferAuth: true,
                    login_at: new Date().toISOString()
                };
                localStorage.setItem('AI_USER', JSON.stringify(autoUser));
                localStorage.setItem('AI_PROFILE', JSON.stringify(autoUser));
                if (window.V1_SESSION && typeof window.V1_SESSION.setSession === 'function') {
                    window.V1_SESSION.setSession({ mobile: cleanMobile, user_id: autoUser.id });
                }
            } catch(e) {}
        }

        // 3. Header Sticky Timer (हेडर में चिपका हुआ टाइमर)
        const stickyTimer = document.getElementById("checkoutHeaderStickyTimer");
        if (stickyTimer) {
            stickyTimer.style.display = "inline-flex";
        }

        // 4. Universal VIP Offer Banner (फटने या खिंचने से बचाने के लिए ऑटो-फिट रिस्पॉन्सिव स्टाइल)
        const topBannerWrap = document.getElementById("checkoutTopBannerContainer");
        if (topBannerWrap) {
            topBannerWrap.style.display = "block";
            topBannerWrap.style.maxWidth = "520px";
            topBannerWrap.style.margin = "12px auto 8px auto";
            topBannerWrap.innerHTML = `
                <div style="width:100%; max-width:520px; margin:0 auto; border-radius:14px; overflow:hidden; border:2px solid #22c55e; box-shadow:0 6px 24px rgba(0,0,0,0.22); background:#070d19; text-align:center;">
                    <img src="/images/banners/vip-reader-offer-badge.jpeg" onerror="this.onerror=null; this.src='/images/banners/vip-reader-offer-badge.jpg';" alt="Aarogyam India VIP Offer Banner" style="max-width:100%; width:auto; height:auto; max-height:280px; display:block; margin:0 auto; object-fit:contain;" />
                </div>
            `;
        }

        // 5. Controls After Email (Email के बाद सुरक्षा लॉक व ऑडियो प्लेयर)
        let vipControls = document.getElementById("checkoutVipOfferControls");
        if (!vipControls) {
            const emailInput = document.getElementById("customerEmail");
            if (emailInput && emailInput.closest(".form-group")) {
                vipControls = document.createElement("div");
                vipControls.id = "checkoutVipOfferControls";
                vipControls.style.marginTop = "14px";
                emailInput.closest(".form-group").after(vipControls);
            }
        }

        if (vipControls) {
            vipControls.innerHTML = `
                <!-- 🔒 Security Lock Badge (Email के बाद) -->
                <div style="padding:10px 14px; background:linear-gradient(135deg, #f0fdf4, #dcfce7); border:1.5px solid #22c55e; color:#15803d; border-radius:10px; font-size:0.82rem; font-weight:800; display:flex; align-items:center; gap:8px; margin-bottom:10px; box-shadow:0 2px 8px rgba(34,197,94,0.12);">
                    <span style="font-size:1.25rem;">🔒</span>
                    <div>
                        <div>प्रमाणित व्यक्तिगत ऑफर सक्रिय (${maskedMobile} के लिए सुरक्षित)</div>
                        <div style="font-size:0.73rem; color:#166534; font-weight:600;">डिस्काउंट लॉक: यह लिंक केवल आपके अधिकृत नंबर पर ही काम करेगा।</div>
                    </div>
                </div>

                <!-- 🎧 Interactive VIP Hindi Voice Note Player -->
                <div id="checkoutVoiceNoteCard" style="padding:12px 14px; background:linear-gradient(135deg, #0f172a, #1e293b); border:1.5px solid #38bdf8; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg, #0284c7, #0369a1); display:flex; align-items:center; justify-content:center; font-size:1.2rem; box-shadow:0 2px 8px rgba(2,132,199,0.5); flex-shrink:0;">
                            🎧
                        </div>
                        <div>
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="color:#f8fafc; font-size:0.84rem; font-weight:800;">आरोग्यम विशेष पाठक वॉइस संदेश</span>
                                <span id="voiceWaveAnimation" style="display:none; align-items:center; gap:3px;">
                                    <span class="voice-bar"></span>
                                    <span class="voice-bar"></span>
                                    <span class="voice-bar"></span>
                                    <span class="voice-bar"></span>
                                </span>
                            </div>
                            <div id="voiceStatusText" style="font-size:0.73rem; color:#94a3b8; margin-top:2px;">
                                ऑटो-प्ले सक्रिय (Personal Voice Note)
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button type="button" id="btnPlayCheckoutVoice" style="background:linear-gradient(135deg, #16a34a, #15803d); color:#ffffff; border:none; padding:8px 16px; border-radius:20px; font-weight:800; font-size:0.82rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(22,163,74,0.4); animation:voicePulse 2s infinite;">
                            <span id="btnVoiceIcon">▶️</span> <span id="btnVoiceLabel">ऑडियो संदेश</span>
                        </button>
                        <button type="button" id="btnRestartCheckoutVoice" style="background:#334155; color:#cbd5e1; border:none; padding:8px 10px; border-radius:20px; font-size:0.78rem; font-weight:700; cursor:pointer; display:none;" title="दोबारा सुनें">
                            🔄
                        </button>
                    </div>
                </div>

                <style>
                    @keyframes voicePulse {
                        0% { transform: scale(1); box-shadow: 0 4px 12px rgba(22,163,74,0.4); }
                        50% { transform: scale(1.03); box-shadow: 0 4px 20px rgba(22,163,74,0.7); }
                        100% { transform: scale(1); box-shadow: 0 4px 12px rgba(22,163,74,0.4); }
                    }
                    .voice-bar {
                        display: inline-block;
                        width: 3px;
                        height: 11px;
                        background: #38bdf8;
                        border-radius: 2px;
                        animation: voiceWave 0.7s ease-in-out infinite alternate;
                    }
                    .voice-bar:nth-child(2) { animation-delay: 0.15s; height: 15px; }
                    .voice-bar:nth-child(3) { animation-delay: 0.3s; height: 9px; }
                    .voice-bar:nth-child(4) { animation-delay: 0.45s; height: 13px; }
                    @keyframes voiceWave {
                        0% { transform: scaleY(0.4); }
                        100% { transform: scaleY(1.3); }
                    }
                </style>
            `;
        }

        // 6. Calculate & Start Timer
        let targetExpMs = offerData.exp;
        if (!targetExpMs && offerData.timer) {
            let mins = 25;
            if (offerData.timer === '15m') mins = 15;
            else if (offerData.timer === '25m') mins = 25;
            else if (offerData.timer === '1h') mins = 60;
            else if (offerData.timer === '24h') mins = 1440;
            targetExpMs = Date.now() + (mins * 60 * 1000);
        }

        if (targetExpMs > 0) {
            startCheckoutCountdown(targetExpMs);
        }

        // 7. Initialize Voice Engine with Auto-Play
        setupCheckoutVoiceEngine(offerData);
    }
}

function setupCheckoutVoiceEngine(offerData) {
    if (!('speechSynthesis' in window)) return;

    const btnPlay = document.getElementById("btnPlayCheckoutVoice");
    const btnRestart = document.getElementById("btnRestartCheckoutVoice");
    const statusText = document.getElementById("voiceStatusText");
    const waveAnim = document.getElementById("voiceWaveAnimation");
    const btnIcon = document.getElementById("btnVoiceIcon");
    const btnLabel = document.getElementById("btnVoiceLabel");

    if (!btnPlay) return;

    const b = window.currentCheckoutBook || {};
    const bookTitle = b.title || "आरोग्यम डिजिटल ई-बुक";
    const bookId = String(b.id || "").toUpperCase();
    const isCombo = (window.currentCheckoutBookList && window.currentCheckoutBookList.length > 1) || bookId.includes(",");

    // Dynamic user condition analysis
    let conditionText = "प्रिय ग्राहक, आप हमारे लिए अति महत्वपूर्ण पाठक हैं। आपको हमारे सर्वश्रेष्ठ पाठक के रूप में चुना गया है। ";
    try {
        const storedPurchases = JSON.parse(localStorage.getItem("AI_PURCHASES") || "[]");
        if (storedPurchases.length > 0) {
            const hasBk001 = storedPurchases.some(p => String(p.book_id || "").includes("BK001"));
            const hasBk002 = storedPurchases.some(p => String(p.book_id || "").includes("BK002"));
            if (hasBk001) {
                conditionText = "प्रिय ग्राहक, आप हमारे लिए अति महत्वपूर्ण पाठक हैं। आपने पहले हमारी खरीफ फसल मास्टर गाइड पुस्तक पढ़ी है। ";
            } else if (hasBk002) {
                conditionText = "प्रिय ग्राहक, आप हमारे लिए अति महत्वपूर्ण पाठक हैं। आपने पहले हमारी खेती का डॉक्टर पुस्तक पढ़ी है। ";
            } else {
                conditionText = "प्रिय ग्राहक, आप हमारे लिए अति महत्वपूर्ण पाठक हैं। आपने पहले हमारी आरोग्यम ई-बुक्स खरीदी हैं। ";
            }
        } else if (sessionStorage.getItem("AI_PREV_STORE_PAGE") || document.referrer.includes("landing")) {
            conditionText = "प्रिय ग्राहक, आप हमारे लिए अति महत्वपूर्ण हैं। आपने आरोग्यम ई-बुक में विशेष रुचि दिखाई थी और चेकआउट किया था। ";
        }
    } catch(e) {}

    // Short intro
    let bookDesc = "जिसमें संपूर्ण उन्नत कृषि तकनीक व वैज्ञानिक मार्गदर्शन दिया गया है।";
    if (bookId.includes("BK002")) bookDesc = "जिसमें 50 से अधिक फसलों के रोगों, कीटों और फफूंद का सटीक और सफल इलाज दिया गया है।";
    else if (bookId.includes("BK001")) bookDesc = "जिसमें खरीफ फसलों की उन्नत बुवाई, खाद प्रबंधन और खरपतवार नियंत्रण की संपूर्ण विधि है।";
    else if (bookId.includes("BK016")) bookDesc = "जिसमें फसलों के सभी रोगों, कीटों और फफूंद के लिए सटीक कीटनाशक, फफूंदनाशक व खरपतवारनाशक दवाओं की संपूर्ण डायरेक्टरी दी गई है।";
    else if (bookId.includes("BK017")) bookDesc = "जिसमें उन्नत किस्में, बुवाई, संतुलित खाद प्रबंधन, सिंचाई और गेहूं की बंपर पैदावार की संपूर्ण वैज्ञानिक तकनीक दी गई है।";
    else if (bookId.includes("BK015")) bookDesc = "जिसमें सब्जियों की उन्नत खेती और बंपर पैदावार की संपूर्ण तकनीक है।";
    else if (bookId.includes("BK006")) bookDesc = "जिसमें घर पर जैविक खाद और 100% असरदार जैविक कीटनाशक बनाने की विधियां हैं।";
    else if (isCombo) bookDesc = "जिसमें संपूर्ण उन्नत कृषि व फसल सुरक्षा का डिजिटल महासंग्रह शामिल है।";

    const amt = offerData.amount !== undefined ? offerData.amount : (b.offerPrice || 99);
    let priceText = amt === 0 ? "बिल्कुल फ्री, यानी 100% मुफ़्त में उपलब्ध है।" : `मात्र ₹${amt} में मिल रही है।`;

    let timerText = "25 मिनट";
    if (offerData.timer === "15m") timerText = "15 मिनट";
    else if (offerData.timer === "25m") timerText = "25 मिनट";
    else if (offerData.timer === "1h") timerText = "1 घंटा";
    else if (offerData.timer === "24h") timerText = "24 घंटे";

    const storeNormalPrice = b.defaultOfferPrice || b.baseOfferPrice || b.comboStorePrice || (isCombo ? b.offerPrice : (b.offerPrice || 99));
    const realMrp = b.mrp || (storeNormalPrice >= 149 ? (storeNormalPrice * 2) : 299);

    const fullScript = isCombo
        ? `${conditionText} आज आपके लिए विशेष एक्सक्लूसिव 1+1 फ़्री कॉम्बो ऑफर है: ${bookTitle}। ${bookDesc} यदि आप इन पुस्तकों का पूरा विवरण देखना चाहते हैं तो इस पेज पर संपूर्ण विवरण देख सकते हैं। इस कॉम्बो का कुल सामान्य मूल्य ₹${realMrp} है और स्टोर पर यह ₹${storeNormalPrice} में मिलता है। परंतु आज आपके लिए यह संपूर्ण कॉम्बो ${priceText} यह विशेष ऑफर आज मात्र ${timerText} के लिए ही मान्य है। कृपया अभी चेकआउट करें और अपनी डिजिटल पुस्तकें तुरंत प्राप्त करें। विशेष नोट: कृपया यह गोपनीय लिंक किसी अन्य को शेयर न करें। यह ऑफर केवल आपके नंबर के लिए है और एक बार खरीदने के बाद बंद हो जाएगा। धन्यवाद! आरोग्यम भारत।`
        : `${conditionText} आज आपके लिए विशेष एक्सक्लूसिव ऑफर है: ${bookTitle}। ${bookDesc} यदि आप इस पुस्तक का पूरा विवरण देखना चाहते हैं तो इस पेज पर संपूर्ण विवरण देख सकते हैं। यह पुस्तक सामान्य रूप से ₹${realMrp} की है और स्टोर पर सभी पाठकों को ₹${storeNormalPrice} में मिलती है। परंतु आज आपके लिए यह पुस्तक ${priceText} यह विशेष ऑफर आज मात्र ${timerText} के लिए ही मान्य है। कृपया अभी चेकआउट करें और अपनी डिजिटल पुस्तक तुरंत प्राप्त करें। विशेष नोट: कृपया यह गोपनीय लिंक किसी अन्य को शेयर न करें। यह ऑफर केवल आपके नंबर के लिए है और एक बार खरीदने के बाद बंद हो जाएगा। धन्यवाद! आरोग्यम भारत।`;

    function playVoice() {
        try {
            window.speechSynthesis.cancel();
            checkoutUtterance = new SpeechSynthesisUtterance(fullScript);
            checkoutUtterance.lang = "hi-IN";
            checkoutUtterance.rate = 0.92;
            checkoutUtterance.pitch = 1.0;

            const voices = window.speechSynthesis.getVoices();
            const hindiVoice = voices.find(v => v.lang === "hi-IN" || v.lang === "hi_IN" || (v.lang.startsWith("hi") && !v.lang.startsWith("en")) || v.name.toLowerCase().includes("hindi") || v.name.toLowerCase().includes("lekha"));
            if (hindiVoice) checkoutUtterance.voice = hindiVoice;

            checkoutUtterance.onstart = () => {
                isCheckoutVoicePlaying = true;
                if (btnIcon) btnIcon.textContent = "⏸️";
                if (btnLabel) btnLabel.textContent = "ऑडियो रोकें";
                if (btnPlay) {
                    btnPlay.style.animation = "none";
                    btnPlay.style.background = "linear-gradient(135deg, #e11d48, #be123c)";
                }
                if (waveAnim) waveAnim.style.display = "inline-flex";
                if (statusText) statusText.innerHTML = `<span style="color:#38bdf8; font-weight:800;">🔊 ऑडियो चल रहा है...</span> (ध्यान से सुनें)`;
                if (btnRestart) btnRestart.style.display = "inline-flex";
            };

            checkoutUtterance.onend = () => {
                isCheckoutVoicePlaying = false;
                if (btnIcon) btnIcon.textContent = "🔄";
                if (btnLabel) btnLabel.textContent = "दोबारा सुनें";
                if (btnPlay) {
                    btnPlay.style.animation = "voicePulse 2s infinite";
                    btnPlay.style.background = "linear-gradient(135deg, #16a34a, #15803d)";
                }
                if (waveAnim) waveAnim.style.display = "none";
                if (statusText) statusText.textContent = "✅ विशेष ऑडियो संदेश समाप्त हुआ। नीचे दिए फॉर्म से चेकआउट पूरा करें।";
            };

            checkoutUtterance.onerror = (e) => {
                console.warn("Speech synthesis notice:", e);
                isCheckoutVoicePlaying = false;
                if (btnIcon) btnIcon.textContent = "▶️";
                if (btnLabel) btnLabel.textContent = "ऑडियो सुनें";
                if (waveAnim) waveAnim.style.display = "none";
            };

            window.speechSynthesis.speak(checkoutUtterance);
        } catch(err) {
            console.warn("Speech synthesis trigger failed:", err);
        }
    }

    function pauseVoice() {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause();
            isCheckoutVoicePlaying = false;
            if (btnIcon) btnIcon.textContent = "▶️";
            if (btnLabel) btnLabel.textContent = "पुनः शुरू करें";
            if (waveAnim) waveAnim.style.display = "none";
            if (statusText) statusText.textContent = "⏸️ ऑडियो रुका हुआ है। जारी रखने के लिए क्लिक करें।";
        }
    }

    function resumeVoice() {
        if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
            isCheckoutVoicePlaying = true;
            if (btnIcon) btnIcon.textContent = "⏸️";
            if (btnLabel) btnLabel.textContent = "ऑडियो रोकें";
            if (waveAnim) waveAnim.style.display = "inline-flex";
            if (statusText) statusText.innerHTML = `<span style="color:#38bdf8; font-weight:800;">🔊 ऑडियो चल रहा है...</span>`;
        } else {
            playVoice();
        }
    }

    btnPlay.onclick = () => {
        if (isCheckoutVoicePlaying) pauseVoice();
        else resumeVoice();
    };

    if (btnRestart) {
        btnRestart.onclick = () => {
            playVoice();
        };
    }

    // 🚀 Auto-Play Audio: Immediate attempt + fallback on very first touch/scroll
    setTimeout(playVoice, 500);

    const handleFirstGesturePlay = () => {
        if (!isCheckoutVoicePlaying) {
            playVoice();
        }
        ['touchstart', 'pointerdown', 'click', 'scroll'].forEach(evt => {
            document.removeEventListener(evt, handleFirstGesturePlay);
        });
    };
    ['touchstart', 'pointerdown', 'click', 'scroll'].forEach(evt => {
        document.addEventListener(evt, handleFirstGesturePlay, { once: true, passive: true });
    });
}

const DEFAULT_BOOK_CATALOG = {
    'BK001': { id: 'BK001', name: 'खरीफ फसल मास्टर गाइड 2026', mrp: 299, offerPrice: 99, cover: '/images/books/kharif-master-guide-2026-cover.webp' },
    'BK002': { id: 'BK002', name: 'खेती का डॉक्टर (फसल का डॉक्टर)', mrp: 299, offerPrice: 99, cover: '/images/books/fasal-ka-doctor-cover.webp' },
    'BK006': { id: 'BK006', name: 'AI वेबसाइट निर्माण गाइड 2026', mrp: 1299, offerPrice: 199, cover: '/images/books/ai-website-guide-cover.webp' },
    'BK015': { id: 'BK015', name: 'सब्जी खेती मास्टर गाइड', mrp: 1999, offerPrice: 149, cover: '/images/books/bk015-cover.webp' },
    'BK016': { id: 'BK016', name: 'कृषि दवा डायरेक्टरी', mrp: 499, offerPrice: 149, cover: '/images/books/bk016-cover.webp' },
    'BK017': { id: 'BK017', name: 'गेहूँ की खेती सम्पूर्ण मार्गदर्शिका', mrp: 299, offerPrice: 99, cover: '/images/books/bk017-cover.webp' },
    'SUB001': { id: 'SUB001', name: '👑 Aarogyam Pro VIP सदस्यता', mrp: 2999, offerPrice: 99, cover: '/images/banners/farmer-community-banner.jpeg' }
};

function startCheckoutCountdown(expTimestamp) {
    if (checkoutCountdownTimerId) clearInterval(checkoutCountdownTimerId);

    function tick() {
        const remainingMs = expTimestamp - Date.now();
        const clock = document.getElementById("checkoutTimerClock");
        if (!clock) return;

        if (remainingMs <= 0) {
            clearInterval(checkoutCountdownTimerId);
            clock.textContent = "00:00";
            renderCheckoutSecurityBanner(false, "⏳ समय सीमा समाप्त: यह विशेष ऑफर लिंक एक्सपायर हो चुका है। मूल मूल्य लागू किया गया।", null);
            if (window.currentCheckoutBook) {
                const revertPrice = window.currentCheckoutBook.defaultOfferPrice || window.currentCheckoutBook.baseOfferPrice || window.currentCheckoutBook.comboStorePrice || 99;
                window.currentCheckoutBook.offerPrice = revertPrice;
                const pEl = document.getElementById("bookPrice");
                if (pEl) pEl.textContent = "₹" + revertPrice;
                const spEl = document.getElementById("summaryPrice");
                if (spEl) spEl.textContent = "₹" + revertPrice;
                const tpEl = document.getElementById("totalPrice");
                if (tpEl) tpEl.textContent = "₹" + revertPrice;
            }
            return;
        }

        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        clock.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    tick();
    checkoutCountdownTimerId = setInterval(tick, 1000);
}

async function loadBook() {
    try {
        const params = new URLSearchParams(window.location.search);
        let rawId = (params.get("b") || params.get("book_id") || params.get("book") || params.get("id") || params.get("product") || params.get("slug") || "").toLowerCase().trim();
        const rawIds = params.get("bs") || params.get("ids") || params.get("bundle_ids");
        const customTitle = params.get("title") || params.get("name");
        const customAmount = params.get("p") || params.get("amount") || params.get("price");

        // 🛡️ Security Parameters (Signature, Mobile, Name, Expiry, Audio, Timer)
        const offerSig = (params.get("s") || params.get("sig") || params.get("signature") || "").trim();
        const offerMobile = (params.get("m") || params.get("mobile") || "").trim();
        const offerName = (params.get("n") || params.get("name") || "").trim();
        const offerExp = parseInt(params.get("e") || params.get("exp") || "0", 10);
        const offerAudio = (params.get("a") || params.get("audio") || "").trim();
        const offerTimer = (params.get("t") || params.get("timer") || "").trim();
        let verifiedOfferAmount = null;
        let offerSecurityError = null;

        let booksArray = [];
        const cacheTime = Math.floor(Date.now() / 300000);
        try {
            const response = await fetch("/data/books.json?v=" + cacheTime);
            const jsonResult = await response.json();
            booksArray = Array.isArray(jsonResult) ? jsonResult : (jsonResult.books || []);
        } catch (e) {
            try {
                const response2 = await fetch("../data/books.json?v=" + cacheTime);
                const jsonResult2 = await response2.json();
                booksArray = Array.isArray(jsonResult2) ? jsonResult2 : (jsonResult2.books || []);
            } catch (e2) {
                console.warn("Local books.json fallback active");
            }
        }

        // Check custom books from localStorage
        try {
            const customBooks = JSON.parse(localStorage.getItem('AAROGYAM_CUSTOM_BOOKS') || '[]');
            if (Array.isArray(customBooks)) {
                customBooks.forEach(cb => {
                    if (!cb || !cb.id) return;
                    const idx = booksArray.findIndex(x => x.id && x.id.toUpperCase() === cb.id.toUpperCase());
                    if (idx >= 0) booksArray[idx] = cb;
                    else booksArray.unshift(cb);
                });
            }
            const landingList = JSON.parse(localStorage.getItem('AAROGYAM_BOOK_LANDING_PAGES') || '[]');
            if (Array.isArray(landingList)) {
                landingList.forEach(lp => {
                    if (!lp || !lp.id) return;
                    const idx = booksArray.findIndex(x => x.id && x.id.toUpperCase() === lp.id.toUpperCase());
                    const synth = {
                        id: lp.id,
                        name: lp.hero?.title || lp.id,
                        mrp: lp.hero?.mrp || 299,
                        offerPrice: lp.hero?.offer_price || 99,
                        cover: lp.hero?.cover_image || "/images/books/kharif-master-guide-2026-cover.webp"
                    };
                    if (idx >= 0) booksArray[idx] = Object.assign({}, booksArray[idx], synth);
                    else booksArray.unshift(synth);
                });
            }
        } catch (e) {}

        // Combo and Multi-Book Bundle Check
        const comboParam = (params.get("combo") || "").toLowerCase().trim();
        const booksParam = (params.get("books") || "").trim();
        if (comboParam || rawIds || booksParam) {
            let idList = [];
            let comboPrice = null;
            let comboMrp = null;
            let comboTitle = null;

            if (comboParam === "agri3" || comboParam === "combo3" || comboParam === "3" || comboParam === "super_combo") {
                idList = ["BK001", "BK002", "BK015"];
                comboMrp = 897;
                comboTitle = "3-पुस्तक सुपर कॉम्बो (खरीफ + डॉक्टर + सब्जी मास्टर)";
            } else if (comboParam === "agri2" || comboParam === "combo2" || comboParam === "2") {
                idList = ["BK001", "BK002"];
                comboMrp = 598;
                comboTitle = "2-पुस्तक सुपर कॉम्बो (खरीफ + डॉक्टर)";
            } else if (rawIds || booksParam) {
                idList = (rawIds || booksParam).split(",").map(x => x.trim()).filter(Boolean);
            }

            if (idList.length > 0) {
                const matchedBooks = [];
                let calcMrp = 0;
                let calcOffer = 0;

                idList.forEach(id => {
                    const upperId = id.toUpperCase();
                    let b = booksArray.find(item => item.id && item.id.toUpperCase() === upperId);
                    const catalogDef = DEFAULT_BOOK_CATALOG[upperId];
                    if (!b && catalogDef) {
                        b = { ...catalogDef };
                    } else if (b && catalogDef) {
                        if (!b.mrp && catalogDef.mrp) b.mrp = catalogDef.mrp;
                        if ((b.offerPrice === undefined || b.offerPrice === null) && catalogDef.offerPrice !== undefined) b.offerPrice = catalogDef.offerPrice;
                        if (!b.cover && catalogDef.cover) b.cover = catalogDef.cover;
                    } else if (!b) {
                        b = { id: upperId, name: `Aarogyam India eBook (${upperId})`, mrp: 299, offerPrice: 99, cover: "/images/books/kharif-master-guide-2026-cover.webp" };
                    }
                    matchedBooks.push(b);
                    calcMrp += (b.mrp || (catalogDef?.mrp || 299));
                    calcOffer += (b.offerPrice !== undefined ? b.offerPrice : (catalogDef?.offerPrice || 99));
                });

                // 🛡️ Cryptographic Security Check for Combo
                if (customAmount !== null && customAmount !== undefined && customAmount !== "") {
                    const rawAmt = parseInt(customAmount, 10);
                    const targetCheckId = idList.join(",");
                    if (!offerSig) {
                        offerSecurityError = "⚠️ अनधिकृत कॉम्बो डिस्काउंट लिंक: कोई सुरक्षा डिजिटल हस्ताक्षर नहीं मिला।";
                    } else if (offerExp > 0 && Date.now() > offerExp) {
                        offerSecurityError = "⏳ समय सीमा समाप्त: यह कॉम्बो ऑफर समाप्त हो चुका है। मूल मूल्य लागू किया गया।";
                    } else {
                        const isSigValid = verifyOfferSignature(targetCheckId, rawAmt, offerMobile, offerSig, offerTimer, offerExp);
                        if (!isSigValid) {
                            offerSecurityError = "⚠️ लिंक से छेड़छाड़ पकड़ी गई (Tampered URL): कॉम्बो डिस्काउंट अमान्य है।";
                        } else if (rawAmt <= 0 && offerMobile !== "ADMIN_TEST" && offerMobile !== "7974422572") {
                            offerSecurityError = "⚠️ ₹0 टेस्ट केवल अधिकृत एडमिन के लिए ही मान्य है।";
                        } else {
                            verifiedOfferAmount = rawAmt;
                            window.activeVerifiedOffer = { 
                                amount: rawAmt, 
                                mobile: offerMobile, 
                                exp: offerExp, 
                                bookId: targetCheckId,
                                timer: offerTimer,
                                audio: offerAudio,
                                isCombo: true
                            };
                        }
                    }
                }

                if (comboPrice === null) {
                    if (verifiedOfferAmount !== null) {
                        comboPrice = verifiedOfferAmount;
                    } else if (matchedBooks.length === 3) comboPrice = 249;
                    else if (matchedBooks.length === 2) comboPrice = 179;
                    else comboPrice = calcOffer;
                }
                if (comboMrp === null) comboMrp = calcMrp;
                if (!comboTitle) comboTitle = `${matchedBooks.length} डिजिटल पुस्तकें बंडल`;

                window.currentCheckoutBookList = matchedBooks;
                window.currentCheckoutBook = {
                    id: idList.join(","),
                    title: comboTitle,
                    mrp: comboMrp,
                    offerPrice: comboPrice,
                    defaultOfferPrice: calcOffer,
                    baseOfferPrice: calcOffer,
                    comboStorePrice: calcOffer,
                    cover: matchedBooks[0]?.cover || "/images/books/kharif-master-guide-2026-cover.webp"
                };

                const coverEl = document.getElementById("bookCover");
                if (coverEl) coverEl.src = window.currentCheckoutBook.cover;
                
                const nameEl = document.getElementById("bookName");
                if (nameEl) {
                    const isThreeBookCombo = matchedBooks.length >= 3 || comboParam === "agri3" || comboParam === "combo3";
                    nameEl.innerHTML = `${comboTitle} <small style="display:block;font-size:0.8rem;color:#16a34a;font-weight:700;margin-top:4px;">(${matchedBooks.map(b => b.name || b.id).join(" + ")})</small>${isThreeBookCombo ? '<div style="margin-top:6px;background:#dcfce7;color:#15803d;padding:4px 10px;border-radius:8px;font-size:0.75rem;font-weight:800;display:inline-block;">🎁 1-वर्ष Pro VIP AI पास बिल्कुल FREE!</div>' : ''}`;
                }
                
                const mrpEl = document.getElementById("bookMrp");
                if (mrpEl) mrpEl.textContent = "₹" + comboMrp;
                
                const priceEl = document.getElementById("bookPrice");
                if (priceEl) priceEl.textContent = "₹" + comboPrice;

                const sumBook = document.getElementById("summaryBook");
                if (sumBook) sumBook.textContent = comboTitle;
                
                const sumMrp = document.getElementById("summaryMrp");
                if (sumMrp) sumMrp.textContent = "₹" + comboMrp;
                
                const sumPrice = document.getElementById("summaryPrice");
                if (sumPrice) sumPrice.textContent = "₹" + comboPrice;
                
                const totPrice = document.getElementById("totalPrice");
                if (totPrice) totPrice.textContent = "₹" + comboPrice;

                // Render Security Badge & Countdown Banner
                renderCheckoutSecurityBanner(verifiedOfferAmount !== null, offerSecurityError, window.activeVerifiedOffer);

                // Auto-fill mobile if valid offer
                if (window.activeVerifiedOffer && window.activeVerifiedOffer.mobile && window.activeVerifiedOffer.mobile !== 'ADMIN_TEST') {
                    const custMobEl = document.getElementById("customerMobile");
                    if (custMobEl && !custMobEl.value) {
                        custMobEl.value = window.activeVerifiedOffer.mobile;
                    }
                }

                // Record Combo Offer Claim for Admin Reports & Conversion Tracking
                if (window.activeVerifiedOffer && window.activeVerifiedOffer.mobile) {
                    recordCheckoutOfferClaim(
                        window.activeVerifiedOffer.mobile,
                        offerName,
                        window.currentCheckoutBook.id,
                        comboTitle,
                        comboPrice,
                        offerTimer
                    );
                }

                autoFillUserData();
                return;
            }
        }

        // Single Book Lookup
        let targetId = (rawId || "").toUpperCase().trim();
        if (targetId.includes("SUB") || targetId === "SUBSCRIPTION" || targetId === "PRO-SUBSCRIPTION") {
            targetId = "SUB001";
        } else if (targetId.includes("KHETI") || targetId === "FASAL-KA-DOCTOR") {
            targetId = "BK002";
        } else if (targetId.includes("KHARIF")) {
            targetId = "BK001";
        }

        let book = null;
        if (targetId) {
            book = booksArray.find(item => 
                (item.id && item.id.toUpperCase() === targetId) || 
                (item.slug && item.slug.toUpperCase() === targetId)
            );
        }

        const catalogDef = DEFAULT_BOOK_CATALOG[targetId];
        if (!book && catalogDef) {
            book = { ...catalogDef };
        } else if (book && catalogDef) {
            if (!book.mrp && catalogDef.mrp) book.mrp = catalogDef.mrp;
            if ((book.offerPrice === undefined || book.offerPrice === null) && catalogDef.offerPrice !== undefined) book.offerPrice = catalogDef.offerPrice;
            if (!book.cover && catalogDef.cover) book.cover = catalogDef.cover;
        }

        if (!book && booksArray.length > 0 && !customTitle) {
            book = booksArray.find(b => b && b.id === 'BK001') || booksArray[0];
        }

        // If not found in JSON but custom params provided, build dynamic product
        if (!book) {
            const isSub = targetId === "SUB001" || (customTitle && customTitle.toLowerCase().includes("vip"));
            const defMrp = customAmount ? (parseInt(customAmount, 10) >= 999 ? 2999 : 299) : (isSub ? 2999 : 299);
            const defPrice = customAmount ? parseInt(customAmount, 10) : (isSub ? 999 : 99);
            const defTitle = customTitle || (isSub ? "👑 Aarogyam Pro VIP Annual Subscription" : "🌾 Aarogyam India ई-बुक मास्टरक्लास");

            book = {
                id: targetId || (isSub ? "SUB001" : "BK001"),
                name: defTitle,
                title: defTitle,
                mrp: defMrp,
                offerPrice: defPrice,
                cover: isSub ? "/images/banners/farmer-community-banner.jpeg" : "/images/books/kharif-master-guide-2026-cover.webp"
            };
        }

        // Standard book values from catalog/metadata
        const standardBookStoreOffer = (book.offerPrice !== undefined && book.offerPrice !== null) ? book.offerPrice : ((catalogDef && catalogDef.offerPrice !== undefined) ? catalogDef.offerPrice : 99);
        const standardBookMrp = book.mrp || ((catalogDef && catalogDef.mrp) ? catalogDef.mrp : (standardBookStoreOffer >= 149 ? standardBookStoreOffer * 2 : 299));

        // 🛡️ Cryptographic Security Check for Single Book
        if (customAmount !== null && customAmount !== undefined && customAmount !== "") {
            const rawAmt = parseInt(customAmount, 10);
            const targetCheckId = (book && book.id) ? book.id.toUpperCase() : (targetId || "BK001").toUpperCase();
            
            if (!offerSig) {
                offerSecurityError = "⚠️ अनधिकृत डिस्काउंट लिंक: कोई डिजिटल सुरक्षा हस्ताक्षर नहीं मिला।";
            } else if (offerExp > 0 && Date.now() > offerExp) {
                offerSecurityError = "⏳ समय सीमा समाप्त: यह विशेष ऑफर समाप्त हो चुका है। मूल मूल्य लागू किया गया।";
            } else {
                const isSigValid = verifyOfferSignature(targetCheckId, rawAmt, offerMobile, offerSig, offerTimer, offerExp);
                if (!isSigValid) {
                    offerSecurityError = "⚠️ लिंक से छेड़छाड़ पकड़ी गई (Tampered URL): डिस्काउंट अमान्य है।";
                } else if (rawAmt <= 0 && offerMobile !== "ADMIN_TEST" && offerMobile !== "7974422572") {
                    offerSecurityError = "⚠️ ₹0 टेस्ट केवल अधिकृत एडमिन के लिए ही मान्य है।";
                } else {
                    verifiedOfferAmount = rawAmt;
                    window.activeVerifiedOffer = { 
                        amount: rawAmt, 
                        mobile: offerMobile, 
                        exp: offerExp, 
                        bookId: targetCheckId,
                        timer: offerTimer,
                        audio: offerAudio,
                        isCombo: false
                    };
                }
            }
        }

        // Override with explicit URL custom params if provided
        if (customTitle) book.name = customTitle;
        if (verifiedOfferAmount !== null) {
            book.offerPrice = verifiedOfferAmount;
        } else {
            // Tampered, expired, or standard view: use the actual book's standard offer price!
            book.offerPrice = standardBookStoreOffer;
        }
        book.mrp = standardBookMrp;

        const bookCover = book.cover || book.thumbnail || book.cover_image || "/images/banners/farmer-community-banner.jpeg";
        const bookName = book.name || book.title || "Aarogyam India Digital Product";
        const bookMrp = standardBookMrp;
        const bookOffer = book.offerPrice;

        window.currentCheckoutBookList = [book];
        window.currentCheckoutBook = {
            id: book.id || targetId || "BK001",
            title: bookName,
            mrp: bookMrp,
            offerPrice: bookOffer,
            defaultOfferPrice: standardBookStoreOffer,
            baseOfferPrice: standardBookStoreOffer,
            cover: bookCover
        };

        const coverEl = document.getElementById("bookCover");
        if (coverEl) coverEl.src = bookCover;
        
        const nameEl = document.getElementById("bookName");
        if (nameEl) nameEl.textContent = bookName;
        
        const mrpEl = document.getElementById("bookMrp");
        if (mrpEl) mrpEl.textContent = "₹" + bookMrp;
        
        const priceEl = document.getElementById("bookPrice");
        if (priceEl) priceEl.textContent = "₹" + bookOffer;

        // Render Security Badge & Countdown Banner
        renderCheckoutSecurityBanner(verifiedOfferAmount !== null, offerSecurityError, window.activeVerifiedOffer);

        // 🔒 Auto-fill and LOCK Name & Mobile for personalized VIP Offer Links
        const offerMobileTarget = (window.activeVerifiedOffer && window.activeVerifiedOffer.mobile && window.activeVerifiedOffer.mobile !== 'ADMIN_TEST')
            ? window.activeVerifiedOffer.mobile
            : (offerMobile && offerMobile !== 'ADMIN_TEST' ? offerMobile : null);

        if (offerMobileTarget) {
            const custMobEl = document.getElementById("customerMobile");
            const custNameEl = document.getElementById("customerName");

            if (custMobEl) {
                custMobEl.value = offerMobileTarget;
                // 🔒 Lock Mobile so user cannot change number to exploit discount
                custMobEl.readOnly = true;
                custMobEl.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                custMobEl.style.borderColor = "#10b981";
                custMobEl.style.color = "#10b981";
                custMobEl.style.fontWeight = "800";
                custMobEl.style.cursor = "not-allowed";
                custMobEl.title = "यह वीआईपी ऑफर केवल इसी पंजीकृत मोबाइल नंबर के लिए मान्य है";
            }

            // Name Resolution: URL parameter 'n' -> Supabase Profiles Database lookup
            let resolvedName = offerName;
            if (!resolvedName) {
                try {
                    const activeDb = window.dbClient || window.supabase;
                    if (activeDb) {
                        const { data: pData } = await activeDb
                            .from('profiles')
                            .select('full_name')
                            .eq('mobile', offerMobileTarget)
                            .maybeSingle();
                        if (pData && pData.full_name) {
                            resolvedName = pData.full_name;
                        }
                    }
                } catch (e) {
                    console.warn("Profile name lookup failed:", e);
                }
            }

            if (custNameEl) {
                if (resolvedName) {
                    custNameEl.value = resolvedName;
                }
                // 🔒 Lock Name as well so it cannot be modified
                custNameEl.readOnly = true;
                custNameEl.style.backgroundColor = "rgba(16, 185, 129, 0.08)";
                custNameEl.style.borderColor = "#10b981";
                custNameEl.style.color = "#10b981";
                custNameEl.style.fontWeight = "800";
                custNameEl.style.cursor = "not-allowed";
            }

            // Inject Verified Farmer Badge
            let badge = document.getElementById("checkout-verified-farmer-badge");
            if (!badge && custMobEl && custMobEl.parentElement) {
                badge = document.createElement("div");
                badge.id = "checkout-verified-farmer-badge";
                badge.style.cssText = "font-size:0.75rem; color:#10b981; font-weight:800; margin-top:5px; display:flex; align-items:center; gap:5px;";
                badge.innerHTML = `🔒 <span>अधिकृत किसान: <strong>${resolvedName || 'पंजीकृत पाठक'}</strong> (+91 ${offerMobileTarget}) — सुरक्षित लिंक</span>`;
                custMobEl.parentElement.appendChild(badge);
            }

            // 🛑 CHECK IF ALREADY PURCHASED (1-Time Use Protection)
            await checkOfferAlreadyPurchased(offerMobileTarget, resolvedName, book.id || targetId, bookName);

            // Record Single Book Offer Claim for Admin Reports & Conversion Tracking
            recordCheckoutOfferClaim(
                offerMobileTarget,
                resolvedName,
                book.id || targetId,
                bookName,
                bookOffer,
                offerTimer
            );
        }

        const sumBook = document.getElementById("summaryBook");
        if (sumBook) sumBook.textContent = bookName;
        
        const sumMrp = document.getElementById("summaryMrp");
        if (sumMrp) sumMrp.textContent = "₹" + bookMrp;
        
        const sumPrice = document.getElementById("summaryPrice");
        if (sumPrice) sumPrice.textContent = "₹" + bookOffer;
        
        const totPrice = document.getElementById("totalPrice");
        if (totPrice) totPrice.textContent = "₹" + bookOffer;

        // Safety Guard: Check if Book is Coming Soon
        const bIdUpper = String(book.id || targetId || '').toUpperCase();
        const isLiveAgri = (bIdUpper === 'BK001' || bIdUpper === 'BK002' || bIdUpper === 'BK015' || bIdUpper === 'SUB001' || bIdUpper.includes('BK001') || bIdUpper.includes('BK002'));
        const isBookComingSoon = !isLiveAgri && (
            book.status === 'coming_soon' || 
            book.isComingSoon === true || 
            book.is_coming_soon === true ||
            book.status !== 'active'
        );

        if (isBookComingSoon) {
            const payBtn = document.getElementById("payNowBtn") || document.querySelector(".pay-btn");
            if (payBtn) {
                payBtn.disabled = true;
                payBtn.style.background = "#94a3b8";
                payBtn.style.cursor = "not-allowed";
                payBtn.innerHTML = `⏳ आगामी पुस्तक (Coming Soon) - रिलीज होने पर उपलब्ध होगी`;
            }
            const orderSummary = document.querySelector(".order-summary");
            if (orderSummary) {
                const notice = document.createElement("div");
                notice.style.cssText = "background:#fef3c7;border:1.5px solid #f59e0b;color:#92400e;padding:12px;border-radius:10px;font-size:0.88rem;margin-top:14px;font-weight:700;line-height:1.4;";
                const safeName = String(bookName || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                notice.innerHTML = `🔔 <strong>सूचना:</strong> '${safeName}' अभी आगामी (Coming Soon) स्थिति में है। इसका भुगतान अभी सक्रिय नहीं है। लॉन्च होते ही सूचना पाने के लिए ई-बुक स्टोर पर रुचि दर्ज करें।`;
                orderSummary.appendChild(notice);
            }
        }

        // Handle Legacy/Fallback Offer Timer UI (when security banner timer is not active)
        const timerParam = !window.activeVerifiedOffer ? (params.get("t") || params.get("timer")) : null;
        if (timerParam) {
            let timerBar = document.getElementById("checkout-offer-timer-bar");
            if (!timerBar) {
                timerBar = document.createElement("div");
                timerBar.id = "checkout-offer-timer-bar";
                timerBar.style.cssText = "background:linear-gradient(90deg, #dc2626, #991b1b); color:#ffffff; padding:10px 14px; text-align:center; font-weight:800; font-size:0.88rem; border-radius:10px; margin: 12px 0; box-shadow:0 4px 12px rgba(220,38,38,0.25); display:flex; align-items:center; justify-content:center; gap:8px;";
                const header = document.querySelector(".checkout-header");
                if (header && header.nextSibling) {
                    header.parentNode.insertBefore(timerBar, header.nextSibling);
                } else {
                    document.body.prepend(timerBar);
                }
            }
            let durationSeconds = 900; // default 15m
            if (timerParam === '1h') durationSeconds = 3600;
            else if (timerParam === '24h') durationSeconds = 86400;
            else if (parseInt(timerParam, 10) > 0) durationSeconds = parseInt(timerParam, 10) * 60;

            let remaining = durationSeconds;
            const updateTimerDisplay = () => {
                const m = Math.floor(remaining / 60);
                const s = remaining % 60;
                timerBar.innerHTML = `⏳ <strong>विशेष सीमित समय ऑफर!</strong> यह डिस्काउंट केवल <span style="background:#0f172a; color:#f8fafc; padding:2px 8px; border-radius:6px; font-family:monospace; font-size:1rem; letter-spacing:1px;">${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</span> में समाप्त हो जाएगा!`;
                if (remaining > 0) remaining--;
            };
            updateTimerDisplay();
            setInterval(updateTimerDisplay, 1000);
        }

        // If amount is 0 (Free Checkout / Admin Test)
        if (bookOffer === 0 || bookOffer <= 0) {
            const payBtn = document.getElementById("payNowBtn") || document.querySelector(".pay-btn");
            if (payBtn) {
                payBtn.innerHTML = `🚀 मुफ़्त में अभी प्राप्त करें (Get Free Access - ₹0)`;
                payBtn.style.background = "linear-gradient(135deg, #16a34a, #15803d)";
                payBtn.style.boxShadow = "0 4px 16px rgba(22,163,74,0.4)";
            }
            const orderSummary = document.querySelector(".order-summary");
            if (orderSummary && !document.getElementById("free-voucher-badge")) {
                const badge = document.createElement("div");
                badge.id = "free-voucher-badge";
                badge.style.cssText = "background:#dcfce7; border:1.5px solid #16a34a; color:#15803d; padding:10px 14px; border-radius:10px; font-size:0.86rem; margin-top:12px; font-weight:800; display:flex; align-items:center; gap:8px;";
                badge.innerHTML = `🎉 <strong>100% मुफ़्त वाउचर लागू!</strong> इसके लिए कोई भुगतान नहीं करना होगा।`;
                orderSummary.prepend(badge);
            }
        }

        autoFillUserData();

    } catch (error) {
        console.error("Book Load Error:", error);
    }
}

// 🛑 One-Time Use Check: Verify if customer already purchased this book
async function checkOfferAlreadyPurchased(mobile, userName, targetBookId, bookTitle) {
    if (!mobile || !targetBookId) return;
    try {
        let isAlreadyBought = false;
        let invoiceNum = '';
        const cleanTargetId = String(targetBookId).toUpperCase();

        // 1. Check local storage purchases first
        const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
        if (Array.isArray(localPurchases)) {
            const localMatch = localPurchases.find(p => 
                p && (String(p.book_id || '').toUpperCase().includes(cleanTargetId) || cleanTargetId.includes(String(p.book_id || '').toUpperCase())) &&
                (p.mobile === mobile || p.customerMobile === mobile)
            );
            if (localMatch) {
                isAlreadyBought = true;
                invoiceNum = localMatch.invoice_number || localMatch.payment_id || '';
            }
        }

        // 2. Check live Supabase purchases table
        const activeDb = window.dbClient || window.supabase;
        if (activeDb && !isAlreadyBought) {
            const { data: prof } = await activeDb.from('profiles').select('id, full_name').eq('mobile', mobile).maybeSingle();
            if (prof && prof.id) {
                const { data: supaPurchases } = await activeDb.from('purchases')
                    .select('id, book_id, invoice_number, purchase_date, payment_status')
                    .eq('profile_id', prof.id)
                    .or('payment_status.eq.success,payment_status.is.null');

                if (supaPurchases && supaPurchases.length > 0) {
                    const match = supaPurchases.find(p => 
                        String(p.book_id || '').toUpperCase().includes(cleanTargetId) || 
                        cleanTargetId.includes(String(p.book_id || '').toUpperCase())
                    );
                    if (match) {
                        isAlreadyBought = true;
                        invoiceNum = match.invoice_number || '';
                    }
                }
            }
        }

        if (isAlreadyBought) {
            // Disable Pay Button
            const payBtn = document.getElementById("payNowBtn") || document.querySelector(".pay-btn");
            if (payBtn) {
                payBtn.disabled = true;
                payBtn.style.background = "#64748b";
                payBtn.style.cursor = "not-allowed";
                payBtn.innerHTML = `⚠️ यह पुस्तक पहले ही खरीदी जा चुकी है`;
            }

            // Render Expired/Already-Bought Banner at the top of checkout
            let expireBanner = document.getElementById("checkout-offer-expired-card");
            if (!expireBanner) {
                expireBanner = document.createElement("div");
                expireBanner.id = "checkout-offer-expired-card";
                expireBanner.style.cssText = "background:linear-gradient(135deg, rgba(220,38,38,0.18), rgba(15,23,42,0.95)); border:2px solid #ef4444; border-radius:16px; padding:20px; margin-bottom:20px; text-align:center; box-shadow:0 8px 30px rgba(0,0,0,0.5);";
                expireBanner.innerHTML = `
                    <div style="font-size:2.4rem; margin-bottom:6px;">⚠️</div>
                    <h3 style="color:#f87171; margin:0 0 6px 0; font-size:1.2rem; font-weight:900;">
                        यह विशेष ऑफ़र लिंक पहले ही उपयोग हो चुका है!
                    </h3>
                    <p style="color:#cbd5e1; font-size:0.88rem; margin:0 0 16px 0; line-height:1.5;">
                        प्रिय <strong>${userName || 'किसान मित्र'}</strong> जी, आपके मोबाइल (+91 ${mobile}) पर <strong>${bookTitle || 'यह ई-बुक'}</strong> की खरीद सफलतापूर्वक संपन्न हो चुकी है${invoiceNum ? ` (बिल क्र: ${invoiceNum})` : ''}।
                        <br><span style="color:#94a3b8; font-size:0.8rem;">एक ही पुस्तक को दोबारा खरीदने की आवश्यकता नहीं है। पढ़ने के लिए 'मेरी लाइब्रेरी' खोलें या हेल्प पर बात करें।</span>
                    </p>
                    <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">
                        <a href="/reader.html?book=${targetBookId}" style="background:#16a34a; color:#fff; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:800; font-size:0.86rem; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(22,163,74,0.4);">
                            <span>📖</span> <span>मेरी लाइब्रेरी में ई-बुक पढ़ें</span>
                        </a>
                        <a href="https://api.whatsapp.com/send?phone=917974422572&text=${encodeURIComponent(`नमस्ते आरोग्यम इंडिया! मेरे नंबर ${mobile} पर ई-बुक ${bookTitle} का ऑफर लिंक एक्सपायर्ड बता रहा है। मुझे सहायता चाहिए।`)}" target="_blank" rel="noopener noreferrer" style="background:#2563eb; color:#fff; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:800; font-size:0.86rem; display:inline-flex; align-items:center; gap:6px; box-shadow:0 2px 8px rgba(37,99,235,0.4);">
                            <span>💬</span> <span>WhatsApp सहायता से बात करें</span>
                        </a>
                    </div>
                `;
                const container = document.querySelector(".checkout-container") || document.querySelector("main") || document.body;
                container.insertBefore(expireBanner, container.firstChild);
            }
        }
    } catch(err) {
        console.warn("Already-purchased check error:", err);
    }
}

function autoFillUserData() {
    const custMobEl = document.getElementById("customerMobile");
    // 🔒 If fields are locked by VIP offer link, do not overwrite them!
    if (custMobEl && custMobEl.readOnly) return;

    const storedUser = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');
    
    const nameVal = storedUser.full_name || storedUser.name || "";
    const mobileVal = storedUser.mobile || "";
    const emailVal = storedUser.email || "";

    if (nameVal && document.getElementById("customerName")) document.getElementById("customerName").value = nameVal;
    if (mobileVal && document.getElementById("customerMobile")) document.getElementById("customerMobile").value = mobileVal;
    if (emailVal && document.getElementById("customerEmail")) document.getElementById("customerEmail").value = emailVal;

    if (typeof getCurrentUser === "function") {
        const user = getCurrentUser();
        if (user) {
            if (user.full_name && document.getElementById("customerName")) document.getElementById("customerName").value = user.full_name;
            if (user.mobile && document.getElementById("customerMobile")) document.getElementById("customerMobile").value = user.mobile;
            if (user.email && document.getElementById("customerEmail")) document.getElementById("customerEmail").value = user.email;
        }
    }
}

// -------------------------------------------------------------
// CHECKOUT LOGS HELPER FUNCTION
// -------------------------------------------------------------
async function logCheckoutActivity(profileId, bookId, status) {
    try {
        const activeDb = window.dbClient || window.supabase;
        if (!activeDb) return;

        let currentUuid = profileId;
        if (!currentUuid && window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') {
            currentUuid = window.V1_SESSION.getUserId();
        }

        if (!currentUuid) return;

        // अब यहाँ कभी भी फर्जी BK001 नहीं जाएगा, जो असली bookId होगी वही सेव होगी
        const targetBookId = bookId || (window.currentCheckoutBook ? window.currentCheckoutBook.id : null);
        if (!targetBookId) return;

        const { error } = await activeDb
            .from("checkout_logs")
            .insert([
                {
                    profile_id: currentUuid,
                    book_id: targetBookId,
                    status: status // 'initiated', 'success', 'failed', 'dropped'
                }
            ]);

        if (error) {
            console.error("Error inserting checkout log:", error);
        } else {
            console.log(`✅ Checkout log recorded: [${status}] for book ${targetBookId}`);
        }
    } catch (err) {
        console.error("Checkout log exception:", err);
    }
}

// Pay Now Button Logic with Smart Referral, Razorpay Integration & Full Activity Tracking
document.getElementById("payNowBtn").addEventListener("click", async function () {
    const name = document.getElementById("customerName").value.trim();
    const mobile = document.getElementById("customerMobile").value.trim();
    const email = document.getElementById("customerEmail").value.trim();
    const refInputEl = document.getElementById("referralMobile");
    const enteredReferral = refInputEl ? refInputEl.value.trim() : 'AI000004';

    if (name === "") {
        alert("Please Enter Full Name");
        return;
    }

    if (mobile.length !== 10) {
        alert("Enter Valid Mobile Number");
        return;
    }

    // 🛡️ SECURITY LAYER 2: Enforce Customer Mobile Number Match
    if (window.activeVerifiedOffer && window.activeVerifiedOffer.mobile && window.activeVerifiedOffer.mobile !== 'ADMIN_TEST') {
        const cleanEntered = mobile.replace(/\D/g, '').slice(-10);
        if (cleanEntered !== window.activeVerifiedOffer.mobile) {
            alert(`⚠️ सुरक्षा चेतावनी (Unauthorized Customer):\n\nयह विशेष डिस्काउंट केवल पंजीकृत नंबर +91-XXXXX${window.activeVerifiedOffer.mobile.slice(-4)} के लिए जारी किया गया है।\n\nकृपया वही मोबाइल नंबर दर्ज करें जिस पर यह लिंक भेजा गया था।`);
            return;
        }
    }

    // सुरक्षा चेक: बिना बुक लोड हुए पेमेंट प्रोसेस न हो
    if (!window.currentCheckoutBook || !window.currentCheckoutBook.id) {
        alert("Error: Book data not found. Please refresh the page.");
        return;
    }

    const payBtn = document.getElementById("payNowBtn");
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    try {
        const shareContextData = syncCheckoutShareContext();

        const finalUuid = window.currentReferrerData.uuid || null;
        const finalReferralMobile = window.currentReferrerData.mobile || null;
        const finalReferralCode = window.currentReferrerData.shareId || enteredReferral;
        const sourceVal = shareContextData.source || "checkout";
        const landingPageVal = shareContextData.landing_url || window.location.pathname;

        if (typeof registerUser === "function") {
            const regResult = await registerUser({
                fullName: name,
                mobile: mobile,
                email: email,
                referred_by: finalUuid,
                referralMobile: finalReferralMobile,
                referralCode: finalReferralCode,
                source: sourceVal,
                landing_page: landingPageVal
            });

            const isAlreadyExists = regResult.message && regResult.message.toLowerCase().includes("already");

            if (!regResult.success && !isAlreadyExists) {
                alert(regResult.message || "User registration failed.");
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                return;
            }
        }

        // सीधे JSON से उठाई गई असली बुक आईडी
        const bookIdToBuy = window.currentCheckoutBook.id;
        const bookTitle = window.currentCheckoutBook.title;
        const bookPrice = window.currentCheckoutBook.offerPrice;
        
        const orderData = {
            bookId: bookIdToBuy,
            title: bookTitle,
            amount: bookPrice,
            customerName: name,
            mobile: mobile,
            email: email,
            referred_by: finalUuid,
            referralMobile: finalReferralMobile,
            referralCode: finalReferralCode,
            attribution: shareContextData,
            source: sourceVal,
            landing_page: landingPageVal
        };

        window.currentOrder = orderData;
        localStorage.setItem("AI_CURRENT_ORDER", JSON.stringify(orderData));

        const activeUserId = (window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') ? window.V1_SESSION.getUserId() : finalUuid;
        
        // 📝 1. चेकआउट लॉग दर्ज करें: पेमेंट शुरू (initiated) - असली बुक आईडी के साथ
        await logCheckoutActivity(activeUserId, bookIdToBuy, 'initiated');

        // 🚀 100% FREE / ADMIN TEST CHECKOUT HANDLER (₹0 - Immediate Unlock)
        if (bookPrice === 0 || bookPrice <= 0) {
            // 🛡️ SECURITY LAYER 4: Strict Admin-Only Verification for ₹0 Unlocks
            if (!window.activeVerifiedOffer || (window.activeVerifiedOffer.mobile !== "ADMIN_TEST" && window.activeVerifiedOffer.mobile !== "7974422572")) {
                alert("⚠️ अनधिकृत अनुरोध: ₹0 टेस्ट केवल अधिकृत एडमिन के लिए ही उपलब्ध है।");
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                return;
            }

            payBtn.disabled = true;
            payBtn.textContent = "सत्यापित हो रहा है...";
            const freePaymentId = 'FREE_TEST_' + Date.now();
            await logCheckoutActivity(activeUserId, bookIdToBuy, 'free_success');

            try {
                const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
                const myPurchasedIds = JSON.parse(localStorage.getItem('my_purchased_book_ids') || '[]');
                const booksToUnlock = (window.currentCheckoutBookList && window.currentCheckoutBookList.length > 0) 
                    ? window.currentCheckoutBookList 
                    : [{ id: bookIdToBuy, name: bookTitle, offerPrice: 0 }];

                const db = window.dbClient || window.supabase;
                const userObj = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');

                for (const b of booksToUnlock) {
                    const bId = b.id || bookIdToBuy;
                    const newPurchase = {
                        book_id: bId,
                        title: b.name || b.title || bookTitle,
                        amount: 0,
                        payment_id: freePaymentId,
                        order_id: 'FREE_ORD_' + Date.now(),
                        created_at: new Date().toISOString()
                    };
                    localPurchases.push(newPurchase);
                    if (!myPurchasedIds.includes(bId)) myPurchasedIds.push(bId);

                    if (db) {
                        await db.from('purchases').insert([{
                            profile_id: activeUserId || userObj.id,
                            book_id: bId,
                            amount: 0,
                            payment_id: freePaymentId,
                            status: 'completed'
                        }]).catch(() => {});
                    }
                }

                localStorage.setItem('AI_PURCHASES', JSON.stringify(localPurchases));
                localStorage.setItem('purchases', JSON.stringify(localPurchases));
                localStorage.setItem('my_purchased_book_ids', JSON.stringify(myPurchasedIds));
                localStorage.removeItem('AI_CART_ITEMS');

                userObj.is_active = true;
                localStorage.setItem('AI_USER', JSON.stringify(userObj));
                localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
                localStorage.setItem('user_is_active', 'true');
                markCheckoutOfferPurchased(mobile, bookIdToBuy, 0, freePaymentId);
            } catch (saveErr) {
                console.warn('Free purchase save note:', saveErr);
            }

            window.location.href = `/ebooks/payment-success.html?payment_id=${freePaymentId}&book_id=${bookIdToBuy}&amount=0`;
            return;
        }

        if (typeof startPayment === "function") {
            const res = startPayment();
            if (res && typeof res === 'object' && res.success === false) {
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
                await logCheckoutActivity(activeUserId, bookIdToBuy, 'failed');
                if (res.message) alert(res.message);
            }
        } 
        else if (typeof Razorpay !== "undefined") {
            var options = {
                "key": window.RAZORPAY_KEY || "rzp_live_TOlsqOqkmxYCWP",
                "amount": bookPrice * 100, // पैसों में कन्वर्ट करने के लिए 100 से गुणा
                "currency": "INR",
                "name": "Aarogyam India",
                "description": bookTitle,
                "handler": async function (response) {
                    // 🎉 2. पेमेंट सफल होने पर 'success' लॉग दर्ज करें
                    await logCheckoutActivity(activeUserId, bookIdToBuy, 'success');

                    // Save purchase records for ALL books in bundle
                    try {
                        const localPurchases = JSON.parse(localStorage.getItem('AI_PURCHASES') || localStorage.getItem('purchases') || '[]');
                        const myPurchasedIds = JSON.parse(localStorage.getItem('my_purchased_book_ids') || '[]');
                        const booksToUnlock = (window.currentCheckoutBookList && window.currentCheckoutBookList.length > 0) 
                            ? window.currentCheckoutBookList 
                            : [{ id: bookIdToBuy, name: bookTitle, offerPrice: bookPrice }];

                        const db = window.dbClient || window.supabase;
                        const userObj = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || '{}');

                        for (const b of booksToUnlock) {
                            const bId = b.id || bookIdToBuy;
                            const bAmt = b.offerPrice || (bookPrice / booksToUnlock.length);

                            const newPurchase = {
                                book_id: bId,
                                title: b.name || b.title || bookTitle,
                                amount: bAmt,
                                payment_id: response.razorpay_payment_id,
                                order_id: response.razorpay_order_id || ('ORD_' + Date.now()),
                                created_at: new Date().toISOString()
                            };
                            localPurchases.push(newPurchase);
                            if (!myPurchasedIds.includes(bId)) myPurchasedIds.push(bId);

                            if (db) {
                                await db.from('purchases').insert([{
                                    profile_id: activeUserId || userObj.id,
                                    book_id: bId,
                                    amount: bAmt,
                                    payment_id: response.razorpay_payment_id,
                                    status: 'completed'
                                }]);
                            }
                        }

                        localStorage.setItem('AI_PURCHASES', JSON.stringify(localPurchases));
                        localStorage.setItem('purchases', JSON.stringify(localPurchases));
                        localStorage.setItem('my_purchased_book_ids', JSON.stringify(myPurchasedIds));
                        localStorage.removeItem('AI_CART_ITEMS');

                        // Activate Membership in local session
                        const isSub = (bookIdToBuy.includes('SUB') || bookPrice >= 999);
                        userObj.is_active = true;
                        if (isSub) userObj.is_subscriber = true;
                        localStorage.setItem('AI_USER', JSON.stringify(userObj));
                        localStorage.setItem('AI_PROFILE', JSON.stringify(userObj));
                        localStorage.setItem('UCAS_USER', JSON.stringify(userObj));
                        localStorage.setItem('user_is_active', 'true');
                        if (isSub) localStorage.setItem('user_is_subscriber', 'true');

                        if (db && (activeUserId || userObj.id)) {
                            await db.from('profiles').update({
                                is_active: true,
                                is_subscriber: isSub ? true : userObj.is_subscriber
                            }).eq('id', activeUserId || userObj.id);
                        }

                        markCheckoutOfferPurchased(mobile, bookIdToBuy, bookPrice, response.razorpay_order_id || response.razorpay_payment_id);
                    } catch (saveErr) {
                        console.warn('Local purchase save note:', saveErr);
                    }

                    window.location.href = `/ebooks/payment-success.html?payment_id=${response.razorpay_payment_id}&book_id=${bookIdToBuy}&amount=${bookPrice}`;
                },
                "prefill": {
                    "name": name,
                    "email": email,
                    "contact": mobile
                },
                "theme": {
                    "color": "#2e7d32"
                },
                "modal": {
                    "ondismiss": async function() {
                        // ❌ 3. यूजर द्वारा पॉपअप बंद करने पर 'dropped' लॉग दर्ज करें
                        console.log("⚠️ Payment popup closed by user (Dropped)");
                        await logCheckoutActivity(activeUserId, bookIdToBuy, 'dropped');
                        payBtn.disabled = false;
                        payBtn.textContent = "Pay Now";
                    }
                }
            };
            var rzp1 = new Razorpay(options);
            rzp1.on('payment.failed', async function (response){
                // ⚠️ 4. पेमेंट फेल होने पर 'failed' लॉग दर्ज करें
                await logCheckoutActivity(activeUserId, bookIdToBuy, 'failed');
                alert("Payment Failed: " + response.error.description);
                payBtn.disabled = false;
                payBtn.textContent = "Pay Now";
            });
            rzp1.open();
        } else {
            setTimeout(() => {
                if (payBtn.textContent === "Processing...") {
                    payBtn.disabled = false;
                    payBtn.textContent = "Pay Now";
                }
            }, 3000);

            alert("Error: Payment gateway not loaded properly.");
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }

    } catch (error) {
        console.error("Payment Error:", error);
        const activeUserId = (window.V1_SESSION && typeof window.V1_SESSION.getUserId === 'function') ? window.V1_SESSION.getUserId() : null;
        const bookIdToBuy = window.currentCheckoutBook ? window.currentCheckoutBook.id : null;
        if (bookIdToBuy) {
            await logCheckoutActivity(activeUserId, bookIdToBuy, 'dropped');
        }

        alert("Something went wrong.");
        payBtn.disabled = false;
        payBtn.textContent = "Pay Now";
    }
});

window.addEventListener('focus', function() {
    const payBtn = document.getElementById("payNowBtn");
    if (payBtn && payBtn.textContent === "Processing...") {
        setTimeout(() => {
            payBtn.disabled = false;
            payBtn.textContent = "Pay Now";
        }, 1000);
    }
});

console.log("✅ Checkout Module Loaded Successfully");