import * as THREE from 'three';

const TYPE_META = {
  combat: { kind: 'PATROL', color: 0xff9c00, verb: 'ENGAGE' },
  diplomacy: { kind: 'DIPLOMACY', color: 0xcc99cc, verb: 'HAIL ENVOY' },
  relief: { kind: 'RELIEF', color: 0xffb15c, verb: 'BEGIN TRANSFER' },
  science: { kind: 'SCIENCE', color: 0x66e6ff, verb: 'BEGIN SCAN' },
};

const FLAVOR = {
  'Klingon Empire': {
    prefixes: ['IKS'],
    envoys: ['Klingon High Council envoy', 'House of Martok delegation', 'Klingon Defense Force attaché'],
    lifeforms: ['Boreth bioluminescent swarm', 'Kri\u2019stak membrane drifter', 'Qo\u2019noS void grazer'],
  },
  'Romulan Star Empire': {
    prefixes: ['IRW'],
    envoys: ['Romulan Senate envoy', 'Tal Shiar liaison', 'Romulan senatorial observer'],
    lifeforms: ['Romulan Neutral Zone veiled jelly', 'Tomed gravimetric drifter', 'Reman shadow swarm'],
  },
  'Cardassian Union': {
    prefixes: ['CDS'],
    envoys: ['Cardassian Central Command envoy', 'Detapa Council delegate', 'Obsidian Order observer'],
    lifeforms: ['Badlands plasma grazer', 'Setlik silicate drifter', 'Cardassian ribbon colony'],
  },
  'United Federation of Planets': {
    prefixes: ['SS'],
    envoys: ['Vulcan Science Academy envoy', 'Andorian Guard attaché', 'Federation Diplomatic Corps delegate'],
    lifeforms: ['Argus array nebula grazer', 'Lantaru subspace jelly', 'Deneva ribbon swarm'],
  },
  'Contested Space': {
    prefixes: ['SS'],
    envoys: ['Bajoran provisional government envoy', 'Maquis intermediary', 'neutral trade delegate'],
    lifeforms: ['Badlands plasma grazer', 'wormhole subspace drifter', 'Demilitarized Zone ribbon colony'],
  },
  'Ferengi Alliance': {
    prefixes: ['FMS'],
    envoys: ['Ferengi Commerce Authority factor', 'Grand Nagus representative', 'Ferengi trade delegate'],
    lifeforms: ['Ferenginar storm grazer', 'latium ribbon colony', 'Rule of Acquisition void jelly'],
  },
  'Breen Confederacy': {
    prefixes: ['BCS'],
    envoys: ['Breen Confederacy envoy', 'Breen privateer captain', 'Breen trade attaché'],
    lifeforms: ['Breen helium-ice drifter', 'port nebula grazer', 'Breen Confederacy veil colony'],
  },
  'Tholian Assembly': {
    prefixes: ['TAS'],
    envoys: ['Tholian Assembly envoy', 'Tholian web-wright', 'Assembly observer'],
    lifeforms: ['Tholian crystalline drifter', 'web-space shimmer', 'Tholian lattice colony'],
  },
  'Gorn Hegemony': {
    prefixes: ['GHS'],
    envoys: ['Gorn Hegemony envoy', 'Gorn clan representative', 'Gorn war-council observer'],
    lifeforms: ['Gornar hothouse grazer', 'Gorn methane drifter', 'Gornar shell colony'],
  },
  'Tzenkethi Coalition': {
    prefixes: ['TCS'],
    envoys: ['Tzenkethi Coalition envoy', 'Tzenkethi autarch delegate', 'Coalition observer'],
    lifeforms: ['Tzenkethi gravity grazer', 'Coalition veil swarm', 'Tzenkethi lattice colony'],
  },
};

const DEFAULT_FLAVOR = {
  prefixes: ['SS'],
  envoys: ['local envoy', 'sector delegate', 'unaffiliated intermediary'],
  lifeforms: ['unidentified lifeform', 'gravimetric drifter', 'subspace ribbon colony'],
};

