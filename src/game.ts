export type SpeciesId =
  | "bulbasaur"
  | "charmander"
  | "squirtle"
  | "pidgey"
  | "rattata"
  | "caterpie"
  | "pikachu"
  | "oddish"
  | "eevee";

export type PokemonType =
  | "Grass"
  | "Fire"
  | "Water"
  | "Normal"
  | "Flying"
  | "Bug"
  | "Electric"
  | "Poison";
export interface Move {
  name: string;
  type: PokemonType;
  power: number;
}
export interface Species {
  id: SpeciesId;
  number: number;
  name: string;
  type: PokemonType;
  color: string;
  description: string;
  moves: Move[];
}

export const SPECIES: Record<SpeciesId, Species> = {
  bulbasaur: {
    id: "bulbasaur",
    number: 1,
    name: "Bulbasaur",
    type: "Grass",
    color: "#76bb83",
    description:
      "A curious little partner. The seed on its back grows stronger in the sunlight.",
    moves: [
      { name: "Tackle", type: "Normal", power: 35 },
      { name: "Vine Whip", type: "Grass", power: 45 },
      { name: "Razor Leaf", type: "Grass", power: 55 },
      { name: "Sludge", type: "Poison", power: 40 },
    ],
  },
  charmander: {
    id: "charmander",
    number: 4,
    name: "Charmander",
    type: "Fire",
    color: "#f2a06b",
    description:
      "Its tail flame flickers with its feelings. A bright flame means a happy partner.",
    moves: [
      { name: "Scratch", type: "Normal", power: 35 },
      { name: "Ember", type: "Fire", power: 45 },
      { name: "Flame Burst", type: "Fire", power: 55 },
      { name: "Slash", type: "Normal", power: 50 },
    ],
  },
  squirtle: {
    id: "squirtle",
    number: 7,
    name: "Squirtle",
    type: "Water",
    color: "#72b8d7",
    description:
      "A cheerful swimmer that retreats into its shell when it needs a little quiet.",
    moves: [
      { name: "Tackle", type: "Normal", power: 35 },
      { name: "Water Gun", type: "Water", power: 45 },
      { name: "Bubble Beam", type: "Water", power: 55 },
      { name: "Rapid Spin", type: "Normal", power: 40 },
    ],
  },
  pidgey: {
    id: "pidgey",
    number: 16,
    name: "Pidgey",
    type: "Flying",
    color: "#cfa77c",
    description: "Follow its soft morning calls to the edges of the meadow.",
    moves: [
      { name: "Tackle", type: "Normal", power: 35 },
      { name: "Gust", type: "Flying", power: 40 },
      { name: "Quick Attack", type: "Normal", power: 45 },
      { name: "Wing Attack", type: "Flying", power: 55 },
    ],
  },
  rattata: {
    id: "rattata",
    number: 19,
    name: "Rattata",
    type: "Normal",
    color: "#b396ca",
    description:
      "Small, quick, and very brave. It knows every shortcut through the tall grass.",
    moves: [
      { name: "Tackle", type: "Normal", power: 35 },
      { name: "Quick Attack", type: "Normal", power: 40 },
      { name: "Hyper Fang", type: "Normal", power: 55 },
      { name: "Bite", type: "Normal", power: 45 },
    ],
  },
  caterpie: {
    id: "caterpie",
    number: 10,
    name: "Caterpie",
    type: "Bug",
    color: "#92bd61",
    description:
      "A leaf-loving explorer with a huge appetite and an even bigger future.",
    moves: [
      { name: "Tackle", type: "Normal", power: 30 },
      { name: "Bug Bite", type: "Bug", power: 45 },
      { name: "Struggle Bug", type: "Bug", power: 50 },
      { name: "Headbutt", type: "Normal", power: 40 },
    ],
  },
  pikachu: {
    id: "pikachu",
    number: 25,
    name: "Pikachu",
    type: "Electric",
    color: "#e9c854",
    description:
      "Listen for a tiny crackle in the grass. Its rosy cheeks store electricity.",
    moves: [
      { name: "Quick Attack", type: "Normal", power: 35 },
      { name: "Thunder Shock", type: "Electric", power: 45 },
      { name: "Spark", type: "Electric", power: 55 },
      { name: "Slam", type: "Normal", power: 45 },
    ],
  },
  oddish: {
    id: "oddish",
    number: 43,
    name: "Oddish",
    type: "Grass",
    color: "#718dbc",
    description:
      "It bathes in moonlight and leaves tiny footprints in the morning dew.",
    moves: [
      { name: "Absorb", type: "Grass", power: 35 },
      { name: "Acid", type: "Poison", power: 45 },
      { name: "Mega Drain", type: "Grass", power: 55 },
      { name: "Tackle", type: "Normal", power: 35 },
    ],
  },
  eevee: {
    id: "eevee",
    number: 133,
    name: "Eevee",
    type: "Normal",
    color: "#bf9267",
    description:
      "A rare meadow visitor with soft fur and a world of possibilities ahead.",
    moves: [
      { name: "Tackle", type: "Normal", power: 35 },
      { name: "Quick Attack", type: "Normal", power: 45 },
      { name: "Swift", type: "Normal", power: 55 },
      { name: "Bite", type: "Normal", power: 45 },
    ],
  },
};

