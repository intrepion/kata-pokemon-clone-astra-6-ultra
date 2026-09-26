export const WORLD_WIDTH = 30;
export const WORLD_HEIGHT = 20;
const TILE = 32;

export type WorldTile =
  | "grass"
  | "path"
  | "water"
  | "tree"
  | "building"
  | "bridge"
  | "flower";
type Position = { x: number; y: number; facing: string };
const map: WorldTile[][] = Array.from({ length: WORLD_HEIGHT }, () =>
  Array<WorldTile>(WORLD_WIDTH).fill("grass"),
);
const fill = (
  x: number,
  y: number,
  width: number,
  height: number,
  tile: WorldTile,
) => {
  for (let row = y; row < y + height; row++) {
    for (let col = x; col < x + width; col++) map[row][col] = tile;
  }
};

// The same tile model powers painting and collision; every visible landmark is reachable.
fill(0, 0, 30, 1, "tree");
fill(0, 19, 30, 1, "tree");
fill(0, 0, 1, 20, "tree");
fill(29, 0, 1, 20, "tree");
fill(1, 1, 28, 1, "tree");
fill(2, 2, 7, 5, "building");
fill(10, 2, 2, 5, "tree");
fill(1, 8, 1, 4, "tree");
fill(1, 14, 1, 5, "tree");
fill(11, 15, 2, 4, "tree");
fill(18, 16, 2, 3, "tree");
fill(27, 2, 2, 3, "tree");
fill(27, 17, 2, 2, "tree");
fill(2, 18, 9, 1, "tree");
fill(20, 18, 7, 1, "tree");
fill(4, 7, 3, 6, "path");
fill(5, 11, 21, 2, "path");
fill(14, 9, 3, 10, "path");
fill(14, 7, 3, 3, "path");
fill(13, 7, 5, 2, "path");
fill(21, 7, 7, 8, "water");
fill(22, 6, 5, 1, "water");
fill(22, 15, 5, 1, "water");
fill(20, 8, 1, 6, "water");
fill(28, 9, 1, 4, "water");
fill(20, 11, 9, 2, "bridge");
fill(8, 8, 3, 2, "flower");
fill(17, 13, 2, 2, "flower");
fill(24, 3, 2, 2, "flower");
fill(3, 14, 7, 4, "grass");

export const INTERACTIONS = [
  { x: 5, y: 7, kind: "heal" as const },
  { x: 13, y: 10, kind: "professor" as const },
  { x: 11, y: 12, kind: "sign" as const },
];

export function tileAt(x: number, y: number): WorldTile {
  return map[Math.floor(y)]?.[Math.floor(x)] ?? "tree";
}

export function isWalkable(x: number, y: number): boolean {
  const tile = tileAt(x, y);
  return tile !== "tree" && tile !== "water" && tile !== "building";
}

export function isTallGrass(x: number, y: number): boolean {
  return (
    tileAt(x, y) === "grass" &&
    ((x >= 3 && x <= 9 && y >= 14 && y <= 17) ||
      (x >= 17 && x <= 21 && y >= 3 && y <= 5) ||
      (x >= 18 && x <= 19 && y === 6))
  );
}

export function nearbyInteraction(
  x: number,
  y: number,
): "heal" | "sign" | "professor" | null {
  let closest: (typeof INTERACTIONS)[number] | undefined;
  let distance = 3;
  for (const interaction of INTERACTIONS) {
    const nextDistance =
      Math.abs(x - interaction.x) + Math.abs(y - interaction.y);
    if (nextDistance < distance) {
      distance = nextDistance;
      closest = interaction;
    }
  }
  return closest?.kind ?? null;
}

const C = {
  grass: "#8dc66b",
  grassLight: "#a5d77a",
  grassDark: "#78b95d",
  path: "#e8d49b",
  pathLight: "#f2dfa9",
  pathEdge: "#b99f6a",
  treeDark: "#28594a",
  treeShade: "#387751",
  treeMid: "#4d9759",
  treeLight: "#6bb566",
  treeTop: "#8ac570",
  water: "#65bdb9",
};
function seed(x: number, y: number, n = 0) {
  return (
    ((((x * 73856093) ^ (y * 19349663) ^ (n * 83492791)) >>> 0) % 997) / 997
  );
}
function rect(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}
function poly(
  ctx: CanvasRenderingContext2D,
  color: string,
  points: number[][],
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}
function shadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  rect(ctx, "#32564726", x + 4, y, w - 8, h);
  rect(ctx, "#32564726", x, y + 3, w, h - 6);
}

