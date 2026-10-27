import {chromium} from '@playwright/test';
import {readFile,writeFile,readdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const parser=await browser.newPage();
    for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
        const path='resources/reference/'+file;
        const html=await parser.evaluate(source=>{
            const doc=new DOMParser().parseFromString(source,'text/html');
            doc.querySelectorAll('.login_btn').forEach(box=>box.innerHTML='<a href="/login" id="website-login-link">Login</a>');
            return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
        },await readFile(path,'utf8'));
        await writeFile(path,html);
    }
    console.log('All public Login links now open the integrated local workspace login.');
}finally{await browser.close();}
