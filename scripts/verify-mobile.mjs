import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const runner = process.env.INVITATION_PLAYWRIGHT_MODULE;
const { chromium, webkit } = await import(runner ? pathToFileURL(runner).href : "playwright");
const baseURL = process.env.INVITATION_TEST_URL || "http://127.0.0.1:3101";
const output = path.resolve("artifacts/qa/mobile");
await fs.mkdir(output, { recursive: true });
const reports = [];
const errors = [];
const sizes = [{width:320,height:568}, {width:360,height:740}, {width:390,height:844}, {width:430,height:932}, {width:1280,height:800}];
for (const [name, engine] of [["chromium", chromium], ["webkit", webkit]].filter(([name]) => (process.env.QA_ENGINES || "chromium,webkit").split(",").includes(name))) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const event of (process.env.QA_ROUTES || "wedding,homecoming").split(",")) {
      for (const language of (process.env.QA_LANGUAGES || "en,si").split(",")) {
        for (const viewport of sizes.filter(size=>!process.env.QA_VIEWPORTS || process.env.QA_VIEWPORTS.split(",").includes(String(size.width)))) {
          const context = await browser.newContext({viewport, isMobile: viewport.width < 720, hasTouch: viewport.width < 720, reducedMotion: "reduce"});
          await context.addCookies([{name:"invitation-language",value:language,url:baseURL}]);
          await context.addInitScript(lang => localStorage.setItem("invitation-language", lang), language);
          await context.route("https://maps.google.com/**", route=>route.fulfill({contentType:"text/html",body:"<!doctype html><html><body>Map preview test fixture</body></html>"}));
          const page = await context.newPage();
          page.setDefaultTimeout(20000);
          page.on("pageerror", error => errors.push(error.message));
          const mediaRequests = [];
          page.on("request", request => { if (/\.(mp4|webm|mp3)(\?|$)/.test(request.url())) mediaRequests.push(request.url()); });
          await page.goto(baseURL + "/" + event + "?guest=" + encodeURIComponent("ආදරණීය අමුත්තා සහ පවුලේ සියලුම දෙනා"), {waitUntil:"domcontentloaded"});
          await page.locator(".invitation-gate").waitFor();
          await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
          await page.waitForFunction(() => document.fonts.status === "loaded", undefined, {timeout:20000});
          assert.equal(await page.locator("main").getAttribute("lang"), language);
          assert.equal(await page.locator("iframe").count(), 0, "Map loaded before opening");
          assert.equal(mediaRequests.length, 0, "Media requested before the opening gesture");
          assert.ok(await page.locator("video").evaluateAll(videos=>videos.every(video=>!video.getAttribute("src") && !video.querySelector("source[src]"))));
          const coverMetrics = await page.evaluate(() => ({
            width:innerWidth, scrollWidth:document.documentElement.scrollWidth,
            tap:[...document.querySelectorAll(".invitation-gate button,.language-toggle--floating button")].map(el => ({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})),
          }));
          assert.ok(coverMetrics.scrollWidth <= viewport.width, "Cover horizontal overflow");
          assert.ok(coverMetrics.tap.every(target => target.w >= 44 && target.h >= 44), "Cover tap target smaller than 44px");
          if (viewport.width === 390) await page.screenshot({path:path.join(output,name+"-"+event+"-"+language+"-cover.png")});
          await page.locator(".gate-button").click();
          await page.locator("#top").waitFor();
          await page.waitForTimeout(250);
          assert.equal(await page.locator(".section-navigator a").count(), 5);
          const contentMetrics = await page.evaluate(() => ({
            width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
            nav:[...document.querySelectorAll(".section-navigator a")].map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})),
            guestText:document.querySelector(".hero-content .guest-line").textContent,
          }));
          assert.ok(contentMetrics.scrollWidth <= viewport.width, "Invitation horizontal overflow");
          assert.ok((await page.locator(".invitation-content").boundingBox()).width<=480,"Desktop invitation column wider than 480px");
          assert.ok(contentMetrics.nav.every(target => target.w >= 44 && target.h >= 44), "Navigation tap targets smaller than44");
          assert.ok(!contentMetrics.guestText.includes("<"));
          if (viewport.width === 390) await page.screenshot({path:path.join(output,name+"-"+event+"-"+language+"-hero.png")});
          for (const section of ["event-details","gallery","location","contact"]) {
            await page.locator('.section-navigator a[href="#'+section+'"]').click();
            await page.waitForTimeout(200);
            assert.equal(await page.locator('.section-navigator a[aria-current="location"]').getAttribute("href"), "#"+section);
            if (viewport.width === 390 && name === "chromium") await page.screenshot({path:path.join(output,event+"-"+language+"-"+section+".png")});
          }
          assert.equal(await page.locator("form").count(),0,"Unexpected guest form");
          assert.equal(await page.locator("footer#contact a[href^=tel]").count(),1);
          await page.locator(".back-to-top").scrollIntoViewIfNeeded();
          await page.locator(".back-to-top").click();
          assert.ok(await page.evaluate(()=>scrollY) < 10);
          await page.locator(".replay-opening").scrollIntoViewIfNeeded();
          const beforeReplay=await page.evaluate(()=>scrollY);
          await page.locator(".replay-opening").click();
          await page.waitForTimeout(200);
          assert.ok(Math.abs((await page.evaluate(()=>scrollY))-beforeReplay)<5,"Replay lost scroll position");
          reports.push({engine:name,event,language,...viewport,coverOverflow:false,contentOverflow:false,tapTargets:true,nav:true,contact:true,noForms:true});
          await page.evaluate(()=>document.querySelectorAll("audio,video").forEach(media=>media.pause()));
          await page.close();
          await context.close();
          console.log("PASS " + name + " " + event + " " + language + " " + viewport.width);
        }
      }
    }
  } finally { await browser.close(); }
}
assert.deepEqual(errors, [], "Browser console errors");
await fs.writeFile(path.join(output,process.env.QA_LANGUAGES ? "results-"+process.env.QA_LANGUAGES.replaceAll(",","-")+".json" : "results.json"),JSON.stringify({baseURL,scenarios:reports.length,reports,errors},null,2));
console.log("PASS "+reports.length+" browser/route/language/viewport scenarios; no JS errors; Contact nav and footer passed.");