function ground(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE;
  const py = y * TILE;
  rect(ctx, seed(x, y) > 0.52 ? C.grass : "#90c970", px, py, TILE, TILE);
  for (let n = 0; n < 4; n++) {
    const dx = Math.floor(seed(x, y, n + 1) * 27) + 2;
    const dy = Math.floor(seed(y, x, n + 12) * 27) + 2;
    rect(ctx, n % 2 ? C.grassLight : "#7fbd64", px + dx, py + dy, 3, 2);
  }
  if (seed(x, y, 6) > 0.84) {
    rect(ctx, "#6eac58", px + 20, py + 21, 2, 4);
    rect(ctx, "#6eac58", px + 17, py + 19, 2, 4);
    rect(ctx, "#accf79", px + 18, py + 23, 5, 2);
  }
}

function path(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE;
  const py = y * TILE;
  const connected = (dx: number, dy: number) =>
    ["path", "bridge", "building"].includes(tileAt(x + dx, y + dy));
  rect(ctx, C.path, px, py, TILE, TILE);
  if (!connected(0, -1)) {
    rect(ctx, "#aac074", px, py, TILE, 3);
    rect(ctx, C.pathEdge, px + 3, py + 3, TILE - 6, 2);
    rect(ctx, C.pathLight, px + 3, py + 5, TILE - 6, 2);
  }
  if (!connected(0, 1)) {
    rect(ctx, "#9dbb6d", px, py + 29, TILE, 3);
    rect(ctx, "#cfb780", px + 3, py + 27, TILE - 6, 2);
  }
  if (!connected(-1, 0)) {
    rect(ctx, "#a0bb71", px, py, 3, TILE);
    rect(ctx, C.pathEdge, px + 3, py + 3, 2, TILE - 6);
  }
  if (!connected(1, 0)) {
    rect(ctx, "#aac074", px + 29, py, 3, TILE);
    rect(ctx, "#cfb780", px + 27, py + 3, 2, TILE - 6);
  }
  for (let i = 0; i < 4; i++) {
    const dx = Math.floor(seed(x, y, i + 9) * 20) + 6;
    const dy = Math.floor(seed(y, x, i + 40) * 20) + 6;
    rect(ctx, i % 2 ? "#d5bd86" : "#f3e2b2", px + dx, py + dy, 3 + (i % 2), 2);
  }
}

function water(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  const px = x * TILE;
  const py = y * TILE;
  rect(ctx, (x + y) % 3 === 0 ? "#63b9b5" : C.water, px, py, TILE, TILE);
  const aquatic = (dx: number, dy: number) =>
    ["water", "bridge"].includes(tileAt(x + dx, y + dy));
  if (!aquatic(0, -1)) {
    rect(ctx, "#75a46a", px, py, TILE, 4);
    rect(ctx, "#cae6b0", px, py + 4, TILE, 3);
    rect(ctx, "#9ad5c0", px, py + 7, TILE, 3);
  }
  if (!aquatic(0, 1)) {
    rect(ctx, "#558f68", px, py + 28, TILE, 4);
    rect(ctx, "#9ed7b7", px, py + 25, TILE, 3);
  }
  if (!aquatic(-1, 0)) {
    rect(ctx, "#72a167", px, py, 4, TILE);
    rect(ctx, "#b2dfb5", px + 4, py, 3, TILE);
    rect(ctx, "#8ccfc0", px + 7, py, 2, TILE);
  }
  if (!aquatic(1, 0)) {
    rect(ctx, "#568f69", px + 28, py, 4, TILE);
    rect(ctx, "#9ad5b6", px + 25, py, 3, TILE);
  }
  const phase = (Math.floor(time / 650) + x + y) % 4;
  if (seed(x, y, 5) > 0.45) {
    const wx = px + 10 + phase;
    rect(ctx, "#86d0c5", wx, py + 16, 10, 2);
    rect(ctx, "#a2dfd0", wx + 3, py + 14, 5, 2);
  }
  if (phase === 0 && seed(x, y, 6) > 0.7) {
    rect(ctx, "#c8ece0", px + 17, py + 8, 2, 6);
    rect(ctx, "#c8ece0", px + 15, py + 10, 6, 2);
  }
}

