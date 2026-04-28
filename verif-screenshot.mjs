import puppeteer from 'puppeteer';
import fs from 'fs';
import http from 'http';
import path from 'path';

const PORT = 8765;
const BASE = '/project_tamagochi';

const mime = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let url = req.url?.split('?')[0] || '/';
  if (url === BASE || url === BASE + '/') url = BASE + '/index.html';
  if (!url.startsWith(BASE)) { res.writeHead(404); res.end(); return; }
  const rel = url.slice(BASE.length);
  const fp = path.join('/home/openchamber/workspaces/tamagochi/dist', rel === '/' ? '/index.html' : rel);
  const ext = path.extname(fp);
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932 });

  page.on('console', (msg) => console.log(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.log(`[ERROR] ${err.message}`));

  await page.goto(`http://127.0.0.1:${PORT}${BASE}/`);
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/verif-01-boot.png' });

  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/verif-02-menu.png' });

  await browser.close();
  server.close(() => { console.log('Done'); process.exit(0); });
});