export interface Creature {
  uid: string;
  speciesId: SpeciesId;
  level: number;
  hp: number;
  maxHp: number;
  xp: number;
}

export interface Battle {
  enemy: Creature;
  log: string;
  result: null | "won" | "caught" | "fled" | "lost";
  turn: number;
}

export interface GameState {
  version: 1;
  player: {
    x: number;
    y: number;
    facing: "up" | "down" | "left" | "right";
    steps: number;
  };
  party: Creature[];
  collection: SpeciesId[];
  seen: SpeciesId[];
  inventory: { pokeballs: number; potions: number };
  battle: Battle | null;
  stats: { caught: number; won: number };
  badge: boolean;
  notice: string;
}

const START = { x: 15, y: 13 };
const WILD: SpeciesId[] = [
  "pidgey",
  "rattata",
  "caterpie",
  "oddish",
  "pikachu",
  "eevee",
  "charmander",
  "squirtle",
  "bulbasaur",
];
const STRONG_AGAINST: Partial<Record<PokemonType, PokemonType[]>> = {
  Grass: ["Water"],
  Fire: ["Grass", "Bug"],
  Water: ["Fire"],
  Flying: ["Grass", "Bug"],
  Bug: ["Grass"],
  Electric: ["Water", "Flying"],
  Poison: ["Grass"],
};
const WEAK_AGAINST: Partial<Record<PokemonType, PokemonType[]>> = {
  Grass: ["Grass", "Fire", "Flying", "Bug", "Poison"],
  Fire: ["Fire", "Water"],
  Water: ["Water", "Grass"],
  Flying: ["Electric"],
  Bug: ["Fire", "Flying", "Poison"],
  Electric: ["Electric", "Grass"],
  Poison: ["Poison"],
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isSpecies = (value: unknown): value is SpeciesId =>
  typeof value === "string" && Object.hasOwn(SPECIES, value);
const bounded = (
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.floor(value)))
    : fallback;
const uniqueSpecies = (value: unknown): SpeciesId[] =>
  Array.isArray(value) ? [...new Set(value.filter(isSpecies))] : [];
const maxHpFor = (level: number): number => 20 + level * 5;
let nextUid = 0;
const createCreature = (speciesId: SpeciesId, level: number): Creature => ({
  uid: `pokemon-${Date.now().toString(36)}-${++nextUid}`,
  speciesId,
  level,
  hp: maxHpFor(level),
  maxHp: maxHpFor(level),
  xp: 0,
});

function freshState(): GameState {
  return {
    version: 1,
    player: { ...START, facing: "down", steps: 0 },
    party: [createCreature("bulbasaur", 5)],
    collection: ["bulbasaur"],
    seen: ["bulbasaur"],
    inventory: { pokeballs: 12, potions: 4 },
    battle: null,
    stats: { caught: 0, won: 0 },
    badge: false,
    notice: "Your adventure starts here. Find a new friend in the tall grass!",
  };
}

