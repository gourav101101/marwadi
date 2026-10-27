import {chromium} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];const found=[];const locals=new Set();page.on('pageerror',e=>errors.push(e.message));
await page.route('**/market-data',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({status:false})}));
const paths=['/','/who-we-are','/our-history','/leadership','/products/equity-derivative','/products/commodity-derivative','/products/currency-derivative','/products/third-party-product','/products/initial-public-offering-ipo','/renaissance','/service/research-and-advisory','/service/margin-trading-smtf','/service/offline-trading','/service/call-and-trade','/service/smart-portfolio-analyse','/contact-us','/faq','/investor-safety','/privacy-policy','/disclaimer','/sitemap'];
for(const path of paths){await page.goto('http://127.0.0.1:8000'+path,{waitUntil:'domcontentloaded'});
const links=await page.locator('a[href],form[action]').evaluateAll(items=>items.map(el=>el.getAttribute('href')||el.getAttribute('action')));
for(const url of links){if(/marwadionline\.(com|in)|marwadihq/i.test(url))found.push({path,url});if(url.startsWith('/')&&!url.startsWith('//')&&!url.startsWith('/reference-'))locals.add(url.split('#')[0]);}
if(path==='/'){await mkdir('qa/screenshots/cleanup',{recursive:true});await page.screenshot({path:'qa/screenshots/cleanup/home-desktop.png'});}
}
const broken=[];for(const path of locals){const response=await page.request.get('http://127.0.0.1:8000'+path);if(response.status()>=400)broken.push({path,status:response.status()});}
const result={pagesChecked:paths.length,referenceLinks:found,brokenLocalLinks:broken,javascriptErrors:errors};await writeFile('qa/reference-navigation-verification.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
if(found.length||broken.length||errors.length)throw Error('Navigation audit failed; see report');
}finally{await browser.close();}
