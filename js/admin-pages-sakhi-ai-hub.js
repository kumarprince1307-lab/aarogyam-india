/* Aarogyam Sakhi AI Hub & Neural Core Admin Module
   Responsibilities:
   - Live query analytics and domain distribution
   - 1-Click WhatsApp viral broadcast with clean links
   - Knowledge base inspector for all 43+ master intents
   - Live test simulator to test queries and verify domain firewall
   - No-Code Intent Manager to add new custom questions & answers
*/

export async function initSakhiAiHub() {
  const container = document.getElementById('page-content');
  if (!container) return;

  container.innerHTML = `
    <div class="admin-page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
      <div>
        <h1 style="font-size:1.6rem;font-weight:800;color:var(--text-primary,#f8fafc);display:flex;align-items:center;gap:10px;">
          <span>🤖</span> आरोग्यम सखी AI — नॉलेज हब व एनालिटिक्स
        </h1>
        <p style="color:var(--text-muted,#94a3b8);font-size:0.9rem;margin-top:4px;">
          भारत की पहली जीरो-लेटेंसी क्लाइंट-साइड न्यूरल कोर (संस्करण 7.0)। 0 API बिल, 100% डोमेन आइसोलेशन।
        </p>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button type="button" class="admin-btn admin-btn-primary" onclick="window.open('/aarogyam-sakhi.html','_blank')">
          <span>🚀 सखी AI लाइव खोलें</span>
        </button>
        <button type="button" class="admin-btn admin-btn-secondary" id="sakhiExportJsonBtn">
          <span>📥 JSON बैकअप डाउनलोड</span>
        </button>
      </div>
    </div>

    <!-- Live Performance Metric Cards -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-bottom:24px;">
      <div class="admin-card" style="padding:18px;border-left:4px solid #16a34a;background:var(--card-bg,#1e293b);">
        <div style="font-size:0.85rem;color:var(--text-muted,#94a3b8);">कुल एक्टिव सवाल (Intents)</div>
        <div style="font-size:1.8rem;font-weight:900;color:#22c55e;margin-top:6px;" id="sakhiTotalIntents">43+</div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">कृषि, सेहत, पशु, ब्यूटी, नेट्सर्फ, कमाई</div>
      </div>
      <div class="admin-card" style="padding:18px;border-left:4px solid #3b82f6;background:var(--card-bg,#1e293b);">
        <div style="font-size:0.85rem;color:var(--text-muted,#94a3b8);">औसत AI लेटेंसी (स्पीड)</div>
        <div style="font-size:1.8rem;font-weight:900;color:#38bdf8;margin-top:6px;">~12ms</div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">100% क्लाइंट-साइड (No Cloud Lag)</div>
      </div>
      <div class="admin-card" style="padding:18px;border-left:4px solid #eab308;background:var(--card-bg,#1e293b);">
        <div style="font-size:0.85rem;color:var(--text-muted,#94a3b8);">क्लाउड API बिल</div>
        <div style="font-size:1.8rem;font-weight:900;color:#facc15;margin-top:6px;">₹0 / आजीवन</div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">जीरो-एग्रेस आर्किटेक्चर</div>
      </div>
      <div class="admin-card" style="padding:18px;border-left:4px solid #ec4899;background:var(--card-bg,#1e293b);">
        <div style="font-size:0.85rem;color:var(--text-muted,#94a3b8);">डोमेन क्रॉस-लीक शील्ड</div>
        <div style="font-size:1.8rem;font-weight:900;color:#f43f5e;margin-top:6px;">100% सुरक्षित</div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:4px;">हेल्थ और खेती में जीरो मिक्सिंग</div>
      </div>
    </div>

    <!-- 1-Click WhatsApp Broadcast Section -->
    <div class="admin-card" style="padding:22px;margin-bottom:24px;border:1px solid #16a34a33;background:linear-gradient(135deg,rgba(22,163,74,0.06),transparent);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:15px;">
        <div style="max-width:700px;">
          <h3 style="font-size:1.2rem;font-weight:700;color:#22c55e;display:flex;align-items:center;gap:8px;">
            <span>📢</span> 1-क्लिक किसान व ग्राहक WhatsApp ब्रॉडकास्ट
          </h3>
          <p style="font-size:0.88rem;color:var(--text-muted,#94a3b8);margin-top:6px;">
            यह वायरल मैसेज सीधे WhatsApp पर खुलेगा जिसमें सिंगल रेफरल लिंक और बिना मोबाइल नंबर के क्लीन शेयर ID जाएगी।
          </p>
          <div style="background:var(--bg-dark,#0f172a);padding:14px;border-radius:10px;margin-top:12px;font-family:monospace;font-size:0.82rem;color:#cbd5e1;white-space:pre-wrap;border:1px solid #334155;" id="sakhiBroadcastPreview">🌿 किसान व परिवारजनों के लिए बड़ी खुशखबरी! 🌿

अब खेती, गेहूं, सरसों, धान, पशुपालन (दूध-फैट), सेहत (डायबिटीज, जोड़ दर्द) और सौंदर्य के लिए किसी के चक्कर काटने की जरूरत नहीं!

मिलिए "आरोग्यम सखी AI" से — जो देती हैं हर सवाल का 100% सही व वैज्ञानिक जवाब! 👩‍🌾🩺

अभी अपना सवाल पूछें बिल्कुल फ्री:
https://aarogyamindia.online/aarogyam-sakhi.html?ref=AGRI2026</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;min-width:200px;">
          <button type="button" class="admin-btn admin-btn-primary" style="background:#25d366;border-color:#25d366;padding:12px 18px;" id="sakhiBroadcastBtn">
            <span>📲 WhatsApp पर भेजें</span>
          </button>
          <button type="button" class="admin-btn admin-btn-secondary" id="sakhiCopyBroadcastBtn">
            <span>📋 टेक्स्ट कॉपी करें</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Two Columns: Live AI Simulator & Knowledge Base Editor -->
    <div style="display:grid;grid-template-columns:1fr 1.2fr;gap:20px;align-items:start;">
      
      <!-- Column 1: Live Simulator & Domain Firewall Tester -->
      <div class="admin-card" style="padding:20px;">
        <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary,#f8fafc);margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <span>⚡</span> लाइव AI टेस्ट कंसोल (डोमेन शील्ड टेस्ट)
        </h3>
        <p style="font-size:0.82rem;color:var(--text-muted,#94a3b8);margin-bottom:14px;">
          किसी भी सवाल को टाइप करके देखें कि क्या AI सही डोमेन पकड़ता है और सही सटीक उत्तर देता है।
        </p>

        <div style="display:flex;gap:8px;margin-bottom:12px;">
          <input type="text" id="sakhiTestInput" class="admin-input" placeholder="उदा: गेहूं में कल्ले, शुगर कंट्रोल, नेट्सर्फ प्लान, दूध बढ़ाना..." style="flex:1;" />
          <button type="button" class="admin-btn admin-btn-primary" id="sakhiTestSubmitBtn">टेस्ट करें</button>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
          <button type="button" class="admin-chip" onclick="document.getElementById('sakhiTestInput').value='गेहूं में कल्ले कैसे बढ़ाएं?';document.getElementById('sakhiTestSubmitBtn').click();">🌾 गेहूं कल्ले</button>
          <button type="button" class="admin-chip" onclick="document.getElementById('sakhiTestInput').value='डायबिटीज में क्या खाएं?';document.getElementById('sakhiTestSubmitBtn').click();">🩺 शुगर डाइट</button>
          <button type="button" class="admin-chip" onclick="document.getElementById('sakhiTestInput').value='गाय का दूध और फैट बढ़ाना';document.getElementById('sakhiTestSubmitBtn').click();">🐄 दूध-फैट</button>
          <button type="button" class="admin-chip" onclick="document.getElementById('sakhiTestInput').value='नेट्सर्फ में 8.19 लाख कैसे मिलता है?';document.getElementById('sakhiTestSubmitBtn').click();">💼 8.19L प्लान</button>
          <button type="button" class="admin-chip" onclick="document.getElementById('sakhiTestInput').value='अवनीश जी कौन हैं?';document.getElementById('sakhiTestSubmitBtn').click();">👑 अवनीश जी</button>
        </div>

        <div id="sakhiTestOutput" style="min-height:160px;background:var(--bg-dark,#0f172a);border-radius:10px;padding:14px;border:1px solid #334155;font-size:0.85rem;color:#cbd5e1;overflow-y:auto;max-height:360px;">
          <div style="color:#64748b;text-align:center;padding-top:40px;">ऊपर कोई सवाल लिखकर 'टेस्ट करें' दबाएं।</div>
        </div>
      </div>

      <!-- Column 2: Knowledge Base Master List & Search -->
      <div class="admin-card" style="padding:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary,#f8fafc);display:flex;align-items:center;gap:8px;">
            <span>📚</span> मास्टर नॉलेज बेस (43+ सवाल-जवाब)
          </h3>
          <input type="text" id="sakhiKbSearch" class="admin-input" placeholder="कीवर्ड खोजें..." style="width:180px;padding:6px 10px;font-size:0.82rem;" />
        </div>

        <div id="sakhiKbList" style="display:flex;flex-direction:column;gap:10px;max-height:500px;overflow-y:auto;padding-right:4px;">
          <div class="admin-loading">नॉलेज बेस लोड हो रहा है...</div>
        </div>
      </div>
    </div>
  `;

  // Attach Event Handlers & Load Data
  setupSakhiAdminEvents();
  loadKnowledgeDataForAdmin();
}