function bridge(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE;
  const py = y * TILE;
  rect(ctx, "#5b8e7a", px, py, TILE, TILE);
  rect(ctx, "#755f43", px, py + 3, TILE, 29);
  for (let i = 0; i < 4; i++) {
    rect(ctx, "#c8a06a", px + i * 8 + 1, py + 3, 6, 28);
    rect(ctx, "#e0bb80", px + i * 8 + 1, py + 3, 2, 27);
    rect(ctx, "#ac8457", px + i * 8 + 4, py + 10, 2, 11);
  }
  if (y === 11) {
    rect(ctx, "#6e5f44", px, py - 4, TILE, 5);
    rect(ctx, "#e6c393", px, py - 6, TILE, 4);
    if (x % 2 === 0) {
      rect(ctx, "#886b45", px + 3, py - 10, 7, 20);
      rect(ctx, "#e8c598", px + 3, py - 12, 7, 5);
    }
  }
  if (y === 12) {
    rect(ctx, "#65573e", px, py + 28, TILE, 5);
    rect(ctx, "#dab382", px, py + 26, TILE, 4);
    if (x % 2 === 0) {
      rect(ctx, "#896f4a", px + 3, py + 20, 7, 17);
      rect(ctx, "#edcb98", px + 3, py + 18, 7, 5);
    }
  }
}

function tree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const px = x * TILE;
  const py = y * TILE;
  const variant = seed(x, y, 8) > 0.6;
  shadow(ctx, px - 5, py + 22, 47, 15);
  rect(ctx, "#796747", px + 12, py + 17, 12, 16);
  rect(ctx, "#a78a55", px + 15, py + 19, 5, 12);
  // Stepped silhouettes retain a pixel-art edge at every canvas size.
  poly(ctx, C.treeDark, [
    [px + 8, py - 29],
    [px + 26, py - 29],
    [px + 26, py - 25],
    [px + 34, py - 25],
    [px + 34, py - 17],
    [px + 40, py - 17],
    [px + 40, py + 3],
    [px + 36, py + 3],
    [px + 36, py + 17],
    [px + 29, py + 17],
    [px + 29, py + 23],
    [px + 5, py + 23],
    [px + 5, py + 18],
    [px - 4, py + 18],
    [px - 4, py + 8],
    [px - 8, py + 8],
    [px - 8, py - 12],
    [px - 3, py - 12],
    [px - 3, py - 22],
    [px + 8, py - 22],
  ]);
  poly(ctx, C.treeShade, [
    [px + 7, py - 24],
    [px + 26, py - 24],
    [px + 26, py - 19],
    [px + 34, py - 19],
    [px + 34, py - 10],
    [px + 36, py - 10],
    [px + 36, py + 6],
    [px + 30, py + 6],
    [px + 30, py + 15],
    [px + 7, py + 15],
    [px + 7, py + 11],
    [px - 3, py + 11],
    [px - 3, py - 9],
    [px + 2, py - 9],
    [px + 2, py - 18],
    [px + 7, py - 18],
  ]);
  poly(ctx, variant ? "#579c59" : C.treeMid, [
    [px + 8, py - 25],
    [px + 24, py - 25],
    [px + 24, py - 20],
    [px + 31, py - 20],
    [px + 31, py - 6],
    [px + 27, py - 6],
    [px + 27, py + 5],
    [px + 18, py + 5],
    [px + 18, py + 10],
    [px + 5, py + 10],
    [px + 5, py + 5],
    [px - 1, py + 5],
    [px - 1, py - 8],
    [px + 4, py - 8],
    [px + 4, py - 19],
    [px + 8, py - 19],
  ]);
  rect(ctx, C.treeLight, px + 8, py - 20, 13, 12);
  rect(ctx, C.treeLight, px + 4, py - 13, 21, 8);
  rect(ctx, C.treeTop, px + 11, py - 20, 8, 4);
  rect(ctx, C.treeTop, px + 7, py - 15, 5, 4);
  rect(ctx, "#6aad60", px + 1, py - 3, 9, 5);
  rect(ctx, "#80bb67", px + 5, py - 4, 6, 3);
  rect(ctx, "#559954", px + 18, py + 7, 7, 4);
  rect(ctx, "#74b363", px + 28, py - 9, 5, 5);
}

