import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const engines=await import(process.env.INVITATION_PLAYWRIGHT_MODULE?pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href:'playwright');
const base=process.env.INVITATION_TEST_URL||'http://127.0.0.1:3101';
const out='artifacts/qa/motion';await fs.mkdir(out,{recursive:true});const results=[];
for(const engine of (process.env.QA_ENGINES||'chromium,webkit').split(',')){
 const browser=await engines[engine].launch({headless:true});
 try{for(const route of (process.env.QA_ROUTES||'wedding,homecoming').split(','))for(const profile of (process.env.QA_PROFILES||'normal,reduced-motion,save-data,slow,autoplay-blocked,low-end').split(',')){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:profile==='reduced-motion'?'reduce':'no-preference'});
  await context.addInitScript(mode=>{
   if(['save-data','slow'].includes(mode))Object.defineProperty(navigator,'connection',{configurable:true,value:{saveData:mode==='save-data',effectiveType:mode==='slow'?'3g':'4g',downlink:10}});
   Object.defineProperty(navigator,'hardwareConcurrency',{configurable:true,value:mode==='low-end'?2:8});
   Object.defineProperty(navigator,'deviceMemory',{configurable:true,value:mode==='low-end'?2:8});
   window.audit={maxVideos:0,plays:0,audioBeforeTap:false};
   const play=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=function(){if(this.tagName==='VIDEO'){window.audit.plays++;if(mode==='autoplay-blocked')return Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));}return play.call(this);};
   document.addEventListener('play',e=>{window.audit.maxVideos=Math.max(window.audit.maxVideos,[...document.querySelectorAll('video')].filter(v=>!v.paused).length);if(e.target.tagName==='AUDIO'&&document.querySelector('.invitation-gate'))window.audit.audioBeforeTap=true;},true);
  },profile);
  const page=await context.newPage(),errors=[],consoleErrors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))consoleErrors.push(m.text());});
  page.on('request',r=>{if(/\.(mp4|webm|mp3)(\?|$)/.test(r.url()))requests.push(r.url());});
  await context.route('https://maps.google.com/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><p>Map fixture</p>'}));
  try{
   await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>!document.querySelector('.gate-button')?.disabled);await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.opening-film').count(),0);assert.equal(await page.locator('#invitation-music').evaluate(v=>v.paused),true);
   if(['normal','low-end'].includes(profile))await page.waitForFunction(()=>document.querySelector('.cover-backdrop').dataset.videoState==='playing',null,{timeout:9000});
   else if(profile==='autoplay-blocked'){
    await page.waitForFunction(()=>document.querySelector('.cover-backdrop').dataset.videoState==='fallback',null,{timeout:9000});
    assert.equal(await page.locator('.cover-backdrop source').count(),0);
    const before=await page.evaluate(()=>window.audit.plays);await page.locator('.gate-card .lotus-touch').click();
    await page.waitForTimeout(1500);assert.ok(await page.evaluate(()=>window.audit.plays)>before,'Gesture did not retry');
    const after=await page.evaluate(()=>window.audit.plays);await page.locator('.gate-card .lotus-touch').click();await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>window.audit.plays),after,'Retried more than once');
   }else assert.equal(requests.length,0,'Policy fallback downloaded media');
   assert.equal(requests.some(x=>/opening-couple|\.mp3/.test(x)),false);
   const attrs=await page.locator('.cover-backdrop video').evaluate(v=>({poster:v.poster,muted:v.muted,inline:v.playsInline,webkit:v.hasAttribute('webkit-playsinline'),remote:v.hasAttribute('disableremoteplayback'),preload:v.preload}));
   assert.ok(attrs.poster.endsWith('.webp'));assert.equal(attrs.preload,'auto');for(const k of ['muted','inline','webkit','remote'])assert.equal(attrs[k],true);
   if(profile==='normal'){
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.paused));
    await page.evaluate(()=>{Object.defineProperty(document,'visibilityState',{configurable:true,value:'visible'});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(()=>document.querySelector('.cover-backdrop').dataset.videoState==='playing');
   }
   await page.screenshot({path:path.join(out,`${engine}-${route}-${profile}-cover.png`)});
   const tapped=Date.now();await page.locator('.gate-button').click();await page.locator('.opening-film[open]').waitFor();
   const duration=await page.locator('.opening-film').evaluate(v=>parseInt(v.style.getPropertyValue('--opening-duration')));
   assert.equal(duration,profile==='reduced-motion'?400:2500);
   assert.equal(await page.locator('.opening-petal').count(),18);
   if(profile!=='reduced-motion'){await page.waitForTimeout(200);assert.equal(await page.locator('.opening-film[open]').count(),1,'Opening skipped after media failure');}
   await page.locator('.opening-film').waitFor({state:'detached',timeout:4000});assert.ok(Date.now()-tapped<4000);
   await page.locator('.section-navigator').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('invitation-opening-seen')),'true');
   await page.locator('.section-navigator a[href="#gallery"]').click();await page.waitForTimeout(1700);
   assert.equal(await page.locator('.hero-backdrop source').count(),0,'Far video retained decoder');
   if(profile==='low-end')assert.equal(requests.some(x=>/opening-couple|closing-loop/.test(x)),false);
   assert.equal(await page.locator('form,#rsvp').count(),0);assert.equal(await page.locator('footer#contact a[href^=tel]').count(),1);
   const audit=await page.evaluate(()=>window.audit);assert.ok(audit.maxVideos<=2);assert.equal(audit.audioBeforeTap,false);
   assert.deepEqual(errors,[]);assert.deepEqual(consoleErrors,[]);
   results.push({engine,route,profile,passed:true,duration,maxVideos:audit.maxVideos,consoleErrors});console.log('PASS',engine,route,profile);
  }finally{await context.close();}
 }}finally{await browser.close();}
}
assert.ok(results.length);await fs.writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
console.log('PASS',results.length,'media policy, bounded opening, retry, visibility and source cleanup scenarios');
