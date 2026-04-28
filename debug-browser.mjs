import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import fs from 'fs';

const PORT = 8765;
const BASE_PATH = '/project_tamagochi';
const DIST_DIR = './dist';

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  
  if (urlPath === BASE_PATH || urlPath === BASE_PATH + '/') {
    urlPath = BASE_PATH + '/index.html';
  }
  
  const filePath = urlPath.replace(BASE_PATH, '') || '/index.html';
  const fullPath = join(DIST_DIR, filePath);
  
  const ext = extname(fullPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  try {
    const content = await readFile(fullPath);
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  } catch (err) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<h1>404</h1><p>${urlPath}</p><p>${fullPath}</p>`);
  }
});

await new Promise(resolve => server.listen(PORT, resolve));
console.log(`Server running at http://localhost:${PORT}`);

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

const page = await browser.newPage();

// Set a proper viewport size
await page.setViewport({ width: 1280, height: 800 });

const logs = [];

// Enable IndexedDB in headless Chrome
page.on('console', async (msg) => {
  const location = msg.location();
  const locStr = location.url ? `:${location.lineNumber}:${location.columnNumber}` : '';
  const text = msg.text();
  logs.push(`[${msg.type().toUpperCase()}]${locStr} ${text}`);
  
  // Check for specific error patterns
  if (text.toLowerCase().includes('webgl') || text.toLowerCase().includes('phaser') || text.toLowerCase().includes('scene')) {
    console.log(`Found relevant log: ${text}`);
  }
});

page.on('pageerror', (err) => {
  console.log(`[PAGE ERROR] ${err.message}`);
  console.log(`Stack: ${err.stack}`);
  logs.push(`[PAGE ERROR] ${err.message}`);
});

page.on('pageerror', (err) => {
  logs.push(`[PAGE ERROR] ${err.message}`);
});

page.on('requestfailed', (request) => {
  logs.push(`[REQUEST FAILED] ${request.url()} - ${request.failure()?.errorText}`);
});

page.on('response', (response) => {
  if (response.status() >= 400) {
    logs.push(`[HTTP ${response.status()}] ${response.url()}`);
  }
});

const url = `http://localhost:${PORT}${BASE_PATH}/`;
console.log(`Navigating to: ${url}`);

// Test 1: WITHOUT viewport (simulating the issue)
// Test 2: WITH viewport (to confirm fix)

// Simulate the blank screen scenario - use default Puppeteer viewport which might be 800x600
// but the Game.ts uses window.innerWidth which might not be set correctly initially

// Actually, let's check what the default viewport is
console.log('Default Puppeteer viewport being used...');

try {
  const defaultViewport = await page.viewport();
  console.log(`Default viewport: ${JSON.stringify(defaultViewport)}`);
  
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));
  
  // Check window size at time of load
  const windowSize = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight
  }));
  console.log(`Window size during page load: ${JSON.stringify(windowSize)}`);
  
  console.log('\n=== Console Logs ===\n');
  logs.forEach(log => console.log(log));
  
  const pageInfo = await page.evaluate(() => {
    const root = document.getElementById('root');
    const canvas = document.querySelector('canvas');
    const phaserContainer = document.getElementById('phaser-game-container');
    
    // Get Phaser game state - look for global Phaser instances
    let phaserState = null;
    const globalKeys = Object.keys(window);
    const phaserGameKeys = globalKeys.filter(k => k.toLowerCase().includes('phaser') || k.toLowerCase().includes('game'));
    
    for (const key of globalKeys) {
      const val = window[key];
      if (val && typeof val === 'object' && val.constructor && val.constructor.name === 'Game') {
        phaserState = {
          key,
          sceneCount: val.scene?.scenes?.length,
          scenes: val.scene?.scenes?.map(s => s.scene.key),
          isBooting: val.scene?.isBooting?.(),
          isRunning: val.scene?.isRunning?.()
        };
        break;
      }
    }
    
    let canvasInfo = null;
    if (canvas) {
      const ctx = canvas.getContext('2d') || canvas.getContext('webgl');
      const rect = canvas.getBoundingClientRect();
      canvasInfo = {
        width: canvas.width,
        height: canvas.height,
        hasContext: !!ctx,
        style: canvas.getAttribute('style'),
        computedStyle: window.getComputedStyle(canvas).cssText.substring(0, 500),
        boundingRect: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left
        },
        parentClientRect: phaserContainer?.getBoundingClientRect()
      };
    }
    
    return {
      rootExists: !!root,
      rootInnerHTML: root?.innerHTML || '',
      canvasInfo,
      phaserContainerExists: !!phaserContainer,
      phaserContainerStyle: phaserContainer ? window.getComputedStyle(phaserContainer).cssText : null,
      bodyInnerHTML: document.body.innerHTML.substring(0, 500),
      windowSize: { width: window.innerWidth, height: window.innerHeight },
      phaserState
    };
  });
  
  console.log('\n=== Page Info ===\n');
  console.log(JSON.stringify(pageInfo, null, 2));
  
} catch (err) {
  console.log(`Navigation error: ${err.message}`);
  logs.push(`[NAV ERROR] ${err.message}`);
}

fs.mkdirSync('/home/openchamber/workspaces/tamagochi/screenshots', { recursive: true });
await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/debug-state.png' });
fs.writeFileSync('/home/openchamber/workspaces/tamagochi/screenshots/console.log', logs.join('\n'));

await browser.close();
server.close();
console.log('\nDone. Check console.log and screenshot.');
