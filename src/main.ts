import "./style.css";
import { GameEngine, SPECIES, type Creature, type SpeciesId } from "./game";
import {
  drawWorld,
  isWalkable,
  isTallGrass,
  nearbyInteraction,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from "./world";
import { icon, ball } from "./icons";

const SAVE_KEY = "pokemon-verdant-v1";
let saved: string | undefined;
try {
  saved = localStorage.getItem(SAVE_KEY) ?? undefined;
} catch {
  /* Gameplay also works without storage. */
}
let game = new GameEngine(saved);
if (!isWalkable(game.state.player.x, game.state.player.y)) {
  game.state.player.x = 15;
  game.state.player.y = 13;
}
let modal: "pokedex" | "bag" | "party" | "help" | "reset" | null = null;
let dexFilter: "all" | "caught" = "all";
let sound = false;
let storageAvailable = true;
let path: { x: number; y: number }[] = [];
let searchOnArrival = false;
let lastStep = 0;
let lastFrame = 0;
let previousFocus: HTMLElement | null = null;
let audioContext: AudioContext | null = null;
const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="#" aria-label="Pokémon Verdant home"><span class="brand-ball">${ball(34)}</span><span><strong>pokémon<span class="brand-dot">.</span></strong><small>VERDANT EDITION</small></span></a>
    <nav class="main-nav" aria-label="Main navigation">
      <button class="nav-button active" data-action="explore" aria-label="Explore">${icon("compass", 19)}<span>Explore</span></button>
      <button class="nav-button" data-action="pokedex" aria-label="Pokédex">${icon("book", 19)}<span>Pokédex</span></button>
      <button class="nav-button" data-action="bag" aria-label="Backpack">${icon("bag", 19)}<span>Backpack</span></button>
    </nav>
    <button class="trainer-chip" data-action="party"><span class="avatar"><img src="/trainer.svg" alt="" /></span><span><strong>Hey, Trainer</strong><small>Let’s make some memories.</small></span>${icon("arrow", 16)}</button>
  </header>
  <main class="page-shell">
    <section class="welcome"><div><p class="eyebrow"><span class="tiny-spark">✦</span> A NEW DAY. A NEW DISCOVERY.</p><h1>Small steps. Big adventures<span>.</span></h1><p class="intro">Take the long way home. You never know who you’ll meet.</p></div><div class="save-status" id="save-status">${icon("check", 15)}<span>Adventure saved</span><span class="save-dot"></span></div></section>
    <div class="adventure-layout">
      <section class="game-card" aria-label="Route 01 exploration">
        <div class="location-bar"><div class="location-title"><span class="location-icon">${icon("pin", 20)}</span><div><h2>Route 01 <span class="location-tag">KANTO</span></h2><p>Pallet Meadow <span>·</span> Where it all begins</p></div></div><div class="weather">${icon("sun", 19)}<span>A beautiful day</span></div></div>
        <div class="game-viewport" id="game-viewport">
          <canvas id="world" width="960" height="640" tabindex="0" role="application" aria-label="Route 01 map. Use arrow keys or W A S D to walk. Press E to interact. Walk through tall grass to encounter Pokémon."></canvas>
          <div class="map-label"><span class="live-dot"></span> THE GREAT OUTDOORS</div>
          <div class="map-tools"><button class="map-icon" data-action="sound" id="sound-button" aria-label="Enable sound" title="Enable sound">${icon("mute", 18)}</button><button class="map-icon" data-action="fullscreen" aria-label="Expand game" title="Expand game">${icon("expand", 18)}</button></div>
          <div class="map-coordinate" id="map-coordinate">${icon("compass", 17)}<span>15° N &nbsp; 13° E</span></div>
          <div id="interaction-hint"></div>
          <div class="dpad" aria-label="Movement controls"><button data-direction="up" aria-label="Move up">↑</button><button data-direction="left" aria-label="Move left">←</button><span>${ball(18)}</span><button data-direction="right" aria-label="Move right">→</button><button data-direction="down" aria-label="Move down">↓</button></div>
          <div id="battle-root"></div>
        </div>
        <div class="adventure-message"><div class="message-art">${icon("leaf", 25)}</div><div class="message-copy"><strong id="notice-title">A little curiosity goes a long way.</strong><p id="notice" role="status" aria-live="polite"></p></div><button class="primary-button search-button" data-action="search">Explore the grass ${icon("arrow", 17)}</button></div>
        <div class="control-strip"><span>${icon("keyboard", 16)}<span><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrow keys to move</span></span><span><kbd>E</kbd> interact</span><span class="click-hint">Click the map to wander</span><button data-action="help" class="text-button">How to play ${icon("help", 15)}</button></div>
      </section>
      <aside class="sidebar">
        <section class="party-card panel"><div class="panel-heading"><h2>Your little crew</h2><button class="text-button" data-action="party">View team ${icon("arrow", 15)}</button></div><p class="panel-subtitle">Good company makes a great adventure.</p><div id="party-list"></div><button class="team-add" data-action="search"><span>+</span> A new friend is out there</button><div class="party-footer">${icon("heart", 14)}<span>Visit the red-roof lab to heal your team.</span></div></section>
        <section class="field-card panel"><div class="panel-heading"><h2>${icon("book", 18)} Field notes</h2><span class="tiny-tag">01</span></div><div class="quest-heading"><span class="quest-icon">${icon("flag", 21)}</span><div><p>YOUR FIRST ADVENTURE</p><h3>A growing circle</h3></div></div><p class="quest-description">There’s a whole world of friends in the tall grass. Catch 3 new Pokémon species.</p><div class="quest-progress"><div id="quest-progress-bar"></div></div><div class="quest-caption"><span id="quest-caption">0 of 3 new friends</span><span id="quest-percent">0%</span></div><div class="reward"><span class="reward-icon">${icon("trophy", 21)}</span><div><small>A LITTLE SOMETHING TO EARN</small><strong>Meadow Explorer badge</strong></div><div id="badge-status">${icon("leaf", 18)}</div></div></section>
        <section class="discovery-card"><span class="discovery-leaf">${icon("leaf", 60)}</span><p>STOP & SMELL THE ODDISH</p><h3>No rush.<br/>Just a little wonder.</h3><span>The best stories start with<br/>“what’s over there?”</span><button class="text-button" data-action="pokedex">Meet the locals ${icon("arrow", 16)}</button></section>
      </aside>
    </div>
    <footer class="page-footer"><span><span class="footer-dot"></span> Made for the joy of the journey.</span><span>A fan-made adventure <span class="footer-divider">/</span> Progress saved on this device <button data-action="help" aria-label="Help and game information">${icon("help", 15)}</button></span></footer>
  </main>
  <div id="modal-root"></div>
  <div class="toast" id="toast" role="status"></div>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#world")!;
const ctx = canvas.getContext("2d")!;
ctx.imageSmoothingEnabled = false;
const speciesImage = (id: SpeciesId, className = "", alt = SPECIES[id].name) =>
  `<img class="pokemon-art ${className}" src="/pokemon/${id}.svg" alt="${alt}" draggable="false" />`;
const typeTag = (type: string) =>
  `<span class="type-tag type-${type.toLowerCase()}">${type}</span>`;
const hpPercent = (creature: Creature) =>
  Math.max(0, (creature.hp / creature.maxHp) * 100);
const hpBar = (creature: Creature) =>
  `<div class="hp-track"><span class="${hpPercent(creature) < 25 ? "critical" : hpPercent(creature) < 50 ? "low" : ""}" style="width:${hpPercent(creature)}%"></span></div>`;
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

function playNote(frequency = 520, duration = 0.09) {
  if (!sound) return;
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === "suspended") void audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + duration,
    );
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    sound = false;
  }
}

