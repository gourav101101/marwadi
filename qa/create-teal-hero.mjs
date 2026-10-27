import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const page=await browser.newPage();
    const image=await readFile('public/assets/brand/hero-teal.png');
    const output=await page.evaluate(async data=>{
        const image=new Image();image.src=data;await image.decode();
        const canvas=document.createElement('canvas');
        canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
        const context=canvas.getContext('2d');
        const stream=canvas.captureStream(24);
        const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:10000000});
        const chunks=[];
        const done=new Promise(resolve=>recorder.onstop=()=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));});
        recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
        let start;const duration=8000;
        const draw=time=>{
            if(!start)start=time;
            const progress=Math.min((time-start)/duration,1);
            // Small, slow motion; full native source resolution and a higher bitrate.
            const scale=1+.008*Math.sin(progress*Math.PI)**2;
            const width=canvas.width*scale,height=canvas.height*scale;
            context.drawImage(image,(canvas.width-width)/2,(canvas.height-height)/2,width,height);
            if(progress<1)requestAnimationFrame(draw);else recorder.stop();
        };
        recorder.start();requestAnimationFrame(draw);return await done;
    },'data:image/png;base64,'+image.toString('base64'));
    await writeFile('public/assets/brand/hero-teal.webm',Buffer.from(output,'base64'));
    console.log('Sharp native-resolution hero video saved.');
}finally{await browser.close();}