function tallGrass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  frontOnly = false,
) {
  const px = x * TILE;
  const py = y * TILE;
  if (!frontOnly) rect(ctx, "#77ae57", px + 1, py + 1, 30, 30);
  const rows = frontOnly ? [24] : [7, 16, 25];
  for (const row of rows) {
    for (let i = 0; i < 4; i++) {
      const dx = px + 3 + i * 8 + (row === 16 ? 3 : 0);
      const dy = py + row;
      rect(ctx, "#4f9051", dx, dy - 3, 2, 7);
      rect(ctx, "#4f9051", dx + 4, dy - 5, 2, 9);
      rect(ctx, "#69a951", dx + 2, dy, 2, 5);
      rect(ctx, "#afce73", dx, dy - 4, 2, 3);
      rect(ctx, "#98c668", dx + 4, dy - 6, 2, 4);
    }
  }
}

function flowers(ctx: CanvasRenderingContext2D, x: number, y: number) {
  for (let n = 0; n < 5; n++) {
    const px = x * TILE + 5 + Math.floor(seed(x, y, n + 2) * 22);
    const py = y * TILE + 5 + Math.floor(seed(y, x, n + 10) * 22);
    const color = n % 3 === 0 ? "#eaa39b" : n % 3 === 1 ? "#f4e6b7" : "#edd078";
    rect(ctx, "#5c9656", px, py + 3, 2, 6);
    rect(ctx, "#69a257", px - 3, py + 5, 5, 2);
    rect(ctx, color, px - 3, py - 1, 8, 4);
    rect(ctx, color, px - 1, py - 3, 4, 8);
    rect(ctx, "#f9f0bc", px, py, 2, 2);
  }
}

function house(ctx: CanvasRenderingContext2D) {
  const x = 64;
  const y = 64;
  shadow(ctx, x + 8, y + 139, 234, 30);
  rect(ctx, "#766748", x, y + 60, 224, 94);
  rect(ctx, "#d9cba0", x + 6, y + 59, 212, 88);
  rect(ctx, "#f5e5b5", x + 10, y + 63, 204, 74);
  rect(ctx, "#ead8a6", x + 10, y + 81, 204, 4);
  rect(ctx, "#ead8a6", x + 10, y + 113, 204, 4);
  rect(ctx, "#baa87a", x + 2, y + 136, 220, 13);
  for (let i = 0; i < 11; i++)
    rect(ctx, "#d7c494", x + i * 20 + 4, y + 139, 17, 6);
  // Stone chimney sits behind the warm tiled roof.
  rect(ctx, "#766b59", x + 160, y - 19, 26, 53);
  rect(ctx, "#c9bd9c", x + 162, y - 17, 20, 41);
  rect(ctx, "#e5d8b0", x + 157, y - 21, 32, 8);
  rect(ctx, "#9d9075", x + 162, y - 4, 20, 3);
  rect(ctx, "#9d9075", x + 162, y + 11, 20, 3);
  poly(ctx, "#765845", [
    [x - 11, y + 60],
    [x + 22, y - 9],
    [x + 201, y - 9],
    [x + 235, y + 60],
    [x + 235, y + 69],
    [x - 11, y + 69],
  ]);
  poly(ctx, "#bf7355", [
    [x - 5, y + 57],
    [x + 26, y - 3],
    [x + 197, y - 3],
    [x + 228, y + 57],
  ]);
  for (let row = 0; row < 5; row++) {
    const inset = 28 - row * 6;
    const rowY = y + row * 12;
    rect(
      ctx,
      row % 2 === 0 ? "#d99064" : "#cd805c",
      x + inset,
      rowY,
      224 - inset * 2,
      8,
    );
    rect(ctx, "#a7634e", x + inset - 3, rowY + 9, 230 - inset * 2, 3);
    for (let col = 0; col < 10; col++) {
      const tileX = x + 29 + col * 20 + (row % 2 ? 10 : 0);
      if (tileX > x + inset && tileX < x + 219 - inset)
        rect(ctx, "#edaa75", tileX, rowY, 2, 8);
    }
  }
  rect(ctx, "#edbd85", x + 21, y - 6, 182, 5);
  rect(ctx, "#e1a471", x - 7, y + 56, 238, 5);
  rect(ctx, "#946544", x - 9, y + 63, 242, 7);
  for (const wx of [x + 24, x + 148]) {
    rect(ctx, "#867956", wx, y + 84, 45, 38);
    rect(ctx, "#ffefc7", wx + 3, y + 87, 39, 32);
    rect(ctx, "#589b9d", wx + 6, y + 90, 33, 26);
    rect(ctx, "#a7d6c9", wx + 8, y + 92, 15, 11);
    rect(ctx, "#7dc0ba", wx + 23, y + 103, 14, 11);
    rect(ctx, "#f4e7bd", wx + 20, y + 89, 4, 28);
    rect(ctx, "#f4e7bd", wx + 5, y + 102, 35, 4);
    rect(ctx, "#937552", wx - 3, y + 121, 51, 5);
    rect(ctx, "#cc9262", wx - 1, y + 126, 47, 9);
    for (let i = 0; i < 6; i++) {
      rect(ctx, "#558e53", wx + 3 + i * 7, y + 121, 6, 7);
      rect(ctx, i % 2 ? "#f6d888" : "#e8a597", wx + 4 + i * 7, y + 118, 4, 5);
    }
  }
  rect(ctx, "#806d4e", x + 89, y + 90, 41, 60);
  rect(ctx, "#b78a5e", x + 93, y + 94, 33, 53);
  rect(ctx, "#668e82", x + 97, y + 98, 25, 24);
  rect(ctx, "#a3c6a8", x + 100, y + 101, 19, 3);
  rect(ctx, "#e7c47f", x + 117, y + 130, 4, 4);
  rect(ctx, "#b6ad86", x + 84, y + 151, 51, 6);
  rect(ctx, "#e7dbb0", x + 82, y + 157, 55, 7);
  // A small capsule crest above the door identifies the field lab without text.
  rect(ctx, "#8c7352", x + 97, y + 72, 23, 15);
  rect(ctx, "#f0dfac", x + 99, y + 74, 19, 11);
  rect(ctx, "#c4775b", x + 104, y + 75, 9, 4);
  rect(ctx, "#f8f0cc", x + 104, y + 80, 9, 4);
  rect(ctx, "#6b795a", x + 103, y + 79, 11, 2);
}

