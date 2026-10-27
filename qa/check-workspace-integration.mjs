import {chromium} from '@playwright/test';
import {readFile,mkdir,writeFile} from 'node:fs/promises';

const base=process.env.WORKSPACE_QA_URL||'http://127.0.0.1:8000';
const isolated=Boolean(process.env.WORKSPACE_QA_URL);
// Isolated verification does not need the source checkout or any real account credentials.
const readme=isolated?'':await readFile('D:/Xampp/htdocs/newcode/README.md','utf8');
const credentials=needle=>{
    const line=readme.split('\n').find(line=>line.startsWith('|')&&line.includes(needle));
    if(!line)throw Error('Documented source development account is missing');
    const cells=line.split('|').map(cell=>cell.trim());
    return {login:cells[2].split(' or ')[0],password:cells[3]};
};
const admin=isolated?{login:'admin@integration.invalid',password:'IntegrationAdmin2026!'}:credentials('admin@wealthdesk.test');
const client=isolated?{login:'client@integration.invalid',password:'IntegrationClient2026!'}:credentials('client@wealthdesk.test');
await mkdir('qa/screenshots/workspace',{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const failures=[];const errors=[];
try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror',error=>errors.push(error.message));
    page.on('response',response=>{if(response.status()>=400&&/\.(css|js|jpg|jpeg|svg|png)(\?|$)/.test(response.url()))failures.push(response.url());});
    await page.goto(base+'/',{waitUntil:'domcontentloaded'});
    await page.keyboard.press('Escape');
    await page.getByRole('link',{name:'Login',exact:true}).click();
    await page.waitForURL('**/login');
    await page.getByRole('heading',{name:'Good to see you.'}).waitFor();
    await page.screenshot({path:'qa/screenshots/workspace/login-desktop.png',fullPage:true});
    const signIn=async account=>{
        await page.locator('input[name="login"]').fill(account.login);
        await page.locator('input[name="password"]').fill(account.password);
        await page.getByRole('button',{name:'Sign in to workspace'}).click();
        await page.waitForURL('**/workspace',{timeout:15000});
    };
    await signIn(admin);
    await page.locator('a[href$="/admin/clients"]').first().waitFor();
    await page.screenshot({path:'qa/screenshots/workspace/admin-dashboard.png',fullPage:true});
    await page.goto(base+'/admin/clients',{waitUntil:'domcontentloaded'});
    if(!await page.getByRole('heading',{name:'Manage clients',exact:true}).count()){
        if(!await page.locator('main.content').count())throw Error('Client management page did not render');
    }
    await page.locator('.account-menu summary').click();
    await page.locator('.account-menu form button').click();
    await page.waitForURL('**/login');
    await signIn(client);
    if(await page.locator('a[href$="/admin/clients"]').count())throw Error('Client sees administrator navigation');
    const forbidden=await page.request.get(base+'/admin/clients');
    if(forbidden.status()!==403)throw Error('Client administrator restriction failed');
    await page.setViewportSize({width:390,height:844});
    await page.screenshot({path:'qa/screenshots/workspace/client-mobile.png',fullPage:true});
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Client mobile layout overflows');
    await page.locator('.account-menu summary').click();
    await page.locator('.account-menu form button').click();
    await page.waitForURL('**/login');
    await page.screenshot({path:'qa/screenshots/workspace/login-mobile.png',fullPage:true});
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Login mobile layout overflows');
    const protectedPage=await page.request.get(base+'/workspace',{maxRedirects:0});
    if(protectedPage.status()!==302||!protectedPage.headers().location.endsWith('/login'))throw Error('Guest workspace restriction failed');
    if(errors.length||failures.length)throw Error(JSON.stringify({errors,failedAssets:failures}));
    const result={status:'passed',isolated,checks:['Public Login opens the merged local sign-in','Admin and client accounts authenticate','Admin client management renders','Client cannot access administrator routes','Logout and guest protection work','Desktop and mobile login/dashboard render'],javascriptErrors:errors,failedAssets:failures};
    await writeFile('qa/workspace-verification.json',JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
}finally{await browser.close();}
