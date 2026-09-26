import { describe, expect, it } from "vitest";
import { GameEngine, type SpeciesId } from "./game";

function sequence(...values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? values.at(-1) ?? 0;
}

function wildBattle(random = () => 0): GameEngine {
  const game = new GameEngine(undefined, random);
  game.encounter();
  return game;
}

describe("meadow exploration", () => {
  it("moves only through passable tiles, turns at obstacles, and encounters wild Pokémon in grass", () => {
    const game = new GameEngine(undefined, () => 0);
    game.move(-1, 0, false, false);
    expect(game.state.player).toMatchObject({
      x: 15,
      y: 13,
      facing: "left",
      steps: 0,
    });
    game.move(0, -1, true, false);
    expect(game.state.player).toMatchObject({ x: 15, y: 12, steps: 1 });
    expect(game.state.battle).toBeNull();
    game.move(1, 0, true, true);
    expect(game.state.battle?.enemy.speciesId).toBe("pidgey");
    expect(game.state.seen).toContain("pidgey");
    game.move(0, 1, true, false);
    expect(game.state.player).toMatchObject({ x: 16, y: 12, steps: 2 });
    game.closeBattle();
    expect(game.state.battle).not.toBeNull();
  });

  it("lets a new trainer choose a starter but prevents replacing an adventuring team", () => {
    const game = new GameEngine();
    game.chooseStarter("squirtle");
    expect(game.state.party[0].speciesId).toBe("squirtle");
    expect(game.state.collection).toEqual(["squirtle"]);
    game.move(1, 0, true, false);
    game.chooseStarter("charmander");
    expect(game.state.party[0].speciesId).toBe("squirtle");
  });

  it("keeps the player within the world and ignores diagonal movement", () => {
    const game = new GameEngine();
    game.state.player.x = 0;
    game.move(-1, 0, true, false);
    game.move(1, 1, true, false);
    game.move(0.5, 0.5, true, false);
    expect(game.state.player.x).toBe(0);
    expect(game.state.player.y).toBe(13);
  });
});