function fence(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
) {
  rect(ctx, "#6c81504d", x + 1, y + 22, width, 5);
  rect(ctx, "#ab9669", x, y + 7, width, 5);
  rect(ctx, "#dec998", x, y + 5, width, 4);
  rect(ctx, "#a78e61", x, y + 17, width, 4);
  for (let i = 0; i < width; i += 25) {
    rect(ctx, "#a58c61", x + i, y + 1, 7, 23);
    rect(ctx, "#eedcb0", x + i, y, 5, 21);
    rect(ctx, "#f5e7c4", x + i + 1, y - 2, 3, 2);
  }
}

function rock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  small = false,
) {
  const scale = small ? 0.65 : 1;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  shadow(ctx, -2, 18, 36, 9);
  poly(ctx, "#738b77", [
    [0, 12],
    [5, 4],
    [14, 0],
    [23, 3],
    [30, 11],
    [30, 21],
    [5, 24],
    [0, 20],
  ]);
  poly(ctx, "#a8b6a0", [
    [3, 11],
    [8, 5],
    [15, 3],
    [23, 6],
    [26, 12],
    [19, 18],
    [5, 18],
  ]);
  rect(ctx, "#cbd0af", 10, 6, 11, 4);
  rect(ctx, "#7e9b7d", 19, 17, 8, 4);
  ctx.restore();
}

function reeds(ctx: CanvasRenderingContext2D, x: number, y: number) {
  for (let i = 0; i < 5; i++) {
    rect(ctx, "#558d60", x + i * 4, y - 11 - (i % 3) * 3, 2, 18 + (i % 3) * 3);
    rect(ctx, "#a6c97e", x + i * 4 - 2, y - 10 - (i % 3) * 3, 2, 10);
    if (i % 2) rect(ctx, "#9d8054", x + i * 4, y - 15 - (i % 3) * 3, 3, 7);
  }
}

