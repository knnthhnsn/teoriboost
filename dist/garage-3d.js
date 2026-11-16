// Garagens 3D-scene: den godkendte Nordic GT (sedan 053), drejelig, med røntgen og kamera der flyver til hvert område.
import { loadThree } from './initial-load.js';
import { loadApprovedFleet } from './approved-fleet.js';
import { plateTexture, addPlates } from './plate-3d.js';

const CX = 2.39; // modellens midte på x-aksen; fronten vender mod +x
const rad = d => d * Math.PI / 180;

/* Kamera pr. område: mål i modelkoordinater, drejning, hældning og afstand. */
const VIEWS = {
  '': { t: [2.55, 0.5, -0.5], yaw: -34, pitch: 11, dist: 8.8 },
  cockpit: { t: [2.7, 0.85, -0.2], yaw: -58, pitch: 16, dist: 6 },
  powertrain: { t: [3.7, 0.55, 0], yaw: 28, pitch: 20, dist: 5.2 },
  exterior: { t: [3.7, 0.42, -0.9], yaw: -84, pitch: 8, dist: 4.4 },
  documents: { t: [1.4, 0.85, -1.4], yaw: -50, pitch: 9, dist: 7 }
};
const XRAY_FOR = { '': 0, cockpit: 0.6, powertrain: 1, exterior: 0, documents: 0 };

/* Punkter på bilen. n = hvilken retning punktet "kigger", så det kan skjules bag bilen. */
const ANCHORS = {
  cockpit: [{ p: [2.9, 1.08, -0.45], n: [0, 1, 0] }],
  powertrain: [{ p: [4.0, 0.98, 0], n: [0.4, 1, 0], xray: [3.95, 0.62, 0] }],
  exterior: [{ p: [3.82, 0.42, -1.14], n: [0, 0, -1] }, { p: [3.82, 0.42, 1.14], n: [0, 0, 1] }],
  documents: [{ p: [0.7, 1.0, -2.0], n: [0, 0, -1] }]
};

const GHOST = new Set(['portable_nordic_paint', 'portable_trim', 'portable_paint2', 'portable_seal', 'portable_nordic_dlo_silver', 'portable_nordic_recess', 'portable_chrome', 'portable_panoroof', 'portable_nordic_glass', 'portable_liner', 'portable_plate', 'portable_tb_badge_enamel', 'portable_tb_badge_chrome', 'portable_tb_badge_bars']);

function paperTexture(T) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 330;
  const g = c.getContext('2d');
  g.fillStyle = '#E3E5E8'; g.fillRect(0, 0, 256, 330);
  g.fillStyle = '#1F2328'; g.fillRect(28, 32, 76, 46);
  g.fillStyle = '#FFD60A'; g.fillRect(176, 32, 52, 46);
  g.fillStyle = '#1F2328'; g.font = '900 34px Rubik, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('B', 202, 68);
  g.fillStyle = '#5F656D';
  [112, 146, 180, 214, 248].forEach((y, i) => g.fillRect(28, y, i === 3 ? 120 : 200, 8));
  const tex = new T.CanvasTexture(c); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
  return tex;
}

function shadowTexture(T) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 10, 128, 128, 126);
  r.addColorStop(0, 'rgba(0,0,0,.7)'); r.addColorStop(.55, 'rgba(0,0,0,.32)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
  return new T.CanvasTexture(c);
}

