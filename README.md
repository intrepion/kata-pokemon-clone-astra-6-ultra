# Pokémon Verdant

A small, playable Pokémon fan adventure for the browser. Explore Pallet Meadow, meet wild Pokémon in the tall grass, build a team, and earn the Meadow Explorer badge. The game includes one explorable map and nine species, with original SVG character art, a canvas world, and a responsive interface.

## Run locally

Use **Node.js 22.12 or newer** and npm. Node.js 24 is used in CI.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The development server listens on `127.0.0.1` by default.

## Play

- Move with **WASD**, **arrow keys**, the **on-screen direction buttons**, or by **clicking or tapping a destination** on the map.
- Press **E**, or tap the interaction prompt, near the lab, Professor Fern, or a trail sign.
- Start with Bulbasaur, or open **View team** before taking your first step to choose Charmander or Squirtle instead.
- Walk through tall grass to meet wild Pokémon. **Explore the grass** guides you toward an encounter.
- Battles are turn based. Choose a move, use a potion, switch your active partner, throw a Poké Ball, or run. Move types affect damage: for example, Water Gun is strong against a wild Charmander.
- Lower a wild Pokémon’s HP before throwing a Poké Ball to improve your chances. Catch three new species to earn the **Meadow Explorer badge**.
- Visit the red-roof lab to heal your team and replenish your supplies. Your active team holds up to six Pokémon; your Pokédex records your discoveries.

The nine species are Bulbasaur, Charmander, Squirtle, Pidgey, Rattata, Caterpie, Pikachu, Oddish, and Eevee.

Progress saves automatically in this browser using local storage. Saves stay on this device and browser; clearing site data removes them. If storage is unavailable, you can still play and the interface reports that saving is unavailable. **How to play → Start a new adventure** provides a confirmed reset.

## Build and verify

```sh
npm test
npm run build
```

The build checks TypeScript and produces the application in `dist/`. Preview that build with:

```sh
npm run preview
```

Run the Playwright browser tests with:

```sh
npx playwright install chromium
npm run test:e2e
```

The GitHub Actions workflow installs dependencies, runs the unit and browser tests, and builds the application on pushes and pull requests.

## Project structure

- `src/game.ts` — game state, combat, encounters, catching, progression, and save restoration.
- `src/world.ts` — map rendering, movement, and world interactions.
- `src/main.ts` — interface, controls, sound, dialogs, and browser persistence.
- `src/style.css` — responsive styling.
- `public/pokemon/` — original hand-authored SVG Pokémon illustrations.

Built with TypeScript, Vite, Vitest, and Playwright. The game runs locally in the browser without a backend or external game assets.

## Fan project

Pokémon Verdant is an unofficial fan project and is not affiliated with or endorsed by Nintendo, Game Freak, Creatures, or The Pokémon Company. Pokémon names, characters, and trademarks belong to their respective owners. The illustrations and interface in this repository were created for this project; no official game sprites or audio are bundled. The repository’s code license is provided in [LICENSE](LICENSE).
