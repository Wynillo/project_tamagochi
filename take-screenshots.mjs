import puppeteer from 'puppeteer';
import fs from 'fs';

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
});
const page = await browser.newPage();
await page.setViewport({ width: 430, height: 932 });

await page.goto('http://localhost:8888/');
await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/01-boot.png' });
console.log('Screenshot 1: 01-boot.png');

await new Promise(r => setTimeout(r, 3000));
await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/02-mainmenu.png' });
console.log('Screenshot 2: 02-mainmenu.png');

await page.mouse.click(215, 550);
await new Promise(r => setTimeout(r, 2000));
await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/03-newgame.png' });
console.log('Screenshot 3: 03-newgame.png');

await browser.close();
console.log('All screenshots completed!');
