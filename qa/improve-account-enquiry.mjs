import {chromium} from '@playwright/test';
import {readdir,readFile,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
const page=await browser.newPage();
for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
const path='resources/reference/'+file;
const html=await page.evaluate(source=>{
const doc=new DOMParser().parseFromString(source,'text/html');
doc.querySelectorAll('.open-account-request').forEach(form=>{
form.querySelector('[name=pancard]')?.closest('.form-group')?.remove();
form.querySelector('[name=city]')?.setAttribute('maxlength','100');
if(!form.querySelector('[name=message]')){
const group=doc.createElement('div');group.className='form-group';group.innerHTML='<textarea class="form-control" name="message" maxlength="2000" rows="3" placeholder="How can we help? (optional)" aria-label="Message"></textarea>';
form.querySelector('.main_btn_pop_mb0')?.before(group);
}
for(const [name,label] of Object.entries({name:'Full name',email:'Email address',phone:'Mobile number',city:'City (optional)'})){
const input=form.querySelector(`[name="${name}"]`);if(!input)continue;input.setAttribute('aria-label',label);if(['name','email','phone'].includes(name))input.setAttribute('autocomplete',name==='phone'?'tel':name);
}
});
return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
},await readFile(path,'utf8'));
await writeFile(path,html);
}
}finally{await browser.close();}
