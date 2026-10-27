import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage();await page.route('**/market-data',route=>route.fulfill({status:503,body:'{}'}));await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
for(const width of [1440,768,390,356]){await page.setViewportSize({width,height:900});const a=await page.locator('#website-login-link').boundingBox();const b=await page.locator('.hed_sce_one .web_btn_ac > button').boundingBox();if(Math.abs(a.y-b.y)>1||Math.abs(a.height-b.height)>1)throw Error('Buttons misaligned at '+width);if(width===356)await page.locator('.hed_sce_one').screenshot({path:'qa/screenshots/cleanup/header-buttons-mobile.png'});}
console.log('Login/account buttons align with equal heights at 1440, 768, 390 and 356px.');
}finally{await browser.close();}