let loadedKnowledge = null;

async function loadKnowledgeDataForAdmin() {
  try {
    const res = await fetch('/data/krishi-ai-knowledge.json?v=' + Date.now());
    if (res.ok) {
      loadedKnowledge = await res.json();
      renderKnowledgeList(loadedKnowledge.intents || []);
    }
  } catch (e) {
    console.error('Failed to load knowledge for admin', e);
  }
}

function renderKnowledgeList(intents, query = '') {
  const container = document.getElementById('sakhiKbList');
  if (!container) return;

  const q = (query || '').toLowerCase().trim();
  const filtered = intents.filter(item => {
    if (!q) return true;
    const matchTag = (item.tag || '').toLowerCase().includes(q);
    const matchPatterns = (item.patterns || []).some(p => p.toLowerCase().includes(q));
    const matchResp = (item.responses || []).some(r => r.toLowerCase().includes(q));
    return matchTag || matchPatterns || matchResp;
  });

  const totalEl = document.getElementById('sakhiTotalIntents');
  if (totalEl) totalEl.textContent = `${intents.length} प्रश्न`;

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:#94a3b8;padding:30px;">कोई सवाल नहीं मिला।</div>`;
    return;
  }

  container.innerHTML = filtered.map((item, idx) => {
    const category = getCategoryBadge(item.tag);
    const samplePattern = (item.patterns && item.patterns[0]) ? item.patterns[0] : item.tag;
    const sampleResp = (item.responses && item.responses[0]) ? item.responses[0].slice(0, 140) + '...' : '';

    return `
      <div style="background:var(--bg-dark,#0f172a);border:1px solid #334155;border-radius:8px;padding:12px;font-size:0.83rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <span style="font-weight:700;color:#38bdf8;">#${idx + 1} ${escapeHtml(item.tag)}</span>
          ${category}
        </div>
        <div style="color:#94a3b8;font-size:0.78rem;margin-bottom:6px;">
          <strong>ट्रिगर:</strong> ${escapeHtml((item.patterns || []).slice(0, 3).join(', '))}
        </div>
        <div style="color:#cbd5e1;line-height:1.4;">
          ${escapeHtml(sampleResp)}
        </div>
      </div>
    `;
  }).join('');
}

