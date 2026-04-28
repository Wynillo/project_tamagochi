import puppeteer from 'puppeteer';
import fs from 'fs';

async function takeScreenshots() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932 }); // iPhone 14 Pro Max

  // Screenshot 1: Boot Scene
  await page.goto('http://localhost:3001/');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/01-boot.png' });
  console.log('Boot screenshot saved');

  // Screenshot 2: Main Menu (after boot)
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/02-mainmenu.png' });
  console.log('MainMenu screenshot saved');

  // Screenshot 3: New Game (click New Game)
  await page.mouse.click(215, 550);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: '/home/openchamber/workspaces/tamagochi/screenshots/03-newgame.png' });
  console.log('NewGame screenshot saved');

  await browser.close();
}

fs.mkdirSync('/home/openchamber/workspaces/tamagochi/screenshots', { recursive: true });
takeScreenshots().catch(err => { console.error(err); process.exit(1); });
