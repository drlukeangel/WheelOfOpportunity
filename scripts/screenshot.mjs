import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const OUT_DIR = "screenshots";
const URL = process.env.WOO_URL || "http://localhost:5173";

const people = [
  { name: "Ana",     icon: "🦊", color: "#f97316", id: "u-ana" },
  { name: "Ben",     icon: "🐢", color: "#0ea5e9", id: "u-ben" },
  { name: "Cleo",    icon: "🦉", color: "#a855f7", id: "u-cleo" },
  { name: "Dev",     icon: "🐙", color: "#10b981", id: "u-dev" },
  { name: "Esme",    icon: "🦄", color: "#ec4899", id: "u-esme" },
  { name: "Finn",    icon: "🐝", color: "#eab308", id: "u-finn" },
  { name: "Gina",    icon: "🦋", color: "#06b6d4", id: "u-gina" },
  { name: "Hari",    icon: "🌿", color: "#84cc16", id: "u-hari" }
];

const groupId = "g-standup";

const nowIso = () => new Date().toISOString();

/** Seed AppData that mirrors what the app would create. */
function buildSeed({ withRuns = false } = {}) {
  const users = people.map((p) => ({
    id: p.id,
    name: p.name,
    email: "",
    employeeId: "",
    icon: p.icon,
    color: p.color,
    createdAt: nowIso()
  }));
  const groups = [{
    id: groupId,
    name: "Monday Standup",
    description: "Eight people. Every voice gets a turn.",
    icon: "🎤",
    color: "#0ea5e9",
    createdAt: nowIso()
  }];
  const memberships = users.map((u, i) => ({ id: `m-${i}`, groupId, userId: u.id }));

  let runs = [];
  let depletionPools = [];
  if (withRuns) {
    // 5 picks already happened this round under depleting mode — 3 still queued
    const pickedOrder = [people[0], people[3], people[5], people[1], people[6]];
    const allIds = people.map((p) => p.id);
    let remaining = [...allIds];
    runs = pickedOrder.map((pick, i) => {
      const candidateUserIds = [...remaining];
      remaining = remaining.filter((id) => id !== pick.id);
      return {
        id: `r-${i}`,
        groupId,
        gameType: "wheelEdge",
        mode: "depleting",
        selectedUserId: pick.id,
        candidateUserIds,
        timestamp: nowIso()
      };
    });
    depletionPools = [{ key: `${groupId}:wheelEdge`, remainingUserIds: remaining }];
  }

  return {
    users,
    groups,
    memberships,
    runs,
    depletionPools,
    settings: { soundEnabled: false, animationSpeed: 1, theme: "dark" }
  };
}

async function seedAndGo(page, seed, tab) {
  // visit once to make localStorage available, then write seed, then reload
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.evaluate((data) => {
    localStorage.setItem("wheel-of-opportunity:v1", JSON.stringify(data));
  }, seed);
  await page.reload({ waitUntil: "networkidle" });
  if (tab) {
    await page.getByRole("button", { name: tab, exact: true }).click();
    await page.waitForTimeout(120);
  }
}

async function pickGroup(page) {
  await page.locator('select').first().selectOption({ label: "🎤 Monday Standup" });
  await page.waitForTimeout(120);
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark"
  });
  const page = await ctx.newPage();

  // 1. Play page, depleting mode, 5 of 8 already picked — the fairness story
  await seedAndGo(page, buildSeed({ withRuns: true }), "Play");
  await pickGroup(page);
  await page.screenshot({ path: join(OUT_DIR, "01-play-pool-status.png"), fullPage: true });

  // 2. Play page, fully fresh round
  await seedAndGo(page, buildSeed({ withRuns: false }), "Play");
  await pickGroup(page);
  await page.screenshot({ path: join(OUT_DIR, "02-play-fresh-round.png"), fullPage: true });

  // 3. Play page in pure-random mode — shows the warning
  await page.locator('select').nth(2).selectOption({ label: "Pure random" });
  await page.waitForTimeout(120);
  await page.screenshot({ path: join(OUT_DIR, "03-play-pure-random-warn.png"), fullPage: true });

  // 4. History page after several picks
  await seedAndGo(page, buildSeed({ withRuns: true }), "History");
  await page.screenshot({ path: join(OUT_DIR, "04-history.png"), fullPage: true });

  // 5. Groups admin
  await seedAndGo(page, buildSeed({ withRuns: false }), "Groups");
  await page.locator('select').first().selectOption({ label: "🎤 Monday Standup" });
  await page.waitForTimeout(120);
  await page.screenshot({ path: join(OUT_DIR, "05-groups.png"), fullPage: true });

  // 6. People admin
  await seedAndGo(page, buildSeed({ withRuns: false }), "People");
  await page.screenshot({ path: join(OUT_DIR, "06-people.png"), fullPage: true });

  await browser.close();
  console.log(`Wrote 6 screenshots to ./${OUT_DIR}/`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
