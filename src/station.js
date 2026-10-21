import * as THREE from 'three';

export function initStation(G) {
  const group = new THREE.Group();
  group.visible = false;
  G.scene.add(group);

  const hull = new THREE.MeshStandardMaterial({ color: 0x9aa2ad, metalness: 0.62, roughness: 0.40 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x30363f, metalness: 0.78, roughness: 0.30 });
  const panels = new THREE.MeshStandardMaterial({ color: 0xb9c0c6, metalness: 0.45, roughness: 0.52 });
  const windowMat = new THREE.MeshBasicMaterial({ color: 0xffb15c });
  const blueMat = new THREE.MeshBasicMaterial({ color: 0x69c7ff });
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff5a3c });

  const spin = new THREE.Group();
  group.add(spin);

  const core = new THREE.Mesh(new THREE.CylinderGeometry(145, 190, 470, 20), hull);
  core.position.y = 30;
  spin.add(core);

  const nose = new THREE.Mesh(new THREE.CylinderGeometry(48, 145, 150, 20), trim);
  nose.position.y = 340;
  spin.add(nose);

  const tail = new THREE.Mesh(new THREE.CylinderGeometry(190, 95, 120, 20), trim);
  tail.position.y = -270;
  spin.add(tail);

  const ring = new THREE.Mesh(new THREE.TorusGeometry(640, 28, 10, 80), hull);
  ring.rotation.x = Math.PI / 2;
  spin.add(ring);

  const ringTrim = new THREE.Mesh(new THREE.TorusGeometry(640, 37, 8, 80), trim);
  ringTrim.rotation.x = Math.PI / 2;
  ringTrim.scale.setScalar(0.995);
  spin.add(ringTrim);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const pod = new THREE.Mesh(new THREE.BoxGeometry(92, 74, 196), i % 3 === 0 ? panels : hull);
    pod.position.set(Math.cos(a) * 640, 0, Math.sin(a) * 640);
    pod.rotation.y = -a;
    spin.add(pod);

    const light = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 150), i % 2 ? windowMat : blueMat);
    light.position.set(Math.cos(a) * 690, 0, Math.sin(a) * 690);
    light.rotation.y = -a;
    spin.add(light);
  }

  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(56, 38, 540), trim);
    arm.position.set(Math.cos(a) * 330, 0, Math.sin(a) * 330);
    arm.rotation.y = -a;
    spin.add(arm);

    const pylon = new THREE.Mesh(new THREE.BoxGeometry(74, 58, 120), panels);
    pylon.position.set(Math.cos(a) * 620, 0, Math.sin(a) * 620);
    pylon.rotation.y = -a;
    spin.add(pylon);
  }

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const strip = new THREE.Mesh(new THREE.BoxGeometry(10, 260, 8), i % 2 ? windowMat : blueMat);
    strip.position.set(Math.cos(a) * 166, 30, Math.sin(a) * 166);
    strip.rotation.y = -a;
    spin.add(strip);
  }

  const beacon = new THREE.Mesh(new THREE.SphereGeometry(15, 8, 6), beaconMat);
  beacon.position.y = 432;
  spin.add(beacon);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(3600, 48, 32),
    new THREE.MeshStandardMaterial({
      color: 0x3e6f9c, metalness: 0.05, roughness: 0.92,
      emissive: 0x071a2c, emissiveIntensity: 1,
    })
  );
  planet.position.set(0, -2600, -16500);
  group.add(planet);

  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(3820, 40, 24),
    new THREE.MeshBasicMaterial({
      color: 0x67b8ff, transparent: true, opacity: 0.11,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    })
  );
  atmo.position.copy(planet.position);
  group.add(atmo);

  const label = 'DEEP SPACE PORT';
  let safe = false;
  let dockable = false;

  function setSystem(sys, isSafe) {
    safe = !!isSafe;
    dockable = safe;
    group.position.set(sys * 40000, 0, -2200);
    group.visible = safe;
  }

  function nearest() {
    return G.player.pos.distanceTo(group.position);
  }

  function canDock() {
    return safe && G.mode === 'space' && nearest() < 1600;
  }

  function update(dt, t) {
    const show = safe && G.mode === 'space' && G.state !== 'warp' && G.state !== 'warp-charge';
    group.visible = show;
    if (!show) return;
    spin.rotation.y += dt * 0.035;
    planet.rotation.y += dt * 0.004;
    const pulse = 0.55 + 0.45 * Math.sin(t * 4.2);
    beacon.scale.setScalar(0.75 + pulse * 0.55);
    beaconMat.color.setRGB(1.0, 0.28 + pulse * 0.20, 0.18 + pulse * 0.10);
  }

  G.station = {
    group,
    setSystem,
    update,
    nearest,
    canDock,
    get safe() { return safe; },
    get dockable() { return dockable; },
    get label() { return label; },
    get planetName() { return G.names.planet; },
  };
  return G.station;
}
