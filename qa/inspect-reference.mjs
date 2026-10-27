import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('qa/reference', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, ignoreHTTPSErrors: true });
    const page = await context.newPage();
    await page.goto('https://www.marwadionline.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(6500);
    await page.screenshot({ path: 'qa/reference/desktop.png', fullPage: true });
    await writeFile('qa/reference/dom.html', await page.content());
    console.log(JSON.stringify(await page.evaluate(() => ({ title: document.title, headings: [...document.querySelectorAll('h1,h2,h3')].map(x => x.innerText), links: [...document.querySelectorAll('.topnav a')].map(x => ({ text: x.innerText.trim(), href:x.href })), overlays: [...document.querySelectorAll('.modal')].map(x=>({id:x.id, visible:getComputedStyle(x).display !== 'none'})) })), null, 2));
    await page.setViewportSize({width:390,height:844});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForTimeout(4000);
    await page.screenshot({path:'qa/reference/mobile.png',fullPage:true});
} finally { await browser.close(); }
