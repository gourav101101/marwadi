import { chromium } from '@playwright/test';
import { readFile,writeFile,readdir } from 'node:fs/promises';

const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const page=await browser.newPage();
    for(const file of (await readdir('resources/reference')).filter(file=>file.endsWith('.html'))){
        const source=await readFile('resources/reference/'+file,'utf8');
        const html=await page.evaluate(source=>{
            const doc=new DOMParser().parseFromString(source,'text/html');
            doc.querySelectorAll('.platform').forEach(section=>section.closest('section')?.remove());
            doc.querySelectorAll('a[href*="play.google.com/store/apps"],a[href*="apps.apple.com/"]').forEach(link=>{
                const list=link.closest('ul');(link.closest('li')||link).remove();
                if(list&&!list.children.length)list.remove();
            });
            doc.querySelectorAll('.english-alert p,.gujrati-alert p,.hindi-alert p').forEach(p=>{
                if(/Google Play Store|Apple App|ગૂગલ પ્લે|એપલ એપ|गूगल प्ले|ऐप्पल ऐप/i.test(p.textContent))p.remove();
            });
            return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
        },source);
        await writeFile('resources/reference/'+file,html);
    }
    console.log('Removed app promotion sections and download links from every local page.');
}finally{await browser.close();}
