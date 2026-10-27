import {chromium} from '@playwright/test';
import {readFile,writeFile,readdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const parser=await browser.newPage();
    for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
        const path='resources/reference/'+file;
        const html=await parser.evaluate(source=>{
            const doc=new DOMParser().parseFromString(source,'text/html');
            doc.querySelectorAll('#becomePartnerModal,[data-bs-target="#becomePartnerModal"],a[href="/become-partner"]').forEach(el=>el.remove());
            doc.querySelectorAll('a,button').forEach(el=>{if(/^become\s+a\s+partner$/i.test(el.textContent.trim()))el.remove();});
            return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
        },await readFile(path,'utf8'));
        await writeFile(path,html);
    }
    console.log('Removed Become a Partner buttons, links and modals from all 16 pages.');
}finally{await browser.close();}