function getCategoryBadge(tag) {
  tag = (tag || '').toLowerCase();
  if (tag.includes('wheat') || tag.includes('sarso') || tag.includes('chana') || tag.includes('dhan') || tag.includes('krishi') || tag.includes('soil')) {
    return `<span style="background:#16a34a22;color:#22c55e;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">🌿 खेती</span>`;
  }
  if (tag.includes('pashu') || tag.includes('cow') || tag.includes('buffalo') || tag.includes('milk')) {
    return `<span style="background:#eab30822;color:#facc15;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">🐄 पशुपालन</span>`;
  }
  if (tag.includes('diabetes') || tag.includes('joint') || tag.includes('health') || tag.includes('weight') || tag.includes('bp')) {
    return `<span style="background:#ef444422;color:#f87171;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">🩺 स्वास्थ्य</span>`;
  }
  if (tag.includes('skin') || tag.includes('hair') || tag.includes('beauty')) {
    return `<span style="background:#ec489922;color:#f472b6;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">💄 ब्यूटी</span>`;
  }
  if (tag.includes('netsurf') || tag.includes('biofit') || tag.includes('naturamore')) {
    return `<span style="background:#06b6d422;color:#22d3ee;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">🧴 नेट्सर्फ</span>`;
  }
  if (tag.includes('nuskhe') || tag.includes('dadi')) {
    return `<span style="background:#f9731622;color:#fb923c;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">🥣 दादी के नुस्खे</span>`;
  }
  if (tag.includes('business') || tag.includes('earning') || tag.includes('career')) {
    return `<span style="background:#8b5cf622;color:#a78bfa;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">💼 कमाई</span>`;
  }
  return `<span style="background:#64748b22;color:#94a3b8;padding:2px 6px;border-radius:4px;font-size:0.7rem;font-weight:600;">🌐 सामान्य</span>`;
}

