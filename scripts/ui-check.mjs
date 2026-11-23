// Browser smoke test: loads the running dev/preview server and exercises the
// solve flow, the left-hand toggle and the notation page. Fails on any console error.
// Usage: npm run dev (note the port), then: node scripts/ui-check.mjs [baseURL]
import { chromium } from "playwright-core";

const base = process.argv[2] || "http://localhost:5173";
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

const assert = (cond, msg) => { if (!cond) { console.error("FAIL:", msg); fails++; } else { console.log("ok:", msg); } };
let fails = 0;

// Solve page: paint a random scramble and solve it.
await page.goto(`${base}/#/solve`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
assert((await page.locator(".net-cell").count()) === 54, "net has 54 stickers");
await page.getByRole("button", { name: "Scramble" }).click();
await page.getByRole("button", { name: /Solve/ }).click();
await page.waitForSelector(".stages", { timeout: 20000 });
const stageNames = await page.locator(".stage__name").allInnerTexts();
assert(stageNames.join(",") === "Cross,F2L 1,F2L 2,F2L 3,F2L 4,OLL,PLL", "seven CFOP stages: " + stageNames.join(" "));
assert((await page.locator(".solve__player .player__stage").count()) === 1, "3D player mounted");

// Case page: multiple selectable algs drive one player.
await page.goto(`${base}/#/case/oll-27`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
const optCount = await page.locator("button").count();
assert(optCount >= 2, `case page shows ${optCount} selectable algorithms`);
assert((await page.locator(".player__phase").first().innerText()) === "OLL", "phase badge shows OLL");
assert((await page.locator(".hand-finger--on").count()) >= 1, "finger guide highlights a finger");

// Advanced F2L now fully populated.
await page.goto(`${base}/#/advanced-f2l`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
const advCards = await page.locator(".card").count();
assert(advCards > 60, `advanced F2L has ${advCards} cases`);

// Cross lesson page exists with a worked example + player.
await page.goto(`${base}/#/cross`, { waitUntil: "networkidle" });
await page.waitForTimeout(400);
assert((await page.locator(".player__stage").count()) === 1, "cross page has a 3D example");
assert((await page.getByText("Cross solution").count()) > 0, "cross page shows a worked solution");
const crossBefore = await page.getByText(/Cross solution/).first().innerText();
await page.getByRole("button", { name: /Scramble/ }).click();
await page.waitForTimeout(800);
const crossAfter = await page.getByText(/Cross solution/).first().innerText();
assert(crossAfter !== crossBefore, "cross scramble makes a new solution: " + crossBefore + " -> " + crossAfter);

// Solve: scrambling shows notation; typing a scramble applies it.
await page.goto(`${base}/#/solve`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.getByRole("button", { name: "Scramble" }).click();
await page.waitForTimeout(150);
assert((await page.locator(".scramble-line code").count()) === 1, "scramble is shown in notation");
await page.getByLabel("Or type a scramble in notation").fill("R U R' U'");
await page.getByRole("button", { name: "Apply" }).click();
await page.waitForTimeout(150);
assert((await page.locator(".scramble-line code").innerText()).includes("R U R'"), "typed scramble is applied");

// Notation page: move groups are tabbed; one section shows at a time.
await page.goto(`${base}/#/notation`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);
const tabs = await page.locator(".ntabs button").allInnerTexts();
assert(tabs.includes("Triggers worth memorising") || tabs.some((t) => /Triggers/i.test(t)), "notation has a triggers tab");
assert((await page.locator(".ntabs").count()) === 1, "notation shows one group at a time");

assert(errors.length === 0, "no console errors" + (errors.length ? ": " + errors.join("; ") : ""));
await browser.close();
console.log(fails ? `\n${fails} check(s) failed` : "\nAll UI checks passed");
process.exit(fails ? 1 : 0);
