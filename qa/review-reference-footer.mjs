import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('https://www.marwadionline.com/',{waitUntil:'domcontentloaded',timeout:60000});
 await page.keyboard.press('Escape');await page.waitForTimeout(1500);
 const footer=page.locator('footer').first();await footer.scrollIntoViewIfNeeded();
 await mkdir('qa/screenshots/footer',{recursive:true});
 await footer.screenshot({path:'qa/screenshots/footer/reference-footer.png',timeout:20000});
 const info=await footer.evaluate(el=>({text:el.innerText,links:[...el.querySelectorAll('a')].map(a=>({text:a.innerText.trim(),href:a.href}))}));
 await writeFile('qa/reference-footer-review.json',JSON.stringify(info,null,2));console.log(JSON.stringify(info));
}finally{await browser.close();}
