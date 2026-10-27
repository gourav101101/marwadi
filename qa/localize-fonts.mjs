import { request } from '@playwright/test';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const context=await request.newContext({timeout:60000,userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'});
try{
    const url='https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto:wght@400;500;700;900&display=swap';
    const response=await context.get(url);if(!response.ok())throw Error('Font CSS unavailable');let css=await response.text();
    const urls=[...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(x=>x[1]))];
    await mkdir('public/reference-assets/fonts',{recursive:true});
    for(const url of urls){const name=createHash('sha256').update(url).digest('hex').slice(0,16)+'.woff2';const response=await context.get(url);if(!response.ok())throw Error('Font download unavailable');await writeFile('public/reference-assets/fonts/'+name,await response.body());css=css.replaceAll(url,'/reference-assets/fonts/'+name);}
    await writeFile('public/reference-assets/fonts/google-fonts.css',css);
    const file='public/reference-assets/assets/user/css/style.css';let original=await readFile(file,'utf8');original=original.replace(/@import[^;]+;/g,'');original='@import url("/reference-assets/fonts/google-fonts.css");\n'+original;await writeFile(file,original);
    console.log('LOCAL_FONTS_READY',urls.length);
}finally{await context.dispose();}