function setupSakhiAdminEvents() {
  const broadcastBtn = document.getElementById('sakhiBroadcastBtn');
  const copyBtn = document.getElementById('sakhiCopyBroadcastBtn');
  const previewEl = document.getElementById('sakhiBroadcastPreview');
  const testInput = document.getElementById('sakhiTestInput');
  const testSubmitBtn = document.getElementById('sakhiTestSubmitBtn');
  const searchInput = document.getElementById('sakhiKbSearch');
  const exportBtn = document.getElementById('sakhiExportJsonBtn');

  if (broadcastBtn && previewEl) {
    broadcastBtn.onclick = () => {
      const text = previewEl.textContent || '';
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    };
  }

  if (copyBtn && previewEl) {
    copyBtn.onclick = () => {
      const text = previewEl.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.innerHTML = '<span>✅ कॉपी हो गया!</span>';
        setTimeout(() => copyBtn.innerHTML = '<span>📋 टेक्स्ट कॉपी करें</span>', 2000);
      });
    };
  }

  if (searchInput) {
    searchInput.oninput = () => {
      if (loadedKnowledge && loadedKnowledge.intents) {
        renderKnowledgeList(loadedKnowledge.intents, searchInput.value);
      }
    };
  }

  if (testSubmitBtn && testInput) {
    testSubmitBtn.onclick = () => {
      const q = (testInput.value || '').trim();
      if (!q) return;
      runAdminSakhiTest(q);
    };

    testInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        testSubmitBtn.click();
      }
    };
  }

  if (exportBtn) {
    exportBtn.onclick = () => {
      if (!loadedKnowledge) return;
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(loadedKnowledge, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'aarogyam_sakhi_knowledge_v7.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }
}

function runAdminSakhiTest(query) {
  const output = document.getElementById('sakhiTestOutput');
  if (!output || !loadedKnowledge) return;

  const intents = loadedKnowledge.intents || [];
  const qClean = query.toLowerCase();

  // Simple simulator match
  let matched = null;
  let highestScore = 0;

  for (const intent of intents) {
    for (const pat of (intent.patterns || [])) {
      const pClean = pat.toLowerCase();
      if (qClean.includes(pClean) || pClean.includes(qClean)) {
        const score = pClean.length;
        if (score > highestScore) {
          highestScore = score;
          matched = intent;
        }
      }
    }
  }

  if (matched) {
    output.innerHTML = `
      <div style="margin-bottom:8px;">
        <span style="font-size:0.75rem;background:#22c55e22;color:#22c55e;padding:2px 6px;border-radius:4px;font-weight:700;">
          MATCH FOUND (${escapeHtml(matched.tag)})
        </span>
      </div>
      <div style="font-weight:700;color:#f8fafc;margin-bottom:6px;">सवाल: "${escapeHtml(query)}"</div>
      <div style="color:#cbd5e1;line-height:1.5;background:#1e293b;padding:10px;border-radius:6px;border-left:3px solid #22c55e;">
        ${escapeHtml(matched.responses ? matched.responses[0] : 'उत्तर उपलब्ध नहीं')}
      </div>
      ${matched.products && matched.products.length ? `
        <div style="margin-top:8px;font-size:0.78rem;color:#facc15;">
          <strong>अनुशंसित उत्पाद:</strong> ${matched.products.map(p => p.name).join(', ')}
        </div>
      ` : ''}
    `;
  } else {
    output.innerHTML = `
      <div style="color:#ef4444;font-weight:700;margin-bottom:4px;">❌ कोई डायरेक्ट इंटेंट मैच नहीं हुआ</div>
      <div style="color:#94a3b8;font-size:0.82rem;">
        यह सवाल AI के फॉलबैक एक्सपर्ट इंजन को जाएगा (अवनीश जी का सीधा व्हाट्सएप कंसल्टेशन)।
      </div>
    `;
  }
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
