import { describe, expect, it } from "vitest";
import { GameEngine } from "./game";
import {
  INTERACTIONS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  isTallGrass,
  isWalkable,
  nearbyInteraction,
  tileAt,
} from "./world";

type TilePosition = { x: number; y: number };
const key = ({ x, y }: TilePosition) => `${x},${y}`;
const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function reachableFrom(start: TilePosition): Set<string> {
  const queue = [start];
  const reached = new Set([key(start)]);
  for (let index = 0; index < queue.length; index++) {
    for (const [dx, dy] of directions) {
      const next = { x: queue[index].x + dx, y: queue[index].y + dy };
      if (isWalkable(next.x, next.y) && !reached.has(key(next))) {
        reached.add(key(next));
        queue.push(next);
      }
    }
  }
  return reached;
}

describe("Pallet Meadow traversal", () => {
  it("starts the trainer on a safe tile with paths out in every direction", () => {
    const { player } = new GameEngine().state;
    expect(isWalkable(player.x, player.y)).toBe(true);
    expect(isTallGrass(player.x, player.y)).toBe(false);
    for (const [dx, dy] of directions) {
      expect(isWalkable(player.x + dx, player.y + dy)).toBe(true);
    }
  });

  it("allows every traversable tile to be reached from the initial spawn", () => {
    const reached = reachableFrom(new GameEngine().state.player);
    const stranded: TilePosition[] = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
      for (let x = 0; x < WORLD_WIDTH; x++) {
        if (isWalkable(x, y) && !reached.has(key({ x, y })))
          stranded.push({ x, y });
      }
    }
    expect(stranded).toEqual([]);
  });

  it("blocks the complete outer border and all coordinates outside the map", () => {
    for (let x = -1; x <= WORLD_WIDTH; x++) {
      for (const y of [-1, 0, WORLD_HEIGHT - 1, WORLD_HEIGHT]) {
        expect(isWalkable(x, y), `edge at ${x},${y}`).toBe(false);
      }
    }
    for (let y = -1; y <= WORLD_HEIGHT; y++) {
      for (const x of [-1, 0, WORLD_WIDTH - 1, WORLD_WIDTH]) {
        expect(isWalkable(x, y), `edge at ${x},${y}`).toBe(false);
      }
    }
  });

  it("blocks the lab and pond but lets the trainer cross the wooden bridge", () => {
    expect(tileAt(5, 6)).toBe("building");
    expect(isWalkable(5, 6)).toBe(false);
    expect(isWalkable(5, 7)).toBe(true);
    expect(tileAt(23, 9)).toBe("water");
    expect(isWalkable(23, 9)).toBe(false);
    expect(tileAt(23, 11)).toBe("bridge");
    expect(isWalkable(23, 11)).toBe(true);
  });
});

describe("landmarks and encounters", () => {
  it("provides reachable healing, professor, and trail sign interactions", () => {
    const reached = reachableFrom(new GameEngine().state.player);
    expect(INTERACTIONS.map(({ kind }) => kind).sort()).toEqual([
      "heal",
      "professor",
      "sign",
    ]);
    for (const interaction of INTERACTIONS) {
      expect(reached.has(key(interaction)), interaction.kind).toBe(true);
      expect(nearbyInteraction(interaction.x, interaction.y)).toBe(
        interaction.kind,
      );
    }
  });

  it("requires the player to approach a landmark before interacting", () => {
    expect(nearbyInteraction(5, 9)).toBe("heal");
    expect(nearbyInteraction(5, 10)).toBeNull();
    expect(nearbyInteraction(13, 8)).toBe("professor");
    expect(nearbyInteraction(13, 7)).toBeNull();
    expect(nearbyInteraction(11, 14)).toBe("sign");
    expect(nearbyInteraction(11, 15)).toBeNull();
    expect(nearbyInteraction(15, 13)).toBeNull();
  });

  it("places every encounter tile on reachable, walkable grass", () => {
    const reached = reachableFrom(new GameEngine().state.player);
    let encounterTiles = 0;
    for (let y = -1; y <= WORLD_HEIGHT; y++) {
      for (let x = -1; x <= WORLD_WIDTH; x++) {
        if (!isTallGrass(x, y)) continue;
        encounterTiles++;
        expect(isWalkable(x, y), `encounter at ${x},${y}`).toBe(true);
        expect(tileAt(x, y)).toBe("grass");
        expect(reached.has(key({ x, y }))).toBe(true);
      }
    }
    expect(encounterTiles).toBeGreaterThan(0);
  });

  it("uses the world collision and encounter flags when entering tall grass", () => {
    const game = new GameEngine(undefined, () => 0);
    game.state.player.x = 9;
    game.state.player.y = 13;
    game.move(0, 1, isWalkable(9, 14), isTallGrass(9, 14));
    expect(game.state.player).toMatchObject({ x: 9, y: 14 });
    expect(game.state.battle).not.toBeNull();
    const blocked = new GameEngine(undefined, () => 0);
    blocked.state.player.x = 10;
    blocked.state.player.y = 15;
    blocked.move(1, 0, isWalkable(11, 15), isTallGrass(11, 15));
    expect(blocked.state.player).toMatchObject({ x: 10, y: 15 });
    expect(blocked.state.battle).toBeNull();
  });
});
