import { test, expect, type Page } from "@playwright/test";

const SAVE_KEY = "pokemon-verdant-v1";
const readSave = (page: Page) =>
  page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), SAVE_KEY);

test("walking saves progress and restores the same adventure after reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Small steps. Big adventures." }),
  ).toBeVisible();
  await page.locator("#world").focus();
  await page.keyboard.press("ArrowUp");
  await expect.poll(async () => (await readSave(page)).player.y).toBe(12);
  await page.reload();
  expect((await readSave(page)).player).toMatchObject({
    x: 15,
    y: 12,
    steps: 1,
  });
  await expect(page.locator("#notice")).toContainText("Welcome back");
  expect(errors).toEqual([]);
});

test("the starter can be chosen before the first step and persists", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "View team" }).click();
  await page.locator('[data-starter="squirtle"]').click();
  await expect(page.locator(".full-party-member")).toContainText("Squirtle");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.keyboard.press("ArrowUp");
  await page.reload();
  await expect(page.locator("#party-list")).toContainText("Squirtle");
  await page.getByRole("button", { name: "View team" }).click();
  await expect(page.locator(".starter-choice")).toHaveCount(0);
});

test("guided exploration, combat, catching, team switching and Pokédex work together", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore the grass", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Wild Pokémon battle" }),
  ).toBeVisible();
  await expect(page.locator(".enemy-health")).toContainText("Pidgey");
  const before = await readSave(page);
  await page.keyboard.press("ArrowUp");
  expect((await readSave(page)).player).toEqual(before.player);
  await page.locator('[data-move="0"]').click();
  await expect(page.locator(".battle-log")).toContainText(
    "Bulbasaur used Tackle",
  );
  expect((await readSave(page)).battle.enemy.hp).toBeLessThan(
    before.battle.enemy.hp,
  );
  await page.getByRole("button", { name: "Throw Poké Ball" }).click();
  await expect(page.locator(".battle-log")).toContainText(
    "Gotcha! Pidgey was caught",
  );
  await page.getByRole("button", { name: "Back to the adventure" }).click();
  await expect(page.locator("#quest-caption")).toHaveText("1 of 3 new friends");
  await page
    .getByRole("button", { name: /Pidgey, level.*Make active partner/ })
    .click();
  await expect(page.locator(".party-member.partner")).toContainText("Pidgey");
  await page.getByRole("button", { name: "Pokédex", exact: true }).click();
  await page.getByRole("button", { name: "Caught", exact: true }).click();
  await expect(page.locator(".dex-card")).toHaveCount(2);
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.reload();
  expect((await readSave(page)).collection).toEqual(["bulbasaur", "pidgey"]);
  expect((await readSave(page)).inventory.pokeballs).toBe(11);
});

test("fleeing safely returns to exploration and completed battles cannot take more actions", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explore the grass", exact: true })
    .click();
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await expect(page.locator(".battle-log")).toContainText("got away safely");
  await expect(page.locator("[data-move]")).toHaveCount(0);
  await page.getByRole("button", { name: "Back to the adventure" }).click();
  await expect(page.locator(".battle-panel")).toHaveCount(0);
});

test("the laboratory heals and replenishes depleted supplies", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!);
    state.player.x = 5;
    state.player.y = 8;
    state.player.steps = 9;
    state.party[0].hp = 8;
    state.inventory = { pokeballs: 0, potions: 0 };
    localStorage.setItem(key, JSON.stringify(state));
  }, SAVE_KEY);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "E Visit the Pokémon Lab" }),
  ).toBeVisible();
  await page.keyboard.press("e");
  const saved = await readSave(page);
  expect(saved.party[0].hp).toBe(saved.party[0].maxHp);
  expect(saved.inventory).toEqual({ pokeballs: 6, potions: 2 });
  await page.getByRole("button", { name: "Backpack", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("25 HP");
  await expect(page.getByRole("button", { name: "Use one" })).toBeDisabled();
});

test("click navigation reaches signs and supports interaction", async ({
  page,
}) => {
  await page.goto("/");
  const bounds = await page.locator("#world").boundingBox();
  await page
    .locator("#world")
    .click({
      position: {
        x: (bounds!.width * 11.5) / 30,
        y: (bounds!.height * 12.5) / 20,
      },
    });
  await expect.poll(async () => (await readSave(page)).player.x).toBe(11);
  await expect.poll(async () => (await readSave(page)).player.y).toBe(12);
  await page.getByRole("button", { name: "E Read the trail sign" }).click();
  await expect(page.locator("#notice")).toContainText("ROUTE 01");
});

test("corrupt saves and blocked saved coordinates recover without trapping the trainer", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(
    (key) => localStorage.setItem(key, "{invalid-json"),
    SAVE_KEY,
  );
  await page.reload();
  expect((await readSave(page)).party[0].speciesId).toBe("bulbasaur");
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key)!);
    state.player.x = 5;
    state.player.y = 4;
    state.inventory.pokeballs = 9;
    localStorage.setItem(key, JSON.stringify(state));
  }, SAVE_KEY);
  await page.reload();
  expect((await readSave(page)).player).toMatchObject({ x: 15, y: 13 });
  expect((await readSave(page)).inventory.pokeballs).toBe(9);
});

test("reset requires confirmation and dialogs support keyboard dismissal", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("ArrowUp");
  await page.getByRole("button", { name: "How to play" }).click();
  await page.getByRole("button", { name: "Start a new adventure" }).click();
  await page.getByRole("button", { name: "Keep my adventure" }).click();
  await page.keyboard.press("Escape");
  expect((await readSave(page)).player.steps).toBe(1);
  await page.getByRole("button", { name: "How to play" }).click();
  await page.getByRole("button", { name: "Start a new adventure" }).click();
  await page.getByRole("button", { name: "Start fresh" }).click();
  expect((await readSave(page)).player.steps).toBe(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("mobile controls, navigation and battle actions fit without horizontal overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Move up", exact: true }).click();
  expect((await readSave(page)).player.y).toBe(12);
  await page.getByRole("button", { name: "Pokédex", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page
    .getByRole("button", { name: "Explore the grass", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Throw Poké Ball" }),
  ).toBeVisible();
  const actions = await page.locator(".battle-items").boundingBox();
  const viewport = await page.locator(".game-viewport").boundingBox();
  expect(actions!.y + actions!.height).toBeLessThanOrEqual(
    viewport!.y + viewport!.height,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Run", exact: true }).click();
  await page.getByRole("button", { name: "Back to the adventure" }).click();
  await expect(page.locator(".battle-panel")).toHaveCount(0);
});
