import {chromium} from '@playwright/test';
import {readdir,readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage();const report=[];
for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
const path='resources/reference/'+file;
const result=await page.evaluate(source=>{
const doc=new DOMParser().parseFromString(source,'text/html');const changes=[];
for(const el of doc.querySelectorAll('.block_online_trading_btn_pay,.popup-overlay')){changes.push('Removed reference trading portal or copied warning popup');el.remove();}
const strip=doc.querySelector('#kyc_details');if(strip){strip.innerHTML='<p>Ready to get started? <a href="/open-account">Send an account enquiry</a></p><p>Keep your contact details current. <a href="/contact-us">Speak with our team</a></p><p>Protect your account. <a href="/investor-safety">Read our investor safety guide</a></p><p>Need help with your account? <a href="/faq">View frequently asked questions</a></p>';changes.push('Replaced imported announcements with local account, contact, safety and FAQ links');}
for(const a of doc.querySelectorAll('a[href]')){
const href=a.getAttribute('href');
if(href.startsWith('/reference-assets/')&&/\.pdf(?:$|[?#])/i.test(href)){
changes.push('Removed copied company document: '+href);a.closest('.contact_blog_main')?.remove();if(a.isConnected)a.remove();continue;
}
if(/(?:marwadionline\.(?:com|in)|marwadihq)/i.test(href)){
changes.push('Removed reference navigation: '+href);
if(a.classList.contains('load-more')){a.closest('.col-lg-12')?.remove();if(a.isConnected)a.remove();}
else{a.setAttribute('href','/contact-us');a.removeAttribute('target');a.removeAttribute('rel');}
}
}
return {html:'<!DOCTYPE html>\n'+doc.documentElement.outerHTML,changes};
},await readFile(path,'utf8'));
await writeFile(path,result.html);report.push({file,changes:result.changes});}
await writeFile('documents/Reference-Link-Cleanup.json',JSON.stringify(report,null,2));console.log('Removed reference navigation, copied documents and notices across '+report.length+' public templates.');
}finally{await browser.close();}
