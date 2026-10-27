import {chromium} from '@playwright/test';
import {readdir,readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{const page=await browser.newPage();const result=[];
for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
const links=await page.evaluate(html=>{const doc=new DOMParser().parseFromString(html,'text/html');return [...doc.querySelectorAll('a[href],form[action],[onclick]')].map(el=>({tag:el.tagName,text:el.textContent.trim().replace(/\s+/g,' ').slice(0,85),url:el.getAttribute('href')||el.getAttribute('action')||el.getAttribute('onclick')})).filter(x=>/https?:|\.pdf|\.xlsx?|\.docx?|tel:|mailto:/.test(x.url));},await readFile('resources/reference/'+file,'utf8'));result.push({file,links});}
await writeFile('qa/reference-link-audit-before.json',JSON.stringify(result,null,2));
const unique=new Map();for(const r of result)for(const l of r.links)unique.set(l.url,l.text);console.log([...unique].map(([url,text])=>({url,text})));
}finally{await browser.close();}