function restoreState(saved: unknown): GameState {
  const fresh = freshState();
  try {
    const data: unknown = typeof saved === "string" ? JSON.parse(saved) : saved;
    if (
      !isRecord(data) ||
      data.version !== 1 ||
      !isRecord(data.player) ||
      !Array.isArray(data.party)
    )
      return fresh;
    const player = { ...data.player };
    if (
      typeof player.x !== "number" ||
      typeof player.y !== "number" ||
      !Number.isInteger(player.x) ||
      !Number.isInteger(player.y) ||
      player.x < 0 ||
      player.x >= 30 ||
      player.y < 0 ||
      player.y >= 20
    )
      return fresh;
    const usedUids = new Set<string>();
    const party: Creature[] = [];
    for (const value of data.party.slice(0, 6)) {
      if (!isRecord(value) || !isSpecies(value.speciesId)) continue;
      const level = bounded(value.level, 5, 1, 50);
      const creature = createCreature(value.speciesId, level);
      if (
        typeof value.uid === "string" &&
        /^[a-zA-Z0-9_-]{1,119}$/.test(value.uid) &&
        !usedUids.has(value.uid)
      )
        creature.uid = value.uid;
      usedUids.add(creature.uid);
      creature.hp = bounded(value.hp, creature.maxHp, 0, creature.maxHp);
      creature.xp = bounded(value.xp, 0, 0, level * 12 - 1);
      party.push(creature);
    }
    if (party.length === 0) return fresh;
    if (party.every((creature) => creature.hp === 0)) {
      party.forEach((creature) => {
        creature.hp = creature.maxHp;
      });
      player.x = START.x;
      player.y = START.y;
    } else if (party[0].hp === 0) {
      const consciousIndex = party.findIndex((creature) => creature.hp > 0);
      [party[0], party[consciousIndex]] = [party[consciousIndex], party[0]];
    }
    const collection = [
      ...new Set([
        ...uniqueSpecies(data.collection),
        ...party.map((creature) => creature.speciesId),
      ]),
    ];
    const seen = [...new Set([...uniqueSpecies(data.seen), ...collection])];
    const inventory = isRecord(data.inventory) ? data.inventory : {};
    const stats = isRecord(data.stats) ? data.stats : {};
    return {
      version: 1,
      player: {
        x: player.x as number,
        y: player.y as number,
        facing:
          player.facing === "up" ||
          player.facing === "left" ||
          player.facing === "right"
            ? player.facing
            : "down",
        steps: bounded(player.steps, 0, 0, 1_000_000),
      },
      party,
      collection,
      seen,
      inventory: {
        pokeballs: bounded(inventory.pokeballs, 12, 0, 99),
        potions: bounded(inventory.potions, 4, 0, 99),
      },
      battle: null,
      stats: {
        caught: bounded(stats.caught, 0, 0, 1_000_000),
        won: bounded(stats.won, 0, 0, 1_000_000),
      },
      badge: collection.length >= 4,
      notice:
        "Welcome back, trainer. Your meadow adventure is right where you left it.",
    };
  } catch {
    return fresh;
  }
}

export class GameEngine {
  public state: GameState;
  private random: () => number;

  constructor(saved?: unknown, random: () => number = Math.random) {
    this.state = restoreState(saved);
    this.random = random;
  }

  private roll(): number {
    const value = this.random();
    return Number.isFinite(value)
      ? Math.max(0, Math.min(0.999999, value))
      : 0.5;
  }

  move(dx: number, dy: number, walkable: boolean, grass: boolean): void {
    if (
      this.state.battle ||
      !Number.isInteger(dx) ||
      !Number.isInteger(dy) ||
      Math.abs(dx) + Math.abs(dy) !== 1
    )
      return;
    const player = this.state.player;
    player.facing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
    const x = player.x + dx;
    const y = player.y + dy;
    if (!walkable || x < 0 || x >= 30 || y < 0 || y >= 20) return;
    player.x = x;
    player.y = y;
    player.steps += 1;
    if (grass && this.roll() < 0.19) this.encounter();
  }

  encounter(): void {
    if (this.state.battle) return;
    const roll = this.roll();
    // Meadow regulars are common; starters and Eevee are special finds.
    const speciesId =
      WILD[
        roll < 0.68
          ? Math.floor(roll / 0.17)
          : roll < 0.82
            ? 4
            : roll < 0.9
              ? 5
              : roll < 0.94
                ? 6
                : roll < 0.98
                  ? 7
                  : 8
      ];
    const level = 2 + Math.floor(this.roll() * 5);
    const enemy = createCreature(speciesId, level);
    if (!this.state.seen.includes(speciesId)) this.state.seen.push(speciesId);
    this.state.battle = {
      enemy,
      result: null,
      turn: 1,
      log: `A wild ${SPECIES[speciesId].name} appeared! Lower its HP to make it easier to catch.`,
    };
    this.state.notice = `A wild ${SPECIES[speciesId].name} appeared!`;
  }