function pick(rng, arr) {
  return arr[(rng() * arr.length) | 0];
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.24, 'rgba(255,255,255,0.76)');
  grad.addColorStop(0.58, 'rgba(255,255,255,0.18)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function markerTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  g.strokeStyle = 'rgba(255,255,255,0.95)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(64, 64, 43, 0, Math.PI * 2);
  g.stroke();
  g.globalAlpha = 0.72;
  g.lineWidth = 2;
  g.beginPath();
  g.arc(64, 64, 55, -0.22, 1.04);
  g.arc(64, 64, 55, Math.PI - 0.22, Math.PI + 1.04);
  g.arc(64, 64, 55, Math.PI * 2 - 0.22, Math.PI * 2 + 1.04);
  g.stroke();
  g.globalAlpha = 1;
  g.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    g.beginPath();
    g.moveTo(64 + Math.cos(a) * 34, 64 + Math.sin(a) * 34);
    g.lineTo(64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48);
    g.stroke();
  }
  g.fillStyle = 'rgba(255,255,255,0.95)';
  g.beginPath();
  g.arc(64, 64, 3.5, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

function engineGlow(tex, color, scale) {
  const mat = new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(scale, scale, 1);
  return sprite;
}

function markerSprite(tex, color, y) {
  const mat = new THREE.SpriteMaterial({
    map: tex, color, transparent: true, opacity: 0.86,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.position.y = y;
  sprite.scale.set(30, 30, 1);
  return sprite;
}

function buildEnvoy(glowTex, markTex) {
  const group = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0xd9e3ea, metalness: 0.58, roughness: 0.34,
    emissive: 0x101820, emissiveIntensity: 0.45,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: 0x59636e, metalness: 0.82, roughness: 0.27,
    emissive: 0x080b0e, emissiveIntensity: 0.4,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0xd8b36a, metalness: 0.68, roughness: 0.32,
    emissive: 0x3b2b09, emissiveIntensity: 0.55,
  });
  const glow = new THREE.MeshBasicMaterial({ color: 0x72d6ff });

  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(32, 34, 5, 28), hull);
  saucer.position.y = 18;
  group.add(saucer);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(31, 2.4, 6, 36), accent);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 18;
  group.add(rim);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(15, 16, 8), hull);
  dome.scale.y = 0.35;
  dome.position.y = 22;
  group.add(dome);
  const neck = new THREE.Mesh(new THREE.BoxGeometry(10, 18, 14), trim);
  neck.position.set(0, 2, 4);
  group.add(neck);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(8, 12, 50, 12), hull);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, -6, 8);
  group.add(body);
  const deflector = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 2, 12), glow);
  deflector.rotation.x = Math.PI / 2;
  deflector.position.set(0, -6, -18);
  group.add(deflector);

  for (const s of [-1, 1]) {
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 10), trim);
    pylon.position.set(s * 17, -4, 10);
    pylon.rotation.z = s * -0.12;
    group.add(pylon);
    const nacelle = new THREE.Mesh(new THREE.BoxGeometry(9, 9, 54), hull);
    nacelle.position.set(s * 29, -3, 14);
    group.add(nacelle);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.2, 30), accent);
    stripe.position.set(s * 29, 1.6, 14);
    group.add(stripe);
    const engine = engineGlow(glowTex, 0x72d6ff, 18);
    engine.position.set(s * 29, -3, 42);
    group.add(engine);
  }

  const marker = markerSprite(markTex, TYPE_META.diplomacy.color, 56);
  group.add(marker);
  return { group, marker };
}

function buildRelief(glowTex, markTex) {
  const group = new THREE.Group();
  const hull = new THREE.MeshStandardMaterial({
    color: 0xaeb6bd, metalness: 0.55, roughness: 0.46,
    emissive: 0x0b0f12, emissiveIntensity: 0.45,
  });
  const trim = new THREE.MeshStandardMaterial({
    color: 0x444c54, metalness: 0.78, roughness: 0.32,
    emissive: 0x07090b, emissiveIntensity: 0.4,
  });
  const cargo = new THREE.MeshStandardMaterial({
    color: 0xc8873a, metalness: 0.42, roughness: 0.55,
    emissive: 0x3a1f05, emissiveIntensity: 0.55,
  });
  const glow = new THREE.MeshBasicMaterial({ color: 0xffb15c });

  const body = new THREE.Mesh(new THREE.BoxGeometry(44, 24, 108), hull);
  group.add(body);
  const spine = new THREE.Mesh(new THREE.BoxGeometry(20, 9, 84), trim);
  spine.position.y = 15;
  group.add(spine);
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(30, 10, 24), hull);
  bridge.position.set(0, 20, -28);
  group.add(bridge);
  const bridgeGlass = new THREE.Mesh(new THREE.BoxGeometry(24, 2.2, 1.2), glow);
  bridgeGlass.position.set(0, 21, -40.6);
  group.add(bridgeGlass);

  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(22, 18, 22), cargo);
      pod.position.set(s * 34, -1, -32 + i * 31);
      group.add(pod);
      const band = new THREE.Mesh(new THREE.BoxGeometry(23, 2, 23), trim);
      band.position.copy(pod.position);
      band.position.y += 6;
      group.add(band);
    }
    const engine = new THREE.Mesh(new THREE.CylinderGeometry(7, 9, 16, 10), trim);
    engine.rotation.x = Math.PI / 2;
    engine.position.set(s * 13, 0, 61);
    group.add(engine);
    const flame = engineGlow(glowTex, 0xffb15c, 21);
    flame.position.set(s * 13, 0, 72);
    group.add(flame);
  }

  const marker = markerSprite(markTex, TYPE_META.relief.color, 68);
  group.add(marker);
  return { group, marker };
}