function duck(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  time: number,
) {
  const bob = Math.floor(time / 700) % 2;
  rect(ctx, "#92d3c3", x - 4, y + 12, 28, 2);
  rect(ctx, "#b8e6d1", x - 8, y + 16, 13, 2);
  rect(ctx, "#e9e6b9", x, y + 2 + bob, 19, 10);
  rect(ctx, "#fbf1d0", x + 5, y + bob, 12, 10);
  rect(ctx, "#fbf1d0", x + 15, y - 5 + bob, 9, 10);
  rect(ctx, "#e9b668", x + 24, y - 1 + bob, 6, 3);
  rect(ctx, "#586c53", x + 21, y - 3 + bob, 2, 2);
  rect(ctx, "#d6cd9f", x + 4, y + 6 + bob, 10, 3);
}

function sign(ctx: CanvasRenderingContext2D, x: number, y: number) {
  shadow(ctx, x - 2, y + 23, 30, 9);
  rect(ctx, "#8c7751", x + 10, y + 9, 7, 21);
  rect(ctx, "#665d41", x - 3, y - 1, 33, 21);
  rect(ctx, "#dfc18a", x - 1, y + 1, 29, 16);
  rect(ctx, "#f0d9a6", x + 1, y + 3, 25, 3);
  rect(ctx, "#917a51", x + 5, y + 8, 14, 2);
  rect(ctx, "#a1895b", x + 5, y + 12, 18, 2);
}

function professor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  shadow(ctx, x + 4, y + 23, 25, 10);
  rect(ctx, "#4a6660", x + 8, y + 21, 6, 10);
  rect(ctx, "#4a6660", x + 19, y + 21, 6, 10);
  rect(ctx, "#3d554b", x + 6, y + 29, 9, 4);
  rect(ctx, "#3d554b", x + 19, y + 29, 9, 4);
  rect(ctx, "#d6dcba", x + 5, y + 7, 23, 18);
  rect(ctx, "#f2f1d8", x + 8, y + 5, 17, 22);
  rect(ctx, "#6e9881", x + 14, y + 8, 5, 13);
  rect(ctx, "#cfaf83", x + 3, y + 17, 5, 6);
  rect(ctx, "#cfaf83", x + 26, y + 17, 5, 6);
  rect(ctx, "#e6cda2", x + 10, y - 8, 14, 16);
  rect(ctx, "#8d947f", x + 7, y - 9, 20, 7);
  rect(ctx, "#e4e5c9", x + 10, y - 12, 14, 7);
  rect(ctx, "#e4e5c9", x + 7, y - 7, 5, 8);
  rect(ctx, "#e4e5c9", x + 23, y - 7, 5, 8);
  rect(ctx, "#4a6659", x + 12, y, 4, 3);
  rect(ctx, "#4a6659", x + 20, y, 4, 3);
  rect(ctx, "#769080", x + 16, y + 1, 4, 1);
}