  attack(moveIndex: number): void {
    const battle = this.activeBattle();
    if (!battle) return;
    const partner = this.state.party[0];
    const move = SPECIES[partner.speciesId].moves[moveIndex];
    if (!move) return;
    const { damage, effectiveness } = this.damage(partner, battle.enemy, move);
    battle.enemy.hp = Math.max(0, battle.enemy.hp - damage);
    let message = `${SPECIES[partner.speciesId].name} used ${move.name}! ${damage} damage.`;
    if (effectiveness > 1) message += " Super effective!";
    if (effectiveness < 1) message += " Not very effective.";
    if (battle.enemy.hp === 0) {
      const xp = 18 + battle.enemy.level * 6;
      partner.xp += xp;
      this.state.stats.won += 1;
      this.state.inventory.pokeballs = Math.min(
        99,
        this.state.inventory.pokeballs + 1,
      );
      message += ` You won! +${xp} XP and a Poké Ball.`;
      while (partner.level < 50 && partner.xp >= partner.level * 12) {
        partner.xp -= partner.level * 12;
        partner.level += 1;
        partner.maxHp = maxHpFor(partner.level);
        partner.hp = Math.min(partner.maxHp, partner.hp + 10);
        message += ` ${SPECIES[partner.speciesId].name} grew to Lv. ${partner.level}!`;
      }
      if (partner.level === 50) partner.xp = Math.min(partner.xp, 599);
      battle.result = "won";
      battle.log = message;
      this.state.notice = message;
      return;
    }
    this.enemyTurn(message);
  }

  catchPokemon(): void {
    const battle = this.activeBattle();
    if (!battle) return;
    if (this.state.inventory.pokeballs === 0) {
      battle.log =
        "Your bag is out of Poké Balls. Win battles or visit the Pokémon Lab to restock.";
      return;
    }
    this.state.inventory.pokeballs -= 1;
    const chance = 0.22 + (1 - battle.enemy.hp / battle.enemy.maxHp) * 0.7;
    const name = SPECIES[battle.enemy.speciesId].name;
    if (this.roll() < chance) {
      const creature = { ...battle.enemy };
      const speciesId = creature.speciesId;
      const isNew = !this.state.collection.includes(speciesId);
      if (isNew) this.state.collection.push(speciesId);
      this.state.stats.caught += 1;
      const joinedParty = this.state.party.length < 6;
      if (joinedParty) this.state.party.push(creature);
      let message = `Gotcha! ${name} was caught. ${joinedParty ? "Your new friend joined the team!" : "Your team is full. This friend is safe in your collection."}`;
      if (isNew && this.state.collection.length >= 4 && !this.state.badge) {
        this.state.badge = true;
        message += " You earned the Meadow Explorer badge!";
      }
      battle.result = "caught";
      battle.log = message;
      this.state.notice = message;
      return;
    }
    this.enemyTurn(
      `Oh no! ${name} broke free. Try weakening it a little more.`,
    );
  }

  usePotion(): void {
    if (this.state.battle?.result) return;
    const partner = this.state.party[0];
    if (this.state.inventory.potions === 0) {
      this.tell(
        "No potions left. The Pokémon Lab will heal your team and restock your bag.",
      );
      return;
    }
    if (partner.hp === partner.maxHp) {
      this.tell(
        `${SPECIES[partner.speciesId].name} is already feeling great. Save that potion!`,
      );
      return;
    }
    const healed = Math.min(25, partner.maxHp - partner.hp);
    partner.hp += healed;
    this.state.inventory.potions -= 1;
    const message = `${SPECIES[partner.speciesId].name} recovered ${healed} HP.`;
    if (this.activeBattle()) this.enemyTurn(message);
    else this.tell(message);
  }

  flee(): void {
    const battle = this.activeBattle();
    if (!battle) return;
    battle.result = "fled";
    battle.log =
      "You got away safely. There are more friends waiting in the meadow.";
    this.state.notice = battle.log;
  }

  closeBattle(): void {
    if (this.state.battle?.result) this.state.battle = null;
  }

