import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 const page=await browser.newPage();
 for(const width of [1440,390])for(const slug of ['faq','investor-safety','privacy-policy','disclaimer','sitemap']){
 await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:8000/'+slug,{waitUntil:'domcontentloaded'});await page.keyboard.press('Escape');
 await expect(page.locator('main h1')).toBeVisible();
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Overflow '+slug+' '+width);
 if(slug==='faq')await page.screenshot({path:`qa/screenshots/footer/faq-${width}.png`,fullPage:true});
 }
 console.log('All five information pages render on desktop and mobile.');
}finally{await browser.close();}
