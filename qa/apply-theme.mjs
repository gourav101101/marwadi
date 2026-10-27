import {readFile,writeFile,readdir} from 'node:fs/promises';
const paths=['public/assets/replica.css',...(await readdir('public/reference-assets/assets/user/css')).filter(x=>x.endsWith('.css')).map(x=>'public/reference-assets/assets/user/css/'+x),...(await readdir('public/assets/brand')).filter(x=>x.endsWith('.svg')).map(x=>'public/assets/brand/'+x)];
const hueToRgb=(p,q,t)=>{if(t<0)t++;if(t>1)t--;if(t<1/6)return p+(q-p)*6*t;if(t<.5)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
function recolor(hex){
    let value=hex.slice(1);if(value.length===3||value.length===4)value=[...value].map(x=>x+x).join('');
    const alpha=value.length===8?value.slice(6):'';
    const rgb=[0,2,4].map(offset=>parseInt(value.slice(offset,offset+2),16)/255);
    const max=Math.max(...rgb),min=Math.min(...rgb),delta=max-min,l=(max+min)/2;
    if(!delta)return hex;
    const s=delta/(1-Math.abs(2*l-1));let h;
    if(max===rgb[0])h=((rgb[1]-rgb[2])/delta)%6;else if(max===rgb[1])h=(rgb[2]-rgb[0])/delta+2;else h=(rgb[0]-rgb[1])/delta+4;
    h=(h*60+360)%360;
    if(h<180||h>250||s<.12)return hex;
    if(l>.92)return '#f7f4ed'+alpha;
    const ns=l>.78?.2:l>.5?.32:.55,nl=l>.78?l:l>.5?l*.95:l>.32?l*.70:l*.95;
    const q=nl<.5?nl*(1+ns):nl+ns-nl*ns,p=2*nl-q,nh=167/360;
    return '#'+[nh+1/3,nh,nh-1/3].map(t=>Math.round(hueToRgb(p,q,t)*255).toString(16).padStart(2,'0')).join('')+alpha;
}
for(const path of paths){const source=await readFile(path,'utf8');await writeFile(path,source.replace(/#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{4}\b|#[0-9a-fA-F]{3}\b/g,recolor));}
for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
    const path='resources/reference/'+file;let source=await readFile(path,'utf8');
    source=source.replaceAll('/assets/brand/hero-sharp.png','/assets/brand/hero-teal.png').replaceAll('/assets/brand/hero-sharp.webm','/assets/brand/hero-teal.webm').replaceAll('/assets/brand/about-original.png','/assets/brand/about-teal.png');
    // Inline source decorative colours participate in the same palette.
    source=source.replace(/#[0-9a-fA-F]{6}\b/g,recolor);
    await writeFile(path,source);
}
const scriptPath='qa/apply-original-media.mjs';let script=await readFile(scriptPath,'utf8');script=script.replaceAll('hero-sharp.png','hero-teal.png').replaceAll('hero-sharp.webm','hero-teal.webm').replaceAll('about-original.png','about-teal.png');await writeFile(scriptPath,script);
console.log('Teal/ivory palette applied across layout styles, native icons and 16 page templates.');
