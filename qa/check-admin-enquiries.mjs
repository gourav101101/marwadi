import {chromium,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base='http://127.0.0.1:8002';const email='inbox'+Date.now()+'@example.invalid';
await page.goto(base+'/open-account',{waitUntil:'domcontentloaded'});
const form=page.locator('.open-account-request');await expect(form).toBeVisible();
for(const [name,value] of Object.entries({name:'Inbox Browser Test',email,phone:'9000000000',city:'New Delhi',message:'Please call about opening my account.'}))await form.locator(`[name="${name}"]`).fill(value);
await form.locator('[name=consent]').check();await form.getByRole('button',{name:'Submit',exact:true}).click();
await expect(page.locator('.replica-status')).toContainText('Your enquiry has been received');
await page.goto(base+'/login');await page.locator('[name=login]').fill('admin@integration.invalid');await page.locator('[name=password]').fill('IntegrationAdmin2026!');await page.getByRole('button',{name:'Sign in to workspace'}).click();await page.waitForURL('**/workspace');
await page.getByRole('link',{name:'Website enquiries',exact:true}).click();
await expect(page.locator('tbody')).toContainText('Inbox Browser Test');
await page.getByRole('link',{name:'View details',exact:true}).first().click();await expect(page.locator('main')).toContainText('Please call about opening my account.');
await mkdir('qa/screenshots/enquiries',{recursive:true});await page.screenshot({path:'qa/screenshots/enquiries/detail-desktop.png',fullPage:true});
await page.getByRole('link',{name:'Back to enquiries'}).click();await page.getByRole('textbox',{name:'Search enquiries'}).fill(email);await page.getByRole('button',{name:'Filter',exact:true}).click();await expect(page.locator('tbody tr')).toHaveCount(1);
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'qa/screenshots/enquiries/list-mobile.png',fullPage:true});
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Mobile overflow');
if(errors.length)throw Error(errors.join('\n'));
console.log('Isolated browser flow passed: submit account enquiry, view in admin, read full message, search, mobile layout.');
}finally{await browser.close();}
