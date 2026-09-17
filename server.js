const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  // Normalize URL to remove query parameters
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let pathname = parsedUrl.pathname;

  // Default route to proposal.html
  if (pathname === '/' || pathname === '') {
    pathname = '/proposal.html';
  }

  // Safe file path resolution
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Check if it's a directory with an index.html or proposal.html
      if (stats && stats.isDirectory()) {
        const potentialIndex = path.join(filePath, 'proposal.html');
        if (fs.existsSync(potentialIndex)) {
          filePath = potentialIndex;
        } else {
          send404(res);
          return;
        }
      } else {
        send404(res);
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error: Failed to read file.');
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'Access-Control-Allow-Origin': '*',
      });
      res.end(content);
    });
  });
});

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>404 Not Found</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center; padding: 4rem 2rem; color: #20414f; background: #f8fafc; }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; }
        p { color: #64748b; margin-bottom: 2rem; }
        a { display: inline-block; background: #6ba439; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 8px; font-weight: 600; }
        a:hover { background: #5d9130; }
      </style>
    </head>
    <body>
      <h1>404 - Document Not Found</h1>
      <p>The requested file does not exist.</p>
      <a href="/proposal.html">Go to Proposal</a>
    </body>
    </html>
  `);
}

server.listen(PORT, () => {
  console.log('====================================================');
  console.log('⚡ NeoGen Technologies × Resonating Brands Proposal');
  console.log('====================================================');
  console.log(`Server is running at: http://localhost:${PORT}`);
  console.log(`Proposal URL:        http://localhost:${PORT}/proposal.html`);
  console.log('Press Ctrl + C to stop the server.');
  console.log('====================================================');
});
