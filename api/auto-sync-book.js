// api/auto-sync-book.js
// Vercel Serverless Function: Zero-Egress Auto Git Sync for Books, Images, and PDFs.
// Directly commits targeted updates to GitHub without Supabase or exposing secrets.
// Supports single file upload, chunked large file uploads (<25MB), catalog saving, and deletion.

const https = require('https');
const fs = require('fs');
const path = require('path');

const GITHUB_OWNER_REPO = process.env.GITHUB_REPO || 'kumarprince1307-lab/aarogyam-india';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB limit for GitHub Contents API

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 25,
  keepAliveMsecs: 60000
});

function sendJson(res, statusCode, data) {
  const jsonStr = JSON.stringify(data);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(jsonStr, 'utf8'),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(jsonStr);
}

function parseBody(req) {
  return new Promise((resolve) => {
    if (req.body) {
      if (typeof req.body === 'object') return resolve(req.body);
      try { return resolve(JSON.parse(req.body)); } catch (e) { return resolve({}); }
    }
    const chunks = [];
    req.on('data', chunk => { chunks.push(chunk); });
    req.on('end', () => {
      try {
        const bodyBuffer = Buffer.concat(chunks);
        const bodyStr = bodyBuffer.toString('utf8');
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function githubRequest(endpoint, method, token, body = null) {
  return new Promise((resolve, reject) => {
    try {
      const cleanEndpoint = endpoint ? String(endpoint).replace(/^\/+/, '') : '';
      const fullUrl = cleanEndpoint.startsWith('http')
        ? cleanEndpoint
        : `https://api.github.com/repos/${GITHUB_OWNER_REPO}${cleanEndpoint ? '/' + cleanEndpoint : ''}`;

      const url = new URL(fullUrl);

      const cleanToken = String(token || '').trim();
      const authHeader = cleanToken.startsWith('github_pat_') || cleanToken.startsWith('ghp_')
        ? `Bearer ${cleanToken}`
        : `token ${cleanToken}`;

      const headers = {
        'User-Agent': 'Aarogyam-Auto-Sync/1.0',
        'Authorization': authHeader,
        'Accept': 'application/vnd.github.v3+json'
      };

      let postData = null;
      if (body) {
        postData = Buffer.from(JSON.stringify(body), 'utf8');
        headers['Content-Type'] = 'application/json; charset=utf-8';
        headers['Content-Length'] = postData.length;
      }

      const options = {
        agent: httpsAgent,
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: method,
        headers: headers,
        timeout: 30000
      };

      const req = https.request(options, (res) => {
        const resChunks = [];
        res.on('data', (chunk) => { resChunks.push(chunk); });
        res.on('end', () => {
          let parsed = null;
          try {
            const rawStr = Buffer.concat(resChunks).toString('utf8');
            parsed = rawStr ? JSON.parse(rawStr) : {};
          } catch (e) {
            parsed = {};
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: parsed });
          } else {
            const errMsg = parsed?.message || `GitHub HTTP ${res.statusCode}`;
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
    } catch (err) {
      reject(err);
    }
  });
}

async function getFileSha(filePath, token) {
  try {
    const res = await githubRequest(`contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${GITHUB_BRANCH}`, 'GET', token);
    return res.data?.sha || null;
  } catch (e) {
    return null;
  }
}

async function getFileContent(filePath, token) {
  try {
    const res = await githubRequest(`contents/${encodeURIComponent(filePath).replace(/%2F/g, '/')}?ref=${GITHUB_BRANCH}`, 'GET', token);
    if (res.data?.content) {
      const cleanBase64 = String(res.data.content).replace(/\s+/g, '');
      const decoded = Buffer.from(cleanBase64, 'base64').toString('utf8');
      return { content: decoded, sha: res.data.sha };
    }
  } catch (e) { }
  return null;
}

async function createBlob(base64Content, token) {
  const cleanBase64 = String(base64Content || '').replace(/^data:[^;]+;base64,/, '');
  const res = await githubRequest('git/blobs', 'POST', token, {
    content: cleanBase64,
    encoding: 'base64'
  });
  return res.data?.sha;
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
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return sendJson(res, 500, {
        success: false,
        connected: false,
        error: 'GITHUB_TOKEN environment variable is not configured in Vercel. Please add GITHUB_TOKEN in Vercel Project Settings.'
      });
    }

    // 1. HEALTH CHECK / TEST CONNECTION (GET request)
    if (req.method === 'GET') {
      try {
        const testRes = await githubRequest('', 'GET', token);
        return sendJson(res, 200, {
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
        return sendJson(res, 500, {
          success: false,
          connected: false,
          error: `GitHub API connection failed: ${testErr.message || 'Unknown error'}`
        });
      }
    }

    if (req.method !== 'POST') {
      return sendJson(res, 405, { success: false, error: 'Method not allowed. Use GET or POST.' });
    }

    const payload = await parseBody(req);
    const action = payload.action || 'save';

    // -------------------------------------------------------------
    // ACTION: CREATE BLOB (Parallel Conflict-Free Fast Blob Upload)
    // -------------------------------------------------------------
    if (action === 'create_blob' || action === 'upload_blob') {
      const rawBase64 = String(payload.base64 || '').replace(/^data:[^;]+;base64,/, '');
      if (!rawBase64) {
        return sendJson(res, 400, { success: false, error: 'base64 is required for create_blob.' });
      }
      const blobSha = await createBlob(rawBase64, token);
      return sendJson(res, 200, { success: true, sha: blobSha });
    }

    // -------------------------------------------------------------
    // ACTION: COMMIT STUDIO TREE (1-Click Atomic Commit for 150+ Pages)
    // -------------------------------------------------------------
    if (action === 'commit_studio_tree') {
      const bookId = String(payload.bookId || '').trim().toUpperCase();
      const totalPages = parseInt(payload.totalPages, 10) || 0;
      const audioScripts = payload.audioScripts || { bookId: bookId, pages: {} };
      const treeItems = Array.isArray(payload.tree) ? payload.tree : [];

      if (!bookId) {
        return sendJson(res, 400, { success: false, error: 'Book ID is required for commit_studio_tree.' });
      }

      // 1. Get latest commit on target branch
      const refRes = await githubRequest(`git/ref/heads/${GITHUB_BRANCH}`, 'GET', token);
      const latestCommitSha = refRes.data?.object?.sha;
      if (!latestCommitSha) throw new Error(`Could not fetch HEAD for branch ${GITHUB_BRANCH}`);

      // 2. Add audio script blob
      const scriptJsonStr = JSON.stringify(audioScripts, null, 2);
      const scriptBlobSha = await createBlob(Buffer.from(scriptJsonStr, 'utf8').toString('base64'), token);
      treeItems.push({
        path: `data/audio-scripts/${bookId}.json`,
        mode: '100644',
        type: 'blob',
        sha: scriptBlobSha
      });

      // 3. Update data/books.json blob
      const booksFile = await getFileContent('data/books.json', token);
      let booksJson = { books: [] };
      if (booksFile && booksFile.content) {
        try { booksJson = JSON.parse(booksFile.content); } catch (e) {}
      }
      if (!Array.isArray(booksJson.books)) booksJson.books = [];

      const existingBook = booksJson.books.find(b => b && b.id && String(b.id).trim().toUpperCase() === bookId);
      if (existingBook) {
        if (totalPages > 0) existingBook.totalPages = totalPages;
        existingBook.hasWebpPages = true;
        existingBook.pageImagesPath = `images/books/${bookId}`;
        existingBook.audioScriptPath = `data/audio-scripts/${bookId}.json`;
      } else {
        booksJson.books.push({
          id: bookId,
          slug: bookId.toLowerCase(),
          heading: `${bookId} eBook`,
          shortTitle: `${bookId}`,
          name: `${bookId} eBook`,
          status: 'active',
          totalPages: totalPages || 1,
          hasWebpPages: true,
          pageImagesPath: `images/books/${bookId}`,
          audioScriptPath: `data/audio-scripts/${bookId}.json`,
          readEnabled: true,
          downloadEnabled: true
        });
      }

      const updatedBooksStr = JSON.stringify(booksJson, null, 2);
      const booksBlobSha = await createBlob(Buffer.from(updatedBooksStr, 'utf8').toString('base64'), token);
      treeItems.push({
        path: 'data/books.json',
        mode: '100644',
        type: 'blob',
        sha: booksBlobSha
      });

      // 4. Create Git Tree
      const treeRes = await githubRequest('git/trees', 'POST', token, {
        base_tree: latestCommitSha,
        tree: treeItems.map(item => ({
          path: String(item.path).replace(/^\/+/, ''),
          mode: item.mode || '100644',
          type: 'blob',
          sha: item.sha
        }))
      });
      const newTreeSha = treeRes.data?.sha;

      // 5. Create Git Commit
      const commitRes = await githubRequest('git/commits', 'POST', token, {
        message: `Publish ${totalPages} WebP pages & audio scripts for ${bookId} [Studio 1-Click Sync]`,
        tree: newTreeSha,
        parents: [latestCommitSha]
      });
      const newCommitSha = commitRes.data?.sha;

      // 6. Update Branch Reference
      await githubRequest(`git/refs/heads/${GITHUB_BRANCH}`, 'PATCH', token, {
        sha: newCommitSha,
        force: false
      });

      return sendJson(res, 200, {
        success: true,
        message: `Successfully pushed ${treeItems.length} files in 1 atomic commit to ${GITHUB_BRANCH}.`,
        commitSha: newCommitSha,
        bookId: bookId,
        totalPages: totalPages
      });
    }

    // -------------------------------------------------------------
    // ACTION: UPLOAD SINGLE ASSET (Cover, Banner, Demo Image, Small PDF)
    // -------------------------------------------------------------
    if (action === 'upload_asset') {
      const filePath = String(payload.path || '').replace(/^\/+/, '');
      const rawBase64 = String(payload.base64 || '').replace(/^data:[^;]+;base64,/, '');

      if (!filePath || !rawBase64) {
        return sendJson(res, 400, { success: false, error: 'filePath and base64 content are required for upload_asset.' });
      }

      const byteSize = Buffer.from(rawBase64, 'base64').length;
      if (byteSize > MAX_FILE_SIZE_BYTES) {
        return sendJson(res, 400, {
          success: false,
          error: `File exceeds GitHub 25MB limit (${(byteSize / (1024 * 1024)).toFixed(1)} MB). Please compress or split.`
        });
      }

      const commitRes = await commitFile(filePath, rawBase64, `Upload ${filePath} [Auto-Sync Asset]`, token);
      return sendJson(res, 200, {
        success: true,
        message: `Asset ${filePath} successfully committed to GitHub.`,
        path: `/${filePath}`,
        commit: commitRes
      });
    }

    // -------------------------------------------------------------
    // ACTION: SAVE AUDIO STUDIO CONFIG & MANIFEST
    // -------------------------------------------------------------
    if (action === 'save_audio_studio') {
      const bookId = String(payload.bookId || '').trim().toUpperCase();
      if (!bookId) {
        return sendJson(res, 400, { success: false, error: 'Book ID is required for save_audio_studio.' });
      }

      const totalPages = parseInt(payload.totalPages, 10) || 0;
      const audioScripts = payload.audioScripts || { bookId: bookId, pages: {} };
      const commitLog = [];

      // 1. Commit data/audio-scripts/${bookId}.json
      const audioScriptPath = `data/audio-scripts/${bookId}.json`;
      const scriptBase64 = Buffer.from(JSON.stringify(audioScripts, null, 2), 'utf8').toString('base64');
      await commitFile(audioScriptPath, scriptBase64, `Update audio scripts for ${bookId} [Studio Auto-Sync]`, token);
      commitLog.push(audioScriptPath);

      // 2. Update data/books.json
      const booksFile = await getFileContent('data/books.json', token);
      let booksJson = { books: [] };
      if (booksFile && booksFile.content) {
        try { booksJson = JSON.parse(booksFile.content); } catch (e) {}
      }
      if (!Array.isArray(booksJson.books)) booksJson.books = [];

      const existingBook = booksJson.books.find(b => b && b.id && String(b.id).trim().toUpperCase() === bookId);
      if (existingBook) {
        if (totalPages > 0) existingBook.totalPages = totalPages;
        existingBook.hasWebpPages = true;
        existingBook.pageImagesPath = `images/books/${bookId}`;
        existingBook.audioScriptPath = audioScriptPath;
      }

      const updatedBooksBase64 = Buffer.from(JSON.stringify(booksJson, null, 2), 'utf8').toString('base64');
      await commitFile('data/books.json', updatedBooksBase64, `Update ${bookId} WebP manifest [Studio Auto-Sync]`, token);
      commitLog.push('data/books.json');

      return sendJson(res, 200, {
        success: true,
        message: `Studio manifest for ${bookId} committed to GitHub repository.`,
        bookId: bookId,
        totalPages: totalPages,
        updatedFiles: commitLog
      });
    }

    // -------------------------------------------------------------
    // ACTION: DELETE BOOK
    // -------------------------------------------------------------
    if (action === 'delete') {
      const deleteBookId = String(payload.bookId || payload.pageData?.id || '').trim().toUpperCase();
      if (!deleteBookId) {
        return sendJson(res, 400, { success: false, error: 'Book ID is required for delete.' });
      }

      // STRICT PROTECTION FOR BK001 & BK002
      if (deleteBookId === 'BK001' || deleteBookId === 'BK002') {
        return sendJson(res, 403, {
          success: false,
          error: `Security Rule Violation: ${deleteBookId} is a protected core landing page and cannot be deleted.`
        });
      }

      const deleteCommitLog = [];

      // 1. Remove from data/universal-book-landing-pages.json
      const landingFile = await getFileContent('data/universal-book-landing-pages.json', token);
      let landingJson = { bookLandingPages: [] };
      if (landingFile && landingFile.content) {
        try { landingJson = JSON.parse(landingFile.content); } catch (e) {}
      }
      if (Array.isArray(landingJson.bookLandingPages)) {
        landingJson.bookLandingPages = landingJson.bookLandingPages.filter(
          p => p && p.id && String(p.id).trim().toUpperCase() !== deleteBookId
        );
      }
      const updatedLandingBase64 = Buffer.from(JSON.stringify(landingJson, null, 2), 'utf8').toString('base64');
      await commitFile('data/universal-book-landing-pages.json', updatedLandingBase64, `Delete landing page ${deleteBookId} [Auto-Sync]`, token);
      deleteCommitLog.push('data/universal-book-landing-pages.json');

      // 2. Remove from data/books.json
      const booksFile = await getFileContent('data/books.json', token);
      let booksJson = { books: [] };
      if (booksFile && booksFile.content) {
        try { booksJson = JSON.parse(booksFile.content); } catch (e) {}
      }
      if (Array.isArray(booksJson.books)) {
        booksJson.books = booksJson.books.filter(
          b => b && b.id && String(b.id).trim().toUpperCase() !== deleteBookId
        );
      }
      const updatedBooksBase64 = Buffer.from(JSON.stringify(booksJson, null, 2), 'utf8').toString('base64');
      await commitFile('data/books.json', updatedBooksBase64, `Delete book ${deleteBookId} from catalog [Auto-Sync]`, token);
      deleteCommitLog.push('data/books.json');

      return sendJson(res, 200, {
        success: true,
        message: `Book ${deleteBookId} deleted from GitHub repository. Vercel auto-deployment triggered.`,
        bookId: deleteBookId,
        updatedFiles: deleteCommitLog
      });
    }

    // -------------------------------------------------------------
    // ACTION: SAVE WEBINAR MASTER CONFIGURATION (AarogyamTube Live Zoom)
    // -------------------------------------------------------------
    if (action === 'save_webinar_master') {
      if (!payload.webinarMaster) {
        return sendJson(res, 400, { success: false, error: 'webinarMaster object is required.' });
      }
      const webinarMasterData = { webinarMaster: payload.webinarMaster };
      const updatedWebinarBase64 = Buffer.from(JSON.stringify(webinarMasterData, null, 2), 'utf8').toString('base64');
      await commitFile('data/webinar-master.json', updatedWebinarBase64, `Update Webinar Master [Auto-Sync]`, token);

      return sendJson(res, 200, {
        success: true,
        message: 'Webinar Master successfully published to GitHub.',
        updatedFiles: ['data/webinar-master.json']
      });
    }

    // -------------------------------------------------------------
    // ACTION: SAVE WEBINAR RECORDINGS & AAROGYAMTUBE VIDEOS / SHORTS
    // -------------------------------------------------------------
    if (action === 'save_webinar_recordings') {
      const recordings = Array.isArray(payload.recordings) ? payload.recordings : [];
      const recordingsData = { recordings: recordings };
      const updatedRecsBase64 = Buffer.from(JSON.stringify(recordingsData, null, 2), 'utf8').toString('base64');
      await commitFile('data/webinar-recordings.json', updatedRecsBase64, `Update AarogyamTube Videos & Recordings (${recordings.length} items) [Auto-Sync]`, token);

      return sendJson(res, 200, {
        success: true,
        message: 'AarogyamTube videos and recordings successfully published to GitHub.',
        total: recordings.length,
        updatedFiles: ['data/webinar-recordings.json']
      });
    }

    // -------------------------------------------------------------
    // ACTION: SAVE / PUBLISH BOOK CATALOG & LANDING PAGE
    // -------------------------------------------------------------
    if (!payload || !payload.pageData || !payload.pageData.id) {
      return sendJson(res, 400, { success: false, error: 'Invalid payload: pageData and Book ID are required.' });
    }

    const bookId = String(payload.pageData.id).trim().toUpperCase();
    const pageData = payload.pageData;
    const bookData = payload.bookData || {};
    const uploadedFiles = Array.isArray(payload.uploadedFiles) ? payload.uploadedFiles : [];

    // STRICT PROTECTION FOR BK001 & BK002
    if (bookId === 'BK001' || bookId === 'BK002') {
      return sendJson(res, 403, {
        success: false,
        error: `Security Rule Violation: ${bookId} is a protected core landing page and cannot be overwritten via auto-sync.`
      });
    }

    const commitLog = [];

    // 1. UPLOAD ANY EMBEDDED MEDIA FILES
    for (const f of uploadedFiles) {
      if (!f || !f.path || !f.base64) continue;
      
      const cleanPath = String(f.path).replace(/^\/+/, '');
      const rawBase64 = f.base64.replace(/^data:[^;]+;base64,/, '');
      const byteSize = Buffer.from(rawBase64, 'base64').length;

      if (byteSize > MAX_FILE_SIZE_BYTES) {
        return sendJson(res, 400, {
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

    return sendJson(res, 200, {
      success: true,
      message: `Book ${bookId} published to GitHub repository. Vercel auto-deployment triggered.`,
      bookId: bookId,
      updatedFiles: commitLog
    });

  } catch (err) {
    console.error('Auto-Sync handler error:', err);
    return sendJson(res, 500, {
      success: false,
      error: `GitHub Auto-Sync failed: ${err.message || 'Unknown error'}`
    });
  }
};
