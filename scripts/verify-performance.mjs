import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
const modulePath=process.env.INVITATION_PLAYWRIGHT_MODULE;
const {chromium}=await import(modulePath?pathToFileURL(modulePath).href:"playwright");
const baseURL=process.env.INVITATION_TEST_URL||"http://127.0.0.1:3101";
const browser=await chromium.launch({headless:true});
const results=[];
const language=process.env.QA_LANGUAGE || "en";
try {
  for(const event of (process.env.QA_ROUTES || "wedding,homecoming").split(",")) {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await context.addCookies([{name:"invitation-language",value:language,url:baseURL}]);
    await context.addInitScript(lang=>localStorage.setItem("invitation-language",lang),language);
    const page=await context.newPage();
    await page.addInitScript(()=>{
      window.invitationMetrics={lcp:0,cls:0,shifts:[]};
      new PerformanceObserver(list=>{for(const item of list.getEntries())window.invitationMetrics.lcp=item.startTime;}).observe({type:"largest-contentful-paint",buffered:true});
      new PerformanceObserver(list=>{for(const item of list.getEntries())if(!item.hadRecentInput){window.invitationMetrics.cls+=item.value;window.invitationMetrics.shifts.push({value:item.value,time:item.startTime,sources:item.sources.map(source=>({node:source.node?.className,previous:{x:source.previousRect.x,y:source.previousRect.y,width:source.previousRect.width,height:source.previousRect.height},current:{x:source.currentRect.x,y:source.currentRect.y,width:source.currentRect.width,height:source.currentRect.height}}))});}}).observe({type:"layout-shift",buffered:true});
    });
    const cdp=await context.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
    await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:1.6*1024*1024/8,uploadThroughput:750*1024/8,connectionType:"cellular4g"});
    await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
    await page.goto(baseURL+"/"+event,{waitUntil:"domcontentloaded"});
    await page.waitForFunction(()=>!document.querySelector(".gate-button")?.disabled);
    await page.evaluate(()=>document.fonts.ready);
    await page.waitForTimeout(1500);
    const metric=await page.evaluate(()=>({
      ...window.invitationMetrics,
      resources:performance.getEntriesByType("resource").map(item=>({name:new URL(item.name).pathname,bytes:item.encodedBodySize,transfer:item.transferSize})),
    }));
    const jsBytes=metric.resources.filter(item=>item.name.endsWith(".js")).reduce((sum,item)=>sum+item.bytes,0);
    const media=metric.resources.filter(item=>/\.(mp4|mp3)$/.test(item.name));
    results.push({event,language,shifts:metric.shifts,lcpMs:Math.round(metric.lcp),cls:Number(metric.cls.toFixed(4)),encodedJSBytes:jsBytes,mediaBeforeTap:media.length,profile:"Cold cache, 150ms latency, 1.6Mbps download, 4x CPU throttle",lcpTargetMet:metric.lcp<2500});
    console.log(JSON.stringify(results.at(-1)));
    await context.close();
  }
} finally{await browser.close();}
const output=path.resolve("artifacts/qa/performance");
await fs.mkdir(output,{recursive:true});await fs.writeFile(path.join(output,language === "en" ? "results.json" : "results-"+language+".json"),JSON.stringify(results,null,2));
