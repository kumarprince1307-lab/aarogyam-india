// Vercel Serverless Function: Secure Server-Side Google Gemini Proxy for Aarogyam Sakhi AI
// Cloaks GEMINI_API_KEY from browser inspect tools and prevents credential scraping.

const https = require('https');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const DEFAULT_MODELS = [
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash-lite'
];

function forwardToGemini(model, payload, apiKey) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const path = `/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      port: 443,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'AarogyamIndia-SakhiAI/1.0'
      },
      timeout: 25000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode || 500, data: { raw: data, error: { message: 'Invalid JSON response from Gemini' } } });
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API timeout after 25s'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method Not Allowed. Use POST.' } });
  }

  const apiKey = GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: {
        message: 'GEMINI_API_KEY environment variable is missing in Vercel settings.'
      }
    });
  }

  try {
    const body = req.body || {};
    // Extract payload either from body.payload or body itself
    const geminiPayload = body.payload || {
      contents: body.contents,
      generationConfig: body.generationConfig,
      systemInstruction: body.systemInstruction
    };

    if (!geminiPayload.contents || !Array.isArray(geminiPayload.contents)) {
      return res.status(400).json({
        error: { message: 'Invalid payload: contents array is required.' }
      });
    }

    // Determine model candidate list
    let modelsToTry = [];
    if (body.model) {
      modelsToTry.push(body.model);
    }
    if (Array.isArray(body.models)) {
      modelsToTry = modelsToTry.concat(body.models);
    }
    DEFAULT_MODELS.forEach(m => {
      if (!modelsToTry.includes(m)) modelsToTry.push(m);
    });

    let lastResult = null;
    let matchedModel = null;

    for (const model of modelsToTry) {
      try {
        const result = await forwardToGemini(model, geminiPayload, apiKey);
        lastResult = result;

        if (result.status >= 200 && result.status < 300) {
          matchedModel = model;
          return res.status(200).json({
            ...result.data,
            _meta: { modelUsed: matchedModel }
          });
        }

        // On 429 quota exhaustion, stop immediately to save retries
        if (result.status === 429) {
          return res.status(429).json(result.data);
        }

        // If not 404/503 (e.g. 400 Bad Request or 403 Forbidden), do not cascade
        if (result.status !== 404 && result.status !== 503) {
          return res.status(result.status).json(result.data);
        }
      } catch (err) {
        lastResult = { status: 504, data: { error: { message: err.message } } };
      }
    }

    const finalStatus = (lastResult && lastResult.status) || 502;
    return res.status(finalStatus).json((lastResult && lastResult.data) || { error: { message: 'All Gemini model fallbacks failed' } });
  } catch (globalErr) {
    return res.status(500).json({
      error: { message: 'Internal serverless error', details: globalErr.message }
    });
  }
};