function buildLifeform(glowTex, markTex) {
  const group = new THREE.Group();
  const bellMat = new THREE.MeshBasicMaterial({
    color: 0x39cfe8, transparent: true, opacity: 0.48,
    side: THREE.DoubleSide, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const veinMat = new THREE.MeshBasicMaterial({
    color: 0x9cf5ff, wireframe: true, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xcffcff });

  const bell = new THREE.Mesh(new THREE.SphereGeometry(29, 24, 16), bellMat);
  bell.scale.y = 0.70;
  bell.position.y = 12;
  group.add(bell);
  const veins = new THREE.Mesh(new THREE.SphereGeometry(30, 12, 8), veinMat);
  veins.scale.y = 0.72;
  veins.position.y = 12;
  group.add(veins);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(11, 1), coreMat);
  core.position.y = 11;
  group.add(core);

  const tentacles = new THREE.Group();
  tentacles.position.y = -2;
  const tendrilMat = new THREE.MeshBasicMaterial({
    color: 0x54dff2, transparent: true, opacity: 0.42,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const rng = (() => {
    let s = 0x9e3779b9;
    return () => {
      s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
      return ((s >>> 0) / 4294967296);
    };
  })();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    const r = 6 + rng() * 5;
    const pts = [
      new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r),
      new THREE.Vector3(Math.cos(a + 0.18) * (r + 8), -20 - rng() * 8, Math.sin(a + 0.18) * (r + 8)),
      new THREE.Vector3(Math.cos(a - 0.12) * (r + 16), -42 - rng() * 12, Math.sin(a - 0.12) * (r + 16)),
      new THREE.Vector3(Math.cos(a + 0.22) * (r + 22), -64 - rng() * 16, Math.sin(a + 0.22) * (r + 22)),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 1.35, 5, false), tendrilMat);
    tentacles.add(tube);
  }
  group.add(tentacles);

  const halo = engineGlow(glowTex, 0x38d8f2, 120);
  halo.position.y = 8;
  halo.material.opacity = 0.38;
  group.add(halo);

  const marker = markerSprite(markTex, TYPE_META.science.color, 66);
  group.add(marker);
  return { group, marker, bell, veins, core, tentacles, halo };
}

