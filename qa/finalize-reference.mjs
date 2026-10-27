import { chromium } from '@playwright/test';
import { readFile,writeFile,readdir } from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const page=await browser.newPage();
    const files=(await readdir('resources/reference')).filter(x=>x.endsWith('.html'));
    for(const file of files){
        const source=await readFile('resources/reference/'+file,'utf8');
        const html=await page.evaluate(source=>{
            const doc=new DOMParser().parseFromString(source,'text/html');
            doc.querySelectorAll('.office_info').forEach(box=>{const paragraphs=[...box.querySelectorAll(':scope > p')];paragraphs.forEach((p,index)=>index?p.remove():p.textContent='__LOCAL_ADDRESS__');});
            doc.querySelectorAll('.product_menu > ul > li').forEach(li=>{
                const text=li.textContent.replace(/\s+/g,' ').trim();
                if(/Security lending|Third Party Service|Depository Services|National Pension System|Wealth Desk|Mutual Funds/.test(text))li.remove();
                if(/^Online Trading/.test(text))li.innerHTML='<a href="/service/offline-trading"><i class="far fa-dot-circle"></i>Offline Trading</a>';
            });
            doc.querySelectorAll('[name="pancard"]').forEach(x=>x.placeholder='Enter pancard');
            doc.querySelectorAll('img.thumbnail_img').forEach(img=>{
                // These five graphic URLs are broken on the original site too. Preserve the tab
                // geometry and explain the missing source graphic instead of a broken network request.
                if(/web-0[1-5]\.svg$/.test(img.getAttribute('src')||'')){
                    const box=doc.createElement('div');box.className='thumbnail_img source-graphic-unavailable';
                    const tab=img.closest('.content');const label=doc.querySelector('.renaissancemenu [data-target="'+tab.id+'"]')?.textContent.trim();
                    box.innerHTML='<span class="fas fa-chart-line" aria-hidden="true"></span><p></p><small>Source preview image is unavailable.</small>';
                    box.querySelector('p').textContent=label||'Portfolio Management Services';img.replaceWith(box);
                }
            });
            return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
        },source);
        await writeFile('resources/reference/'+file,html);
    }
    const call=await readFile('resources/reference/service--call-and-trade.html','utf8');
    const offline=await page.evaluate(source=>{
        const doc=new DOMParser().parseFromString(source,'text/html');
        doc.body.dataset.referencePage='/service/offline-trading';
        doc.title='Offline Trading - Marwadi Shares and Finance Limited';
        doc.querySelectorAll('main .sub_banner h1,main .sub_banner h2,main .breadcrumb-item.active').forEach(el=>el.textContent='Offline Trading');
        const items=doc.querySelectorAll('main .products_accordion_main .accordion-item');
        items[0].querySelector('button').textContent='Offline Trading';
        items[0].querySelector('.phishing_info').innerHTML='<p>Connect with our team for personal assistance with trading and account services. Discuss your requirements, understand the process and place instructions through authorised dealing channels.</p>';
        items[1].querySelector('button').textContent='Personal Trading Support';
        items[1].querySelector('.phishing_info').innerHTML='<ul><li>Get assistance with trading-related queries.</li><li>Discuss account services and documentation.</li><li>Confirm order details and applicable charges through an authorised representative.</li><li>Contact our team to find the service channel available to you.</li></ul>';
        doc.querySelectorAll('.product_menu a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='/service/offline-trading'));
        return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
    },call);
    await writeFile('resources/reference/service--offline-trading.html',offline);
    console.log('FINALIZED',files.length+1,'reference pages');
}finally{await browser.close();}
// Preserve the client's instruction when regenerating the imported pages.
await import('./remove-app-promotions.mjs');
await import('./apply-original-media.mjs');
await import('./apply-client-branding.mjs');
await import('./apply-theme.mjs');
await import('./apply-logo-theme.mjs');
await import('./remove-partner.mjs');
await import('./remove-utility-links.mjs');
await import('./integrate-workspace-login.mjs');

await import('./apply-local-footer.mjs');

await import('./improve-account-enquiry.mjs');

await import('./remove-reference-navigation.mjs');
