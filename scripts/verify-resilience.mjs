import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const pw=await import(process.env.INVITATION_PLAYWRIGHT_MODULE?pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href:'playwright');
const base=process.env.INVITATION_TEST_URL||'http://127.0.0.1:3101';
const results=[];await fs.mkdir('artifacts/qa/resilience',{recursive:true});
for(const engine of (process.env.QA_ENGINES||'chromium,webkit').split(',')){
 const browser=await pw[engine].launch();
 try{for(const route of ['wedding','homecoming'])for(const scenario of (process.env.QA_SCENARIOS||'start-timeout,clock-stall,preferences,storage-blocked').split(',')){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await context.addInitScript(mode=>{
   Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,value:8});Object.defineProperty(navigator,'deviceMemory',{configurable:true,value:8});
   if(mode==='preferences'){if(localStorage.getItem('invitation-music-muted')===null)localStorage.setItem('invitation-music-muted','true');if(localStorage.getItem('invitation-opening-seen')===null)localStorage.setItem('invitation-opening-seen','true');}
   if(mode==='storage-blocked'){Storage.prototype.getItem=function(){throw new DOMException('Storage denied','SecurityError');};Storage.prototype.setItem=function(){throw new DOMException('Storage denied','SecurityError');};}
   if(['slow-4g','fast-3g','offline'].includes(mode))Object.defineProperty(navigator,'connection',{configurable:true,value:{effectiveType:'4g',saveData:false,downlink:10}});
  },scenario);
  if(scenario==='start-timeout')await context.route(/\.(mp4|webm)(\?|$)/,async r=>{await new Promise(resolve=>setTimeout(resolve,15000));await r.continue().catch(()=>{});});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await context.route('https://maps.google.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Map fixture</p>'}));
  if(['slow-4g','fast-3g','offline'].includes(scenario)){
   assert.equal(engine,'chromium');const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:562.5,downloadThroughput:180000,uploadThroughput:84375});
  }
  try{
   await page.goto(base+'/'+route+'?guest=PrivateGuestName',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.gate-button')?.disabled);
   if(scenario==='start-timeout'){await page.waitForFunction(()=>['playing','fallback'].includes(document.querySelector('.cover-backdrop').dataset.videoState),null,{timeout:10000});if(engine==='chromium')assert.equal(await page.locator('.cover-backdrop').getAttribute('data-video-state'),'fallback');else if(await page.locator('.cover-backdrop').getAttribute('data-video-state')==='playing')assert.ok((await page.locator('.cover-backdrop video').evaluate(v=>v.currentSrc)).endsWith('.mp4'),'WebKit should recover delayed WebM using MP4');}
   if(scenario==='clock-stall'){
    await page.waitForFunction(()=>document.querySelector('.cover-backdrop').dataset.videoState==='playing');
    await page.locator('.cover-backdrop video').evaluate(v=>{const frozen=v.currentTime;Object.defineProperty(v,'currentTime',{configurable:true,get:()=>frozen});v.dispatchEvent(new Event('waiting'));});
    await page.waitForFunction(()=>document.querySelector('.cover-backdrop').dataset.videoState==='fallback',null,{timeout:5500});
    assert.equal(await page.locator('.cover-backdrop source').count(),0);
   }
   if(scenario==='offline'){await context.setOffline(true);await page.waitForTimeout(7000);await context.setOffline(false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));}
   if(['slow-4g','fast-3g'].includes(scenario))await page.waitForFunction(()=>['playing','fallback'].includes(document.querySelector('.cover-backdrop').dataset.videoState),null,{timeout:10000});
   const coverState=await page.locator('.cover-backdrop').getAttribute('data-video-state');
   if(['start-timeout','clock-stall','slow-4g','fast-3g','offline'].includes(scenario))assert.ok(['playing','fallback'].includes(coverState),'Cover did not settle: '+coverState);
   assert.equal(await page.locator('meta[property="og:url"]').getAttribute('content'),'https://janith-pradeepa.vercel.app/'+route);
   const image=await page.locator('meta[property="og:image"]').getAttribute('content');assert.ok(image.startsWith('https://janith-pradeepa.vercel.app/assets/'+route+'/share/'));assert.ok(!image.includes('PrivateGuestName'));
   assert.equal(await page.locator('meta[property="og:image:width"]').getAttribute('content'),'1200');assert.equal(await page.locator('meta[property="og:image:height"]').getAttribute('content'),'630');
   assert.equal(await page.locator('meta[property="og:locale"]').getAttribute('content'),'en_LK');assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'),'https://janith-pradeepa.vercel.app/'+route);
   assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'),'summary_large_image');
   assert.equal(await page.locator('link[rel="apple-touch-icon"]').count(),1);assert.equal(await page.locator('link[rel="manifest"]').count(),1);
   await page.locator('.gate-button').click();await page.locator('.opening-film[open]').waitFor();
   const duration=await page.locator('.opening-film').evaluate(v=>parseInt(v.style.getPropertyValue('--opening-duration')));assert.equal(duration,scenario==='preferences'?900:2500);
   await page.locator('.opening-film-skip').click();await page.locator('.opening-film').waitFor({state:'hidden',timeout:4000});await page.locator('.section-navigator').waitFor();
   if(scenario==='preferences'){
    assert.equal(await page.locator('#invitation-music').evaluate(v=>v.paused),true);await page.locator('.music-control').click();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>localStorage.getItem('invitation-music-muted')),'false');
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.gate-button')?.disabled);assert.equal(await page.locator('#invitation-music').evaluate(v=>v.paused),true);await page.locator('.gate-button').click();await page.locator('.opening-film-skip').click();await page.locator('.opening-film').waitFor({state:'hidden'});assert.equal(await page.locator('#invitation-music').evaluate(v=>v.paused),false);
    await page.locator('.replay-opening').scrollIntoViewIfNeeded();await page.locator('.replay-opening').click();assert.equal(await page.locator('.opening-film').evaluate(v=>parseInt(v.style.getPropertyValue('--opening-duration'))),2500);await page.locator('.opening-film-skip').click();await page.locator('.opening-film').waitFor({state:'hidden'});
   }
   assert.deepEqual(errors,[]);results.push({engine,route,scenario,coverState,duration,passed:true});console.log('PASS',engine,route,scenario,coverState);
  }finally{await context.close();}
 }}finally{await browser.close();}
}
await fs.writeFile('artifacts/qa/resilience/results-'+(process.env.QA_SCENARIOS||'core').replaceAll(',','-')+'.json',JSON.stringify(results,null,2));
