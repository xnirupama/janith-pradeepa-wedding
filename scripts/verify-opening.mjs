import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const pw=await import(process.env.INVITATION_PLAYWRIGHT_MODULE?pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href:'playwright');
const base=process.env.INVITATION_TEST_URL||'http://127.0.0.1:3101';
const out=process.env.QA_OUTPUT||'artifacts/qa/opening-fix';await fs.mkdir(out,{recursive:true});const results=[];
for(const engine of (process.env.QA_ENGINES||'chromium,webkit').split(',')){
 const browser=await pw[engine].launch();
 try{for(const route of (process.env.QA_ROUTES||'wedding,homecoming').split(','))for(const mode of (process.env.QA_PROFILES||'normal,gesture-required,blocked-once,reduced-motion,save-data,slow,low-end,returning,delayed').split(',')){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:mode==='reduced-motion'?'reduce':'no-preference'});
  await context.addInitScript(profile=>{
   Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,value:profile==='low-end'?2:8});Object.defineProperty(navigator,'deviceMemory',{configurable:true,value:profile==='low-end'?2:8});
   if(['save-data','slow'].includes(profile))Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:profile==='save-data',effectiveType:profile==='slow'?'3g':'4g',downlink:profile==='slow'?.5:10}});
   if(profile==='returning')localStorage.setItem('invitation-opening-seen','true');
   window.openingAudit={calls:[],inClick:false};
   document.addEventListener('click',()=>{window.openingAudit.inClick=true;},true);
   window.addEventListener('click',()=>{window.openingAudit.inClick=false;});
   const nativePlay=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=function(){
    if(this.dataset.priority==='opening'){
     window.openingAudit.calls.push({directGesture:window.openingAudit.inClick,src:this.src});
     if(profile==='gesture-required'&&!window.openingAudit.inClick)return Promise.reject(new DOMException('Must play inside click','NotAllowedError'));
     if(profile==='blocked-once'&&window.openingAudit.calls.length===1)return Promise.reject(new DOMException('Tap required','NotAllowedError'));
    }
    return nativePlay.call(this);
   };
  },mode);
  if(mode==='delayed'&&engine==='chromium')await context.route(/opening-couple.*\.mp4/,async r=>{await new Promise(resolve=>setTimeout(resolve,5000));await r.continue().catch(()=>{});});
  await context.route('https://maps.google.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Map fixture</p>'}));
  const page=await context.newPage(),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  try{
   await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.gate-button')?.disabled);
   assert.equal(await page.locator('.opening-film').getAttribute('open'),null);
   assert.equal(requests.some(x=>/opening-couple.*\.(mp4|webm)/.test(x)),false);
   await page.locator('.gate-button').click();await page.locator('.opening-film[open]').waitFor();
   if(mode==='blocked-once'){
    await page.locator('.opening-play-button').waitFor();await page.waitForTimeout(3000);
    assert.equal(await page.locator('.opening-film[open]').count(),1,'Rejected video automatically skipped');
    await page.locator('.opening-play-button').click();
   }
   if(mode==='delayed'&&engine==='chromium'){
    await page.waitForTimeout(3000);assert.equal(await page.locator('.opening-film.is-playing-film[open]').count(),1,'Buffering skipped opening');
   }
   await page.waitForFunction(()=>{const v=document.querySelector('.opening-film video');return v.currentTime>.25&&!v.paused&&v.classList.contains('is-playing');},null,{timeout:15000});
   if(mode==='visibility'){
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>document.querySelector('.opening-film video').paused);
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>!document.querySelector('.opening-film video').paused&&document.querySelector('.opening-film video').classList.contains('is-playing'));
   }
   const first=await page.locator('.opening-film video').evaluate(v=>({time:v.currentTime,src:v.currentSrc,muted:v.muted,inline:v.playsInline,loop:v.loop,display:getComputedStyle(v).display}));
   assert.ok(first.src.endsWith('.mp4'));assert.equal(first.muted,true);assert.equal(first.inline,true);assert.equal(first.loop,false);assert.notEqual(first.display,'none');
   assert.equal(await page.locator('.opening-curtain').count(),0,'Curtains obscure playing film');
   assert.equal(await page.locator('.opening-film').evaluate(v=>getComputedStyle(v).opacity),'1');
   assert.equal(await page.locator('.opening-memory').evaluate(v=>getComputedStyle(v).animationName),'none');
   const direct=await page.evaluate(()=>window.openingAudit.calls[0].directGesture);assert.equal(direct,true,'First play was outside the Open gesture');
   if(mode==='normal'){
    await page.waitForFunction(()=>document.querySelector('.opening-film video').currentTime>3);
    assert.equal(await page.locator('.opening-film.is-playing-film[open]').count(),1,'Film removed by old 2.5s timeout');
    await page.screenshot({path:path.join(out,`${engine}-${route}-playing.png`)});
    await page.locator('.opening-film').waitFor({state:'hidden',timeout:18000});
   }else{
    await page.locator('.opening-film video').evaluate(v=>v.currentTime=v.duration-.25);
    await page.locator('.opening-film.is-revealing').waitFor({state:'attached',timeout:6000});
    await page.locator('.opening-film').waitFor({state:'hidden',timeout:4000});
   }
   await page.locator('.section-navigator').waitFor();
   if(mode==='returning'){
    await page.locator('.replay-opening').scrollIntoViewIfNeeded();const before=await page.evaluate(()=>scrollY);
    await page.locator('.replay-opening').click();await page.waitForFunction(()=>document.querySelector('.opening-film video').currentTime>.2&&!document.querySelector('.opening-film video').paused);
    assert.equal(await page.locator('.opening-film').evaluate(v=>parseInt(v.style.getPropertyValue('--opening-duration'))),2500);
    await page.locator('.opening-film-skip').click();await page.locator('.opening-film').waitFor({state:'hidden'});assert.ok(Math.abs(await page.evaluate(()=>scrollY)-before)<5);
   }
   assert.deepEqual(errors,[]);results.push({engine,route,mode,first,directGesture:direct,passed:true});console.log('PASS',engine,route,mode);
  }finally{await context.close();}
 }}finally{await browser.close();}
}
assert.ok(results.length);await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log('PASS',results.length,'visible, gesture-started MP4 opening cases');