let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const el = document.querySelector<HTMLDivElement>("#toast")!;
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 3600);
}

function save() {
  try {
    localStorage.setItem(SAVE_KEY, game.serialize());
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  document.querySelector("#save-status")!.innerHTML =
    `${icon(storageAvailable ? "check" : "help", 15)}<span>${storageAvailable ? "Adventure saved" : "Playing without saving"}</span><span class="save-dot"></span>`;
}

function update() {
  const state = game.state;
  document.querySelector("#notice")!.textContent = state.notice;
  document.querySelector("#notice-title")!.textContent = state.badge
    ? "You’re a Meadow Explorer!"
    : state.battle
      ? "A new story in the tall grass."
      : "A little curiosity goes a long way.";
  document.querySelector("#party-list")!.innerHTML =
    state.party
      .slice(0, 3)
      .map(
        (creature, i) =>
          `<button class="party-member ${i === 0 ? "partner" : ""}" data-partner="${creature.uid}" aria-label="${SPECIES[creature.speciesId].name}, level ${creature.level}, ${creature.hp} of ${creature.maxHp} HP. ${i === 0 ? "Your active partner" : "Make active partner"}"><span class="party-sprite" style="--pokemon-color:${SPECIES[creature.speciesId].color}">${speciesImage(creature.speciesId)}</span><span class="party-info"><span class="party-name">${SPECIES[creature.speciesId].name}<small>Lv. ${creature.level}</small></span><span class="party-meta">${typeTag(SPECIES[creature.speciesId].type)}<small>${creature.hp}/${creature.maxHp} HP</small></span>${hpBar(creature)}</span>${i === 0 ? '<span class="partner-star" title="Active partner">✦</span>' : ""}</button>`,
      )
      .join("") +
    (state.party.length === 1
      ? `<div class="empty-slot">${ball(24)}<span>A little room for possibility</span><span>02</span></div><div class="empty-slot">${ball(24)}<span>And a friend you haven’t met</span><span>03</span></div>`
      : state.party.length > 3
        ? `<button class="more-team text-button" data-action="party">+ ${state.party.length - 3} more in your team ${icon("arrow", 14)}</button>`
        : "");
  const count = Math.min(3, Math.max(0, state.collection.length - 1));
  document
    .querySelector("#quest-progress-bar")!
    .setAttribute("style", `width:${(count / 3) * 100}%`);
  document.querySelector("#quest-caption")!.textContent = state.badge
    ? "A badge and a few best friends"
    : `${count} of 3 new friends`;
  document.querySelector("#quest-percent")!.textContent =
    `${Math.round((count / 3) * 100)}%`;
  document.querySelector("#badge-status")!.innerHTML = icon(
    state.badge ? "check" : "leaf",
    18,
  );
  document
    .querySelector(".field-card")!
    .classList.toggle("complete", state.badge);
  document.querySelector("#map-coordinate")!.innerHTML =
    `${icon("compass", 17)}<span>${String(state.player.x).padStart(2, "0")}° N &nbsp; ${String(state.player.y).padStart(2, "0")}° E</span>`;
  const interaction = nearbyInteraction(state.player.x, state.player.y);
  document.querySelector("#interaction-hint")!.innerHTML =
    interaction && !state.battle
      ? `<button data-action="interact"><kbd>E</kbd> ${interaction === "heal" ? "Visit the Pokémon Lab" : interaction === "professor" ? "Talk to Professor Fern" : "Read the trail sign"} ${icon("arrow", 14)}</button>`
      : "";
  document.querySelector<HTMLButtonElement>(".search-button")!.disabled =
    !!state.battle;
  document
    .querySelector(".game-viewport")!
    .classList.toggle("in-battle", !!state.battle);
  renderBattle();
  if (modal) renderModal(false);
  save();
}

function battleHp(creature: Creature, enemy = false) {
  return `<div class="battle-health ${enemy ? "enemy-health" : "ally-health"}"><div><strong>${SPECIES[creature.speciesId].name}</strong><span>Lv. ${creature.level}</span></div><div class="battle-type">${typeTag(SPECIES[creature.speciesId].type)}<small>${enemy ? "WILD POKÉMON" : "YOUR PARTNER"}</small></div><div class="battle-hp-row"><b>HP</b>${hpBar(creature)}</div><small class="hp-number">${creature.hp} / ${creature.maxHp}</small></div>`;
}

function renderBattle() {
  const battle = game.state.battle;
  const root = document.querySelector("#battle-root")!;
  if (!battle) {
    root.innerHTML = "";
    return;
  }
  const ally = game.state.party[0];
  const done = !!battle.result;
  root.innerHTML = `<section class="battle-panel" aria-label="Wild Pokémon battle"><div class="battle-scene"><div class="battle-eyebrow"><span class="live-dot"></span> ${done ? (battle.result === "caught" ? "A NEW FRIEND!" : battle.result === "won" ? "VICTORY!" : "UNTIL NEXT TIME") : "A WILD ENCOUNTER"}</div>${battleHp(battle.enemy, true)}<div class="enemy-platform"></div><div class="enemy-pokemon ${battle.result === "caught" ? "caught-pokemon" : ""}">${speciesImage(battle.enemy.speciesId)}</div><div class="ally-platform"></div><div class="ally-pokemon">${speciesImage(ally.speciesId)}</div>${battleHp(ally)}<span class="battle-grass grass-one"></span><span class="battle-grass grass-two"></span></div><div class="battle-console"><p class="battle-log" role="status" aria-live="polite">${escape(battle.log)}</p>${done ? `<button class="primary-button battle-continue" data-action="continue">Back to the adventure ${icon("arrow", 17)}</button>` : `<div class="battle-moves">${SPECIES[ally.speciesId].moves.map((move, index) => `<button class="move-button type-border-${move.type.toLowerCase()}" data-move="${index}"><strong>${move.name}</strong><span>${typeTag(move.type)}<small>${move.power ? `${move.power} PWR` : "STATUS"}</small></span></button>`).join("")}</div><div class="battle-items"><button data-action="catch" ${game.state.inventory.pokeballs < 1 ? "disabled" : ""}>${ball(17)}<span>Throw Poké Ball</span><b>${game.state.inventory.pokeballs}</b></button><button data-action="potion" ${game.state.inventory.potions < 1 || ally.hp === ally.maxHp ? "disabled" : ""}>${icon("potion", 17)}<span>Potion</span><b>${game.state.inventory.potions}</b></button><button data-action="switch">${icon("refresh", 17)}<span>Switch</span></button><button data-action="flee">${icon("arrow", 17)}<span>Run</span></button></div>`}</div></section>`;
}

function openModal(next: NonNullable<typeof modal>) {
  path = [];
  searchOnArrival = false;
  previousFocus = document.activeElement as HTMLElement;
  modal = next;
  renderModal(true);
}
function closeModal() {
  modal = null;
  document.querySelector("#modal-root")!.innerHTML = "";
  document.body.classList.remove("modal-open");
  (previousFocus?.isConnected ? previousFocus : canvas).focus({
    preventScroll: true,
  });
  document
    .querySelectorAll(".nav-button")
    .forEach((el) =>
      el.classList.toggle(
        "active",
        (el as HTMLElement).dataset.action === "explore",
      ),
    );
}
function renderModal(focus: boolean) {
  if (!modal) return;
  let content = "";
  const title = {
    pokedex: "A world of little wonders.",
    bag: "Packed for possibility.",
    party: "Better, together.",
    help: "Every adventure starts somewhere.",
    reset: "A fresh beginning?",
  }[modal];
  const label = {
    pokedex: "YOUR POKÉDEX",
    bag: "YOUR BACKPACK",
    party: "YOUR TEAM",
    help: "A LITTLE FIELD GUIDE",
    reset: "RESET ADVENTURE",
  }[modal];
  if (modal === "pokedex") {
    const species = Object.values(SPECIES).filter(
      (item) => dexFilter === "all" || game.state.collection.includes(item.id),
    );
    content = `<div class="dex-top"><p>${game.state.collection.length} caught <span>·</span> ${game.state.seen.length} seen <span>·</span> ${Object.keys(SPECIES).length} to discover</p><div class="segmented"><button data-filter="all" class="${dexFilter === "all" ? "selected" : ""}">All Pokémon</button><button data-filter="caught" class="${dexFilter === "caught" ? "selected" : ""}">Caught</button></div></div><div class="dex-grid">${species
      .map((item) => {
        const caught = game.state.collection.includes(item.id);
        const seen = game.state.seen.includes(item.id);
        return `<article class="dex-card ${seen ? "discovered" : "undiscovered"}"><div class="dex-number"><span>#${String(item.number).padStart(3, "0")}</span>${caught ? `<span title="Caught">${ball(17)}</span>` : `<span>${seen ? "SEEN" : "UNDISCOVERED"}</span>`}</div><div class="dex-art">${speciesImage(item.id, "", seen ? item.name : "Undiscovered Pokémon silhouette")}</div><h3>${seen ? item.name : "???"}</h3>${seen ? typeTag(item.type) : '<span class="unknown-type">A new friend awaits</span>'}<p>${seen ? item.description : "Keep exploring the tall grass to meet this Pokémon."}</p></article>`;
      })
      .join("")}</div>`;
  } else if (modal === "bag") {
    content = `<p class="modal-description">The essentials for a day out in the meadow.</p><div class="bag-item"><span class="bag-item-icon">${ball(38)}</span><div><h3>Poké Balls <span>× ${game.state.inventory.pokeballs}</span></h3><p>Catch a wild Pokémon. Lower its HP for a better chance.</p></div></div><div class="bag-item"><span class="bag-item-icon potion-icon">${icon("potion", 37)}</span><div><h3>Potions <span>× ${game.state.inventory.potions}</span></h3><p>Restore 25 HP to your active partner.</p></div><button class="secondary-button" data-action="potion" ${game.state.inventory.potions < 1 || game.state.party[0].hp === game.state.party[0].maxHp || !!game.state.battle?.result ? "disabled" : ""}>Use one</button></div><div class="bag-note">${icon("heart", 21)}<p>Running low? Professor Fern’s red-roof lab restores your team and tops up your supplies. Walk to the door and press <kbd>E</kbd>.</p></div>`;
  } else if (modal === "party") {
    content = `<p class="modal-description">${game.state.battle && !game.state.battle.result ? "Switching your partner uses a turn. Choose someone ready to jump in." : "Choose a Pokémon to lead the way. Your team can hold six friends."}</p><div class="full-party">${game.state.party.map((creature, index) => `<div class="full-party-member"><span class="full-party-art">${speciesImage(creature.speciesId)}</span><div><h3>${SPECIES[creature.speciesId].name} <small>Lv. ${creature.level}</small></h3>${typeTag(SPECIES[creature.speciesId].type)}${hpBar(creature)}<p>${creature.hp} / ${creature.maxHp} HP <span>·</span> ${creature.xp} XP</p></div><button class="${index === 0 ? "active-partner" : "secondary-button"}" data-partner="${creature.uid}" ${index === 0 || creature.hp <= 0 || !!game.state.battle?.result ? "disabled" : ""}>${index === 0 ? `${icon("check", 16)} Leading` : "Choose"}</button></div>`).join("")}</div>${game.state.player.steps === 0 && game.state.stats.caught === 0 && game.state.stats.won === 0 && !game.state.battle ? `<div class="starter-choice"><h3>Your story, your starter.</h3><p>Before your first step, pick the partner that feels like you.</p><div>${(["bulbasaur", "charmander", "squirtle"] as SpeciesId[]).map((id) => `<button data-starter="${id}" class="${game.state.party[0].speciesId === id ? "chosen" : ""}">${speciesImage(id)}<strong>${SPECIES[id].name}</strong>${typeTag(SPECIES[id].type)}</button>`).join("")}</div></div>` : ""}`;
  } else if (modal === "help") {
    content = `<p class="modal-description">Welcome to Pokémon Verdant, a tiny, lovingly made fan adventure inspired by the games we grew up with.</p><div class="help-grid"><div>${icon("compass", 25)}<h3>Follow your curiosity</h3><p>Walk with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>, arrow keys, the on-screen arrows, or click a spot on the map.</p></div><div>${icon("leaf", 25)}<h3>Take the grassy path</h3><p>Wild Pokémon hide in tall grass. Wander through it, or press “Explore the grass” for a guided stroll.</p></div><div>${ball(25)}<h3>Make a new friend</h3><p>Use moves to lower a wild Pokémon’s HP, then throw a Poké Ball. Catch 3 new Pokémon species to earn your badge.</p></div><div>${icon("heart", 25)}<h3>A place to rest</h3><p>Visit the red-roof lab and press <kbd>E</kbd> to heal and restock. Talk to Professor Fern or read signs along the way.</p></div></div><div class="help-bottom"><p>Your adventure saves automatically in this browser. All game art and mechanics run locally. Pokémon is owned by Nintendo, Game Freak, and Creatures; this fan project is unaffiliated.</p><button class="text-button reset-button" data-action="reset">Start a new adventure ${icon("refresh", 15)}</button></div>`;
  } else {
    content = `<p class="modal-description">This will erase your saved team, Pokédex, and badge on this device. You’ll start back in Pallet Meadow with a new partner.</p><div class="reset-actions"><button class="secondary-button" data-action="cancel-reset">Keep my adventure</button><button class="danger-button" data-action="confirm-reset">Start fresh</button></div>`;
  }
  const focusedAction = (document.activeElement as HTMLElement)?.dataset
    ?.action;
  document.querySelector("#modal-root")!.innerHTML =
    `<div class="modal-backdrop"><section class="modal modal-${modal}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close dialog">${icon("close", 23)}</button><p class="eyebrow">${label}</p><h2 id="modal-title">${title}</h2>${content}</section></div>`;
  document.body.classList.add("modal-open");
  document
    .querySelectorAll(".nav-button")
    .forEach((el) =>
      el.classList.toggle(
        "active",
        (el as HTMLElement).dataset.action === modal,
      ),
    );
  if (focus) document.querySelector<HTMLButtonElement>(".modal-close")!.focus();
  else if (focusedAction)
    document
      .querySelector<HTMLButtonElement>(
        `.modal [data-action="${focusedAction}"]`,
      )
      ?.focus();
}

function move(dx: number, dy: number) {
  if (modal || game.state.battle) return;
  const { x, y } = game.state.player;
  game.move(dx, dy, isWalkable(x + dx, y + dy), isTallGrass(x + dx, y + dy));
  if (game.state.battle) {
    path = [];
    searchOnArrival = false;
    playNote(660, 0.25);
  }
  update();
}

function findPath(target: {
  x: number;
  y: number;
}): { x: number; y: number }[] {
  const start = game.state.player;
  const queue = [
    { x: start.x, y: start.y, path: [] as { x: number; y: number }[] },
  ];
  const visited = new Set([`${start.x},${start.y}`]);
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    if (current.x === target.x && current.y === target.y) return current.path;
    for (const [dx, dy] of [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ]) {
      const x = current.x + dx,
        y = current.y + dy;
      if (isWalkable(x, y) && !visited.has(`${x},${y}`)) {
        visited.add(`${x},${y}`);
        queue.push({ x, y, path: [...current.path, { x, y }] });
      }
    }
  }
  return [];
}

function searchGrass() {
  if (game.state.battle) return;
  if (modal) closeModal();
  path = [];
  searchOnArrival = false;
  const player = game.state.player;
  if (isTallGrass(player.x, player.y)) {
    game.encounter();
    update();
    playNote(660, 0.2);
    return;
  }
  let nearest: { x: number; y: number }[] | null = null;
  for (let y = 0; y < WORLD_HEIGHT; y++)
    for (let x = 0; x < WORLD_WIDTH; x++) {
      if (!isTallGrass(x, y)) continue;
      const candidate = findPath({ x, y });
      if (candidate.length && (!nearest || candidate.length < nearest.length))
        nearest = candidate;
    }
  if (nearest) {
    path = nearest;
    searchOnArrival = true;
    toast("A little stroll to the tall grass…");
  }
}

function interact() {
  if (game.state.battle || modal) return;
  const interaction = nearbyInteraction(
    game.state.player.x,
    game.state.player.y,
  );
  if (interaction === "heal") {
    game.heal();
    toast("Rested, restocked, and ready for the road.");
    playNote(880, 0.25);
  } else if (interaction === "professor") {
    game.state.notice =
      "Professor Fern: “A gentle approach goes a long way. Lower a wild Pokémon’s HP before throwing a Poké Ball!”";
  } else if (interaction === "sign") {
    game.state.notice =
      "ROUTE 01 · Pokémon Lab to the northwest. Tall grass ahead. Wander kindly, and leave only footprints.";
  } else toast("Get closer to the lab door, Professor Fern, or a trail sign.");
  update();
}

document.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>(
    "button, a.brand",
  );
  if (!target || (target as HTMLButtonElement).disabled) return;
  if (target.classList.contains("brand")) {
    event.preventDefault();
    if (modal) closeModal();
    return;
  }
  if (target.dataset.direction) {
    path = [];
    searchOnArrival = false;
    const direction = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    }[target.dataset.direction]!;
    move(direction[0], direction[1]);
    return;
  }
  if (target.dataset.move !== undefined) {
    game.attack(Number(target.dataset.move));
    playNote(200, 0.12);
    update();
    return;
  }
  if (target.dataset.partner) {
    game.switchPartner(target.dataset.partner);
    update();
    if (modal === "party" && game.state.battle) closeModal();
    return;
  }
  if (target.dataset.starter) {
    game.chooseStarter(target.dataset.starter as SpeciesId);
    update();
    playNote(700);
    return;
  }
  if (target.dataset.filter) {
    dexFilter = target.dataset.filter as typeof dexFilter;
    renderModal(false);
    return;
  }
  switch (target.dataset.action) {
    case "explore":
      if (modal) closeModal();
      canvas.focus({ preventScroll: true });
      break;
    case "pokedex":
      openModal("pokedex");
      break;
    case "bag":
      openModal("bag");
      break;
    case "party":
    case "switch":
      openModal("party");
      break;
    case "help":
      openModal("help");
      break;
    case "close-modal":
      closeModal();
      break;
    case "search":
      searchGrass();
      break;
    case "interact":
      interact();
      break;
    case "catch":
      game.catchPokemon();
      playNote(780, 0.18);
      update();
      break;
    case "potion":
      game.usePotion();
      playNote(820, 0.15);
      update();
      break;
    case "flee":
      game.flee();
      update();
      break;
    case "continue":
      game.closeBattle();
      update();
      canvas.focus({ preventScroll: true });
      break;
    case "sound":
      sound = !sound;
      target.innerHTML = icon(sound ? "sound" : "mute", 18);
      target.setAttribute("aria-label", sound ? "Mute sound" : "Enable sound");
      target.title = sound ? "Mute sound" : "Enable sound";
      playNote();
      break;
    case "fullscreen": {
      const viewport = document.documentElement;
      if (document.fullscreenElement) void document.exitFullscreen();
      else if (viewport.requestFullscreen)
        void viewport
          .requestFullscreen()
          .catch(() => toast("Fullscreen isn’t available in this browser."));
      else toast("Fullscreen isn’t available in this browser.");
      break;
    }
    case "reset":
      openModal("reset");
      break;
    case "cancel-reset":
      openModal("help");
      break;
    case "confirm-reset":
      game = new GameEngine();
      path = [];
      searchOnArrival = false;
      closeModal();
      update();
      toast("A fresh adventure. A world of possibility.");
      break;
  }
});

document.addEventListener("click", (event) => {
  if ((event.target as HTMLElement).classList.contains("modal-backdrop"))
    closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (modal) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
    if (event.key === "Tab") {
      const buttons = [
        ...document.querySelectorAll<HTMLElement>(
          ".modal button:not([disabled]), .modal a[href]",
        ),
      ];
      const first = buttons[0],
        last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    return;
  }
  const direction = (
    {
      ArrowUp: [0, -1],
      w: [0, -1],
      ArrowDown: [0, 1],
      s: [0, 1],
      ArrowLeft: [-1, 0],
      a: [-1, 0],
      ArrowRight: [1, 0],
      d: [1, 0],
    } as Record<string, number[]>
  )[event.key.length === 1 ? event.key.toLowerCase() : event.key];
  if (direction) {
    event.preventDefault();
    if (performance.now() - lastStep < 115) return;
    lastStep = performance.now();
    path = [];
    searchOnArrival = false;
    move(direction[0], direction[1]);
  }
  if (event.key.toLowerCase() === "e") {
    event.preventDefault();
    interact();
  }
});

canvas.addEventListener("click", (event) => {
  if (modal || game.state.battle) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.floor(
    ((event.clientX - rect.left) / rect.width) * WORLD_WIDTH,
  );
  const y = Math.floor(
    ((event.clientY - rect.top) / rect.height) * WORLD_HEIGHT,
  );
  searchOnArrival = false;
  path = findPath({ x, y });
  if (!path.length && !isWalkable(x, y))
    toast("Try a patch of grass or the walking path.");
});

function frame(time: number) {
  if (time - lastFrame > 33) {
    drawWorld(ctx, game.state.player, time);
    if (path.length) {
      const destination = path[path.length - 1];
      ctx.strokeStyle = "#fff9cb";
      ctx.lineWidth = 2;
      ctx.strokeRect(destination.x * 32 + 7, destination.y * 32 + 7, 18, 18);
    }
    lastFrame = time;
  }
  if (path.length && time - lastStep > 150 && !modal && !game.state.battle) {
    lastStep = time;
    const next = path.shift()!;
    move(next.x - game.state.player.x, next.y - game.state.player.y);
    if (!path.length && searchOnArrival && !game.state.battle) {
      searchOnArrival = false;
      game.encounter();
      update();
      playNote(660, 0.2);
    }
  }
  requestAnimationFrame(frame);
}

update();
requestAnimationFrame(frame);
