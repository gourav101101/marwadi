import {chromium} from '@playwright/test';
import {readFile,writeFile,readdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
    const parser=await browser.newPage();
    for(const file of (await readdir('resources/reference')).filter(x=>x.endsWith('.html'))){
        const html=await readFile('resources/reference/'+file,'utf8');
        const branded=await parser.evaluate(html=>{
            const doc=new DOMParser().parseFromString(html,'text/html');
            const replaceName=value=>value.replace(/Marwadi Shares\s*(?:and|&)\s*Finance Limited(?:\s*\(MSFL\))?|Marwadi Commodity (?:Finance )?Broker Private Limited|Marwadi Financial Services|Marwadi Group|\bMSFL\b/gi,'__LOCAL_BUSINESS_NAME__');
            const walker=doc.createTreeWalker(doc,NodeFilter.SHOW_TEXT);let node;
            while(node=walker.nextNode()){if(!['SCRIPT','STYLE'].includes(node.parentElement?.tagName))node.textContent=replaceName(node.textContent);}
            doc.querySelectorAll('[alt],[title],meta[content]').forEach(el=>{for(const attribute of ['alt','title','content'])if(el.hasAttribute(attribute))el.setAttribute(attribute,replaceName(el.getAttribute(attribute)));});
            doc.querySelectorAll('meta[name="description"],meta[property="og:description"]').forEach(meta=>meta.content='Explore investment products, market insights and personal trading support with __LOCAL_BUSINESS_NAME__. Visit our office in Lajpat Nagar, New Delhi.');
            doc.querySelectorAll('.msfl > .row > .col-lg-6').forEach((column,index)=>{
                column.innerHTML=index===0?'<div class="msfl_info"><div class="footer-heading">__LOCAL_BUSINESS_NAME__</div><p>__LOCAL_ADDRESS__</p></div>':'<div class="msfl_info"><div class="footer-heading">Investment information</div><p>Investments in securities markets are subject to market risks. Read all related documents carefully before investing.</p></div>';
            });
            doc.querySelectorAll('.office_info .footer-heading').forEach((el,index)=>el.textContent=index===0?'Office Address':'New Delhi Office');
            doc.querySelectorAll('.contact_info_dtl').forEach(box=>{
                const heading=box.querySelector('h2');if(!heading)return;
                const text=heading.textContent.trim().toUpperCase();
                if(text==='CORPORATE OFFICE')heading.textContent='Office Address';
                if(text==='REGISTERED OFFICE')heading.textContent='New Delhi Office';
                if(text==='EMAIL'){box.innerHTML='<h2>Email</h2><p>Business email will be updated shortly.</p>';}
                if(text==='CALL US'){box.innerHTML='<h2>Call Us</h2><p>Contact number will be updated shortly.</p>';}
            });
            doc.querySelectorAll('.f_number_info').forEach(el=>el.textContent='Business contact details will be updated shortly.');
            return '<!DOCTYPE html>\n'+doc.documentElement.outerHTML;
        },html);
        await writeFile('resources/reference/'+file,branded);
    }
    console.log('Client name and address placeholders applied across all pages.');
}finally{await browser.close();}