describe("turn-based battles", () => {
  it("trades attacks, wins a fight, awards XP and supplies, and levels up", () => {
    const game = wildBattle();
    game.state.party[0].xp = 55;
    game.attack(0);
    expect(game.state.battle?.enemy.hp).toBeLessThan(
      game.state.battle!.enemy.maxHp,
    );
    expect(game.state.party[0].hp).toBeLessThan(45);
    expect(game.state.battle?.turn).toBe(2);
    game.state.battle!.enemy.hp = 1;
    game.attack(0);
    expect(game.state.battle?.result).toBe("won");
    expect(game.state.stats.won).toBe(1);
    expect(game.state.inventory.pokeballs).toBe(13);
    expect(game.state.party[0].level).toBe(6);
    expect(game.state.party[0].maxHp).toBe(50);
    const xp = game.state.party[0].xp;
    game.attack(0);
    expect(game.state.party[0].xp).toBe(xp);
    game.closeBattle();
    expect(game.state.battle).toBeNull();
  });

  it("applies type effectiveness to attacks", () => {
    const againstWater = wildBattle();
    againstWater.state.battle!.enemy.speciesId = "squirtle";
    againstWater.attack(1);
    const waterDamage =
      againstWater.state.battle!.enemy.maxHp -
      againstWater.state.battle!.enemy.hp;
    const againstFire = wildBattle();
    againstFire.state.battle!.enemy.speciesId = "charmander";
    againstFire.attack(1);
    const fireDamage =
      againstFire.state.battle!.enemy.maxHp -
      againstFire.state.battle!.enemy.hp;
    expect(waterDamage).toBeGreaterThan(fireDamage * 2);
    expect(againstWater.state.battle?.log).toContain("Super effective");
    expect(againstFire.state.battle?.log).toContain("Not very effective");
  });

  it("catches wild Pokémon, updates the collection and awards the Meadow Explorer badge", () => {
    const game = new GameEngine(undefined, () => 0);
    for (const speciesId of [
      "pidgey",
      "pikachu",
      "eevee",
    ] satisfies SpeciesId[]) {
      game.encounter();
      game.state.battle!.enemy.speciesId = speciesId;
      game.catchPokemon();
      expect(game.state.battle?.result).toBe("caught");
      game.closeBattle();
    }
    expect(game.state.party).toHaveLength(4);
    expect(game.state.collection).toEqual([
      "bulbasaur",
      "pidgey",
      "pikachu",
      "eevee",
    ]);
    expect(game.state.inventory.pokeballs).toBe(9);
    expect(game.state.stats.caught).toBe(3);
    expect(game.state.badge).toBe(true);
    expect(game.state.notice).toContain("Meadow Explorer badge");
  });

  it("counts duplicate catches without adding duplicate Pokédex entries or badge progress", () => {
    const game = new GameEngine(undefined, () => 0);
    for (let index = 0; index < 7; index += 1) {
      game.encounter();
      game.catchPokemon();
      game.closeBattle();
    }
    expect(game.state.party).toHaveLength(6);
    expect(game.state.collection).toEqual(["bulbasaur", "pidgey"]);
    expect(game.state.stats.caught).toBe(7);
    expect(game.state.badge).toBe(false);
    expect(game.state.notice).toContain("collection");
  });

  it("makes weakened Pokémon easier to catch and spends a turn on a failed attempt", () => {
    const healthy = wildBattle(sequence(0, 0, 0.5, 0, 0));
    healthy.catchPokemon();
    expect(healthy.state.battle?.result).toBeNull();
    expect(healthy.state.battle?.turn).toBe(2);
    expect(healthy.state.inventory.pokeballs).toBe(11);
    expect(healthy.state.party[0].hp).toBeLessThan(45);
    const weakened = wildBattle(sequence(0, 0, 0.5));
    weakened.state.battle!.enemy.hp = 1;
    weakened.catchPokemon();
    expect(weakened.state.battle?.result).toBe("caught");
  });

  it("does not spend a turn for an empty bag or a potion at full health", () => {
    const game = wildBattle();
    game.state.inventory.pokeballs = 0;
    game.catchPokemon();
    expect(game.state.battle?.turn).toBe(1);
    expect(game.state.inventory.pokeballs).toBe(0);
    game.usePotion();
    expect(game.state.inventory.potions).toBe(4);
    expect(game.state.battle?.turn).toBe(1);
  });

  it("heals with a potion before the enemy takes its turn", () => {
    const game = wildBattle();
    game.state.party[0].hp = 5;
    game.usePotion();
    expect(game.state.party[0].hp).toBeGreaterThan(5);
    expect(game.state.party[0].hp).toBeLessThan(30);
    expect(game.state.inventory.potions).toBe(3);
    expect(game.state.battle?.turn).toBe(2);
    expect(game.state.battle?.log).toContain("recovered 25 HP");
  });

  it("recovers the whole team and moves home after a loss", () => {
    const game = wildBattle();
    game.state.player.x = 25;
    game.state.party[0].hp = 1;
    game.attack(0);
    expect(game.state.battle?.result).toBe("lost");
    expect(game.state.party[0].hp).toBe(game.state.party[0].maxHp);
    expect(game.state.player).toMatchObject({ x: 15, y: 13 });
    game.closeBattle();
    expect(game.state.battle).toBeNull();
  });

  it("allows a safe escape and a free heal with supply replenishment at the center", () => {
    const game = wildBattle();
    game.state.party[0].hp = 10;
    game.flee();
    expect(game.state.battle?.result).toBe("fled");
    game.heal();
    expect(game.state.party[0].hp).toBe(10);
    game.closeBattle();
    game.state.inventory = { pokeballs: 0, potions: 0 };
    game.heal();
    expect(game.state.party[0].hp).toBe(45);
    expect(game.state.inventory).toEqual({ pokeballs: 6, potions: 2 });
  });

  it("switches partners during a battle at the cost of a turn", () => {
    const game = wildBattle();
    game.catchPokemon();
    game.closeBattle();
    const secondUid = game.state.party[1].uid;
    game.encounter();
    game.switchPartner(secondUid);
    expect(game.state.party[0].uid).toBe(secondUid);
    expect(game.state.party[0].hp).toBeLessThan(game.state.party[0].maxHp);
    expect(game.state.battle?.turn).toBe(2);
  });

  it("sends out the next healthy partner when the leader faints without ending the battle", () => {
    const game = wildBattle();
    game.catchPokemon();
    game.closeBattle();
    const secondUid = game.state.party[1].uid;
    game.encounter();
    game.state.party[0].hp = 1;
    game.attack(0);
    expect(game.state.battle?.result).toBeNull();
    expect(game.state.party[0].uid).toBe(secondUid);
    expect(game.state.party[1].hp).toBe(0);
    expect(game.state.battle?.log).toContain("Go, Pidgey!");
  });
});

