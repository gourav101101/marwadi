import {readFile,writeFile,readdir} from 'node:fs/promises';
for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
 const path='resources/reference/'+file;
 const html=await readFile(path,'utf8');
 const updated=html.replace(/<footer\b[^>]*>[\s\S]*?(?=<div class="hed_pop_up">)/,'<footer class="footer_sec overflow-hidden">__LOCAL_FOOTER__\n');
 if(updated===html&&!html.includes('__LOCAL_FOOTER__'))throw Error('Footer boundary missing: '+file);
 await writeFile(path,updated);
}
console.log('Replaced reference footer on all public pages; preserved account modal.');