function trainer(
  ctx: CanvasRenderingContext2D,
  player: Position,
  time: number,
) {
  const x = Math.round(player.x * TILE);
  const y = Math.round(player.y * TILE);
  const back = player.facing === "up";
  const side = player.facing === "left" || player.facing === "right";
  const walking = !Number.isInteger(player.x) || !Number.isInteger(player.y);
  const stride = walking ? (Math.floor(time / 110) % 2 ? 2 : -2) : 0;
  shadow(ctx, x + 3, y + 24, 28, 9);
  rect(ctx, "#344b56", x + 9, y + 21, 6, 10 + stride);
  rect(ctx, "#344b56", x + 20, y + 21, 6, 10 - stride);
  rect(ctx, "#f2e5c1", x + 7, y + 29 + stride, 9, 4);
  rect(ctx, "#f2e5c1", x + 20, y + 29 - stride, 9, 4);
  rect(ctx, "#344b56", x + 6, y + 32 + stride, 10, 2);
  rect(ctx, "#344b56", x + 20, y + 32 - stride, 10, 2);
  rect(ctx, "#31585a", x + 7, y + 7, 22, 17);
  rect(ctx, "#428284", x + 10, y + 7, 15, 16);
  rect(ctx, "#6eaca0", x + 10, y + 7, 4, 15);
  rect(ctx, "#edd09e", x + 4, y + 14, 5, 8);
  rect(ctx, "#edd09e", x + 27, y + 14, 5, 8);
  if (back) {
    rect(ctx, "#705c45", x + 11, y + 9, 14, 15);
    rect(ctx, "#d6ae6e", x + 12, y + 10, 12, 12);
    rect(ctx, "#ecd098", x + 14, y + 11, 8, 4);
    rect(ctx, "#9a7e53", x + 14, y + 19, 8, 2);
  } else {
    rect(ctx, "#d7b275", x + 7, y + 8, 3, 14);
    rect(ctx, "#d7b275", x + 26, y + 8, 3, 14);
    rect(ctx, "#f3e6bf", x + 16, y + 7, 4, 5);
  }
  rect(ctx, "#705b49", x + 9, y - 7, 19, 16);
  if (!back) {
    rect(ctx, "#eed09e", x + 10, y - 4, 17, 12);
    rect(ctx, "#d8af80", x + 10, y + 5, 17, 3);
    if (side) {
      rect(
        ctx,
        "#374f4b",
        x + (player.facing === "left" ? 11 : 24),
        y + 1,
        2,
        3,
      );
      rect(
        ctx,
        "#eed09e",
        x + (player.facing === "left" ? 7 : 27),
        y + 2,
        3,
        4,
      );
    } else {
      rect(ctx, "#374f4b", x + 13, y + 1, 2, 3);
      rect(ctx, "#374f4b", x + 23, y + 1, 2, 3);
    }
  }
  rect(ctx, "#854f41", x + 7, y - 11, 23, 9);
  rect(ctx, "#c46d53", x + 10, y - 15, 17, 11);
  rect(ctx, "#e38e68", x + 10, y - 15, 13, 5);
  rect(ctx, "#f4e9bb", x + 17, y - 13, 6, 6);
  rect(
    ctx,
    "#d47b58",
    x + (player.facing === "left" ? 3 : player.facing === "right" ? 13 : 7),
    y - 5,
    25,
    4,
  );
  if (back) rect(ctx, "#e7cea0", x + 14, y - 4, 10, 3);
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  player: Position,
  time: number,
): void {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, WORLD_WIDTH * TILE, WORLD_HEIGHT * TILE);
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      ground(ctx, x, y);
      const tile = tileAt(x, y);
      if (tile === "path") path(ctx, x, y);
      if (tile === "water" || tile === "bridge") water(ctx, x, y, time);
      if (tile === "bridge") bridge(ctx, x, y);
      if (tile === "flower") flowers(ctx, x, y);
      if (isTallGrass(x, y)) tallGrass(ctx, x, y);
    }
  }
  // Small environmental details make the clearing feel lived in.
  fence(ctx, 66, 422, 59);
  fence(ctx, 227, 422, 94);
  fence(ctx, 570, 66, 177);
  reeds(ctx, 686, 271);
  reeds(ctx, 869, 276);
  reeds(ctx, 758, 483);
  duck(ctx, 786, 267, time);
  duck(ctx, 832, 439, time + 400);
  // Lily pads and lily flowers.
  rect(ctx, "#4c967c", 729, 309, 24, 10);
  rect(ctx, "#69b795", 731, 307, 20, 9);
  rect(ctx, "#65bdb9", 742, 306, 3, 7);
  rect(ctx, "#f2ceba", 737, 303, 7, 5);
  rect(ctx, "#f7e6bd", 739, 301, 3, 7);
  rect(ctx, "#4f9c80", 858, 466, 18, 8);
  rect(ctx, "#78bf97", 861, 464, 13, 7);
  rock(ctx, 606, 221);
  rock(ctx, 609, 251, true);
  rock(ctx, 88, 296, true);
  rock(ctx, 655, 536);
  // Landmark, trees, and characters paint in depth order.
  const objects: { depth: number; draw: () => void }[] = [
    { depth: 7 * TILE, draw: () => house(ctx) },
    { depth: 11 * TILE, draw: () => professor(ctx, 13 * TILE, 10 * TILE) },
    { depth: 13 * TILE, draw: () => sign(ctx, 11 * TILE + 3, 12 * TILE) },
    { depth: (player.y + 1) * TILE, draw: () => trainer(ctx, player, time) },
  ];
  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      if (tileAt(x, y) === "tree")
        objects.push({ depth: (y + 1) * TILE, draw: () => tree(ctx, x, y) });
    }
  }
  objects.sort((a, b) => a.depth - b.depth).forEach((object) => object.draw());
  if (isTallGrass(Math.round(player.x), Math.round(player.y))) {
    tallGrass(ctx, Math.round(player.x), Math.round(player.y), true);
  }
  ctx.restore();
}
