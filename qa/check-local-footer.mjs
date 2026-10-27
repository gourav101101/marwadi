import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
 await page.keyboard.press('Escape');await page.waitForTimeout(400);
 const footer=page.locator('.local-footer');await footer.waitFor();
 const links=await footer.locator('a').evaluateAll(items=>items.map(a=>a.getAttribute('href')));
 for(const href of new Set(links.filter(x=>x.startsWith('/')))){
  const response=await page.request.get('http://127.0.0.1:8000'+href);
  if(response.status()!==200)throw Error(href+' returned '+response.status());
 }
 if(links.some(x=>/marwadionline|MarwadiHQ|marwadihq/.test(x)))throw Error('Reference company link remains');
 await mkdir('qa/screenshots/footer',{recursive:true});
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});await footer.scrollIntoViewIfNeeded();
  await footer.screenshot({path:`qa/screenshots/footer/footer-${width}.png`});
  if(await footer.evaluate(el=>el.scrollWidth>el.clientWidth+1))throw Error('Footer overflow at '+width);
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile('qa/footer-verification.json',JSON.stringify({status:'passed',localLinks:links.filter(x=>x.startsWith('/')),widths:[1440,768,390],javascriptErrors:errors},null,2));
 console.log('Footer links return HTTP 200; desktop/tablet/mobile checks passed.');
}finally{await browser.close();}
