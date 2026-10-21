export const STARBASES = [
  { id: 'DS1', name: 'Deep Space 1', ordinal: 1 },
  { id: 'DS2', name: 'Deep Space 2', ordinal: 2 },
  { id: 'DS3', name: 'Deep Space 3', ordinal: 3 },
  { id: 'DS4', name: 'Deep Space 4', ordinal: 4 },
  { id: 'DS5', name: 'Deep Space 5', ordinal: 5 },
  { id: 'DS6', name: 'Deep Space 6', ordinal: 6 },
  { id: 'DS7', name: 'Deep Space 7', ordinal: 7 },
  { id: 'DS8', name: 'Deep Space 8', ordinal: 8 },
  { id: 'DS9', name: 'Deep Space 9', ordinal: 9 },
];

const AUX_STARBASES = ['Starbase 375', 'Starbase 24', 'Starbase 133', 'Starbase 621'];

export function starbaseForSystem(sysIndex) {
  if (sysIndex <= 0 || sysIndex % 2 === 0) return null;
  const ordinal = (sysIndex + 1) / 2;
  if (ordinal <= STARBASES.length) return STARBASES[ordinal - 1];
  return {
    id: `SB ${ordinal}`,
    name: AUX_STARBASES[(ordinal - STARBASES.length - 1) % AUX_STARBASES.length],
    ordinal,
  };
}

export const RANKS = [
  { name: 'ENSIGN', points: 0 },
  { name: 'LIEUTENANT', points: 4 },
  { name: 'LT. COMMANDER', points: 10 },
  { name: 'COMMANDER', points: 18 },
  { name: 'CAPTAIN', points: 28 },
];

