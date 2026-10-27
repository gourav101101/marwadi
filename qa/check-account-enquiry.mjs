import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:390,height:844}});
await page.goto('http://127.0.0.1:8000/open-account',{waitUntil:'domcontentloaded'});
const form=page.locator('.open-account-request');await expect(form).toBeVisible();
await expect(form.locator('[name=pancard]')).toHaveCount(0);
for(const name of ['name','email','phone','city','message'])await expect(form.locator(`[name="${name}"]`)).toBeVisible();
await expect(form.locator('[name=consent]')).toBeVisible();
await page.screenshot({path:'qa/screenshots/footer/account-enquiry-mobile.png',fullPage:true});
console.log('Mobile enquiry fields and consent verified; no live submission or email sent.');
}finally{await browser.close();}