export function initMissions(G) {
  const group = new THREE.Group();
  G.scene.add(group);
  const glowTex = glowTexture();
  const markTex = markerTexture();
  const envoy = buildEnvoy(glowTex, markTex);
  const relief = buildRelief(glowTex, markTex);
  const science = buildLifeform(glowTex, markTex);
  const objects = { diplomacy: envoy, relief, science };
  for (const key of Object.keys(objects)) {
    objects[key].group.visible = false;
    group.add(objects[key].group);
  }

  const beamMat = new THREE.MeshBasicMaterial({
    color: 0x9cf5ff, transparent: true, opacity: 0.30,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 6, 1, true), beamMat);
  beam.visible = false;
  G.scene.add(beam);

  const M = {
    active: false,
    completed: false,
    type: null,
    phase: null,
    title: '',
    targetName: '',
    objective: '',
    hint: '',
    progressLabel: '',
    progress: 0,
    distance: 0,
    canInteract: false,
    prompt: '',
    rewardText: '',
    completedAt: 0,
    departureTimer: 0,
    wantsWarp: false,
    systemIndex: 0,
    sequence: 0,
    targetPos: new THREE.Vector3(),
    targetObj: null,
    briefing: false,
    stationKeeping: false,
    mode: 'idle',
    offers: [],
    contract: null,
    contractHint: '',
  };

  let lastType = null;
  let briefT = 0;
  let holdTime = 0;
  let interactRange = 0;
  let holdRange = 0;
  let minRange = 0;
  let combatTotal = 0;
  let contactWarn = '';

  const _fwd = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _up = new THREE.Vector3();
  const _mid = new THREE.Vector3();
  const _dir = new THREE.Vector3();
  const _upAxis = new THREE.Vector3(0, 1, 0);

  function flavor() {
    return FLAVOR[G.names.power] || DEFAULT_FLAVOR;
  }

  function scaleReward(type) {
    const base = type === 'science'
      ? { score: 320, credits: 120, label: 'NEW LIFEFORM CATALOGUED' }
      : type === 'diplomacy'
        ? { score: 260, credits: 130, label: 'ACCORD' }
        : { score: 220, credits: 160, label: 'COLONY STABILIZED' };
    const mult = 1 + M.systemIndex * 0.28;
    return {
      score: Math.round(base.score * mult),
      credits: Math.round(base.credits * mult),
      label: base.label,
    };
  }

  function makeOffers(sysIndex) {
    const sb = G.station && G.station.starbase;
    if (!sb) return [];
    const rng = G.rngFor('contracts-' + sysIndex + '-' + (G.telemetryData.assignmentsCompleted || 0));
    const names = ['BRIGHT HORIZON', 'SILENT SENTINEL', 'OPEN HAND', 'LONG SHADOW', 'STEADFAST', 'WAYFARER'];
    const targetPool = [sysIndex + 1, sysIndex + 3, sysIndex + 5, sysIndex - 1, sysIndex - 3]
      .filter((i) => i >= 0 && !G.isSafeSystem(i));
    const types = ['combat', 'diplomacy', 'relief', 'science'];
    const usedNames = new Set();
    const out = [];
    for (let o = 0; o < 3; o++) {
      const count = rng() < 0.42 ? 3 : 2;
      let opName = pick(rng, names);
      let guard = 0;
      while (usedNames.has(opName) && guard++ < names.length) opName = pick(rng, names);
      usedNames.add(opName);
      const stages = [];
      for (let k = 0; k < count; k++) {
        let sys = targetPool[(rng() * targetPool.length) | 0];
        if (sys === undefined) sys = sysIndex + 1;
        if (k > 0 && rng() < 0.38) sys = stages[0].system;
        if (k > 0 && stages[k - 1].system === sys) sys = G.isSafeSystem(sys + 2) ? sys + 4 : sys + 2;
        let type = types[(rng() * types.length) | 0];
        if (k === 0) type = rng() < 0.45 ? 'combat' : type;
        stages.push({ system: sys, type, done: false });
      }
      const mult = 1 + (sysIndex / 2) * 0.22;
      const systems = [...new Set(stages.map((st) => st.system))];
      out.push({
        id: 'C' + sysIndex + '-' + (G.telemetryData.assignmentsCompleted || 0) + '-' + o,
        title: `OPERATION ${opName}`,
        issuerSystem: sysIndex,
        issuerName: sb.name.toUpperCase(),
        stages,
        targetNames: systems.map((i) => G.ensureSystem(i).area.toUpperCase()),
        score: Math.round((280 + count * 130) * mult),
        credits: Math.round((170 + count * 80) * mult),
        blurb: count === 3 ? 'EXTENDED PATROL · THREE STAGES' : 'TWO-STAGE ASSIGNMENT',
      });
    }
    return out;
  }

  function beginStarbase(sysIndex) {
    hideObjects();
    M.active = false;
    M.completed = false;
    M.mode = 'starbase';
    M.phase = null;
    M.canInteract = false;
    M.prompt = '';
    M.stationKeeping = false;
    M.wantsWarp = false;
    M.departureTimer = 0;
    M.systemIndex = sysIndex;
    M.sequence++;
    M.targetObj = null;
    M.contractHint = '';
    M.offers = M.contract ? [] : makeOffers(sysIndex);
    return M;
  }

  function beginDebrief(sysIndex) {
    beginStarbase(sysIndex);
    M.mode = 'debrief';
    if (M.contract) M.contract.status = 'debrief';
    return M;
  }

  function startContractStage(sysIndex) {
    const c = M.contract;
    const stage = c.stages[c.stageIndex];
    startField(sysIndex, stage.type);
    M.mode = 'contract';
    M.title = c.title;
    M.contractHint = `STAGE ${c.stageIndex + 1}/${c.stages.length} · ${TYPE_META[stage.type].kind}`;
    return M;
  }

  function advanceContract() {
    const c = M.contract;
    if (!c) return;
    const stage = c.stages[c.stageIndex];
    stage.done = true;
    if (c.stageIndex + 1 < c.stages.length) {
      c.stageIndex++;
      c.status = 'travel';
      const next = c.stages[c.stageIndex];
      M.contractHint = `STAGE COMPLETE · NEXT ${G.ensureSystem(next.system).area.toUpperCase()}`;
    } else {
      c.status = 'return';
      M.contractHint = `ASSIGNMENT COMPLETE · RETURN TO ${c.issuerName}`;
    }
    M.departureTimer = 5.5;
  }

  function beginSystem(sysIndex, forcedType = null) {
    M.systemIndex = sysIndex;
    if (!forcedType && G.safeSystem) {
      if (M.contract && M.contract.status === 'return' && M.contract.issuerSystem === sysIndex) {
        return beginDebrief(sysIndex);
      }
      return beginStarbase(sysIndex);
    }
    if (!forcedType && M.contract && M.contract.status === 'travel'
      && M.contract.stages[M.contract.stageIndex].system === sysIndex) {
      return startContractStage(sysIndex);
    }
    return startField(sysIndex, forcedType);
  }

  function startField(sysIndex, forcedType = null) {
    hideObjects();
    M.active = true;
    M.completed = false;
    M.wantsWarp = false;
    M.departureTimer = 0;
    M.progress = 0;
    M.completedAt = 0;
    M.rewardText = '';
    M.canInteract = false;
    M.prompt = '';
    M.stationKeeping = false;
    M.systemIndex = sysIndex;
    M.sequence++;
    M.mode = M.contract && M.contract.status === 'travel' ? 'contract' : 'field';
    M.briefing = true;
    M.phase = 'briefing';
    M.type = chooseType(sysIndex, G.safeSystem, forcedType);
    lastType = M.type;
    const f = flavor();
    const rng = G.rngFor('mission-text-' + sysIndex + '-' + M.type);
    M.targetObj = objects[M.type] ? objects[M.type].group : null;
    M.targetPos.set(0, 0, 0);
    M.distance = 0;
    contactWarn = '';

    if (M.type === 'combat') {
      M.title = 'SECTOR PATROL';
      M.targetName = `${G.names.power.toUpperCase()} PATROL`;
      M.objective = `CLEAR THE ${G.names.power.toUpperCase()} PATROL`;
      M.hint = 'HOSTILE CONTACTS INBOUND';
      M.progressLabel = '';
      M.rewardText = 'SECTOR SECURED';
      briefT = 3.2;
    } else if (M.type === 'diplomacy') {
      const envoyName = pick(rng, f.envoys);
      M.title = 'DIPLOMATIC CONTACT';
      M.targetName = envoyName.toUpperCase();
      M.objective = `OPEN A CHANNEL WITH THE ${envoyName.toUpperCase()}`;
      M.hint = 'STARFLEET DOCTRINE · TALK FIRST';
      M.progressLabel = 'RANGE 0u';
      interactRange = 270;
      holdRange = 430;
      holdTime = 9.0;
      briefT = 3.2;
    } else if (M.type === 'relief') {
      const prefix = pick(rng, f.prefixes);
      M.title = 'PLANETARY RELIEF';
      M.targetName = `${prefix} ${G.names.planet.toUpperCase()} RELIEF`;
      M.objective = `TRANSFER SUPPLIES TO ${M.targetName}`;
      M.hint = 'COLONY RUNNING OUT OF MEDICAL SUPPLIES';
      M.progressLabel = 'RANGE 0u';
      interactRange = 280;
      holdRange = 390;
      holdTime = 7.0;
      briefT = 3.2;
    } else {
      const lifeName = pick(rng, f.lifeforms);
      M.title = 'FIRST CONTACT';
      M.targetName = lifeName.toUpperCase();
      M.objective = `OBSERVE THE ${lifeName.toUpperCase()}`;
      M.hint = 'SEEK OUT NEW LIFE · DO NOT DISTURB IT';
      M.progressLabel = 'RANGE 0u';
      interactRange = 320;
      holdRange = 440;
      minRange = 105;
      holdTime = 11.0;
      briefT = 3.2;
    }

    if (M.type !== 'combat') {
      const reward = scaleReward(M.type);
      M.rewardText = `${reward.label} · ${reward.score} SCORE`;
    }
    M.progressLabel = M.type === 'combat' ? '' : 'RANGE 0u';
    for (const key of Object.keys(objects)) {
      if (TYPE_META[key]) objects[key].marker.material.color.setHex(TYPE_META[key].color);
    }
    if (M.targetObj) {
      positionTarget(M.targetObj);
      M.targetObj.visible = true;
      M.distance = Math.round(M.targetObj.position.distanceTo(G.player.pos));
      M.progressLabel = `RANGE ${M.distance}u`;
    }
    G.telemetryData.missionStarts = (G.telemetryData.missionStarts || 0) + 1;
    return M;
  }

  function chooseType(sysIndex, safe, forced) {
    if (forced && TYPE_META[forced]) return forced;
    if (sysIndex === 0) return 'science';
    const rng = G.rngFor('mission-' + sysIndex + (safe ? '-safe' : '-hostile'));
    const deck = safe
      ? ['diplomacy', 'relief', 'science']
      : ['combat', 'combat', 'diplomacy', 'relief', 'science'];
    let t = deck[(rng() * deck.length) | 0];
    if (t === lastType) {
      const i = deck.indexOf(t);
      t = deck[(i + 1) % deck.length];
    }
    return t;
  }

  function positionTarget(obj) {
    const rng = G.rngFor('mission-pos-' + M.systemIndex);
    _fwd.set(0, 0, -1).applyQuaternion(G.player.quat);
    _right.set(1, 0, 0).applyQuaternion(G.player.quat);
    _up.set(0, 1, 0).applyQuaternion(G.player.quat);
    M.targetPos.copy(G.player.pos)
      .addScaledVector(_fwd, 500 + rng() * 80)
      .addScaledVector(_right, (rng() - 0.5) * 190)
      .addScaledVector(_up, (rng() - 0.5) * 70);
    obj.position.copy(M.targetPos);
    obj.rotation.set(0, Math.atan2(-(G.player.pos.x - obj.position.x), -(G.player.pos.z - obj.position.z)), 0);
  }

  function hideObjects() {
    for (const key of Object.keys(objects)) objects[key].group.visible = false;
    beam.visible = false;
  }

  function finish() {
    if (M.completed) return;
    M.completed = true;
    M.briefing = false;
    M.phase = 'complete';
    M.canInteract = false;
    M.prompt = '';
    M.progress = 1;
    M.progressLabel = 'COMPLETE';
    M.completedAt = G.time;
    M.stationKeeping = false;
    beam.visible = false;
    const T = G.telemetryData;
    if (M.type === 'combat') {
      M.hint = 'PATROL CLEARED · SECTOR SECURED';
      M.departureTimer = 4.5;
    } else {
      const reward = scaleReward(M.type);
      const { score, credits } = reward;
      T.score += score;
      G.player.credits = (G.player.credits || 0) + credits;
      T.credits = G.player.credits;
      T.creditsEarned += credits;
      M.rewardText = `+${score} SCORE · +${credits} CR`;
      M.hint = M.type === 'science'
        ? 'DATA ARCHIVED · STARFLEET SCIENCE'
        : M.type === 'diplomacy'
          ? 'ACCORD SIGNED · CHANNELS OPEN'
          : 'SUPPLIES DELIVERED · COLONY STABLE';
      M.departureTimer = G.safeSystem ? 0 : 4.5;
    }
    T.missionsCompleted = (T.missionsCompleted || 0) + 1;
    T.missionsByType = T.missionsByType || {};
    T.missionsByType[M.type] = (T.missionsByType[M.type] || 0) + 1;
    T.missionLog = T.missionLog || [];
    T.missionLog.push({
      system: G.systemIndex + 1, type: M.type, title: M.title,
      at: Math.round(G.time * 10) / 10,
    });
    if (T.missionLog.length > 12) T.missionLog.shift();
    if (M.mode === 'contract') advanceContract();
    if (G.audio && G.audio.chime) G.audio.chime();
    if (M.targetObj && objects[M.type] && objects[M.type].marker) {
      objects[M.type].marker.material.color.setHex(0x9dffd6);
    }
  }

  function animate(dt) {
    const t = G.time;
    if (M.targetObj && M.targetObj.visible) {
      const o = objects[M.type];
      if (M.type === 'diplomacy') {
        M.targetObj.rotation.y += dt * 0.06;
        M.targetObj.position.y = M.targetPos.y + Math.sin(t * 0.7) * 3.2;
        o.marker.material.opacity = 0.60 + 0.24 * Math.sin(t * 3.1);
      } else if (M.type === 'relief') {
        M.targetObj.rotation.y += dt * 0.035;
        M.targetObj.rotation.z = Math.sin(t * 0.42) * 0.035;
        M.targetObj.position.y = M.targetPos.y + Math.sin(t * 0.56 + 1.1) * 2.2;
        o.marker.material.opacity = 0.60 + 0.24 * Math.sin(t * 2.8 + 0.8);
      } else if (M.type === 'science') {
        M.targetObj.rotation.y += dt * 0.10;
        M.targetObj.position.y = M.targetPos.y + Math.sin(t * 0.52) * 5.0;
        o.bell.scale.set(1 + 0.035 * Math.sin(t * 1.6), 0.70 + 0.025 * Math.sin(t * 1.8 + 0.5), 1 + 0.035 * Math.sin(t * 1.6));
        o.veins.rotation.y -= dt * 0.16;
        o.core.scale.setScalar(0.92 + 0.08 * Math.sin(t * 2.4));
        o.tentacles.rotation.y += dt * 0.22;
        o.tentacles.rotation.z = Math.sin(t * 0.5) * 0.08;
        o.halo.material.opacity = 0.30 + 0.12 * Math.sin(t * 1.4);
        o.marker.material.opacity = 0.62 + 0.24 * Math.sin(t * 2.6 + 0.4);
      }
    }
    if (beam.visible) {
      beamMat.opacity = 0.20 + 0.12 * Math.sin(t * 7.5);
    }
  }

  function updateBeam(on) {
    if (!on || !M.targetObj) { beam.visible = false; return; }
    _dir.copy(M.targetObj.position).sub(G.player.pos);
    const len = _dir.length();
    if (len < 1) { beam.visible = false; return; }
    _dir.multiplyScalar(1 / len);
    _mid.copy(G.player.pos).addScaledVector(_dir, len * 0.5);
    beam.position.copy(_mid);
    beam.quaternion.setFromUnitVectors(_upAxis, _dir);
    beam.scale.set(1.1, len, 1.1);
    beamMat.color.setHex(M.type === 'science' ? 0x7cecff : 0xffc27a);
    beam.visible = true;
  }

  function update(dt) {
    if (!M.active) return;
    animate(dt);
    if (M.targetObj) M.distance = Math.round(M.targetObj.position.distanceTo(G.player.pos));
    else M.distance = 0;

    if (M.completed) {
      if (!G.safeSystem && M.departureTimer > 0) {
        M.departureTimer = Math.max(0, M.departureTimer - dt);
        if (M.departureTimer <= 0) M.wantsWarp = true;
      }
      if (M.mode === 'contract' && M.contractHint) {
        M.hint = M.departureTimer > 0
          ? `${M.contractHint} · WARP IN ${Math.ceil(M.departureTimer)}s`
          : `${M.contractHint} · WARPING`;
      } else {
        M.hint = G.safeSystem
          ? 'MISSION COMPLETE · JUMP WHEN READY'
          : (M.departureTimer > 0 ? `MISSION COMPLETE · WARP IN ${Math.ceil(M.departureTimer)}s` : 'MISSION COMPLETE · WARPING');
      }
      return;
    }

    if (M.phase === 'briefing') {
      briefT -= dt;
      M.hint = `MISSION BRIEFING · ${M.type === 'combat' ? 'HOSTILES CLOSING' : 'STAND BY'}`;
      if (briefT <= 0) {
        M.briefing = false;
        if (M.type === 'combat') {
          M.phase = 'engaged';
          G.flight.startWave(G.flight.wave.num + 1);
          combatTotal = Math.max(1, G.flight.wave.toSpawn);
          M.objective = `CLEAR THE ${G.names.power.toUpperCase()} PATROL`;
          M.progressLabel = `${combatTotal} CONTACTS`;
          M.hint = 'WEAPONS FREE';
        } else {
          M.phase = 'approach';
          M.hint = `CLOSE TO ${interactRange}u · ${M.distance}u`;
        }
      }
      return;
    }

    if (M.phase === 'engaged') {
      const left = G.flight.aliveCount() + (G.flight.wave.active ? G.flight.wave.toSpawn : 0);
      M.progress = Math.min(1, Math.max(0, 1 - left / combatTotal));
      M.progressLabel = `${left} CONTACT${left === 1 ? '' : 'S'} LEFT`;
      M.hint = left > 0 ? 'WEAPONS FREE · CLEAR THE PATROL' : 'PATROL CLEARED';
      return;
    }

    if (M.phase === 'approach') {
      M.canInteract = M.distance <= interactRange;
      M.prompt = TYPE_META[M.type].verb;
      M.progressLabel = `RANGE ${M.distance}u`;
      M.hint = M.canInteract
        ? `PRESS E / A TO ${TYPE_META[M.type].verb}`
        : `CLOSE TO ${interactRange}u · ${M.distance}u`;
      return;
    }

    if (M.phase === 'contact') {
      M.canInteract = false;
      M.stationKeeping = M.distance <= holdRange && (M.type !== 'science' || M.distance >= minRange);
      if (M.stationKeeping) {
        G.input.thrust = 0;
        G.input.boost = false;
      }
      let gain = 0;
      contactWarn = '';
      let inBeam = false;
      if (M.type === 'diplomacy') {
        if (G.input.fire || G.input.torpedo) {
          gain = -dt * 1.2;
          contactWarn = 'WEAPONS HOT · TALKS SUSPENDED';
        } else if (M.distance > holdRange) {
          gain = -dt * 0.08;
          contactWarn = `OUT OF CHANNEL RANGE · ${M.distance}u`;
        } else {
          gain = dt / holdTime;
          inBeam = true;
        }
      } else if (M.type === 'relief') {
        if (M.distance > holdRange) {
          gain = -dt * 0.08;
          contactWarn = `OUT OF TRANSPORT RANGE · ${M.distance}u`;
        } else {
          gain = dt / holdTime;
          inBeam = true;
        }
      } else {
        if (G.input.fire || G.input.torpedo) {
          gain = -dt * 1.4;
          contactWarn = 'WEAPONS HOT · OBSERVATION LOST';
        } else if (M.distance < minRange) {
          gain = -dt * 0.9;
          contactWarn = `TOO CLOSE · GIVE IT SPACE`;
        } else if (M.distance > holdRange) {
          gain = -dt * 0.06;
          contactWarn = `OUT OF SCAN RANGE · ${M.distance}u`;
        } else {
          gain = dt / holdTime;
          inBeam = true;
        }
      }
      M.progress = Math.min(1, Math.max(0, M.progress + gain));
      const pct = Math.round(M.progress * 100);
      M.progressLabel = M.type === 'diplomacy'
        ? `TALKS ${pct}%`
        : M.type === 'relief' ? `TRANSFER ${pct}%` : `SCAN ${pct}%`;
      M.hint = contactWarn || (
        M.type === 'diplomacy' ? `HOLD WITHIN ${holdRange}u · WEAPONS COLD`
          : M.type === 'relief' ? `HOLD WITHIN ${holdRange}u · CARGO BEAM ACTIVE`
            : `MAINTAIN ${minRange}\u2013${holdRange}u · WEAPONS COLD`
      );
      updateBeam(inBeam);
      if (M.progress >= 1) finish();
      return;
    }
  }

  M.beginSystem = beginSystem;
  M.update = update;
  M.depart = () => {
    hideObjects();
    M.active = false;
    M.completed = false;
    M.phase = null;
    M.canInteract = false;
    M.stationKeeping = false;
    M.wantsWarp = false;
    M.departureTimer = 0;
    M.mode = 'idle';
    M.offers = [];
    M.lastDebrief = '';
  };
  M.nextWarpTarget = () => {
    const c = M.contract;
    if (!c) return null;
    if (c.status === 'travel') return c.stages[c.stageIndex].system;
    if (c.status === 'return' || c.status === 'debrief') return c.issuerSystem;
    return null;
  };
  M.acceptOffer = (index) => {
    if (M.contract || !M.offers[index]) return false;
    const offer = M.offers[index];
    M.contract = {
      id: offer.id, title: offer.title,
      issuerSystem: offer.issuerSystem, issuerName: offer.issuerName,
      stages: offer.stages.map((st) => ({ ...st })),
      stageIndex: 0, status: 'travel',
      score: offer.score, credits: offer.credits,
      acceptedAt: G.time,
    };
    M.offers = [];
    M.mode = 'starbase';
    M.lastDebrief = '';
    const first = G.ensureSystem(M.contract.stages[0].system);
    M.contractHint = `COURSE SET · ${first.area.toUpperCase()}`;
    G.setCourse(M.contract.stages[0].system);
    if (G.audio && G.audio.chime) G.audio.chime();
    return true;
  };
  M.abandonContract = () => {
    if (!M.contract) return false;
    M.contract = null;
    G.clearCourse();
    M.contractHint = 'ASSIGNMENT RELEASED';
    beginStarbase(G.systemIndex);
    M.contractHint = 'ASSIGNMENT RELEASED';
    return true;
  };
  M.completeContract = () => {
    const c = M.contract;
    if (!c || c.status !== 'debrief') return false;
    const T = G.telemetryData;
    T.score += c.score;
    T.assignmentsCompleted = (T.assignmentsCompleted || 0) + 1;
    T.reputation = (T.reputation || 0) + 1;
    G.player.credits = (G.player.credits || 0) + c.credits;
    T.credits = G.player.credits;
    T.creditsEarned += c.credits;
    if (G.career) G.career.contracts = (G.career.contracts || 0) + 1;
    M.contract = null;
    const name = c.title;
    beginStarbase(G.systemIndex);
    M.lastDebrief = `${name} CLOSED · +${c.score} SCORE · +${c.credits} CR`;
    M.contractHint = M.lastDebrief;
    if (G.audio && G.audio.chime) G.audio.chime();
    return true;
  };
  M.interact = () => {
    if (!M.active || M.completed || M.phase !== 'approach' || !M.canInteract) return false;
    M.phase = 'contact';
    M.progress = 0;
    M.canInteract = false;
    M.hint = M.type === 'science' ? 'PASSIVE SCAN · WEAPONS COLD' : 'CHANNEL OPEN';
    if (G.audio && G.audio.chime) G.audio.chime();
    return true;
  };
  M.combatCleared = () => {
    if (M.active && M.type === 'combat' && !M.completed) finish();
  };
  M.forceComplete = () => {
    if (M.active && !M.completed) finish();
  };

  G.missions = M;
  return M;
}
