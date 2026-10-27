import {readFile,writeFile,readdir} from 'node:fs/promises';
const hexPattern=/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b/g;
function recolor(hex,svg=false){
    let value=hex.slice(1);if(value.length===3||value.length===4)value=[...value].map(x=>x+x).join('');
    const alpha=value.length===8?value.slice(6):'';
    const rgb=[0,2,4].map(offset=>parseInt(value.slice(offset,offset+2),16)/255);
    const max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min,l=(max+min)/2;
    if(!delta)return hex;
    const s=delta/(1-Math.abs(2*l-1));let h;
    if(max===rgb[0])h=((rgb[1]-rgb[2])/delta)%6;else if(max===rgb[1])h=(rgb[2]-rgb[0])/delta+2;else h=(rgb[0]-rgb[1])/delta+4;
    h=(h*60+360)%360;
    // Preserve conventional market gain colours. Only replace the former cool brand palette.
    if(!((h>=155&&h<=250)||(h>=70&&h<155&&s<.4))||s<.08)return hex;
    const color=l>.90?'#faf8f2':l>.76?'#e8e0ce':l>.48?'#a3926a':svg?'#a27b2d':l>.30?'#8a6926':'#182024';
    return color+alpha;
}
const cssPaths=['public/assets/replica.css',...(await readdir('public/reference-assets/assets/user/css')).filter(x=>x.endsWith('.css')).map(x=>'public/reference-assets/assets/user/css/'+x)];
for(const file of cssPaths){const text=await readFile(file,'utf8');await writeFile(file,text.replace(hexPattern,hex=>recolor(hex)));}
for(const name of (await readdir('public/assets/brand')).filter(x=>x.endsWith('.svg'))){const file='public/assets/brand/'+name;await writeFile(file,(await readFile(file,'utf8')).replace(hexPattern,hex=>recolor(hex,true)));}
for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
    const target='resources/reference/'+file;
    let text=await readFile(target,'utf8');
    text=text.replaceAll('/assets/brand/hero-teal.png','/assets/brand/hero-gold.png').replaceAll('/assets/brand/hero-teal.webm','/assets/brand/hero-gold.webm').replaceAll('/assets/brand/about-teal.png','/assets/brand/about-gold.png');
    text=text.replaceAll('/assets/brand/wordmark-light.svg','/assets/brand/client-logo.jpeg').replaceAll('/assets/brand/wordmark.svg','/assets/brand/client-logo.jpeg');
    text=text.replace(hexPattern,hex=>recolor(hex));
    await writeFile(target,text);
}
const scriptPath='qa/apply-original-media.mjs';let script=await readFile(scriptPath,'utf8');
script=script.replaceAll('hero-teal.png','hero-gold.png').replaceAll('hero-teal.webm','hero-gold.webm').replaceAll('about-teal.png','about-gold.png').replaceAll("asset='wordmark-light.svg'","asset='client-logo.jpeg'").replaceAll("asset='wordmark.svg'","asset='client-logo.jpeg'");await writeFile(scriptPath,script);
console.log('Logo-led charcoal, gold and ivory theme applied to 16 pages. Original supplied logo preserved.');
