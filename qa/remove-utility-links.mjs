import {chromium} from '@playwright/test';
import {readFile,writeFile,readdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const parser=await browser.newPage();
    let count=0;
    for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
        const path='resources/reference/'+file;
        const html=await parser.evaluate(source=>{
            const doc=new DOMParser().parseFromString(source,'text/html');
            doc.querySelectorAll('a').forEach(link=>{
                const text=link.textContent.replace(/\s+/g,' ').trim();
                const href=link.getAttribute('href')||'';
                if(text==='Investor Relations'||text==='Download'||href.endsWith('/investor-relations/investor-relations')||href==='https://www.marwadionline.com/download'){
                    const list=link.closest('ul');(link.closest('li')||link).remove();
                    if(list&&!list.children.length)list.remove();
                }
            });
            return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
        },await readFile(path,'utf8'));
        await writeFile(path,html);count++;
    }
    console.log('Removed Investor Relations and Download links across '+count+' pages.');
}finally{await browser.close();}