export const SHIP_DEFS = [
  {
    id: 'miranda', name: 'U.S.S. Saratoga', registry: 'NCC-31911', className: 'Miranda',
    minRank: 0, minStation: 1, cost: 0, speed: 1, phaser: 1, torpedo: 1, damage: 1, regen: 1,
    blurb: 'LIGHT CRUISER · BALANCED SYSTEMS',
  },
  {
    id: 'excelsior', name: 'U.S.S. Hood', registry: 'NCC-42296', className: 'Excelsior',
    minRank: 0, minStation: 1, cost: 650, speed: 1.08, phaser: 1.05, torpedo: 1, damage: 0.96, regen: 1,
    blurb: 'HEAVY CRUISER · LONG-RANGE PATROL',
  },
  {
    id: 'soyuz', name: 'U.S.S. Bozeman', registry: 'NCC-1941', className: 'Soyuz',
    minRank: 0, minStation: 1, cost: 550, speed: 0.95, phaser: 0.98, torpedo: 0.95, damage: 1.0, regen: 0.95,
    blurb: 'FRIGATE · RELIABLE WORKHORSE',
  },
  {
    id: 'neworleans', name: 'U.S.S. Kyushu', registry: 'NCC-65491', className: 'New Orleans',
    minRank: 0, minStation: 1, cost: 620, speed: 1.02, phaser: 1.0, torpedo: 1.0, damage: 0.98, regen: 1,
    blurb: 'FRIGATE · SECTOR PATROL',
  },
  {
    id: 'niagara', name: 'U.S.S. Princeton', registry: 'NCC-59804', className: 'Niagara',
    minRank: 0, minStation: 1, cost: 650, speed: 1.0, phaser: 1.02, torpedo: 1.0, damage: 0.98, regen: 1,
    blurb: 'CRUISER · BALANCED DEFENCE',
  },
  {
    id: 'freedom', name: 'U.S.S. Firebrand', registry: 'NCC-68723', className: 'Freedom',
    minRank: 0, minStation: 1, cost: 600, speed: 0.98, phaser: 1.04, torpedo: 0.95, damage: 1.0, regen: 0.95,
    blurb: 'FRIGATE · PHASER PICKET',
  },
  {
    id: 'springfield', name: 'U.S.S. Chekov', registry: 'NCC-57302', className: 'Springfield',
    minRank: 0, minStation: 1, cost: 680, speed: 1.0, phaser: 1.0, torpedo: 1.04, damage: 0.98, regen: 0.98,
    blurb: 'FRIGATE · TORPEDO SCREEN',
  },
  {
    id: 'saber', name: 'U.S.S. Yeager', registry: 'NCC-61947', className: 'Saber',
    minRank: 0, minStation: 1, cost: 800, speed: 1.10, phaser: 1.06, torpedo: 1.0, damage: 0.96, regen: 1,
    blurb: 'ESCORT · FAST RESPONSE',
  },
  {
    id: 'steamrunner', name: 'U.S.S. Appalachia', registry: 'NCC-52136', className: 'Steamrunner',
    minRank: 0, minStation: 1, cost: 900, speed: 1.12, phaser: 1.04, torpedo: 1.08, damage: 0.95, regen: 1,
    blurb: 'HEAVY ESCORT · TORPEDO RUN',
  },
  {
    id: 'akira', name: 'U.S.S. Thunderchild', registry: 'NCC-63549', className: 'Akira',
    minRank: 1, minStation: 2, cost: 950, speed: 1.14, phaser: 1.05, torpedo: 1.18, damage: 0.94, regen: 1,
    blurb: 'TORPEDO CRUISER · FAST ATTACK',
  },
  {
    id: 'intrepid', name: 'U.S.S. Voyager', registry: 'NCC-74656', className: 'Intrepid',
    minRank: 1, minStation: 3, cost: 1200, speed: 1.22, phaser: 1.02, torpedo: 1.04, damage: 0.95, regen: 1.25,
    blurb: 'LONG-RANGE EXPLORER · EFFICIENT SHIELDS',
  },
  {
    id: 'defiant', name: 'U.S.S. Defiant', registry: 'NX-74205', className: 'Defiant',
    minRank: 2, minStation: 4, cost: 1600, speed: 1.20, phaser: 1.18, torpedo: 1.10, damage: 0.90, regen: 0.95,
    blurb: 'ESCORT · HEAVY PHASER ARRAY',
  },
  {
    id: 'galaxy', name: 'U.S.S. Galaxy', registry: 'NCC-70637', className: 'Galaxy',
    minRank: 3, minStation: 6, cost: 2300, speed: 0.96, phaser: 1.06, torpedo: 1.08, damage: 0.88, regen: 1.20,
    blurb: 'EXPLORATION CRUISER · DEEP SPACE ENDURANCE',
  },
  {
    id: 'sovereign', name: 'U.S.S. Enterprise', registry: 'NCC-1701-E', className: 'Sovereign',
    minRank: 4, minStation: 9, cost: 3200, speed: 1.15, phaser: 1.12, torpedo: 1.12, damage: 0.82, regen: 1.20,
    blurb: 'FLEET FLAGSHIP · ALL SYSTEMS ADVANCED',
  },
];

export const PART_DEFS = [
  {
    id: 'sif', name: 'SIF REINFORCEMENT', desc: '-12% INCOMING DAMAGE',
    cost: 420, minRank: 0, minStation: 1,
  },
  {
    id: 'shieldcoil', name: 'REGENERATIVE SHIELD COILS', desc: '+35% SHIELD REGENERATION',
    cost: 480, minRank: 0, minStation: 1,
  },
  {
    id: 'targeting', name: 'TARGETING SENSOR ARRAY', desc: '+12% PHASER DAMAGE',
    cost: 520, minRank: 1, minStation: 2,
  },
  {
    id: 'impulse', name: 'IMPULSE MANIFOLD', desc: '+10% IMPULSE SPEED',
    cost: 460, minRank: 1, minStation: 2,
  },
  {
    id: 'quantum', name: 'QUANTUM TORPEDO CASING', desc: '+25% TORPEDO DAMAGE',
    cost: 680, minRank: 2, minStation: 4,
  },
  {
    id: 'ablative', name: 'ABLATIVE HULL PLATING', desc: '-18% INCOMING DAMAGE',
    cost: 760, minRank: 2, minStation: 5,
  },
  {
    id: 'autorepair', name: 'AUTOMATED REPAIR NODES', desc: '+1.5 HULL / SEC',
    cost: 820, minRank: 3, minStation: 7,
  },
];

export function careerPoints(G) {
  const T = G.telemetryData;
  return (T.missionsCompleted || 0) + (T.assignmentsCompleted || 0) * 2;
}

