// Temporary responsiveness audit. Usage: node scripts/.responsive-audit.mjs [baseURL]
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://localhost:5179";
const routes = [
  "/", "/notation", "/cross", "/f2l", "/advanced-f2l", "/oll", "/pll",
  "/solve", "/timer", "/search", "/case/oll-1", "/case/f2l-1",
];
const widths = [320, 360, 390, 480, 768, 1024, 1280, 1440, 1920];

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });

let problems = 0;
for (const width of widths) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of routes) {
    errors.length = 0;
    await page.goto(base + "/#" + route, { waitUntil: "networkidle" });
    await page.waitForTimeout(350);
    const result = await page.evaluate(() => {
      const vw = window.innerWidth;
      const doc = document.documentElement;
      const offenders = [];
      for (const el of document.querySelectorAll("main *, header *, aside *")) {
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.right <= vw + 1 && r.left >= -1) continue;
        if (el.closest(".chips--scroll")) continue;
        if (el.closest(".side")) continue;
        const cs = getComputedStyle(el);
        if (cs.position === "fixed") continue;
        // content clipped by an ancestor (progress-bar fills, scrollers) cannot widen the page
        let clippedByAncestor = false;
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const acs = getComputedStyle(a);
          if (acs.overflowX === "hidden" || acs.overflowX === "clip" || acs.overflowX === "auto" || acs.overflowX === "scroll") { clippedByAncestor = true; break; }
        }
        if (clippedByAncestor) continue;
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className).slice(0, 60),
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.innerText || "").trim().slice(0, 40),
        });
        if (offenders.length >= 4) break;
      }
      // clipped text: element with hidden/auto overflow and horizontal content clipped
      const clipped = [];
      for (const el of document.querySelectorAll("main *")) {
        if (el.children.length) continue;
        const cs = getComputedStyle(el);
        if (cs.overflowX === "visible") continue;
        if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) {
          clipped.push({ tag: el.tagName.toLowerCase(), cls: String(el.className).slice(0, 40), sw: el.scrollWidth, cw: el.clientWidth, text: (el.innerText || "").trim().slice(0, 30) });
        }
        if (clipped.length >= 3) break;
      }
      return {
        overflow: Math.max(0, doc.scrollWidth - vw),
        offenders,
        clipped,
      };
    });
    const bad = result.overflow > 1 || result.offenders.length || errors.length;
    if (bad) {
      problems++;
      console.log(`\n[${width}] ${route}`);
      if (result.overflow > 1) console.log(`  page overflow: +${result.overflow}px`);
      for (const o of result.offenders) console.log(`  out: <${o.tag} class="${o.cls}"> ${o.left}..${o.right} "${o.text}"`);
      for (const c of result.clipped) console.log(`  clipped: <${c.tag} class="${c.cls}"> ${c.sw}>${c.cw} "${c.text}"`);
      for (const e of errors.slice(0, 2)) console.log("  " + e);
    }
  }
}
await browser.close();
console.log(`\n${problems ? problems + " route/width combinations flagged" : "No overflow or console errors at any width"}`);