describe("save recovery", () => {
  it("restores a save but ends an interrupted encounter", () => {
    const game = wildBattle();
    game.state.inventory.potions = 2;
    game.state.player.steps = 12;
    const restored = new GameEngine(game.serialize());
    expect(restored.state.party).toEqual(game.state.party);
    expect(restored.state.inventory.potions).toBe(2);
    expect(restored.state.player.steps).toBe(12);
    expect(restored.state.battle).toBeNull();
  });

  it.each([
    undefined,
    null,
    '{"version":1,',
    { version: 2 },
    { version: 1, party: [] },
  ])("recovers safely from malformed saved data: %j", (saved) => {
    const restored = new GameEngine(saved);
    expect(restored.state.party[0].speciesId).toBe("bulbasaur");
    expect(restored.state.player).toMatchObject({ x: 15, y: 13 });
  });

  it("rejects unknown species and invalid coordinates rather than trusting stored payloads", () => {
    const game = new GameEngine();
    const save = JSON.parse(game.serialize());
    save.party[0].speciesId = "__proto__";
    save.collection = ["missingno", "constructor"];
    expect(new GameEngine(save).state.party[0].speciesId).toBe("bulbasaur");
    const outside = JSON.parse(game.serialize());
    outside.player.x = 500;
    expect(new GameEngine(outside).state.player.x).toBe(15);
  });

  it("clamps resource values, derives maximum HP, and recovers a fully fainted saved party", () => {
    const save = JSON.parse(new GameEngine().serialize());
    save.party[0].hp = -500;
    save.party[0].maxHp = 1_000_000;
    save.inventory = { potions: 100000, pokeballs: -2 };
    save.player.x = 22;
    const restored = new GameEngine(save);
    expect(restored.state.party[0].maxHp).toBe(45);
    expect(restored.state.party[0].hp).toBe(45);
    expect(restored.state.inventory).toEqual({ potions: 99, pokeballs: 0 });
    expect(restored.state.player.x).toBe(15);
  });

  it("removes invalid entries from a partial save and promotes a healthy partner", () => {
    const game = wildBattle();
    game.catchPokemon();
    const save = JSON.parse(game.serialize());
    save.party[0].hp = 0;
    save.party.push({ speciesId: "missingno" });
    save.collection.push("missingno");
    save.seen.push("__proto__");
    const restored = new GameEngine(save);
    expect(restored.state.party).toHaveLength(2);
    expect(restored.state.party[0].speciesId).toBe("pidgey");
    expect(restored.state.collection).toEqual(["bulbasaur", "pidgey"]);
    expect(restored.state.seen).toEqual(["bulbasaur", "pidgey"]);
  });

  it("replaces unsafe restored identifiers before they reach HTML attributes", () => {
    const save = JSON.parse(new GameEngine().serialize());
    save.party[0].uid = '\"><img src=x onerror=alert(1)>';
    const restored = new GameEngine(save);
    expect(restored.state.party[0].uid).toMatch(/^[a-zA-Z0-9_-]{1,119}$/);
    expect(restored.state.party[0].uid).not.toBe(save.party[0].uid);
  });

  it("keeps identifiers unique and preserves safe identifiers across saves", () => {
    const game = wildBattle();
    game.catchPokemon();
    const save = JSON.parse(game.serialize());
    save.party[0].uid = "trusted_partner-1";
    save.party[1].uid = "trusted_partner-1";
    const restored = new GameEngine(save);
    expect(restored.state.party[0].uid).toBe("trusted_partner-1");
    expect(
      new Set(restored.state.party.map((creature) => creature.uid)).size,
    ).toBe(2);
  });

  it("recovers fainted parties without mutating the caller’s saved object", () => {
    const save = JSON.parse(new GameEngine().serialize());
    save.player.x = 22;
    save.party[0].hp = 0;
    new GameEngine(save);
    expect(save.player.x).toBe(22);
    expect(save.party[0].hp).toBe(0);
  });

  it("derives badge progress from unique known collection entries and team members", () => {
    const save = JSON.parse(new GameEngine().serialize());
    save.collection = ["pidgey", "pidgey", "pikachu", "eevee", "missingno"];
    save.badge = false;
    const restored = new GameEngine(save);
    expect(restored.state.collection).toHaveLength(4);
    expect(restored.state.seen).toEqual(
      expect.arrayContaining(restored.state.collection),
    );
    expect(restored.state.badge).toBe(true);
    save.collection = ["bulbasaur"];
    save.badge = true;
    expect(new GameEngine(save).state.badge).toBe(false);
  });
});
