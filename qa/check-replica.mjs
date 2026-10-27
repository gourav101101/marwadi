import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
await mkdir('qa/screenshots',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const errors=[];const failedAssets=[];const checks=[];
try{
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400&&(response.url().includes('/reference-assets/')||response.url().includes('/assets/brand/')))failedAssets.push(response.url());});
    const home=await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});if(!home.ok())throw Error('Home failed');
    await page.locator('#close-popup').click();
    await page.locator('.replica-market-track').waitFor({timeout:20000});
    const video=page.locator('[data-original-motion]');await video.evaluate(video=>{video.pause();video.currentTime=1;});
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:'qa/screenshots/desktop.png',fullPage:true});
    checks.push('Project-owned hero footage, artwork and live market strip');
    await page.getByRole('button',{name:'Open an account',exact:true}).first().click();
    await page.locator('#exampleModal.show').waitFor();
    await page.screenshot({path:'qa/screenshots/account-modal.png'});
    await page.locator('#exampleModal [data-bs-dismiss="modal"]').click();
    await page.locator('#exampleModal').waitFor({state:'hidden'});
    if(await page.locator('#becomePartnerModal,[data-bs-target="#becomePartnerModal"]').count())throw Error('Removed partner feature is still present');
    await page.locator('#website-login-link').click();
    await page.waitForURL('**/login');
    await page.getByRole('heading',{name:'Good to see you.'}).waitFor();
    checks.push('Account modal, integrated workspace login and removal of partner signup');
    await page.goto('http://127.0.0.1:8000/service/call-and-trade',{waitUntil:'domcontentloaded'});
    await page.locator('main .accordion-button').first().click();
    await page.locator('main .accordion-collapse.show').first().waitFor();
    await page.screenshot({path:'qa/screenshots/service.png',fullPage:true});
    checks.push('Original service accordion interactions');
    const routes=['/who-we-are','/our-history','/leadership','/products/equity-derivative','/products/commodity-derivative','/products/currency-derivative','/products/third-party-product','/products/initial-public-offering-ipo','/renaissance','/service/research-and-advisory','/service/margin-trading-smtf','/service/offline-trading','/service/smart-portfolio-analyse','/contact-us'];
    for(const route of routes){const response=await context.request.get('http://127.0.0.1:8000'+route);if(!response.ok())throw Error('Route failed '+route);}
    await page.goto('http://127.0.0.1:8000/leadership',{waitUntil:'domcontentloaded'});
    await page.screenshot({path:'qa/screenshots/leadership.png',fullPage:true});
    await page.goto('http://127.0.0.1:8000/renaissance',{waitUntil:'domcontentloaded'});
    await page.locator('.renaissancemenu [data-target="management"]').click();
    if(await page.locator('#management').evaluate(x=>x.classList.contains('hidden')))throw Error('PMS tabs failed');
    checks.push('PMS tab interactions');
    for(const width of [360,390,768,1024,1440]){
        await page.setViewportSize({width,height:900});
        for(const route of ['/','/contact-us','/service/offline-trading','/renaissance']){
            await page.goto('http://127.0.0.1:8000'+route,{waitUntil:'domcontentloaded'});
            if(route==='/')await page.keyboard.press('Escape');
            await page.locator('.replica-market-track').waitFor({timeout:20000});
            const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
            if(overflow){const nodes=await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(x=>x.getBoundingClientRect().right>innerWidth+2).slice(0,6).map(x=>({tag:x.tagName,cls:x.className,right:x.getBoundingClientRect().right})));throw Error('Overflow '+width+' '+route+' '+JSON.stringify(nodes));}
        }
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});await page.keyboard.press('Escape');
    await page.locator('.replica-market-track').waitFor({timeout:20000});
    await page.locator('[data-original-motion]').evaluate(video=>{video.pause();video.currentTime=1;});
    await page.screenshot({path:'qa/screenshots/mobile.png',fullPage:true});
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-menus-wrapper-open').waitFor();
    await page.waitForFunction(()=>Math.abs(document.querySelector('.nav-menus-wrapper-open').getBoundingClientRect().x)<1);
    await page.screenshot({path:'qa/screenshots/mobile-menu.png'});
    await page.locator('.nav-menus-wrapper-open a').filter({hasText:/^Our Services/}).first().locator('.submenu-indicator').click();
    await page.locator('.nav-menus-wrapper-open').getByRole('link',{name:'Call and Trade',exact:true}).click();
    await page.waitForURL('**/service/call-and-trade');
    checks.push('Original mobile navigation and five responsive widths');
    if(errors.length||failedAssets.length)throw Error(JSON.stringify({errors,failedAssets:[...new Set(failedAssets)]}));
    const report={status:'passed',checks,checkedPages:routes.length+2,javascriptErrors:errors,failedAssets:[...new Set(failedAssets)]};
    await writeFile('qa/reference/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