export async function mountCar3d(stage, { interactive = true, zone = '' } = {}) {
  if (!await loadThree()) return null;
  const T = window.THREE;
  let gltf;
  try { gltf = await loadApprovedFleet(T, 'sedan', 'lod1'); } catch { return null; }
  if (!stage.isConnected) return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'gx-3d';
  canvas.setAttribute('aria-hidden', 'true');
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power', preserveDrawingBuffer: true }); } catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 80);
  scene.add(new T.HemisphereLight(0xeaf1f5, 0x4a525a, 1.2));
  const key = new T.DirectionalLight(0xfff1d6, 1.05); key.position.set(-6, 9, -7); scene.add(key);
  const rim = new T.DirectionalLight(0xb5cfe0, 0.55); rim.position.set(7, 4, 8); scene.add(rim);

  const root = new T.Group(); root.position.x = -CX; scene.add(root);
  root.add(gltf.scene);
  const plateMap = plateTexture(T); addPlates(T, gltf.scene, plateMap);
  const shadow = new T.Mesh(new T.PlaneGeometry(6.4, 3.4), new T.MeshBasicMaterial({ map: shadowTexture(T), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(CX, 0.004, 0); root.add(shadow);

  /* Materialer: bil-ghosting til røntgen, og lys i de dele et område peger på. */
  const ghosted = [], lit = { cockpit: [], exterior: [] };
  const seen = new Set();
  gltf.scene.traverse(o => {
    if (!o.isMesh) return;
    for (const m of [].concat(o.material)) {
      if (seen.has(m)) continue; seen.add(m);
      if (GHOST.has(m.name)) { ghosted.push({ m, base: m.opacity, baseTransparent: m.transparent }); }
      if (m.emissive && (m.name === 'portable_brake_caliper' || m.name === 'portable_led')) lit.exterior.push(m);
      if (m.emissive && (m.name === 'portable_trim' && o.name === 'steering_wheel')) lit.cockpit.push(m);
    }
  });

  /* Drivlinjen: bygget i modellens koordinater, så den sidder præcist under karrosseriet. */
  const drive = new T.Group(); drive.visible = false; root.add(drive);
  const yellow = new T.MeshStandardMaterial({ color: 0xFFD60A, roughness: 0.45, metalness: 0.1, transparent: true });
  const steel = new T.MeshStandardMaterial({ color: 0xC2CCD6, roughness: 0.4, metalness: 0.5, transparent: true });
  const white = new T.MeshStandardMaterial({ color: 0xFEFFED, roughness: 0.5, transparent: true });
  const ink = new T.LineBasicMaterial({ color: 0x0F1215, transparent: true });
  const add = (geo, mat, x, y, z, rot) => { const mesh = new T.Mesh(geo, mat); mesh.position.set(x, y, z); if (rot) mesh.rotation.set(...rot); mesh.add(new T.LineSegments(new T.EdgesGeometry(geo, 35), ink)); drive.add(mesh); return mesh; };
  add(new T.BoxGeometry(0.78, 0.5, 0.62), yellow, 3.98, 0.58, 0);
  for (let i = 0; i < 4; i++) add(new T.BoxGeometry(0.14, 0.12, 0.54), yellow, 3.78 + i * 0.16, 0.9, 0);
  add(new T.CylinderGeometry(0.2, 0.17, 0.4, 24), white, 3.4, 0.5, 0, [0, 0, Math.PI / 2]);
  add(new T.BoxGeometry(0.75, 0.34, 0.36), white, 2.86, 0.46, 0);
  add(new T.CylinderGeometry(0.045, 0.045, 1.9, 16), steel, 1.8, 0.4, 0, [0, 0, Math.PI / 2]);
  add(new T.BoxGeometry(0.34, 0.26, 0.34), white, 0.86, 0.38, 0);
  add(new T.CylinderGeometry(0.03, 0.03, 1.8, 12), steel, 0.86, 0.385, 0, [Math.PI / 2, 0, 0]);
  add(new T.CylinderGeometry(0.03, 0.03, 1.8, 12), steel, 3.82, 0.385, 0, [Math.PI / 2, 0, 0]);
  add(new T.CylinderGeometry(0.17, 0.17, 0.5, 20), steel, 2.2, 0.28, 0.58, [Math.PI / 2, 0, 0]);
  const dotMat = new T.MeshBasicMaterial({ color: 0xFFD60A, transparent: true });
  const dots = Array.from({ length: 9 }, () => { const d = new T.Mesh(new T.SphereGeometry(0.05, 10, 10), dotMat); drive.add(d); return d; });

  /* Papirerne: svæver ved siden af bilen, så "Ansvar og papirer" også er noget man kan se udefra. */
  const paper = new T.Mesh(new T.PlaneGeometry(0.95, 1.22), new T.MeshBasicMaterial({ map: paperTexture(T), side: T.DoubleSide, toneMapped: false }));
  paper.position.set(0.7, 0.95, -2.0); paper.rotation.y = rad(-8);
  root.add(paper);

  const size = () => {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 1.1 ? 38 : 30; camera.updateProjectionMatrix();
  };
  stage.prepend(canvas); size();
  const ro = new ResizeObserver(size); ro.observe(stage);

  const reduced = () => document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = { ...VIEWS[zone in VIEWS ? zone : ''] };
  let target = { ...current, t: [...current.t] };
  let view = { yaw: current.yaw, pitch: current.pitch, dist: current.dist, t: [...current.t] };
  let sway = 0, activeZone = zone, xray = 0, xrayTarget = 0, lastInput = -1e9, dragging = false;
  const pins = [...stage.querySelectorAll('[data-pins="out"] .gx-pin')];
  stage.querySelector('[data-pins="bp"]')?.setAttribute('hidden', '');
  stage.dataset.three = 'on';

  function setZone(z, { withXray = true } = {}) {
    activeZone = z; const v = VIEWS[z in VIEWS ? z : '']; target = { yaw: v.yaw, pitch: v.pitch, dist: v.dist, t: [...v.t] };
    lastInput = -1e9; if (withXray) xrayTarget = XRAY_FOR[z] ?? 0;
    if (reduced()) { view = { yaw: target.yaw, pitch: target.pitch, dist: target.dist, t: [...target.t] }; xray = xrayTarget; }
  }
  function setXray(v) { xrayTarget = Math.min(1, Math.max(0, v)); if (reduced()) xray = xrayTarget; }
  if (!interactive) { xray = xrayTarget = XRAY_FOR[zone] ?? 0; }

  /* Træk for at dreje. */
  let sx = 0, sy = 0;
  if (interactive) {
    canvas.style.touchAction = 'pan-y';
    canvas.addEventListener('pointerdown', e => { dragging = true; sx = e.clientX; sy = e.clientY; canvas.setPointerCapture(e.pointerId); stage.classList.add('is-dragging'); stage.dataset.touched = '1'; });
    canvas.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; sx = e.clientX; sy = e.clientY;
      target.yaw -= dx * 0.45; view.yaw = target.yaw;
      target.pitch = Math.min(38, Math.max(3, target.pitch + dy * 0.18)); view.pitch = target.pitch;
      lastInput = performance.now();
    });
    const up = () => { dragging = false; stage.classList.remove('is-dragging'); lastInput = performance.now(); };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  }

  const v3 = new T.Vector3(), cam = new T.Vector3();
  const ease = (a, b, k) => a + (b - a) * k;
  let last = performance.now(), visible = true, raf = 0, disposed = false;

  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!stage.isConnected) { dispose(); return; }
    const box = stage.getBoundingClientRect();
    visible = box.bottom > 0 && box.top < innerHeight;
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const k = 1 - Math.exp(-dt * 5.5);
    let dyaw = target.yaw - view.yaw; dyaw = ((dyaw + 540) % 360) - 180;
    if (!dragging) {
      view.yaw += dyaw * k; view.pitch = ease(view.pitch, target.pitch, k); view.dist = ease(view.dist, target.dist, k);
      for (let i = 0; i < 3; i++) view.t[i] = ease(view.t[i], target.t[i], k);
    }
    const idle = interactive && !dragging && !reduced() && now - lastInput > 3500;
    sway = ease(sway, idle ? Math.sin(now / 2600) * 7 : 0, 1 - Math.exp(-dt * 1.2));
    xray = ease(xray, xrayTarget, 1 - Math.exp(-dt * 6));

    const yaw = rad(view.yaw + sway), pit = rad(view.pitch);
    camera.position.set(view.t[0] - CX + Math.cos(yaw) * Math.cos(pit) * view.dist, view.t[1] + Math.sin(pit) * view.dist, view.t[2] + Math.sin(yaw) * Math.cos(pit) * view.dist);
    camera.lookAt(view.t[0] - CX, view.t[1], view.t[2]);

    const solid = 1 - xray * 0.9;
    for (const g of ghosted) { g.m.transparent = xray > 0.02 || g.baseTransparent; g.m.opacity = g.base * solid; g.m.depthWrite = xray < 0.4 && !g.baseTransparent; g.m.needsUpdate = false; }
    drive.visible = xray > 0.03;
    for (const m of [yellow, steel, white, dotMat, ink]) m.opacity = Math.min(1, xray * 1.4);
    const pulse = 0.5 + 0.5 * Math.sin(now / 320);
    const glowOn = z => activeZone === z ? 0.22 + pulse * 0.28 : 0;
    for (const m of lit.exterior) { m.emissive.setHex(0xFFD60A); m.emissiveIntensity = glowOn('exterior'); }
    for (const m of lit.cockpit) { m.emissive.setHex(0xFFD60A); m.emissiveIntensity = glowOn('cockpit'); }
    yellow.emissive.setHex(0xFFD60A); yellow.emissiveIntensity = activeZone === 'powertrain' ? 0.18 + pulse * 0.25 : 0;
    paper.position.y = 0.95 + Math.sin(now / 900) * 0.04;
    paper.scale.setScalar(ease(paper.scale.x, activeZone === 'documents' ? 1.22 : 1, k));
    paper.lookAt(camera.position.x + CX, paper.position.y, camera.position.z);
    const t = now / 1000;
    dots.forEach((d, i) => { const u = ((t * 0.42 + i / dots.length) % 1); d.position.set(3.9 - u * 3.05, 0.5 - u * 0.1, 0); });

    renderer.render(scene, camera);

    /* Punkterne følger de rigtige steder på bilen. */
    const w = stage.clientWidth, h = stage.clientHeight;
    for (const pin of pins) {
      const z = pin.dataset.gxZone; if (!interactive && z !== zone) continue;
      let best = null, bestDot = -9;
      for (const a of ANCHORS[z]) {
        const p = a.xray && xray > 0.5 ? a.xray : a.p;
        v3.set(p[0] - CX, p[1], p[2]);
        cam.copy(camera.position).sub(v3).normalize();
        const d = cam.x * a.n[0] + cam.y * a.n[1] + cam.z * a.n[2];
        if (d > bestDot) { bestDot = d; best = v3.clone(); }
      }
      const away = z !== 'documents' && bestDot < (z === 'cockpit' ? -0.35 : 0.05); // the papers float beside the car: their number must always stay reachable
      pin.classList.toggle('is-away', away);
      if (best) {
        best.project(camera);
        const clamp = v => Math.max(7, Math.min(93, v)), px = clamp((best.x * 0.5 + 0.5) * 100), py = clamp((-best.y * 0.5 + 0.5) * 100); // off-screen anchors park at the edge instead of vanishing
        pin.style.left = px + '%'; pin.style.top = py + '%';
        pin.classList.toggle('gx-pin--l', px > 58); pin.classList.toggle('gx-pin--r', px <= 58);
        pin.classList.remove('gx-pin--b');
      }
    }
  }
  raf = requestAnimationFrame(frame);

  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(raf); ro.disconnect();
    scene.traverse(o => { o.geometry?.dispose?.(); for (const m of [].concat(o.material || [])) { m.map?.dispose?.(); m.dispose?.(); } });
    renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove();
  }
  stage.classList.add('has-3d');
  return { setZone, setXray, dispose };
}
