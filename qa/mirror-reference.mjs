import { chromium, request } from '@playwright/test';
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.marwadionline.com';
const pages = ['/', '/who-we-are', '/our-history', '/leadership', '/products/equity-derivative', '/products/commodity-derivative', '/products/currency-derivative', '/products/third-party-product', '/products/initial-public-offering-ipo', '/renaissance', '/service/research-and-advisory', '/service/margin-trading-smtf', '/service/call-and-trade', '/service/smart-portfolio-analyse', '/contact-us'];
const libraries = ['jquery.min.js','jquery-ui.min.js','owl.carousel.js','bootstrap.js','select2.min.js','menu.js','wow.min.js','jquery.lazyload.js','jquery-marquee/package/jquery.marquee.min.js','jquery.particleground.js'];
const browser = await chromium.launch({ executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true });
const context = await request.newContext({ ignoreHTTPSErrors:true, timeout:90000 });
const parser = await browser.newPage();
const queue = new Set();
const results = [];
const assetPath = url => '/reference-assets' + new URL(url).pathname;
const outputName = url => (url === '/' ? 'home' : url.slice(1).replaceAll('/','--')) + '.html';
await mkdir('resources/reference', {recursive:true});
await mkdir('qa/reference/pages', {recursive:true});

async function pool(items, fn, concurrency=5) {
    let index = 0;
    await Promise.all(Array.from({length:concurrency}, async()=>{ while(index < items.length) { const item=items[index++]; await fn(item); } }));
}
try {
    // Fetch HTML in parallel; transform in the single detached DOM parser below.
    const documents = new Map();
    await pool(pages, async url => {
        const cache = 'qa/reference/pages/'+outputName(url);
        let html;
        try { html = await readFile(cache,'utf8'); } catch {
            const response = await context.get(origin+url);
            if (!response.ok()) { console.log('PAGE_FAILED',url,response.status()); return; }
            html = await response.text();
            await writeFile(cache, html);
        }
        documents.set(url,html);
    });
    for (const [url,html] of documents) {
        const transformed = await parser.evaluate(({html,origin,libraries,url}) => {
            const doc = new DOMParser().parseFromString(html.replace(/<noscript>[\s\S]*?<\/noscript>/gi,''),'text/html');
            const assets = new Set();
            const normal = text => text.replace(/\s+/g,' ').trim();
            doc.querySelectorAll('script,noscript,base,meta[name="csrf-token"],iframe[src*="google"],iframe[src*="youtube"]').forEach(x=>x.remove());
            const walker=doc.createTreeWalker(doc,NodeFilter.SHOW_COMMENT); const comments=[]; while(walker.nextNode())comments.push(walker.currentNode); comments.forEach(x=>x.remove());
            // Retain the original menu structure and styling, scoped to the requested menu.
            doc.querySelectorAll('.nav-menu > li').forEach(li=>{
                const label=normal(li.querySelector('a')?.textContent||'');
                if (!['About','Our Products','Our Services','Contact Us'].includes(label))li.remove();
                if(label==='Our Products') li.querySelectorAll(':scope > ul > li').forEach(child=>{
                    const text=normal(child.querySelector('a')?.textContent||'');
                    if(!['Derivatives','Third Party Product','Initial Public Offering (IPO)','Portfolio Management Services (PMS)'].includes(text))child.remove();
                });
                if(label==='Our Services') li.querySelectorAll(':scope > ul > li').forEach(child=>{
                    const text=normal(child.querySelector('a')?.textContent||'');
                    if(!['Research and Advisory','Margin Trading / SMTF','Call and Trade','Smart portfolio analyse'].includes(text))child.remove();
                });
            });
            const products=[...doc.querySelectorAll('.nav-menu > li')].find(li=>normal(li.querySelector('a')?.textContent||'')==='Our Products')?.querySelector('ul');
            if(products){const li=doc.createElement('li');li.innerHTML='<a href="/products/commodity-derivative">Commodities</a>';products.children[0]?.after(li);}
            const services=[...doc.querySelectorAll('.nav-menu > li')].find(li=>normal(li.querySelector('a')?.textContent||'')==='Our Services')?.querySelector('ul');
            if(services){const li=doc.createElement('li');li.innerHTML='<a href="/service/offline-trading">Offline Trading</a>';services.children[1]?.after(li);}
            doc.querySelectorAll('#h_our_service-service-menu .service_blog_home_main').forEach(card=>{
                const a=card.querySelector('a');const label=normal(card.querySelector('h4')?.textContent||'');
                if(label==='Online Trading'){a.href='/service/offline-trading';card.querySelector('h4').textContent='Offline Trading';}
                if(label==='Security lending and borrowing mechanism')card.remove();
            });
            doc.querySelectorAll('#h_our_prodcut-menu .service_blog_home_main').forEach(card=>{
                const a=card.querySelector('a');const label=normal(card.querySelector('h4')?.textContent||'');
                if(label==='Depository Services'){a.href='/products/commodity-derivative';card.querySelector('h4').textContent='Commodities';}
                if(label==='National Pension System (NPS)'){a.href='/renaissance';card.querySelector('h4').textContent='Portfolio Management Services';}
            });
            doc.querySelectorAll('.contact_info_dtl').forEach(box=>{
                if(/CORPORATE OFFICE|REGISTERED OFFICE/i.test(box.querySelector('h2')?.textContent||'')){
                    [...box.children].filter(x=>x.tagName!=='H2').forEach(x=>x.remove());box.insertAdjacentHTML('beforeend','<p>__LOCAL_ADDRESS__</p>');
                }
            });
            doc.querySelectorAll('.office_info').forEach(box=>{box.querySelectorAll('p').forEach(p=>p.textContent='__LOCAL_ADDRESS__');});
            doc.querySelectorAll('#PayToMarwadi,.custome_search').forEach(x=>x.remove());
            // No copied tracker, chat, payment or original form-post code is executed.
            doc.querySelectorAll('[onclick],[onload],[onerror],[onsubmit]').forEach(x=>{['onclick','onload','onerror','onsubmit'].forEach(a=>x.removeAttribute(a));});
            doc.querySelectorAll('form').forEach(form=>{
                if(form.closest('.newslater')) {form.closest('.newslater').remove();return;}
                form.action='/reference-enquiry';form.method='post';
                form.querySelectorAll('input[name="_token"]').forEach(x=>x.remove());
                form.insertAdjacentHTML('afterbegin','<input type="hidden" name="_token" value="__LOCAL_CSRF__">');
                const type=form.querySelector('[name="account_type"]')?.value;
                form.insertAdjacentHTML('afterbegin','<input type="hidden" name="interest" value="'+(type==='open_account'?'Open an account':type?'Become a partner':'General enquiry')+'">');
                form.querySelectorAll('[name="secret_otp"],[name="secret_otp_email"],.otp-input,.otp-input-email,.send-otp-mobile,.send-otp-email,.verify-btn,.verify-btn-email').forEach(x=>x.remove());
                form.querySelectorAll('[name="mobile_number"],[name="mobile"],[name="contact_no"]').forEach(x=>x.name='phone');
                form.querySelectorAll('[name="name"],[name="email"],[name="phone"]').forEach(x=>x.required=true);
                form.querySelectorAll('[name="email"]').forEach(x=>x.type='email');
                form.querySelectorAll('[name="pancard"]').forEach(x=>{x.required=false;x.placeholder='Enter pancard (optional)';});
                form.insertAdjacentHTML('beforeend','<label class="replica-consent"><input type="checkbox" name="consent" value="1" required> I agree to be contacted regarding this enquiry.</label><small class="replica-form-note">This form saves an enquiry. Account activation and verification are completed separately.</small>');
            });
            // Live data is loaded through a read-only local Laravel endpoint, never fabricated.
            doc.querySelectorAll('.nifty-value,.sensex-value').forEach(x=>x.innerHTML='<p>Loading market…</p>');
            const ticker=doc.querySelector('#market-ticker'); if(ticker){ticker.innerHTML='<span>Loading market data…</span>';ticker.style.display='block';}
            // Eager local assets make the original sections visible without delayed remote lazy loaders.
            doc.querySelectorAll('[data-original]').forEach(x=>x.setAttribute('src',x.getAttribute('data-original')));
            for(const el of doc.querySelectorAll('[src],[href],[poster],[data-original]')) {
                for(const attr of ['src','href','poster','data-original']) {
                    const value=el.getAttribute(attr); if(!value || value.startsWith('#')||value.startsWith('data:')||value.startsWith('mailto:')||value.startsWith('tel:'))continue;
                    let parsed;try{parsed=new URL(value,origin);}catch{continue;}
                    if(parsed.origin!==origin)continue;
                    if(parsed.pathname.startsWith('/assets/')||parsed.pathname.startsWith('/storage/')) {
                        assets.add(parsed.href);el.setAttribute(attr,'/reference-assets'+parsed.pathname);
                    } else if(attr==='href') {
                        const allowed=['/','/who-we-are','/our-history','/leadership','/products/equity-derivative','/products/commodity-derivative','/products/currency-derivative','/products/third-party-product','/products/initial-public-offering-ipo','/renaissance','/service/research-and-advisory','/service/margin-trading-smtf','/service/offline-trading','/service/call-and-trade','/service/smart-portfolio-analyse','/contact-us'];
                        if(allowed.includes(parsed.pathname))el.setAttribute(attr,parsed.pathname+parsed.search+parsed.hash);
                        else {el.setAttribute(attr,parsed.href);el.setAttribute('target','_blank');}
                    }
                }
            }
            doc.querySelectorAll('style,[style]').forEach(el=>{
                const attr=el.tagName==='STYLE'?null:'style';let value=attr?el.getAttribute(attr):el.textContent;
                value=value.replace(/url\(["']?(https:\/\/www\.marwadionline\.com\/[^)'"\s]+)["']?\)/g,(_,asset)=>{assets.add(asset);return 'url("/reference-assets'+new URL(asset).pathname+'")';});
                if(attr)el.setAttribute(attr,value);else el.textContent=value;
            });
            doc.querySelectorAll('a[target="_blank"]').forEach(a=>a.rel='noopener noreferrer');
            doc.body.dataset.referencePage=url;
            for(const file of libraries){const script=doc.createElement('script');script.src='/reference-assets/assets/user/js/'+file;doc.body.append(script);assets.add(origin+'/assets/user/js/'+file);}
            const css=doc.createElement('link');css.rel='stylesheet';css.href='/assets/replica.css';doc.head.append(css);
            const script=doc.createElement('script');script.src='/assets/replica.js';doc.body.append(script);
            return {html:'<!DOCTYPE html>\n'+doc.documentElement.outerHTML,assets:[...assets]};
        },{html,origin,libraries,url});
        transformed.assets.forEach(x=>queue.add(x));
        await writeFile('resources/reference/'+outputName(url),transformed.html);
        console.log('PAGE_READY',url);
    }
    // Download all first-party media/styles/fonts recursively, preserving CSS relative paths.
    const seen=new Set();
    while([...queue].some(x=>!seen.has(x))) {
        const batch=[...queue].filter(x=>!seen.has(x));batch.forEach(x=>seen.add(x));
        await pool(batch,async url=>{
            const target=path.join('public',decodeURIComponent(assetPath(url)));
            try {
                let body;
                try {await stat(target);body=await readFile(target);}catch{
                    const response=await context.get(url);if(!response.ok())throw Error('HTTP '+response.status());
                    body=await response.body();await mkdir(path.dirname(target),{recursive:true});await writeFile(target,body);
                }
                if(new URL(url).pathname.endsWith('.css')) {
                    let css=body.toString('utf8');
                    css=css.replace(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/g,(match,quote,link)=>{
                        if(link.startsWith('data:')||link.startsWith('#')||link.startsWith('/reference-assets/'))return match;
                        const asset=new URL(link,url);if(asset.origin!==origin)return match;
                        queue.add(asset.href);return 'url("'+assetPath(asset.href)+'")';
                    });
                    await writeFile(target,css);
                }
                results.push({url,ok:true});
            }catch(error){results.push({url,ok:false,error:error.message});console.log('ASSET_FAILED',url,error.message);}
        },6);
        console.log('ASSET_PROGRESS',seen.size,'downloaded/discovered',queue.size);
    }
    await writeFile('qa/reference/asset-report.json',JSON.stringify(results,null,2));
    console.log('MIRROR_COMPLETE',documents.size,'pages',results.length,'assets',results.filter(x=>!x.ok).length,'failed');
}finally{await context.dispose();await browser.close();}
