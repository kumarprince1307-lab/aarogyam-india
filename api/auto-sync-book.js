// api/auto-sync-book.js
// Vercel Serverless Function: Zero-Egress Auto Git Sync for Books, Images, and PDFs.
// Directly commits targeted updates to GitHub without Supabase or exposing secrets.

const https = require('https');

const GITHUB_OWNER_REPO = process.env.GITHUB_REPO || 'kumarprince1307-lab/aarogyam-india';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit for GitHub Contents API

function githubRequest(endpoint, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `https://api.github.com/repos/${GITHUB_OWNER_REPO}/${endpoint.replace(/^\//, '')}`);
    
    const headers = {
      'User-Agent': 'Aarogyam-Auto-Sync/1.0',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    };

    let postData = null;
    if (body) {
      postData = JSON.stringify(body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: headers,
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (e) {
          parsed = { raw: data };
        }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: parsed });
        } else {
          const errMsg = parsed.message || `GitHub API error (HTTP ${res.statusCode})`;
          reject(new Error(errMsg));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => { req.destroy(); reject(new Error('GitHub API request timed out')); });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function getFileSha(filePath, token) {
  try {
    const res = await githubRequest(`contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${GITHUB_BRANCH}`, 'GET', token);
    return res.data?.sha || null;
  } catch (e) {
    return null; // File does not exist yet
  }
}

async function getFileContent(filePath, token) {
  try {
    const res = await githubRequest(`contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${GITHUB_BRANCH}`, 'GET', token);
    if (res.data?.content) {
      const decoded = Buffer.from(res.data.content, 'base64').toString('utf8');
      return { content: decoded, sha: res.data.sha };
    }
  } catch (e) { }
  return null;
}

async function commitFile(filePath, base64Content, commitMessage, token) {
  const existingSha = await getFileSha(filePath, token);
  const body = {
    message: commitMessage,
    content: base64Content,
    branch: GITHUB_BRANCH
  };
  if (existingSha) {
    body.sha = existingSha;
  }

  const res = await githubRequest(`contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}`, 'PUT', token, body);
  return res.data;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({
      success: false,
      connected: false,
      error: 'GITHUB_TOKEN environment variable is not configured in Vercel. Please add GITHUB_TOKEN in Vercel Project Settings.'
    });
  }

  // 1. HEALTH CHECK / TEST CONNECTION (GET request)
  if (req.method === 'GET') {
    try {
      const testRes = await githubRequest('', 'GET', token);
      return res.status(200).json({
        success: true,
        connected: true,
        repository: GITHUB_OWNER_REPO,
        branch: GITHUB_BRANCH,
        repoFullName: testRes.data?.full_name || GITHUB_OWNER_REPO,
        defaultBranch: testRes.data?.default_branch || 'main',
        private: testRes.data?.private ?? false,
        permissions: testRes.data?.permissions || { push: true }
      });
    } catch (testErr) {
      return res.status(500).json({
        success: false,
        connected: false,
        error: `GitHub API connection failed: ${testErr.message || 'Unknown error'}`
      });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET or POST.' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (!payload || !payload.pageData || !payload.pageData.id) {
      return res.status(400).json({ success: false, error: 'Invalid payload: pageData and Book ID are required.' });
    }

    const bookId = String(payload.pageData.id).trim().toUpperCase();
    const pageData = payload.pageData;
    const bookData = payload.bookData || {};
    const uploadedFiles = Array.isArray(payload.uploadedFiles) ? payload.uploadedFiles : [];

    // STRICT PROTECTION FOR BK001 & BK002
    if (bookId === 'BK001' || bookId === 'BK002') {
      return res.status(403).json({
        success: false,
        error: `Security Rule Violation: ${bookId} is a protected core landing page and cannot be overwritten via auto-sync.`
      });
    }

    const commitLog = [];

    // 1. UPLOAD MEDIA FILES (Images, PDFs)
    for (const f of uploadedFiles) {
      if (!f || !f.path || !f.base64) continue;
      
      const cleanPath = String(f.path).replace(/^\/+/, '');
      const rawBase64 = f.base64.replace(/^data:[^;]+;base64,/, '');
      const byteSize = Buffer.from(rawBase64, 'base64').length;

      if (byteSize > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({
          success: false,
          error: `File ${cleanPath} exceeds GitHub 25MB limit (${(byteSize / (1024 * 1024)).toFixed(1)} MB). Please split the PDF into Part 1 / Part 2 or compress below 25MB.`
        });
      }

      await commitFile(cleanPath, rawBase64, `Upload ${cleanPath} for ${bookId}`, token);
      commitLog.push(cleanPath);
    }

    // 2. TARGETED UPDATE OF data/universal-book-landing-pages.json
    const landingFile = await getFileContent('data/universal-book-landing-pages.json', token);
    let landingJson = { bookLandingPages: [] };
    if (landingFile && landingFile.content) {
      try {
        landingJson = JSON.parse(landingFile.content);
      } catch (pe) { }
    }
    if (!Array.isArray(landingJson.bookLandingPages)) landingJson.bookLandingPages = [];

    const existingLpIdx = landingJson.bookLandingPages.findIndex(p => p && p.id && String(p.id).trim().toUpperCase() === bookId);
    if (existingLpIdx >= 0) {
      landingJson.bookLandingPages[existingLpIdx] = pageData;
    } else {
      landingJson.bookLandingPages.push(pageData);
    }

    const updatedLandingBase64 = Buffer.from(JSON.stringify(landingJson, null, 2), 'utf8').toString('base64');
    await commitFile('data/universal-book-landing-pages.json', updatedLandingBase64, `Publish landing page ${bookId} [Auto-Sync]`, token);
    commitLog.push('data/universal-book-landing-pages.json');

    // 3. TARGETED UPDATE OF data/books.json
    const booksFile = await getFileContent('data/books.json', token);
    let booksJson = { books: [] };
    if (booksFile && booksFile.content) {
      try {
        booksJson = JSON.parse(booksFile.content);
      } catch (pe) { }
    }
    if (!Array.isArray(booksJson.books)) booksJson.books = [];

    const existingBookIdx = booksJson.books.findIndex(b => b && b.id && String(b.id).trim().toUpperCase() === bookId);
    if (existingBookIdx >= 0) {
      booksJson.books[existingBookIdx] = bookData;
    } else {
      booksJson.books.push(bookData);
    }

    const updatedBooksBase64 = Buffer.from(JSON.stringify(booksJson, null, 2), 'utf8').toString('base64');
    await commitFile('data/books.json', updatedBooksBase64, `Update catalog for book ${bookId} [Auto-Sync]`, token);
    commitLog.push('data/books.json');

    return res.status(200).json({
      success: true,
      message: `Book ${bookId} published to GitHub repository. Vercel auto-deployment triggered.`,
      bookId: bookId,
      updatedFiles: commitLog
    });

  } catch (err) {
    console.error('Auto-Sync handler error:', err);
    return res.status(500).json({
      success: false,
      error: `GitHub Auto-Sync failed: ${err.message || 'Unknown error'}`
    });
  }
};
