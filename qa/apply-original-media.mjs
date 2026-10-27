import { chromium } from '@playwright/test';
import { readFile,writeFile,readdir } from 'node:fs/promises';
const root='/assets/brand/';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const report=[];
try{
    const parser=await browser.newPage();
    for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
        const source=await readFile('resources/reference/'+file,'utf8');
        const result=await parser.evaluate(({source,root})=>{
            const doc=new DOMParser().parseFromString(source,'text/html');let replaced=0;
            const hero=doc.querySelector('.home_banner');
            if(hero){
                hero.classList.add('brand-hero');hero.removeAttribute('style');
                hero.innerHTML=`<video class="brand-hero-video" data-original-motion autoplay muted loop playsinline poster="${root}hero-gold.png" aria-hidden="true"><source src="${root}hero-gold.webm" type="video/webm"></video><div class="brand-hero-shade"></div><div class="container brand-hero-inner"><div class="brand-hero-copy"><span class="brand-eyebrow">YOUR GOALS. YOUR NEXT CHAPTER.</span><h1>Invest with clarity.<br>Plan with confidence.</h1><p>Explore investment opportunities with a clear perspective and personal support at every step.</p><div class="brand-hero-actions"><button class="main_btn" type="button" data-bs-toggle="modal" data-bs-target="#exampleModal">Open an Account <span aria-hidden="true">↗</span></button><a href="/contact-us">Let’s talk <span aria-hidden="true">→</span></a></div><div class="brand-hero-tags"><span>Personal guidance</span><span>Market perspective</span><span>Thoughtful planning</span></div></div></div>`;
                replaced++;
            }
            const iconFor=text=>{
                text=text.toLowerCase();
                if(text.includes('research'))return'research';if(text.includes('offline')||text.includes('online trading'))return'trading';if(text.includes('margin'))return'margin';if(text.includes('call'))return'call';if(text.includes('portfolio'))return'portfolio';if(text.includes('derivative'))return'derivatives';if(text.includes('commodit'))return'commodities';if(text.includes('ipo')||text.includes('public offering'))return'ipo';return'products';
            };
            for(const img of [...doc.querySelectorAll('img')]){
                const original=img.getAttribute('src')||img.getAttribute('data-original')||'';
                if(!original.includes('/reference-assets/'))continue;
                let asset='about-gold.png',alt='Original financial planning illustration';
                if(original.includes('footer-logo')){asset='client-logo.jpeg';alt='Marwadi Financial Services';}
                else if(original.endsWith('/logo.png')){asset='client-logo.jpeg';alt='Marwadi Financial Services home';}
                else if(original.includes('service-menu')||original.includes('product-menu')){const label=img.closest('.service_blog')?.querySelector('h4')?.textContent||img.alt;asset=iconFor(label)+'.svg';alt=label+' illustration';}
                else if(original.includes('our-experience')){asset='about-gold.png';alt='Original illustration of a thoughtful financial journey';img.classList.add('brand-about-art');}
                else if(original.includes('leadership')){asset='profile-placeholder.svg';alt='Your team photograph to be provided';}
                else if(original.includes('trust-leaders')){asset='association-placeholder.svg';alt='Association details awaiting confirmation';}
                else if(original.includes('ourhistory')&&original.endsWith('.png')){asset='milestone.svg';alt='Company milestone illustration';}
                else if(original.includes('ourhistory')){asset='about-gold.png';alt='Original illustrative artwork; company milestone photograph to be supplied';}
                else if(original.includes('who-we-are')){asset='about-gold.png';alt='Original conceptual illustration; company office photographs to be supplied';}
                else if(original.includes('twitter')){asset='x.svg';alt='X';}
                else if(original.includes('office_icon')){asset='office.svg';alt='Office';}
                else if(original.includes('warning')){asset='warning.svg';alt='Important notice';}
                else if(original.includes('invest_icon')){asset='invest.svg';alt='Investment planning illustration';}
                else if(original.includes('help_img')){asset='contact-card.svg';alt='Contact our team for personal support';const link=img.closest('a');if(link)link.href='/contact-us';}
                else if(original.includes('table')&&original.includes('renaissance')){
                    const panel=doc.createElement('div');panel.className='brand-document-panel';panel.innerHTML='<img src="'+root+'document.svg" alt=""><h3>Portfolio information</h3><p>Approved strategy details and supporting documents will be added here.</p><a class="main_btn" href="/contact-us">Speak to Our Team</a>';img.replaceWith(panel);replaced++;continue;
                }
                else if(original.includes('/strategy.svg')){asset='portfolio.svg';alt='Portfolio strategy illustration';}
                img.src=root+asset;img.alt=alt;img.removeAttribute('title');img.removeAttribute('srcset');img.removeAttribute('data-original');replaced++;
            }
            // A placeholder is not paired with a real reference-company director's biography.
            if(doc.body.dataset.referencePage==='/leadership'){
                doc.querySelectorAll('.leadership_dtl_info').forEach(box=>{const name=box.querySelector('.name');if(name)name.innerHTML='<h4>Leadership profile</h4><span>Details to be provided</span>';const bio=box.querySelector('.dis');if(bio)bio.innerHTML='<p>Your leadership names, photographs and approved biographies will appear here once supplied.</p>';});
                doc.querySelectorAll('.directors_blog_info').forEach(box=>{box.innerHTML='<h4>Team profile</h4><p>Photograph and biography to be provided.</p>';});
            }
            doc.querySelectorAll('.source-graphic-unavailable small').forEach(el=>el.textContent='Approved strategy details will be added here.');
            doc.querySelectorAll('.contact_icon').forEach(el=>{el.innerHTML='<img src="'+root+'office.svg" alt="Contact our office" width="51" height="51">';});
            // Replace all decorative first-party raster backgrounds, including inline banners.
            doc.querySelectorAll('[style],style').forEach(el=>{
                const isStyle=el.tagName==='STYLE';const text=isStyle?el.textContent:el.getAttribute('style');
                const updated=text.replace(/url\(\s*["']?[^)]*\/reference-assets\/[^)]*\)/g,'url("'+root+'section-pattern.svg")');
                if(isStyle)el.textContent=updated;else el.setAttribute('style',updated);
            });
            doc.querySelectorAll('link[rel*="icon"]').forEach(link=>{link.href=root+'favicon.svg';link.type='image/svg+xml';});
            return {html:'<!DOCTYPE html>\n'+doc.documentElement.outerHTML,replaced};
        },{source,root});
        await writeFile('resources/reference/'+file,result.html);report.push({page:file,replaced:result.replaced});
    }
}finally{await browser.close();}

// Preserve typography and layout rules; remove the borrowed decorative image references.
for(const file of (await readdir('public/reference-assets/assets/user/css')).filter(x=>x.endsWith('.css'))){
    const location='public/reference-assets/assets/user/css/'+file;
    let css=await readFile(location,'utf8');
    css=css.replace(/url\(["']?([^)'"\s]+)["']?\)/g,(match,url)=>{
        if(!url.includes('/reference-assets/')||/\/(fonts?|webfonts)\//.test(url)||!(/\.(png|jpg|jpeg|gif|svg|webp)(?:[?#]|$)/i.test(url)))return match;
        if(url.includes('footer_bg'))return'url("'+root+'footer-pattern.svg")';
        if(/pattern\.jpg|testimonial_bg|countdown_bg|awards_new_sec_bg/.test(url))return'url("'+root+'blue-pattern.svg")';
        if(/check_|ui-icons/.test(url))return'url("'+root+'check.svg")';
        if(/select-arrow/.test(url))return'url("'+root+'arrow.svg")';
        return'url("'+root+'section-pattern.svg")';
    });
    await writeFile(location,css);
}
await writeFile('documents/original-media-replacement-report.json',JSON.stringify(report,null,2));
console.log('Replaced reference-company media on',report.length,'pages; original video, artwork, icons, wordmarks and backgrounds are local.');
