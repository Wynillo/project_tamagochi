import puppeteer from 'puppeteer';
import fs from 'fs';
import http from 'http';
import path from 'path';

const PORT = 8765;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const base = req.url?.split('?')[0] || '/';
  const filePath = path.join('/home/openchamber/workspaces/tamagochi/dist', base === '/' ? 'index.html' : base);
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
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

  await page.goto(`http://127.0.0.1:${PORT}/`);
  await new Promise((r) => setTimeout(r, 3500));

  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/fix-01-boot.png' });
  console.log('Screenshot 1: Boot done');

  await new Promise((r) => setTimeout(r, 3000));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/fix-02-mainmenu.png' });
  console.log('Screenshot 2: MainMenu done');

  await page.mouse.click(215, 550);
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/fix-03-newgame.png' });
  console.log('Screenshot 3: NewGame done');

  page.evaluate(() => {
    const store = window.__ZUSTAND_STORE_FALLBACK;
    if (store) store.startGame('SPARKLESPHERE', 'Test');
  }).catch(() => {});

  await page.evaluate(() => {
    const game = window.__PHASER_GAME;
    const scene = game?.scene?.getScene('NewGameScene');
    if (scene) scene.scene.start('HubScene');
  });
  await new Promise((r) => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/fix-04-hub.png' });
  console.log('Screenshot 4: HubScene done');

  await browser.close();
  server.close(() => process.exit(0));
});