  heal(): void {
    if (this.state.battle) return;
    this.state.party.forEach((creature) => {
      creature.hp = creature.maxHp;
    });
    this.state.inventory.pokeballs = Math.max(
      6,
      this.state.inventory.pokeballs,
    );
    this.state.inventory.potions = Math.max(2, this.state.inventory.potions);
    this.state.notice =
      "All rested! Your team is healthy, and Professor Fern topped up your bag. Come back anytime.";
  }

  switchPartner(uid: string): void {
    if (this.state.battle?.result) return;
    const index = this.state.party.findIndex(
      (creature) => creature.uid === uid,
    );
    if (index <= 0) return;
    const partner = this.state.party[index];
    if (partner.hp === 0) {
      this.tell(
        `${SPECIES[partner.speciesId].name} needs a rest at the Pokémon Lab first.`,
      );
      return;
    }
    [this.state.party[0], this.state.party[index]] = [
      partner,
      this.state.party[0],
    ];
    const message = `Go, ${SPECIES[partner.speciesId].name}!`;
    if (this.activeBattle()) this.enemyTurn(message);
    else
      this.tell(
        `${SPECIES[partner.speciesId].name} is now leading your adventure.`,
      );
  }

  chooseStarter(id: SpeciesId): void {
    if (
      !["bulbasaur", "charmander", "squirtle"].includes(id) ||
      this.state.battle ||
      this.state.player.steps > 0 ||
      this.state.stats.caught > 0 ||
      this.state.stats.won > 0 ||
      this.state.party.length !== 1
    )
      return;
    this.state.party = [createCreature(id, 5)];
    this.state.collection = [id];
    this.state.seen = [id];
    this.state.notice = `You and ${SPECIES[id].name}, at the beginning of something wonderful.`;
  }

  serialize(): string {
    return JSON.stringify(this.state);
  }

  private activeBattle(): Battle | null {
    return this.state.battle && this.state.battle.result === null
      ? this.state.battle
      : null;
  }

  private tell(message: string): void {
    this.state.notice = message;
    if (this.state.battle) this.state.battle.log = message;
  }

  private damage(
    attacker: Creature,
    defender: Creature,
    move: Move,
  ): { damage: number; effectiveness: number } {
    const defendingType = SPECIES[defender.speciesId].type;
    const effectiveness = STRONG_AGAINST[move.type]?.includes(defendingType)
      ? 1.6
      : WEAK_AGAINST[move.type]?.includes(defendingType)
        ? 0.65
        : 1;
    const sameType = SPECIES[attacker.speciesId].type === move.type ? 1.2 : 1;
    const base =
      (move.power / 8 + attacker.level * 0.7) * effectiveness * sameType;
    return {
      damage: Math.max(2, Math.floor(base * (0.85 + this.roll() * 0.3))),
      effectiveness,
    };
  }

  private enemyTurn(message: string): void {
    const battle = this.activeBattle();
    if (!battle) return;
    const partner = this.state.party[0];
    const enemy = battle.enemy;
    const moves = SPECIES[enemy.speciesId].moves;
    const move = moves[Math.floor(this.roll() * 2)];
    const { damage } = this.damage(enemy, partner, move);
    partner.hp = Math.max(0, partner.hp - damage);
    battle.turn += 1;
    message += ` ${SPECIES[enemy.speciesId].name} used ${move.name} for ${damage} damage.`;
    if (partner.hp === 0) {
      message += ` ${SPECIES[partner.speciesId].name} fainted.`;
      const next = this.state.party.findIndex((creature) => creature.hp > 0);
      if (next >= 0) {
        [this.state.party[0], this.state.party[next]] = [
          this.state.party[next],
          partner,
        ];
        message += ` Go, ${SPECIES[this.state.party[0].speciesId].name}!`;
      } else {
        battle.result = "lost";
        this.state.party.forEach((creature) => {
          creature.hp = creature.maxHp;
        });
        this.state.player.x = START.x;
        this.state.player.y = START.y;
        this.state.inventory.pokeballs = Math.max(
          6,
          this.state.inventory.pokeballs,
        );
        this.state.inventory.potions = Math.max(
          2,
          this.state.inventory.potions,
        );
        message +=
          " Professor Fern brought you home and healed your team. Ready for another try!";
      }
    }
    battle.log = message;
    this.state.notice = message;
  }
}
