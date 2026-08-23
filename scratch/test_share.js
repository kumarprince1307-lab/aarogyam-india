const handler = require('./api/share.js');

const req = {
  headers: { 'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.html)' },
  query: { id: 'LP0005879', share_id: 'AI000004' }
};

const res = {
  setHeader: () => {},
  status: (code) => ({
    send: (html) => {
      console.log('Status: ' + code);
      const ogImgMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
      console.log('OG Image returned in HTML:');
      console.log(ogImgMatch ? ogImgMatch[1] : 'NOT FOUND');
    }
  })
};

handler(req, res);
