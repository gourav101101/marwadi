import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('qa/screenshots',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const page=await browser.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    for(const width of [1880,1440,390,360]){
        await page.setViewportSize({width,height:900});
        await page.goto('http://127.0.0.1:8000/',{waitUntil:'domcontentloaded'});
        await page.keyboard.press('Escape');
        await page.locator('.replica-index-row').first().waitFor({timeout:20000});
        const seen=new Set();
        for(let sample=0;sample<24;sample++){
            const result=await page.evaluate(()=>{
                const items=[...document.querySelectorAll('.nifty_view_carousel>.item')].filter(item=>getComputedStyle(item).display!=='none');
                if(items.length!==1)return {error:'Expected exactly one visible index, found '+items.length};
                const row=items[0].querySelector('.replica-index-row');
                const parts=[...row.children].map(el=>el.getBoundingClientRect());
                for(let i=1;i<parts.length;i++)if(parts[i].left<parts[i-1].right-1)return {error:'Quote fields overlap'};
                const bounds=document.querySelector('.nifty_info').getBoundingClientRect();
                if(parts[0].left<bounds.left-1||parts.at(-1).right>bounds.right+1)return {error:'Quote clipped by index container'};
                if(document.documentElement.scrollWidth>innerWidth+1)return {error:'Page overflows horizontally'};
                return {name:row.querySelector('p').textContent};
            });
            if(result.error)throw Error(width+'px: '+result.error);seen.add(result.name);
            await page.waitForTimeout(250);
        }
        if(seen.size!==2)throw Error(width+'px: both NIFTY and SENSEX should alternate');
        await page.screenshot({path:`qa/screenshots/market-fixed-${width}.png`});
        console.log(width+'px: both indices alternate without overlap or clipping');
    }
    if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();}
