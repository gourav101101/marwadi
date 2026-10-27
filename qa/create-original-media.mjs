import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const directory='public/assets/brand';await mkdir(directory,{recursive:true});
const iconPaths={
 research:'<path d="M17 12h25v35H17zM23 21h13M23 28h8M23 35h5"/><circle cx="42" cy="40" r="9"/><path d="m49 47 6 6"/>',
 trading:'<path d="M11 15h42v30H11zM23 52h18M32 45v7M18 34l9-8 8 5 11-12"/>',
 margin:'<path d="M12 50h42M18 43V31h8v12M29 43V23h8v20M40 43V12h8v31"/>',
 call:'<path d="M18 13c-5 3-5 13 1 23s15 16 20 12l6-6-10-8-5 5c-5-3-8-7-10-12l5-4-7-10zM39 12c8 1 13 6 14 14M38 20c4 1 6 3 7 7"/>',
 portfolio:'<circle cx="32" cy="32" r="20"/><path d="M32 12v20h20M17 45l15-13"/>',
 derivatives:'<path d="M11 51h43M15 44l11-16 10 8 15-24M41 12h10v10"/><circle cx="26" cy="28" r="3"/>',
 commodities:'<path d="m10 46 7-14h15l7 14zM29 46l7-14h15l7 14zM20 29l7-14h15l7 14z"/>',
 products:'<path d="M13 15h16v16H13zM35 15h16v16H35zM13 37h16v16H13zM35 37h16v16H35z"/>',
 ipo:'<path d="M14 50h37M20 50V25h25v25M17 25l15-12 16 12M27 32v11M37 32v11"/>',
 invest:'<path d="M14 50h40M21 42V30h8v12M35 42V20h8v22M16 23l14-12 14 4M39 8l6 7-8 3"/>',
 office:'<path d="M16 53V17l27-6v42M10 53h44M23 24h3M34 21h3M23 33h3M34 30h3M23 42h3M34 39h3M29 53v-9"/>',
 warning:'<path d="m32 10 24 43H8zM32 25v13"/><circle cx="32" cy="45" r="1"/>',
 milestone:'<path d="M14 52h38M22 52V14l26 5-9 9 9 9-26-4"/>',
 document:'<path d="M18 10h21l10 11v33H18zM38 10v12h11M25 31h17M25 38h17M25 45h10"/>',
 x:'<path d="m16 14 33 38M47 14 16 52"/>',
 check:'<path d="m14 32 12 12 25-26"/>',
 arrow:'<path d="m25 17 15 15-15 15"/>',
};
for(const [name,paths] of Object.entries(iconPaths))await writeFile(`${directory}/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#007dc5" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`);
for(const [name,bg,stroke] of [['section-pattern','#eff8ff','#b6d8ed'],['blue-pattern','#0879b7','#58a3ca'],['footer-pattern','#173347','#355267']])await writeFile(`${directory}/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="700" viewBox="0 0 1600 700"><rect width="1600" height="700" fill="${bg}"/><g fill="none" stroke="${stroke}" stroke-width="1" opacity=".55"><circle cx="1370" cy="300" r="360"/><circle cx="1370" cy="300" r="285"/><circle cx="1370" cy="300" r="210"/><path d="M0 600C380 180 640 750 1040 260S1600 160 1700-90M0 650C380 230 640 800 1040 310S1600 210 1700-40"/></g></svg>`);
const mark='<path d="M5 39V24l10-9v24zm15 0V15L30 6v33zm15 0V20l10-9v28z"/>';
for(const [name,color] of [['wordmark','#007dc5'],['wordmark-light','#ffffff']])await writeFile(`${directory}/${name}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="270" height="64" viewBox="0 0 270 64"><g fill="${color}">${mark}<text x="57" y="35" font-family="Arial,sans-serif" font-weight="700" font-size="29" letter-spacing="1">MARWADI</text><text x="59" y="51" font-family="Arial,sans-serif" font-size="7.8" letter-spacing="2.6">FINANCE BROKER</text></g></svg>`);
await writeFile(`${directory}/favicon.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 48"><rect width="52" height="48" rx="8" fill="#eaf6ff"/><g fill="#007dc5">${mark}</g></svg>`);
await writeFile(`${directory}/profile-placeholder.svg`,'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="660" viewBox="0 0 600 660"><rect width="600" height="660" rx="18" fill="#edf7fd"/><circle cx="300" cy="240" r="80" fill="#c5e1f2"/><path d="M150 470c0-160 300-160 300 0" fill="#c5e1f2"/><text x="300" y="545" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" fill="#367394">YOUR TEAM PHOTO</text><text x="300" y="578" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" fill="#6b8798">To be provided</text></svg>');
await writeFile(`${directory}/association-placeholder.svg`,'<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect x="1" y="1" width="398" height="198" rx="12" fill="#f4faff" stroke="#d8eaf5"/><path d="m200 35 25 14v27l-25 15-25-15V49z" fill="none" stroke="#007dc5" stroke-width="3"/><text x="200" y="128" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#265a76">Association details</text><text x="200" y="155" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#718b9c">To be confirmed</text></svg>');
await writeFile(`${directory}/contact-card.svg`,'<svg xmlns="http://www.w3.org/2000/svg" width="450" height="400" viewBox="0 0 450 400"><rect width="450" height="400" rx="12" fill="#eaf7ff"/><circle cx="225" cy="112" r="44" fill="#007dc5"/><path d="M205 96h40v27h-23l-12 10v-10h-5z" stroke="white" fill="none" stroke-width="3"/><text x="225" y="210" text-anchor="middle" font-family="Arial,sans-serif" font-size="30" font-weight="700" fill="#125078">Let’s talk.</text><text x="225" y="251" text-anchor="middle" font-family="Arial,sans-serif" font-size="17" fill="#4a758e">Personal support for your next step.</text><rect x="105" y="290" width="240" height="47" rx="4" fill="#007dc5"/><text x="225" y="320" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="white">Contact our team</text></svg>');

// Original motion footage, composed locally from the new illustration; no borrowed video.
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const page=await browser.newPage();
    const image=await readFile(`${directory}/hero-original.png`);
    const encoded=await page.evaluate(async data=>{
        const image=new Image();image.src=data;await image.decode();
        const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=810;
        const context=canvas.getContext('2d');const stream=canvas.captureStream(24);
        const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm;codecs=vp8';
        const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:1800000});const chunks=[];
        const done=new Promise(resolve=>recorder.onstop=async()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));});
        recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
        const duration=8000;let start;
        const draw=time=>{if(!start)start=time;const progress=Math.min((time-start)/duration,1);const scale=1+.025*Math.sin(progress*Math.PI)**2;const width=canvas.width*scale,height=canvas.height*scale;context.drawImage(image,(canvas.width-width)/2,(canvas.height-height)/2,width,height);if(progress<1)requestAnimationFrame(draw);else recorder.stop();};
        recorder.start();requestAnimationFrame(draw);return await done;
    },'data:image/png;base64,'+image.toString('base64'));
    await writeFile(`${directory}/hero-original.webm`,Buffer.from(encoded,'base64'));
    console.log('Original SVG asset system and 8-second hero motion footage created.');
}finally{await browser.close();}
