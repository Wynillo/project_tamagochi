import puppeteer from 'puppeteer';
import fs from 'fs';

const logs = [];

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();

page.on('console', (msg) => {
  logs.push(`[${msg.type()}] ${msg.text()}`);
});
page.on('pageerror', (err) => {
  logs.push(`[PAGE ERROR] ${err.message}`);
});

await page.goto('http://localhost:3000/');
await new Promise((r) => setTimeout(r, 4000));

fs.mkdirSync('/home/openchamber/workspaces/tamagochi/screenshots', { recursive: true });
await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/debug-state.png' });

fs.writeFileSync('/home/openchamber/workspaces/tamagochi/screenshots/console.log', logs.join('\n'));

await browser.close();
console.log('Done. Check /home/openchamber/workspaces/tamagochi/screenshots/console.log');