export function rankIndexForPoints(points) {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (points >= RANKS[i].points) index = i;
  return index;
}

export function rankIndex(G) {
  return rankIndexForPoints(careerPoints(G));
}

export function rankName(G) {
  return RANKS[rankIndex(G)].name;
}

export function nextRank(G) {
  const i = rankIndex(G);
  return i + 1 < RANKS.length ? RANKS[i + 1] : null;
}

export function shipDefById(id) {
  return SHIP_DEFS.find((s) => s.id === id) || SHIP_DEFS[0];
}

export function initCareer(G, startShip) {
  const current = SHIP_DEFS.find((s) => s.className === startShip.className) || SHIP_DEFS[0];
  G.player.parts = {};
  G.career = {
    currentShipId: current.id,
    currentShipName: `${startShip.name} ${startShip.registry}`,
    ownedShips: new Set([current.id]),
    partsInstalled: 0,
    contracts: 0,
  };
  refreshStats(G);
}

export function refreshStats(G) {
  const ship = shipDefById(G.career.currentShipId);
  const parts = G.player.parts || {};
  const player = G.player;
  player.speedMul = ship.speed * (parts.impulse ? 1.10 : 1);
  player.damageTakenMul = ship.damage * (parts.sif ? 0.88 : 1) * (parts.ablative ? 0.82 : 1);
  player.shipPhaserMul = ship.phaser;
  player.partPhaserMul = parts.targeting ? 1.12 : 1;
  player.shipTorpedoMul = ship.torpedo;
  player.partTorpedoMul = parts.quantum ? 1.25 : 1;
  player.shieldRegenRate = 14 * ship.regen * (parts.shieldcoil ? 1.35 : 1);
  player.shieldRegenDelay = parts.shieldcoil ? 4.0 : 5.0;
  player.hullRegenRate = parts.autorepair ? 1.5 : 0;
}

export function applyShip(G, id) {
  const def = shipDefById(id);
  G.career.currentShipId = def.id;
  G.career.currentShipName = `${def.name} ${def.registry}`;
  G.career.ownedShips.add(def.id);
  G.names.ship = def.name;
  G.names.shipClass = def.className;
  G.names.registry = def.registry;
  refreshStats(G);
}

export function commissionShip(G, id) {
  if (!G.career) return false;
  const def = SHIP_DEFS.find((s) => s.id === id);
  if (!def || def.id === G.career.currentShipId) return false;
  applyShip(G, def.id);
  return true;
}

export function installPart(G, id) {
  if (!G.career || !G.player.parts) return false;
  const def = PART_DEFS.find((p) => p.id === id);
  if (!def || G.player.parts[id]) return false;
  G.player.parts[id] = true;
  G.career.partsInstalled++;
  refreshStats(G);
  return true;
}

export function partsForStation(G) {
  const sb = G.station && G.station.starbase;
  if (!sb || !G.player.parts) return [];
  const rank = rankIndex(G);
  return PART_DEFS.filter((p) => !G.player.parts[p.id]
    && p.minStation <= sb.ordinal && p.minRank <= rank)
    .sort((a, b) => b.minStation - a.minStation || b.minRank - a.minRank)
    .slice(0, 4);
}

export function shipsForStation(G) {
  const sb = G.station && G.station.starbase;
  if (!sb || !G.career) return [];
  const rank = rankIndex(G);
  const fits = SHIP_DEFS.filter((s) => s.minStation <= sb.ordinal)
    .sort((a, b) => b.minStation - a.minStation || b.minRank - a.minRank || b.cost - a.cost);
  const ready = fits.filter((s) => s.minRank <= rank && s.id !== G.career.currentShipId);
  const locked = fits.filter((s) => s.minRank > rank);
  return [...ready, ...locked].slice(0, 3);
}

export function canCommission(G, id) {
  const def = SHIP_DEFS.find((s) => s.id === id);
  const sb = G.station && G.station.starbase;
  if (!def || !sb) return false;
  if (def.id === G.career.currentShipId) return false;
  if (def.minStation > sb.ordinal) return false;
  if (def.minRank > rankIndex(G)) return false;
  return true;
}
