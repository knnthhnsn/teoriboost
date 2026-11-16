// A small three.js diorama for a driving-test situation, in the garage's look: the approved Nordic GT, flat colours with ink edges.
import { loadThree } from './initial-load.js';
import { loadApprovedFleet } from './approved-fleet.js';
import { plateTexture, addPlates } from './plate-3d.js';
import { attachCylindricalBillboard } from './cylindrical-billboard.js';
import { createSeatedOccupants } from './seated-occupants.js';
import { buildExtra, addPoliceMarkings } from './vehicles-extra.js';
const EXTRA_KINDS = new Set(['bus', 'lorry', 'ambulance', 'tractor']); // drawn from boxes when there is no model (tractor) or the model fails to load

// Road-side people (Codex art, cut out): name -> height in metres.
const PEOPLE = { 'dad-shoulders': 2.0, 'granny-rollator': 1.55, 'jogger-headphones': 1.8, 'kid-ball': 1.15, 'kindergarten-group': 1.55, 'phone-walker': 1.8, 'pram-mum': 1.7, 'road-worker': 1.8, 'scooter-teen': 1.75, 'wheelchair-cheer': 1.45, 'wheelchair-finger': 1.45, 'white-cane': 1.8, 'dog-stick': 0.75, 'dog-dachshund': 0.5, 'deer-startled': 1.1, 'deer-fawn': 1.05, 'snowman-cool': 1.35, 'snowman-melting': 1.3 };
const loadSprite = (T, path, height) => new Promise((resolve, reject) => new T.TextureLoader().load(new URL(path, import.meta.url).href, tex => {
  tex.encoding = T.sRGBEncoding; const h = height, geo = new T.PlaneGeometry(h * tex.image.width / tex.image.height, h); geo.translate(0, h / 2, 0);
  const m = attachCylindricalBillboard(T, new T.Mesh(geo, new T.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05, depthWrite: false, side: T.DoubleSide })));
  m.userData.dispose = () => { geo.dispose(); m.material.dispose(); tex.dispose(); }; resolve(m);
}, undefined, () => reject(new Error('sprite unavailable'))));
const PROP_H = { licence: 3.6, laptop: 3.2, phone: 3.8, drinks: 3.4, pills: 3.2, 'coffee-clock': 3.4, charger: 4.6, fine: 3.4, keys: 3.0, clipboard: 3.8, documents: 3.2, steering: 3.0 };
const loadProp = (T, name) => loadSprite(T, `./assets/props/${name}.webp`, PROP_H[name]);
const loadPerson = (T, name) => loadSprite(T, `./assets/people-situations/${name}.webp`, PEOPLE[name] * 1.4);
// The cyclists in these scenes ride away from the camera, so they are drawn from behind (the side view looked sideways on the road).
const loadCyclist = T => loadSprite(T, './assets/people-cse/a_cyclist_rear.webp', 2.3);

const INK = 0x0F1215;
// The 3D vehicles we have: the approved Nordic GT (sedan) and Petrol GT (scooter), and the draft Rally Hatch for background traffic.
const LODS = { sedan: 'lod1', scooter: 'lod1', hatch: 'lod0' }, fleet = {};
// Bus, lorry and ambulance are our own Blender models (car-studio), exported to plain GLB; they keep their own paint.
const PLAIN = { bus: 'citybus', lorry: 'truck', ambulance: 'ambulance' };
const NOSE_FLIP = {}; // models whose nose points -x
// The GLB export flattens Blender's procedural paint to grey, so the body colours are set again here by material name.
const PLAIN_COLOURS = {
  ambulance: { ambulance_paint_PBR: '#F4F5F7', ambulance_dark_PBR: '#2B3138', ambulance_silver_PBR: '#C2CCD6', ambulance_green_PBR: '#58CC02', ambulance_blue_PBR: '#2D7BFF', ambulance_red_PBR: '#D42F2F', ambulance_seat_PBR: '#5F656D', ambulance_lamp_PBR: '#2D7BFF', ambulance_mirror_PBR: '#2B3138', ambulance_glass_PBR: '#243542' },
  lorry: { truck_paint_PBR: '#3F5F73', truck_dark_PBR: '#2B3138', truck_cream_PBR: '#E3E5E8', truck_trailer_cream_PBR: '#E3E5E8', truck_silver_PBR: '#C2CCD6', truck_mustard_PBR: '#C9A200', truck_lamp_PBR: '#FFF2B0', truck_mirror_PBR: '#2B3138', seat_PBR: '#171918' },
  bus: {}
};
const loadPlain = (T, file) => (T.GLTFLoader ? Promise.resolve() : import('./assets/GLTFLoader-r128.js')).then(() => new Promise((res, rej) => new T.GLTFLoader().load(new URL(`./assets/models/vehicles/${file}.glb`, import.meta.url).href, res, undefined, rej)));
const loadVehicle = (T, kind) => fleet[kind] ||= (PLAIN[kind] ? loadPlain(T, PLAIN[kind]) : loadApprovedFleet(T, kind, LODS[kind])).catch(e => { fleet[kind] = null; throw e; });
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function shadowTexture(T) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), r = g.createRadialGradient(64, 64, 6, 64, 64, 62);
  r.addColorStop(0, 'rgba(0,0,0,.55)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128);
  return new T.CanvasTexture(c);
}

export async function mountSituation3d(stage, spec) {
  if (!stage || !await loadThree() || !stage.isConnected) return null;
  const T = window.THREE;
  const kinds = [...new Set(['sedan', ...spec.actors.filter(a => a.t === 'car' || a.t === 'parked').map(a => a.kind === 'police' ? 'sedan' : a.kind || 'sedan').filter(k => LODS[k] || PLAIN[k])])], models = {};
  for (const k of kinds) { try { models[k] = await loadVehicle(T, k); } catch { if (k === 'sedan') return null; } }
  // Drivers: the game's own seated 2D people (seated-occupants.js), only when a moving sedan is in the scene.
  let occupants = null;
  if (spec.actors.some(a => a.t === 'car' && (a.learner || !a.kind || a.kind === 'sedan' || a.kind === 'police'))) { try { occupants = await createSeatedOccupants(T); } catch { occupants = null; } }
  let cyclist = null;
  if (spec.actors.some(a => a.t === 'cyclist')) { try { cyclist = await loadCyclist(T); } catch { cyclist = null; } }
  const people = {};
  // (effect cards are loaded below, once the scene helpers exist)
  for (const n of new Set(spec.actors.filter(a => a.t === 'person' && PEOPLE[a.p]).map(a => a.p))) { try { people[n] = await loadPerson(T, n); } catch { /* the scene still works without this person */ } }
  const props = {};
  for (const n of (spec.studio || [])) { if (PROP_H[n]) { try { props[n] = await loadProp(T, n); } catch { /* the car still stands in the studio */ } } }
  // Painted scenery (grass, asphalt, trees, houses), made by Codex in the series' style; scenes still work without them.
  const envTex = {};
  if (!spec.studio) await Promise.all(['grass', 'asphalt', 'tree-pine', 'tree-round', 'tree-bare-autumn', 'house-a', 'house-b', 'house-c'].map(n => new Promise(res => new T.TextureLoader().load(`assets/scene-env/${n}.webp`, t => { t.encoding = T.sRGBEncoding; t.anisotropy = 4; envTex[n] = t; res(); }, undefined, () => res()))));
  if (!stage.isConnected) return null;

  const canvas = document.createElement('canvas'); canvas.className = 'sit3d'; canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Tredimensionel illustration af situationen. Alle betingelser står i situationens tekst.');
  let renderer; try { renderer = new T.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: !!spec.capture }); } catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75)); renderer.outputEncoding = T.sRGBEncoding;
  // 16 Nov 2026: no filmic tone mapping. ACES flattened the brand yellow to pastel and greyed the Codex-painted CSE art;
  // colours now come out as drawn, and the light is scaled down instead (env.lightScale).
  renderer.toneMapping = T.NoToneMapping;
  // Weather and light: sky, fog, ground and light strength per environment.
  const ENVS = { day: { sky: 0x9DB7B2, fogColor: 0xA9B9A6, fog: [70, 150], ground: 0x56703A, hemiSky: 0xC9D9D0, hemiGround: 0x3F3A2A, hemi: 0.6, hemiBoost: 4.3, sunColor: 0xFFD9A0, sun: 1.9, sunPos: [-14, 6, 10], exposure: 0.88 }, night: { sky: 0x101C2C, fog: [14, 60], ground: 0x25382A, hemi: 0.45, sun: 0.18 }, fog: { sky: 0xD3D9DE, fog: [6, 34], ground: 0x8FA070, hemi: 1.2, sun: 0.5 }, snow: { sky: 0xDCE6EC, fog: [30, 90], ground: 0xD9E0E6, hemi: 1.35, sun: 0.7, lightScale: 0.55 }, rain: { sky: 0x93A6B3, fog: [22, 80], ground: 0x62804F, hemi: 0.95, sun: 0.35 }, sun: { sky: 0xF3E3B0, fog: [60, 130], ground: 0x8AA645, hemi: 1.3, sun: 1.5 } };
  const env = { ...(ENVS[spec.env] || ENVS.day), ...(spec.look || {}) };
  if (spec.variant && env.sunPos) env.sunPos = [-env.sunPos[0], env.sunPos[1], env.sunPos[2]];
  const LS = env.lightScale ?? 0.9, HF = env.hemiBoost ?? 1; // light without tone mapping: less direct sun, more even sky fill (measured against the old look)
  const scene = new T.Scene(); scene.background = new T.Color(env.sky); scene.fog = new T.Fog(env.fogColor ?? env.sky, env.fog[0], env.fog[1]);
  const camera = new T.PerspectiveCamera(36, 1, 0.5, 160);
  scene.add(new T.HemisphereLight(env.hemiSky ?? 0xEAF1F5, env.hemiGround ?? 0x6A7452, env.hemi * HF * LS));
  const sun = new T.DirectionalLight(env.sunColor ?? 0xFFF1D6, env.sun * LS); sun.position.set(...(env.sunPos || [-8, 14, 6])); scene.add(sun);

  // Hex colours here are sRGB values as drawn; three r128 reads them as linear, which washes everything out, so convert once.
  const mat = (color, o = {}) => new T.MeshStandardMaterial({ color: new T.Color(color).convertSRGBToLinear(), roughness: 0.95, metalness: 0, flatShading: true, ...o });
  // Road-coloured flat surfaces get the painted asphalt (tiled by size) so side roads, yards and rings match the main road.
  const asphaltFor = (w, d) => { const t = envTex.asphalt.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(Math.max(0.2, w / 8), Math.max(0.2, d / 8)); return t; };
  const ROAD_COLOURS = new Set([0x2D343B, 0x23292E]);
  const inkMat = new T.LineBasicMaterial({ color: INK });
  const box = (w, h, d, color, x, y, z, edges = true) => {
    const g = new T.BoxGeometry(w, h, d), m = new T.Mesh(g, mat(color)); m.position.set(x, y, z);
    if (edges) m.add(new T.LineSegments(new T.EdgesGeometry(g), inkMat));
    scene.add(m); return m;
  };
  const flat = (w, d, color, x, y, z) => { const road = envTex.asphalt && ROAD_COLOURS.has(color), m = new T.Mesh(new T.PlaneGeometry(w, d), mat(road ? 0xFFFFFF : color)); if (road) { m.material.color.set(0xFFFFFF); m.material.map = asphaltFor(w, d); } m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); scene.add(m); return m; };
  const shadowTex = shadowTexture(T);
  const blob = (x, z, w, d) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); scene.add(m); };

  // Ground and the main road (runs along z).
  // Painted ground: soft mottled patches instead of one flat colour (multiplies the ground colour).
  const mottle = (rep, seed, lo = 205) => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'), q = rng(seed); g.fillStyle = `rgb(${lo + 25},${lo + 25},${lo + 25})`; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { const v = lo + Math.floor(q() * 50), x = q() * 256, y = q() * 256, rad = 6 + q() * 26; g.fillStyle = `rgba(${v},${v},${v},0.35)`; for (const [ox, oy] of [[0, 0], [256, 0], [-256, 0], [0, 256], [0, -256]]) { g.beginPath(); g.arc(x + ox, y + oy, rad, 0, 7); g.fill(); } } const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; };
  const groundTex = mottle([36, 36], 11), roadTex = mottle([1.4, 24], 5, 225);
  const painted = spec.env !== 'snow' && envTex.grass;
  if (painted) { for (const [t, rx, ry] of [[envTex.grass, 30, 30], [envTex.asphalt, 1.2, 14]]) { if (!t) continue; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rx, ry); } }
  const gm = flat(300, 300, painted ? 0xFFFFFF : env.ground, 0, -0.02, -40); gm.material.map = painted ? envTex.grass : groundTex;
  // A motorway is one carriageway in one direction: 2 lanes, or 3 when the question says so (16 Nov 2026: it used to draw
  // a two-way road with 4 lanes and a broken centre line, a layout that does not exist in Denmark).
  const exm = spec.extras || {}, MW = spec.road === 'highway' && !spec.studio, MWN = MW ? (exm.lanes >= 3 ? 3 : 2) : 0;
  const W = MW ? (MWN === 3 ? 10.5 : 7) : exm.lanes ? 11.2 : 7, E = W / 2 - 0.25; // road width and the x of the edge lines
  flat(W, 200, painted && envTex.asphalt ? 0xFFFFFF : 0x2D343B, 0, 0, -50).material.map = painted && envTex.asphalt ? envTex.asphalt : roadTex;
  const jz0 = spec.road === 'junction' ? spec.jz : spec.road === 'roundabout' ? spec.rz : null, gapHalf = spec.road === 'roundabout' ? 12.6 : 3.6, inGap = z => jz0 !== null && Math.abs(z - jz0) < gapHalf;
  const segs = jz0 === null ? [[20, -80]] : [[20, jz0 + gapHalf], [jz0 - gapHalf, -80]];
  const WHITE = 0xFEFFED;
  // dashes along z: length len, gap gap; solid lines are one long strip. They stop where a side road crosses.
  const lineAlong = (x, color, len, gap, w = 0.15) => { for (const [a, b] of segs) { if (!gap) flat(w, a - b, color, x, 0.02, (a + b) / 2); else for (let z = a; z > b; z -= len + gap) box(w, 0.02, Math.min(len, z - b), color, x, 0.02, z - Math.min(len, z - b) / 2, false); } };
  // edge lines: solid, or broken when the question says so; a yellow line along the right kerb when it names one
  lineAlong(-E, WHITE, exm.edge === 'dashed' ? 1.2 : 0, exm.edge === 'dashed' ? 1.2 : 0);
  if (exm.sos) { box(0.12, 1.5, 0.12, 0x6B7077, W / 2 + 2.6, 0.75, -6); box(0.7, 0.9, 0.35, 0xE8742A, W / 2 + 2.6, 1.55, -6); box(0.34, 0.2, 0.05, 0xFEFFED, W / 2 + 2.6, 1.7, -5.8, false); box(0.2, 0.34, 0.04, 0x1F2328, W / 2 + 2.6, 1.35, -5.8, false); }
  if (exm.sharkTeeth) for (const z of [-3.5]) for (let i = 0; i < 4; i++) { const t = new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(-0.4, 0), new T.Vector2(0, -0.75), new T.Vector2(0.4, 0)])), new T.MeshBasicMaterial({ color: 0xFEFFED })); t.rotation.x = -Math.PI / 2; t.position.set(0.7 + i * 0.9, 0.04, z); scene.add(t); }
  if (exm.ramp) { for (let z = 12; z > -18; z -= 3) box(0.15, 0.02, 1.6, WHITE, E, 0.02, z - 0.8, false); flat(0.15, 62, WHITE, E, 0.02, -49); } // broken line along the acceleration lane, solid again where it ends
  else lineAlong(E, WHITE, exm.edge === 'dashed' ? 1.2 : 0, exm.edge === 'dashed' ? 1.2 : 0, MW ? 0.3 : 0.15); // motorway edge line is the wide one
  if (exm.kerbYellow) lineAlong(W / 2 + 0.05, 0xFFD60A, 0, 0, 0.3);
  // centre line: broken (default), solid, double solid, warning line (long strokes, short gaps) or none
  const cl = MW ? 'motorway' : exm.centre || 'dashed';
  if (MW) for (let k = 1; k < MWN; k++) lineAlong(-W / 2 + k * W / MWN, WHITE, 3, 6, 0.15); // lane lines: long strokes, long gaps
  else if (cl === 'solid') lineAlong(0, WHITE, 0, 0, 0.18);
  else if (cl === 'double') { lineAlong(-0.16, WHITE, 0, 0, 0.14); lineAlong(0.16, WHITE, 0, 0, 0.14); }
  else if (cl === 'warning') lineAlong(0, WHITE, 6, 1.5, 0.16);
  else if (cl === 'dashed') lineAlong(0, WHITE, 2, 2, 0.14);
  if (exm.lanes && !MW) for (const x of [-W / 4 - 0.25, W / 4 + 0.25]) lineAlong(x, WHITE, 2, 2, 0.14);

  const V = spec.variant ? 1 : 0; // second take of the same question: other scenery, camera, sun side and car colours, so a repeat cannot be solved by recognising the picture
  const r = rng(7 + V * 101);
  // Painted cut-out card standing on the ground, tilted back a little towards the camera.
  const tint = spec.env === 'night' ? 0x56668A : spec.env === 'rain' ? 0xC4CCD0 : 0xFFFFFF;
  const card = (name, h, x, z) => { const t = envTex[name]; if (!t) return null; const w = h * t.image.width / t.image.height, g = new T.PlaneGeometry(w, h); g.translate(0, h / 2, 0); g.rotateX(-0.42); const m = attachCylindricalBillboard(T, new T.Mesh(g, new T.MeshBasicMaterial({ map: t, color: tint, transparent: true, alphaTest: 0.45, fog: true }))); m.position.set(x, 0, z); scene.add(m); return m; }; /* 16 Nov 2026: trees and houses turn to face the camera around the y axis only (they looked flat from the side) */
  const tree = (x, z, s) => {
    const names = ['tree-pine', 'tree-round', 'tree-pine', 'tree-bare-autumn'], n = names[Math.floor(r() * 4)];
    if (envTex[n]) { card(n, (n === 'tree-pine' ? 6.2 : 5.2) * s, x, z); blob(x, z, 3.2 * s, 2.2 * s); return; }
    box(0.35 * s, 1.6 * s, 0.35 * s, 0x6B4F3A, x, 0.8 * s, z, false);
    const hue = [0x4F7A47, 0x5B7F3E, 0x436B45, 0x6A7F3C][Math.floor(r() * 4)];
    const c = new T.Mesh(new T.ConeGeometry(1.5 * s, 3.4 * s, 7), mat(hue)); c.position.set(x, 3 * s, z);
    c.add(new T.LineSegments(new T.EdgesGeometry(c.geometry), inkMat)); scene.add(c);
    const top = new T.Mesh(new T.ConeGeometry(1.0 * s, 2.3 * s, 7), mat(new T.Color(hue).offsetHSL(0.02, 0.05, 0.07))); top.position.set(x, 4.3 * s, z);
    top.add(new T.LineSegments(new T.EdgesGeometry(top.geometry), inkMat)); scene.add(top);
  };
  if (!spec.studio) for (let z = 14; z > -80; z -= 6 + r() * 5) { const lx = MW ? -(1.5 * W + 4) - r() * 6 : -7 - r() * 7, rx = 8 + r() * 7, ls = 0.9 + r() * 0.5, rs = 0.9 + r() * 0.5; if (!(jz0 !== null && Math.abs(z - jz0) < 11)) { tree(lx, z, ls); tree(rx, z + 2, rs); } }


  // Road signs: a pole and a flat sign turned a little towards the camera so it can be read.
  const signTexture = kind => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    if (kind === 'triangle') {
      g.beginPath(); g.moveTo(128, 18); g.lineTo(244, 226); g.lineTo(12, 226); g.closePath(); g.lineJoin = 'round'; g.fillStyle = '#D42F2F'; g.fill(); g.strokeStyle = '#D42F2F'; g.lineWidth = 16; g.stroke();
      g.beginPath(); g.moveTo(128, 78); g.lineTo(196, 196); g.lineTo(60, 196); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill();
    } else if (kind === 'yield') {
      g.beginPath(); g.moveTo(14, 38); g.lineTo(242, 38); g.lineTo(128, 238); g.closePath();
      g.lineJoin = 'round'; g.fillStyle = '#D42F2F'; g.fill(); g.strokeStyle = '#D42F2F'; g.lineWidth = 18; g.stroke();
      g.beginPath(); g.moveTo(60, 70); g.lineTo(196, 70); g.lineTo(128, 190); g.closePath(); g.fillStyle = '#FFFFFF'; g.fill();
    } else {
      g.translate(128, 128); g.rotate(Math.PI / 4); g.fillStyle = '#FFFFFF'; g.fillRect(-84, -84, 168, 168); g.fillStyle = '#1F2328'; g.fillRect(-90, -90, 180, 6);
      g.fillStyle = '#1F2328'; g.fillRect(-94, -94, 188, 188); g.fillStyle = '#FFFFFF'; g.fillRect(-84, -84, 168, 168); g.fillStyle = '#FFD60A'; g.fillRect(-66, -66, 132, 132);
    }
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  };
  const signTextures = [];
  const sign = (kind, x, z, ry, size) => {
    box(0.16, 2.3, 0.16, 0x2B3138, x, 1.15, z);
    const tex = signTexture(kind); signTextures.push(tex);
    const m = new T.Mesh(new T.PlaneGeometry(size, size), new T.MeshBasicMaterial({ map: tex, transparent: false, alphaTest: 0.5, side: T.DoubleSide, toneMapped: false }));
    m.position.set(x, 2.3 + size * 0.2, z); m.rotation.y = ry; scene.add(m);
  };
  const ex = spec.extras || {};
  // Cycle path: a separate red-brown strip with a kerb beside the road; cycle lane: a red-brown strip inside the edge line. White bicycle marks on both.
  // Bicycle pictogram painted on the cycle path (two wheels, frame, handlebar, saddle), drawn once on a canvas.
  const bikeTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d'); g.strokeStyle = '#FEFFED'; g.fillStyle = '#FEFFED'; g.lineWidth = 9; g.lineCap = 'round'; g.lineJoin = 'round'; for (const wx of [58, 198]) { g.beginPath(); g.arc(wx, 78, 34, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(58, 78); g.lineTo(104, 40); g.lineTo(168, 40); g.lineTo(198, 78); g.moveTo(104, 40); g.lineTo(128, 78); g.lineTo(58, 78); g.moveTo(128, 78); g.lineTo(168, 40); g.moveTo(96, 28); g.lineTo(116, 28); g.moveTo(168, 40); g.lineTo(160, 18); g.lineTo(184, 18); g.stroke(); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; return t; })();
  const bikeMark = (x, z) => { const m = new T.Mesh(new T.PlaneGeometry(1.5, 0.75), new T.MeshBasicMaterial({ map: bikeTex, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, Math.PI / 2); m.position.set(x, 0.045, z); scene.add(m); };
  if (exm.cyclePath) { flat(2.3, 200, 0x8A4B3C, W / 2 + 1.65, 0.015, -50); box(0.25, 0.18, 200, 0xC2CCD6, W / 2 + 0.38, 0.09, -50, false); for (let z = 8; z > -60; z -= 9) bikeMark(W / 2 + 1.65, z); }
  if (exm.cycleLane) { flat(1.4, 200, 0x8A4B3C, E - 0.7, 0.012, -50); for (let z = 8; z > -60; z -= 9) bikeMark(E - 0.7, z); }
  if (spec.road === 'roundabout') {
    const rz = spec.rz, R1 = 5.2, R2 = 11.2;
    const ring = new T.Mesh(new T.RingGeometry(R1, R2, 48), mat(envTex.asphalt ? 0xFFFFFF : 0x2D343B)); if (envTex.asphalt) { ring.material.color.set(0xFFFFFF); ring.material.map = asphaltFor(R2 * 2, R2 * 2); } ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.005, rz); scene.add(ring);
    for (const rr of [R2 - 0.2, R1 + 0.2]) { const l = new T.Mesh(new T.RingGeometry(rr - 0.07, rr + 0.07, 48), mat(WHITE)); l.rotation.x = -Math.PI / 2; l.position.set(0, 0.022, rz); scene.add(l); }
    flat(40, 6.4, 0x2D343B, 0, 0.004, rz); // the arm that crosses the main road
    const island = new T.Mesh(new T.CylinderGeometry(R1 - 0.35, R1 - 0.35, 0.4, 32), mat(0x6E8F42)); if (envTex.grass) { island.material.color.set(0xFFFFFF); island.material.map = envTex.grass.clone(); island.material.map.needsUpdate = true; island.material.map.repeat.set(1, 1); } island.position.set(0, 0.2, rz); island.add(new T.LineSegments(new T.EdgesGeometry(island.geometry), inkMat)); scene.add(island);
    if (envTex['tree-round']) { const c = card('tree-round', 4.2, 0, rz); c.position.y = 0.4; } else { const tree = new T.Mesh(new T.ConeGeometry(1.2, 3, 7), mat(0x4F7A47)); tree.position.set(0, 1.9, rz); scene.add(tree); }
    // yield marks (shark teeth) and a white stop line where each approach meets the ring
    for (const [ax, az, ry] of [[1.7, rz + R2 + 0.9, 0], [-1.7, rz - R2 - 0.9, Math.PI], [R2 + 0.9, rz - 1.7, Math.PI / 2], [-R2 - 0.9, rz + 1.7, -Math.PI / 2]]) {
      for (let i = 0; i < 4; i++) { const t = new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(-0.4, 0), new T.Vector2(0, 0.7), new T.Vector2(0.4, 0)])), mat(WHITE)); t.rotation.set(-Math.PI / 2, 0, ry); const ox = Math.cos(ry) * (i - 1.5) * 0.9, oz = -Math.sin(ry) * (i - 1.5) * 0.9; t.position.set(ax + ox, 0.03, az + oz); scene.add(t); }
    }
    for (const [x, z] of [[-17, rz + 14], [17, rz - 14], [-17, rz - 14], [17, rz + 14]]) { if (card(['house-a', 'house-b', 'house-c'][Math.abs(Math.round(x + z)) % 3], 5.2, x, z)) continue; box(5, 3.2, 5, 0xE3E5E8, x, 1.6, z); box(5.3, 0.5, 5.3, 0xB5543A, x, 3.4, z); }
  }
  if (spec.road === 'junction') {
    const jz = spec.jz; flat(200, 6.4, 0x2D343B, 0, 0.004, jz);
    // the side road: edge lines on both sides, a dashed centre line, and the stop line where the main-road traffic is not
    for (const sx of [1, -1]) {
      flat(40, 0.16, 0xFEFFED, sx * 23.6, 0.02, jz + 3.1); flat(40, 0.16, 0xFEFFED, sx * 23.6, 0.02, jz - 3.1);
      for (let x = 4.5; x < 40; x += 4) box(2, 0.02, 0.14, 0xFEFFED, sx * x, 0.02, jz, false);
    }
    if (ex.yieldSign) {
      // B 1 Ubetinget vigepligt on the side road (right of the driver coming in), E 34 Hovedvej on the main road, and the white shark's teeth across the side road.
      sign('yield', 6.3, jz - 4.4, 0.7, 2.1); sign('main', 4.9, jz + 8, 0.3, 1.8);
      for (let i = 0; i < 4; i++) { const t = new T.Mesh(new T.ShapeGeometry(new T.Shape([new T.Vector2(0, -0.4), new T.Vector2(1.0, 0), new T.Vector2(0, 0.4)])), mat(0xFEFFED)); t.rotation.x = -Math.PI / 2; t.position.set(4.2, 0.035, jz - 2.6 + i * 0.85); scene.add(t); }
    }
    for (const [x, z] of [[-17, jz - 8], [-17, jz + 9], [17, jz + 12], [17, jz - 9]]) { if (card(['house-a', 'house-b', 'house-c'][Math.abs(Math.round(x + z)) % 3], 5.2, x, z)) continue; box(5, 3.4, 5, 0xE3E5E8, x, 1.7, z); box(5.3, 0.5, 5.3, 0xB5543A, x, 3.6, z); }
  }
  // Bends and hills: the straight road is covered beyond z = -10 and a second stretch of road is laid on top, turned sideways (bend) or tilted (hill).
  if (exm.bend) {
    // A real curve: the road beyond z = -10 is a chain of short straight pieces, each turned a little more, so the lanes bend instead of kinking.
    const cover = new T.Mesh(new T.PlaneGeometry(W + 16, 160), mat(painted ? 0xFFFFFF : env.ground)); if (painted) { cover.material.color.set(0xFFFFFF); const gt = envTex.grass.clone(); gt.needsUpdate = true; gt.wrapS = gt.wrapT = T.RepeatWrapping; gt.repeat.set((W + 16) / 10, 16); cover.material.map = gt; } else { const gt = groundTex.clone(); gt.needsUpdate = true; gt.repeat.set((W + 16) * 36 / 300, 160 * 36 / 300); cover.material.map = gt; } /* same mottled ground as the rest (snow had a flat band) */ cover.rotation.x = -Math.PI / 2; cover.position.set(0, 0.05, -90); scene.add(cover);
    const turn = exm.bend === 'left' ? 0.55 : exm.bend === 'right' ? -0.55 : exm.bend === 'sharpLeft' ? 0.95 : exm.bend === 'sharpRight' ? -0.95 : 0;
    const SEG = 10, N = 12, CURVE = 5;
    let parent = new T.Group(); parent.position.set(0, 0, -10); scene.add(parent);
    for (let i = 0; i < N; i++) {
      const g = new T.Group(); g.rotation.y = i < CURVE ? turn / CURVE : 0; if (i) g.position.set(0, 0, -SEG); parent.add(g); parent = g;
      const part = (w, d, color, x, y, z) => { const m = new T.Mesh(new T.PlaneGeometry(w, d), mat(color)); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); g.add(m); return m; };
      const road = part(W, SEG + 0.5, 0x2D343B, 0, 0.07, -SEG / 2); if (painted && envTex.asphalt) { road.material.color.set(0xFFFFFF); road.material.map = asphaltFor(W, SEG); } else { if (envTex.asphalt) road.material.color.set(0xFFFFFF); const rt = roadTex.clone(); rt.needsUpdate = true; rt.repeat.set(1.4, 24 * (SEG + 0.5) / 200); road.material.map = rt; } /* 16 Nov 2026: same surface as the straight road; in snow the bend was dark asphalt next to a snowy road */
      for (const x of [-E, E]) part(0.16, SEG + 0.5, WHITE, x, 0.08, -SEG / 2);
      for (const z of [-2.5, -7.5]) part(0.14, 2, WHITE, 0, 0.08, z);
      for (const sx of [-1, 1]) { const tx = sx * (W / 2 + 4 + ((i * 7 + (sx > 0 ? 3 : 0)) % 4)); const tc = i % 2 === (sx > 0 ? 0 : 1) ? card((i + (sx > 0 ? 1 : 0)) % 2 ? 'tree-pine' : 'tree-round', 5.4, tx, -SEG / 2) : null; if (tc) { scene.remove(tc); g.add(tc); } }
      if (exm.guardrail) for (const sx of [-1, 1]) { const rail = new T.Mesh(new T.BoxGeometry(0.15, 0.5, SEG + 0.2), mat(0xC2CCD6)); rail.position.set(sx * (W / 2 + 0.9), 0.7, -SEG / 2); g.add(rail); }
    }
  }
  if (exm.guardrail && !exm.bend) for (const sx of [-1, 1]) { box(0.16, 0.42, 90, 0xC2CCD6, sx * (W / 2 + 0.9), 0.78, -35, false); for (let z = 12; z > -80; z -= 4) box(0.14, 0.8, 0.14, 0x4A5560, sx * (W / 2 + 0.9), 0.4, z, false); }
  if (exm.footbridge) { box(0.7, 5.2, 0.7, 0x6B7077, -W / 2 - 1.2, 2.6, -9); box(0.7, 5.2, 0.7, 0x6B7077, W / 2 + 1.2, 2.6, -9); box(W + 4, 0.5, 2.4, 0x8A929A, 0, 5.3, -9); box(W + 4, 0.9, 0.12, 0xC2CCD6, 0, 6, -10.1); }
  if (exm.bridge) { flat(60, 8, 0x3E6F9A, 0, 0.01, -14); box(W + 2, 0.35, 9, 0x9AA3AB, 0, 0.1, -14); for (const sx of [-1, 1]) { box(0.35, 1.0, 9.2, 0xC2CCD6, sx * (W / 2 + 0.5), 0.75, -14); } }
  if (exm.gravel) { flat(W, 200, 0xB59D78, 0, 0.012, -50); }
  if (exm.leaves) { for (let i = 0; i < 70; i++) { const lf = new T.Mesh(new T.CircleGeometry(0.22, 6), mat(i % 2 ? 0xE08A1E : 0xC9A200)); lf.rotation.x = -Math.PI / 2; lf.position.set((r() - 0.5) * (W - 1), 0.04, 8 - r() * 40); scene.add(lf); } }
  // shine: no drawn patch (a flat grey rectangle read as slop); the scene keeps the plain road
  if (exm.school) { box(0.16, 2.4, 0.16, 0x2B3138, W / 2 + 1.2, 1.2, -5); box(1.3, 1.3, 0.08, 0xFFD60A, W / 2 + 1.2, 2.8, -5); }
  // Traffic light before a junction: a pole with three lamps, the lit one named by the question.
  if (exm.trafficLight) {
    const z = (spec.jz ?? spec.rz ?? -14) + 6, x = W / 2 + 0.8;
    box(0.18, 3.6, 0.18, 0x2B3138, x, 1.8, z); box(0.55, 1.5, 0.45, 0x1F2328, x, 3.9, z);
    [[0xD42F2F, 'red', 4.35], [0xFFD60A, 'yellow', 3.9], [0x58CC02, 'green', 3.45]].forEach(([c, n, y]) => { const lamp = new T.Mesh(new T.SphereGeometry(0.17, 12, 8), new T.MeshBasicMaterial({ color: n === exm.trafficLight ? c : 0x3A3F45 })); lamp.position.set(x, y, z + 0.24); scene.add(lamp); });
    box(3, 0.02, 0.18, WHITE, 1.7, 0.03, z - 0.6, false); // stop line
  }
  // Painted road marks before a junction: lane arrows, STOP, a big white triangle, shark's teeth.
  if (exm.paint) {
    const z = (spec.jz ?? spec.rz ?? -14) + 9.5;
    const paintTex = kind => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 256; const g = c.getContext('2d'); g.fillStyle = '#FEFFED'; g.strokeStyle = '#FEFFED';
      if (kind === 'arrow-straight' || kind === 'arrow-both') { g.fillRect(112, 90, 32, 150); g.beginPath(); g.moveTo(128, 10); g.lineTo(176, 96); g.lineTo(80, 96); g.closePath(); g.fill(); }
      if (kind === 'arrow-both') { g.lineWidth = 30; g.beginPath(); g.moveTo(128, 230); g.lineTo(128, 190); g.quadraticCurveTo(128, 150, 190, 150); g.stroke(); g.beginPath(); g.moveTo(232, 150); g.lineTo(184, 118); g.lineTo(184, 182); g.closePath(); g.fill(); }
      if (kind === 'arrow-right') { g.lineWidth = 34; g.beginPath(); g.moveTo(112, 236); g.lineTo(112, 150); g.quadraticCurveTo(112, 96, 170, 96); g.stroke(); g.beginPath(); g.moveTo(236, 96); g.lineTo(168, 50); g.lineTo(168, 142); g.closePath(); g.fill(); }
      if (kind === 'arrow-left') { g.lineWidth = 34; g.beginPath(); g.moveTo(144, 236); g.lineTo(144, 150); g.quadraticCurveTo(144, 96, 86, 96); g.stroke(); g.beginPath(); g.moveTo(20, 96); g.lineTo(88, 50); g.lineTo(88, 142); g.closePath(); g.fill(); }
      if (kind === 'triangle') { g.beginPath(); g.moveTo(10, 30); g.lineTo(246, 30); g.lineTo(128, 236); g.closePath(); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.moveTo(70, 70); g.lineTo(186, 70); g.lineTo(128, 170); g.closePath(); g.fill(); }
      if (kind === 'stop') { g.font = '900 120px Rubik, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(128, 128); g.scale(1, 1.7); g.fillText('STOP', 0, 0, 250); g.restore(); }
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; signTextures.push(t); return t;
    };
    const lay = (kind, x, zz, w = 1.8, h = 3.0) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: paintTex(kind), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.045, zz); scene.add(m); };
    for (const k of exm.paint) { if (k === 'arrow-both' || k === 'arrow-straight' || k === 'arrow-right' || k === 'arrow-left') lay(k, 1.7, z); if (k === 'stop') { lay('stop', 1.7, z - 2.2, 2.6, 2.4); } if (k === 'triangle') lay('triangle', 1.7, z - 1, 2.4, 2.4); }
  }
  // Studio: for questions about licences, exams, drink, pills, tiredness or electric cars the road is covered by a clean floor, your car stands in the middle and the named props stand around it.
  if (spec.studio) {
    const floor = new T.Mesh(new T.CircleGeometry(160, 48), mat(0xF1F2F4)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0.09, -2); scene.add(floor);
    const ring = new T.Mesh(new T.RingGeometry(4.6, 4.9, 48), mat(0xFFD60A)); ring.rotation.x = -Math.PI / 2; ring.position.set(1.0, 0.1, 0.4); scene.add(ring);
    const slots = [[2.6, 1.0], [-0.6, -3.2], [5.0, -4.6], [-5.4, 2.4]];
    Object.values(props).forEach((pm, i) => { const c = pm.clone(); c.position.set(slots[i][0], 0, slots[i][1]); scene.add(c); blob(slots[i][0], slots[i][1], 2.2, 1.4); });
  }
  // Road layouts named by the question: zebra crossing, tunnel, bus lane, traffic island, hatched area, road works, parking bays, car park, one-way, turn lane.
  // Where a lane or the road ends, everything beyond the taper is verge again: grass over the old road and a new white edge line.
  const vergeFrom = (x2, zb) => {
    const x3 = W / 2 + 3, g = new T.PlaneGeometry(x3 - x2, 100 + zb), m = mat(painted ? 0xFFFFFF : env.ground);
    if (painted) { const t = envTex.grass.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set((x3 - x2) / 10, (100 + zb) / 10); m.map = t; }
    const v = new T.Mesh(g, m); v.rotation.x = -Math.PI / 2; v.position.set((x2 + x3) / 2, 0.04, (zb - 100) / 2); scene.add(v);
    box(0.16, 0.02, 100 + zb, WHITE, x2 + 0.05, 0.06, (zb - 100) / 2, false);
  };
  if (exm.merge) {
    const x1 = W / 2, x2 = W / 4, za = -1, zb = -17, g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute([x1, 0.04, za, x2, 0.04, zb, x1, 0.04, zb], 3)); g.setAttribute('normal', new T.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    const wm = mat(painted ? 0xFFFFFF : env.ground, { side: T.DoubleSide }); if (painted) { g.setAttribute('uv', new T.Float32BufferAttribute([x1 / 10, za / 10, x2 / 10, zb / 10, x1 / 10, zb / 10], 2)); const t = envTex.grass.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1, 1); wm.map = t; }
    const wedge = new T.Mesh(g, wm); scene.add(wedge);
    const L = Math.hypot(x1 - x2, za - zb), edge = box(0.18, 0.02, L, WHITE, (x1 + x2) / 2, 0.06, (za + zb) / 2, false); edge.rotation.y = Math.atan2(x1 - x2, za - zb);
    vergeFrom(x2, zb);
  }
  if (exm.yard) {
    // A closed practice yard: one wide asphalt plate over the road, a low fence round it and cones marking the exercise.
    flat(36, 52, 0x23292E, 0, 0.07, -16);
    const cone = (x, z) => { const k = new T.Mesh(new T.ConeGeometry(0.28, 0.8, 8), mat(0xFF7A00)); k.position.set(x, 0.47, z); scene.add(k); };
    box(0.12, 0.7, 52, 0xC9CED4, -18, 0.4, -16, false); box(0.12, 0.7, 52, 0xC9CED4, 18, 0.4, -16, false); box(36, 0.7, 0.12, 0xC9CED4, 0, 0.4, -42, false);
    if (exm.yard === 'straight') { for (let z = -2; z > -30; z -= 3.2) { cone(-2.2, z); cone(2.2, z); } for (let x = -2.2; x <= 2.2; x += 1.1) cone(x, -30); }
    else if (exm.yard === 'uturn') { for (let a = 0; a <= Math.PI + 0.01; a += Math.PI / 10) { cone(1.5 + 6 * Math.cos(a), -9 - 6 * Math.sin(a)); cone(1.5 + 3 * Math.cos(a), -9 - 3 * Math.sin(a)); } }
    else if (exm.yard === 'bay') { for (const [bx, bz, bw, bd] of [[5.5, -9, 3, 0.15], [5.5, -15, 3, 0.15], [4, -12, 0.15, 6], [7, -12, 0.15, 6]]) box(bw, 0.02, bd, WHITE, bx, 0.09, bz, false); cone(4, -9); cone(7, -9); cone(4, -15); cone(7, -15); }
    else { for (let z = -4; z >= -12; z -= 1.6) cone(5.5, z); for (let x = 5.5; x >= -1; x -= 1.6) cone(x, -12); }
  }
  if (exm.narrow) {
    const x1 = W / 2, x2 = W / 2 - 1.9, za = -1, zb = -15, g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute([x1, 0.04, za, x2, 0.04, zb, x1, 0.04, zb], 3)); g.setAttribute('normal', new T.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    const nm = mat(painted ? 0xFFFFFF : env.ground, { side: T.DoubleSide }); if (painted) { g.setAttribute('uv', new T.Float32BufferAttribute([x1 / 10, za / 10, x2 / 10, zb / 10, x1 / 10, zb / 10], 2)); const t = envTex.grass.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1, 1); nm.map = t; }
    scene.add(new T.Mesh(g, nm));
    const L = Math.hypot(x1 - x2, za - zb), edge = box(0.18, 0.02, L, WHITE, (x1 + x2) / 2, 0.06, (za + zb) / 2, false); edge.rotation.y = Math.atan2(x1 - x2, za - zb);
    vergeFrom(x2, zb);
  }
  if (exm.ramp) {
    // Acceleration lane: a strip along the right edge of the road that tapers into it further ahead.
    const xa = W / 2, xb = W / 2 + 3.6, z0r = 12, z1r = -2, z2r = -18, pts = [[xa, z0r], [xb, z0r], [xb, z1r], [xa, z0r], [xb, z1r], [xa, z1r], [xb, z1r], [xa, z2r], [xa, z1r]];
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts.flatMap(([x, z]) => [x, 0.03, z]), 3)); g.setAttribute('normal', new T.Float32BufferAttribute(pts.flatMap(() => [0, 1, 0]), 3)); g.setAttribute('uv', new T.Float32BufferAttribute(pts.flatMap(([x, z]) => [x / 7, z / 7]), 2));
    const rm = mat(envTex.asphalt ? 0xFFFFFF : 0x2D343B, { side: T.DoubleSide }); if (envTex.asphalt) { const t = envTex.asphalt.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(1, 1); rm.map = t; } scene.add(new T.Mesh(g, rm));
    box(0.15, 0.02, z0r - z1r, WHITE, xb - 0.1, 0.06, (z0r + z1r) / 2, false);
    const dl = Math.hypot(xb - xa, z1r - z2r), diag = box(0.15, 0.02, dl, WHITE, (xa + xb) / 2, 0.06, (z1r + z2r) / 2, false); diag.rotation.y = Math.atan2(xb - xa, z1r - z2r);
  }
  if (exm.tow) box(0.07, 0.07, exm.tow.z1 - exm.tow.z2, 0x1F2328, exm.tow.x, 0.62, (exm.tow.z1 + exm.tow.z2) / 2, false);
  if (exm.bumps) for (const z of [-5, -9.5, -14]) { box(W, 0.16, 1.3, 0xD7D9DC, 0, 0.1, z, false); for (let i = -2; i <= 2; i++) box(W / 6, 0.17, 0.5, 0x2B3138, i * W / 5, 0.11, z, false); }
  if (exm.zebra) for (let i = -4; i <= 4; i++) box(0.6, 0.02, 2.4, WHITE, i * 0.95 * (W / 7), 0.03, -7, false);
  if (exm.tunnel) {
    // The camera sits inside the tube: walls, a low dark ceiling, a row of lamps, reflectors along the kerb and a dark far end.
    box(0.6, 5.4, 92, 0x8A9097, -W / 2 - 0.4, 2.7, -13); box(0.6, 5.4, 92, 0x8A9097, W / 2 + 0.4, 2.7, -13); box(W + 2, 0.7, 92, 0x4C535A, 0, 5.75, -13);
    for (let z = 26; z > -56; z -= 6) { box(0.9, 0.1, 0.9, 0xFFF2B0, 0, 5.35, z, false, true); box(0.16, 0.2, 0.5, 0xFFD60A, -W / 2 + 0.05, 0.3, z - 3, false, true); box(0.16, 0.2, 0.5, 0xFFD60A, W / 2 - 0.05, 0.3, z - 3, false, true); }
    box(W + 2, 6.4, 0.6, 0x15181C, 0, 3.2, -58);
  }
  if (exm.busLane) { flat(2.6, 200, 0xB5543A, W / 2 - 1.5, 0.014, -50); for (let z = 6; z > -50; z -= 11) { box(0.9, 0.02, 0.12, WHITE, W / 2 - 1.5, 0.04, z, false); box(0.12, 0.02, 0.9, WHITE, W / 2 - 1.5, 0.04, z, false); } }
  if (exm.island) { box(1.6, 0.3, 8, 0xB9C0C6, 0, 0.15, -5); for (const z of [-1.2, -8.8]) { box(0.28, 0.9, 0.28, 0x1F2328, 0, 0.75, z); box(0.3, 0.2, 0.3, 0xFFD60A, 0, 1.1, z, false); } }
  if (exm.hatch) {
    // Hatched area: a white-framed strip with diagonal stripes, painted on one canvas so nothing spills over the edge.
    const c = document.createElement('canvas'); c.width = 128; c.height = 640; const g = c.getContext('2d'); g.strokeStyle = '#FEFFED'; g.fillStyle = '#FEFFED'; g.lineWidth = 8; g.strokeRect(6, 6, 116, 628); g.lineWidth = 9;
    g.save(); g.beginPath(); g.rect(10, 10, 108, 620); g.clip(); for (let y = -140; y < 760; y += 44) { g.beginPath(); g.moveTo(0, y + 120); g.lineTo(128, y); g.stroke(); } g.restore();
    const ht = new T.CanvasTexture(c); ht.encoding = T.sRGBEncoding; const hm = new T.Mesh(new T.PlaneGeometry(2.6, 13), new T.MeshBasicMaterial({ map: ht, transparent: true, depthWrite: false })); hm.rotation.x = -Math.PI / 2; hm.position.set(0, 0.04, -11); scene.add(hm);
  }
  if (exm.roadworks) {
    for (let i = 0; i < 6; i++) { const c = new T.Mesh(new T.ConeGeometry(0.3, 0.85, 8), mat(0xFF7A00)); c.position.set(0.9 - i * 0.28, 0.42, -4 - i * 1.6); scene.add(c); }
    box(2.2, 0.9, 0.2, 0xFFD60A, -1.9, 0.9, -13); box(2.2, 0.35, 0.22, 0x1F2328, -1.9, 0.9, -13, false); box(3, 0.1, 6, 0x6B7077, -1.9, 0.05, -16);
    box(0.16, 1.2, 0.16, 0x2B3138, 4.6, 0.6, -6); box(1.1, 1.1, 0.08, 0xFFD60A, 4.6, 1.6, -6);
  }
  if (exm.bays) {
    for (let i = 0; i < 5; i++) box(0.12, 0.02, 4.6, WHITE, W / 2 + 0.2 + 2.6, 0.03, 4 - i * 4.6 + 0, false);
    flat(2.7, 28, 0x3A4048, W / 2 + 1.55 + 0.3, 0.01, -8);
    for (let i = 0; i < 5; i++) box(2.7, 0.02, 0.12, WHITE, W / 2 + 1.9, 0.03, 4.6 - i * 4.6, false);
    box(0.16, 2.4, 0.16, 0x2B3138, W / 2 + 3.9, 1.2, -4); box(0.9, 0.9, 0.08, 0x1CB0F6, W / 2 + 3.9, 2.6, -4); box(0.2, 0.5, 0.1, WHITE, W / 2 + 3.9, 2.6, -3.94, false);
  }
  if (exm.garage) {
    box(18, 11, 14, 0x9AA3AB, 13, 5.5, -22); box(10, 4.2, 0.6, 0x23272C, 13, 2.1, -14.8, false); for (const y of [4.8, 8]) box(17.4, 0.5, 0.5, 0xE3E5E8, 13, y, -14.6, false);
    box(0.16, 2.4, 0.16, 0x2B3138, 6.6, 1.2, -8); box(1.1, 1.1, 0.08, 0x1CB0F6, 6.6, 2.7, -8); box(0.25, 0.6, 0.1, WHITE, 6.6, 2.7, -7.94, false);
  }
  if (exm.oneway) for (const z of [-3, -14]) { box(0.16, 2.4, 0.16, 0x2B3138, W / 2 + 1.3, 1.2, z); box(1.5, 0.8, 0.08, 0x1CB0F6, W / 2 + 1.3, 2.7, z); box(0.9, 0.16, 0.1, WHITE, W / 2 + 1.3, 2.7, z + 0.06, false); const hd = box(0.4, 0.4, 0.1, WHITE, W / 2 + 1.3, 2.7, z + 0.06, false); hd.rotation.z = Math.PI / 4; hd.position.x = W / 2 + 1.65; }
  if (exm.turnLane) for (const z of [-3, -12]) {
    // Road arrow: a shaft and a triangular head, bent to the left.
    const sh = new T.Shape(); sh.moveTo(-0.11, 0); sh.lineTo(0.11, 0); sh.lineTo(0.11, 1.5); sh.lineTo(0.5, 1.5); sh.lineTo(0, 2.3); sh.lineTo(-0.5, 1.5); sh.lineTo(-0.11, 1.5); sh.closePath();
    const ar = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshBasicMaterial({ color: 0xFEFFED, side: T.DoubleSide })); ar.rotation.set(-Math.PI / 2, 0, 0.55); ar.position.set(-W / 4, 0.04, z + 1.1); scene.add(ar);
  }
  // The part the question is about (spec.mark) is shown by the camera close-up in draw(), not by a ring.
  if (spec.road === 'rail') {
    const rz = spec.rz; flat(200, 5, 0x6A6F73, 0, 0.01, rz);
    for (const dz of [-0.75, 0.75]) box(200, 0.1, 0.1, 0xC2CCD6, 0, 0.12, rz + dz, false);
    for (let x = -60; x < 60; x += 0.9) box(0.3, 0.07, 2.6, 0x5B4636, x, 0.05, rz, false);
    box(7, 0.02, 0.3, 0xFEFFED, 0, 0.025, rz + 4.2, false);
    for (const sx of [4.4, -4.4]) {
      const sz = rz + 3.4 * Math.sign(sx);
      box(0.2, 3.4, 0.2, 0x2B3138, sx, 1.7, sz); box(1.1, 0.8, 0.12, 0xFEFFED, sx, 3.2, sz);
      for (const dx of [-0.28, 0.28]) { const l = new T.Mesh(new T.SphereGeometry(0.2, 12, 8), new T.MeshBasicMaterial({ color: ex.redLights ? 0xFF3B30 : 0x4A4F55 })); l.position.set(sx + dx, 3.2, sz + 0.1 * Math.sign(sx)); scene.add(l); }
      if (ex.barrier) { const a = box(0.12, 0.12, 3.4, 0xFEFFED, sx * 0.9, 2.2, sz + (sx > 0 ? -1.3 : 1.3)); a.rotation.x = Math.sign(sx) * -0.9; }
    }
    if (ex.train) for (let i = 0; i < 4; i++) box(9, 3.2, 2.7, i ? 0xB5543A : 0x3F5F73, -40 - i * 9.4, 1.9, rz);
  }
  // Painted facade: rows of dark windows with pale frames; multiplies the wall colour.
  const facadeTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, 128, 128); for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) { const x = 12 + col * 38, y = 14 + row * 54; g.fillStyle = '#F4F0E6'; g.fillRect(x - 3, y - 3, 30, 40); g.fillStyle = '#6F8793'; g.fillRect(x, y, 24, 34); g.fillStyle = '#A9BCC2'; g.fillRect(x, y, 24, 10); g.fillStyle = '#F4F0E6'; g.fillRect(x + 11, y, 2, 34); } const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t; })();
  if (ex.town && !exm.yard) for (let z = 8; z > -60; z -= 11 + r() * 3) for (const sx of [-1, 1]) {
    const x = sx * (8.5 + r() * 1.5), h = 3 + r() * 2, hn = ['house-a', 'house-b', 'house-c'][Math.floor(r() * 3)];
    if (envTex[hn]) { card(hn, hn === 'house-c' ? 4.4 : 3.6 + h * 0.9, x, z); blob(x, z, 6, 3); continue; }
    const wall = box(5, h, 6, [0xD9CDB4, 0xE0B97C, 0x9FB5AE, 0xD8A58A][Math.floor(r() * 4)], x, h / 2, z); wall.material.map = facadeTex; box(5.4, 0.5, 6.4, [0xB5543A, 0x8A4B38, 0x6E5A4A][Math.floor(r() * 3)], x, h + 0.25, z);
  }
  // Motorway: a steel barrier towards the opposite carriageway on the left (no yellow line: in Denmark yellow marks road
  // works), reflector posts on the right.
  // Right of the wide edge line: a hard shoulder (nødspor) only where a broken-down car stands on it. It is narrower and
  // paler than a lane, so it never reads as an extra lane or a side road (Kenneth, 16 Nov 2026).
  if (MW) { const bx = -W / 2 - 0.9; box(0.12, 0.32, 200, 0xB8C0C8, bx, 0.62, -50); for (let z = 14; z > -80; z -= 4) box(0.12, 0.75, 0.12, 0x6B7077, bx, 0.38, z);
    // The opposite carriageway beyond the central reservation: the same lanes, traffic the other way (Kenneth, 16 Nov 2026).
    const ox = -W - 2.4, ow = painted && envTex.asphalt;
    flat(W, 200, ow ? 0xFFFFFF : 0x2D343B, ox, 0, -50).material.map = ow ? envTex.asphalt : roadTex;
    flat(0.3, 200, WHITE, ox - W / 2 + 0.25, 0.02, -50); flat(0.15, 200, WHITE, ox + W / 2 - 0.25, 0.02, -50);
    for (let k = 1; k < MWN; k++) lineAlong(ox - W / 2 + k * W / MWN, WHITE, 3, 6, 0.15);
    const shoulder = !exm.ramp && (spec.actors || []).some(a => a.t === 'car' && a.x > W / 2);
    if (shoulder) flat(2.8, 200, 0x6B7077, W / 2 + 1.4, -0.005, -50);
    for (const z of [10, -4, -18, -32]) box(0.14, 1.2, 0.14, 0x2B3138, W / 2 + (shoulder ? 3.3 : exm.ramp ? 2.1 : 1.2), 0.6, z); }

  // Cars: repainted per actor. Every model's nose points +x; its middle is found from its own bounds.
  const plateMap = plateTexture(T);
  const paintNames = new Set(['portable_nordic_paint', 'portable_paint', 'portable_paint2']);
  const centres = {}, halves = {}, inkOutline = {}, toonCache = new Map();
  const toonRamp = (() => { const d = new Uint8Array([95, 150, 210, 255]), t = new T.DataTexture(d, 4, 1, T.LuminanceFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t; })();
  // A driver in a moving sedan: the same seated person and seat spot as the game (judge-world.js), hands on the wheel. Parked cars stay empty.
  let driverN = 0;
  const addDriver = body => { if (!occupants) return; const raw = body.children[0]?.children[0] || body, d = occupants.create({ identity: driverN++ % 4, width: 0.55, height: 0.66 }); d.position.set(2.5, 0.83, -0.43); raw.add(d); };
  const makeCar = (kind, hex, driver = false) => {
    const model = models[kind] || models.sedan, k = models[kind] ? kind : 'sedan';
    const g = new T.Group(), body = model.scene.clone(true);
    centres[k] ||= (() => { const bb = new T.Box3().setFromObject(model.scene); halves[k] = (bb.max.x - bb.min.x) / 2; return (bb.min.x + bb.max.x) / 2; })();
    body.traverse(o => {
      if (!o.isMesh) return;
      const list = [].concat(o.material).map(m => { if (PLAIN[kind]) { const col = PLAIN_COLOURS[kind][m.name]; if (!col) return m; const c = m.clone(); c.map = null; c.vertexColors = false; c.color.set(col).convertSRGBToLinear(); c.roughness = 0.6; c.metalness = 0.05; return c; } if (!paintNames.has(m.name)) return m; const c = m.clone(); c.map = null; c.vertexColors = false; c.color.set(hex).convertSRGBToLinear(); /* paint is an sRGB brand hex like every other colour here */ c.roughness = 0.5; c.metalness = 0.05; return c; });
      // Stepped (cel) shading: 4 flat tones instead of smooth gloss, so the car reads as painted like the rest of the scene.
      const toon = list.map(m => { if (!m.isMeshStandardMaterial || m.transparent || m.emissiveIntensity > 0.5) return m; const t = (toonCache.get(m) || (toonCache.set(m, new T.MeshToonMaterial({ color: m.color, map: m.map, vertexColors: m.vertexColors, gradientMap: toonRamp, side: m.side, name: m.name })), toonCache.get(m))); return t; });
      o.material = toon.length === 1 ? toon[0] : toon;
    });
    // Ink line: a slightly fattened black back-face copy of every solid mesh, like the drawn outline of the series.
    const thick = halves[k] * 0.007;
    const outlineMat = (inkOutline[k] ||= new T.MeshBasicMaterial({ color: 0x2B2622, side: T.BackSide }));
    outlineMat.onBeforeCompile = sh => { sh.uniforms.thick = { value: thick }; sh.vertexShader = 'uniform float thick;\n' + sh.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normalize(normal) * thick;'); };
    const hulls = []; body.traverse(o => { if (o.isMesh && !o.isSkinnedMesh && ![].concat(o.material).some(m => m.transparent)) hulls.push(o); });
    for (const o of hulls) { const h = new T.Mesh(o.geometry, outlineMat); h.name = 'ink'; o.add(h); }
    if (k === 'sedan') addPlates(T, body, plateMap);
    if (driver && k === 'sedan') addDriver(body);
    body.position.x = -centres[k]; g.add(body); return g;
  };

  // Lamps: two headlights and two tail lights. At night every vehicle shows them and the headlights throw two beams; in fog, rain and snow the tail lights and a dim pair of headlights are on.
  const lampMats = { front: new T.MeshBasicMaterial({ color: 0xFFF6C9 }), rear: new T.MeshBasicMaterial({ color: 0xFF2A1A }) };
  const beamMat = new T.MeshBasicMaterial({ color: 0xFFF2B0, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide });
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,60,40,.9)'); r.addColorStop(1, 'rgba(255,60,40,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const amberTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,150,0,.95)'); r.addColorStop(1, 'rgba(255,150,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c); })();
  const lit = exm.lampsOn || spec.env === 'night' || spec.env === 'fog' || spec.env === 'rain' || spec.env === 'snow';
  const addLamps = (car, kind, a) => {
    if (!lit) return;
    const half = halves[kind] || ({ bus: 6, lorry: 8, ambulance: 3, tractor: 2.2, scooter: 1 }[kind] || 2.3), y = ({ bus: 0.8, lorry: 0.9, ambulance: 0.9, scooter: 0.7 }[kind] || 0.72), w = ({ bus: 0.9, lorry: 0.9, ambulance: 0.8, scooter: 0.0 }[kind] ?? 0.72);
    const zs = w ? [-w, w] : [0];
    for (const z of zs) {
      const hl = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), lampMats.front); hl.position.set(half - 0.05, y, z); car.add(hl);
      const tl = new T.Mesh(new T.BoxGeometry(0.08, 0.14, 0.34), lampMats.rear); tl.position.set(-half + 0.02, y + 0.05, z); car.add(tl);
      const gl = new T.Sprite(new T.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false })); gl.scale.set(1.1, 1.1, 1); gl.position.set(-half - 0.1, y + 0.05, z); car.add(gl);
      if (spec.env === 'night' && (a.learner || a.dir === 'toward')) { const beam = new T.Mesh(new T.ConeGeometry(1.1, 9, 12, 1, true), beamMat); beam.rotation.z = Math.PI / 2; beam.position.set(half + 4.4, y - 0.1, z); car.add(beam); }
    }
  };

  // Fire and smoke are Codex drawings (cut-out cards that always face the camera), put on a wreck by the spec: smoke: 'plume' | 'steam', fire: 'big' | 'small'.
  const EFFECT_H = { 'smoke-plume': 4.2, steam: 2.2, 'fire-big': 2.0, 'fire-small': 1.1 };
  const effectCards = {};
  for (const n of new Set(spec.actors.flatMap(a => [a.smoke && (a.smoke === 'steam' ? 'steam' : 'smoke-plume'), a.fire && (a.fire === 'small' ? 'fire-small' : 'fire-big')]).filter(Boolean))) { try { effectCards[n] = await loadSprite(T, `./assets/effects/${n}.webp`, EFFECT_H[n]); } catch { /* the scene still works without it */ } }
  const addEffects = (car, a) => {
    for (const [n, off] of [[a.smoke && (a.smoke === 'steam' ? 'steam' : 'smoke-plume'), [0.9, 0.9, 0]], [a.fire && (a.fire === 'small' ? 'fire-small' : 'fire-big'), [1.3, 0.55, 0]]]) {
      if (!n || !effectCards[n]) continue;
      const c = effectCards[n].clone(); c.position.set(...off); car.add(c);
    }
  };
  // Signs without official art are drawn here from simple shapes (colour and symbol follow the Danish sign for that code).
  const drawnSign = code => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const RED = '#D42F2F', BLUE = '#0A5BB0', INK = '#1F2328';
    const tri = inner => { g.beginPath(); g.moveTo(128, 18); g.lineTo(244, 226); g.lineTo(12, 226); g.closePath(); g.lineJoin = 'round'; g.fillStyle = RED; g.fill(); g.strokeStyle = RED; g.lineWidth = 16; g.stroke(); g.beginPath(); g.moveTo(128, 70); g.lineTo(200, 198); g.lineTo(56, 198); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = 10; g.lineCap = 'round'; inner(); };
    const disc = (fill, ring, inner) => { g.beginPath(); g.arc(128, 128, 116, 0, 7); g.fillStyle = ring; g.fill(); g.beginPath(); g.arc(128, 128, 92, 0, 7); g.fillStyle = fill; g.fill(); g.strokeStyle = fill === '#fff' ? INK : '#fff'; g.fillStyle = g.strokeStyle; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; inner(); };
    const arrow = (x, y, ang, len = 70) => { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(0, len / 2); g.lineTo(0, -len / 2 + 16); g.stroke(); g.beginPath(); g.moveTo(-26, -len / 2 + 34); g.lineTo(0, -len / 2); g.lineTo(26, -len / 2 + 34); g.closePath(); g.fill(); g.restore(); };
    const sq = col => { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(8, 8, 240, 240, 22); g.fill(); g.fillStyle = col; g.beginPath(); g.roundRect(20, 20, 216, 216, 14); g.fill(); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; };
    const k = code.split(',')[0].trim();
    if (k === 'A 11') tri(() => { g.beginPath(); g.moveTo(128, 100); g.lineTo(128, 190); g.moveTo(84, 150); g.lineTo(172, 150); g.stroke(); });
    else if (k === 'A 19') tri(() => { for (const [y, col] of [[100, RED], [140, '#E8B400'], [180, '#2E9B4E']]) { g.fillStyle = col; g.beginPath(); g.arc(128, y, 14, 0, 7); g.fill(); } });
    else if (k === 'A 16') tri(() => { g.lineWidth = 8; g.beginPath(); g.arc(128, 150, 32, 0, 5.2); g.stroke(); arrow(128, 186, 1.6, 30); });
    else if (k === 'C 19') disc('#fff', RED, () => { g.fillStyle = RED; g.fillRect(66, 108, 124, 40); });
    else if (k === 'C 11') disc('#fff', RED, () => { g.lineWidth = 18; g.strokeStyle = INK; g.fillStyle = INK; g.beginPath(); g.moveTo(150, 190); g.lineTo(150, 128); g.lineTo(104, 128); g.stroke(); g.beginPath(); g.moveTo(112, 98); g.lineTo(78, 128); g.lineTo(112, 158); g.closePath(); g.fill(); g.strokeStyle = RED; g.lineWidth = 14; g.beginPath(); g.moveTo(64, 192); g.lineTo(192, 64); g.stroke(); });
    else if (k === 'D 11') disc(BLUE, BLUE, () => { arrow(128, 128, Math.PI / 2, 120); });
    else if (k === 'B 13') { g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(128 + 120 * Math.cos(a), 128 + 120 * Math.sin(a)); } g.closePath(); g.fillStyle = '#fff'; g.fill(); g.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; g.lineTo(128 + 104 * Math.cos(a), 128 + 104 * Math.sin(a)); } g.closePath(); g.fillStyle = RED; g.fill(); g.fillStyle = '#fff'; g.font = '900 62px Rubik, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STOP', 128, 132); }
    else if (k === 'B 17') { g.translate(128, 128); g.rotate(Math.PI / 4); g.fillStyle = INK; g.fillRect(-94, -94, 188, 188); g.fillStyle = '#fff'; g.fillRect(-84, -84, 168, 168); g.fillStyle = '#FFD60A'; g.fillRect(-66, -66, 132, 132); g.fillStyle = INK; for (const o of [-24, 4]) g.fillRect(-66, o, 132, 12); }
    else if (k === 'D 21') { sq(BLUE); g.lineWidth = 9; g.beginPath(); g.arc(88, 156, 28, 0, 7); g.arc(168, 156, 28, 0, 7); g.moveTo(88, 156); g.lineTo(122, 104); g.lineTo(168, 156); g.moveTo(104, 104); g.lineTo(138, 104); g.stroke(); }
    else if (k === 'E 18') { sq(BLUE); g.fillRect(104, 90, 48, 110); g.fillStyle = RED; g.fillRect(70, 62, 116, 30); }
    else if (k === 'E 19') { sq(BLUE); arrow(128, 128, 0, 150); }
    else if (k === 'F 11') { g.fillStyle = RED; g.beginPath(); g.moveTo(10, 70); g.lineTo(190, 70); g.lineTo(246, 128); g.lineTo(190, 186); g.lineTo(10, 186); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(26, 86); g.lineTo(184, 86); g.lineTo(228, 128); g.lineTo(184, 170); g.lineTo(26, 170); g.closePath(); g.fill(); g.fillStyle = '#C9CED4'; for (const y of [104, 128, 152]) g.fillRect(44, y - 5, 110, 10); }
    else if (k === 'E 68') { g.fillStyle = '#fff'; g.beginPath(); g.roundRect(8, 60, 240, 136, 16); g.fill(); g.fillStyle = '#2E8B57'; g.beginPath(); g.roundRect(18, 70, 220, 116, 10); g.fill(); g.fillStyle = '#fff'; g.font = '900 34px Rubik, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MILJØ', 128, 110); g.fillText('ZONE', 128, 150); }
    else if (k.startsWith('C 55')) disc('#fff', RED, () => { g.fillStyle = INK; g.font = '900 96px Rubik, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(k.startsWith('C 55:') ? k.slice(5) : '80', 128, 136); });
    else return null;
    return c;
  };
  // The official sign art from the question (diagrams.js: OFFICIAL_SIGN_ART), put on poles by the right-hand verge, turned a little towards the camera.
  const signArt = [];
  for (const code of (spec.extras?.signs || []).slice(0, 3)) {
    try {
      const D = await import('./diagrams.js'), src = D.OFFICIAL_SIGN_ART[code]?.src;
      let tex = src && await new Promise(res => new T.TextureLoader().load(src, t => { t.encoding = T.sRGBEncoding; res(t); }, undefined, () => res(null)));
      if (!tex && !src) { const cv = drawnSign(code); if (cv) { tex = new T.CanvasTexture(cv); tex.encoding = T.sRGBEncoding; tex.anisotropy = 4; } }
      if (tex) signArt.push(tex);
    } catch { /* no art for this sign: the scene simply has no sign */ }
  }
  signArt.forEach((tex, i) => {
    const size = 2.1, aspect = tex.image.width / tex.image.height, x = W / 2 + 1.5, z = -2 - i * 5.5;
    box(0.16, 2.6, 0.16, 0x2B3138, x, 1.3, z);
    const m = new T.Mesh(new T.PlaneGeometry(size * Math.min(aspect, 1.6), size / Math.max(aspect, 1)), new T.MeshBasicMaterial({ map: tex, transparent: false, alphaTest: 0.5, side: T.DoubleSide, toneMapped: false }));
    m.position.set(x, 2.9, z); m.rotation.y = 0.55; scene.add(m);
  });
  const lorry = (x, z, color) => {
    box(2.5, 3.1, 8.4, color, x, 2.15, z + 1.4); box(2.4, 2.5, 2.1, 0x3F5F73, x, 1.6, z - 3.9); box(2.45, 0.4, 8, 0x1F2328, x, 0.5, z + 1.4);
    for (const dz of [-3.7, 0.2, 2.2, 4]) for (const dx of [-1.2, 1.2]) { const w = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.35, 14), mat(0x1F2328)); w.rotation.z = Math.PI / 2; w.position.set(x + dx, 0.55, z + dz); scene.add(w); }
    blob(x, z, 4, 11);
  };
  for (let a of spec.actors) {
    if (a.t === 'lorry') a = { ...a, t: 'car', kind: 'lorry', dir: a.dir };
    if (a.t === 'person') { const pm = people[a.p]; if (pm) { const c = pm.clone(); c.position.set(a.x, 0, a.z); if (/^(dog|deer)/.test(a.p) && a.x > 0) c.scale.x = -1; scene.add(c); blob(a.x, a.z, 1.3, 1.3); } continue; }
    if (a.t === 'pedestrian') { box(0.5, 1.0, 0.35, 0x3F5F73, a.x, 0.9, a.z); const h = new T.Mesh(new T.SphereGeometry(0.22, 12, 10), mat(0xE9C9A0)); h.position.set(a.x, 1.65, a.z); scene.add(h); box(0.45, 0.55, 0.3, 0x1F2328, a.x, 0.28, a.z); blob(a.x, a.z, 1, 1); continue; }
    if (a.t === 'cyclist') { if (cyclist) { const c = cyclist.clone(); c.position.set(a.x, 0, a.z); scene.add(c); blob(a.x, a.z, 1.0, 2.0); } continue; }
    const kind = a.kind || 'sedan';
    if (V && !a.learner && a.color) a = { ...a, color: ({ '#B5543A': '#4F7A8C', '#7C8FA0': '#C9A04A', '#C2CCD6': '#D9D2C0', '#3F5F73': '#8A4F3F', '#5F7F6B': '#9A5B6E' })[a.color] || a.color };
    const car = EXTRA_KINDS.has(kind) && !models[kind] ? buildExtra(T, kind, a.color) : makeCar(a.learner ? 'sedan' : kind === 'police' ? 'sedan' : kind, a.learner ? '#FFD60A' : kind === 'police' ? '#F4F5F7' : a.color, a.t !== 'parked');
    if (kind === 'police') addPoliceMarkings(T, car);
    car.rotation.y = a.dir === 'toward' ? -Math.PI / 2 : a.dir === 'side' ? Math.PI : Math.PI / 2;
    if (NOSE_FLIP[kind] && models[kind]) car.rotation.y += NOSE_FLIP[kind];
    if (a.rot !== undefined) car.rotation.y = a.rot;
    if (a.tilt) car.rotation.x = a.tilt;
    if (a.learner && ex.trailer) { const tr = buildExtra(T, ex.trailer, '#F4F5F7'); tr.position.x = ex.trailer === 'caravan' ? -5.4 : -4.4; tr.rotation.y = 0; car.add(tr); }
    if (a.learner && ex.overhang) {
      for (const zz of [-0.35, 0.35]) { const bm = new T.Mesh(new T.BoxGeometry(6.6, 0.12, 0.12), mat(0xC9CED4)); bm.position.set(-0.9, 1.6, zz); bm.add(new T.LineSegments(new T.EdgesGeometry(bm.geometry), inkMat)); car.add(bm); }
      for (let rx = -3.9; rx < 2.2; rx += 0.7) { const rg = new T.Mesh(new T.BoxGeometry(0.06, 0.06, 0.8), mat(0xC9CED4)); rg.position.set(rx, 1.6, 0); car.add(rg); }
      const fl = new T.Mesh(new T.BoxGeometry(0.05, 0.5, 0.5), mat(0xD42F2F)); fl.position.set(-4.2, 1.6, 0); car.add(fl);
    }
    if (a.learner && ex.cargo) { const cg = new T.Mesh(new T.BoxGeometry(1.6, 0.5, 1.1), mat(0x7C8FA0)); cg.position.set(0, 1.85, 0); cg.add(new T.LineSegments(new T.EdgesGeometry(cg.geometry), inkMat)); car.add(cg); }
    addLamps(car, kind, a);
    if (a.signal) {
      const hl = halves[kind] || ({ bus: 6, lorry: 8, ambulance: 3 }[kind] || 2.3), wy = ({ bus: 1.0, lorry: 1.0, ambulance: 1.0 }[kind] || 0.75), wz = ({ bus: 1.1, lorry: 1.1, ambulance: 0.95 }[kind] || 0.85) * (a.signal === 'L' ? -1 : 1);
      for (const bx_ of [hl, -hl]) {
        const bl = new T.Mesh(new T.SphereGeometry(0.17, 8, 6), new T.MeshBasicMaterial({ color: 0xFF9600 })); bl.position.set(bx_, wy, wz); car.add(bl);
        const gl = new T.Sprite(new T.SpriteMaterial({ map: amberTex, transparent: true, depthWrite: false })); gl.scale.set(1.6, 1.6, 1); gl.position.copy(bl.position); car.add(gl);
      }
    }
    if (a.blink) {
      const hl = halves[kind] || ({ bus: 6, lorry: 8, ambulance: 3 }[kind] || 2.3), wy = ({ bus: 1.0, lorry: 1.0, ambulance: 1.0 }[kind] || 0.75), wz = ({ bus: 1.1, lorry: 1.1, ambulance: 0.95 }[kind] || 0.85);
      for (const [bx_, bz_] of [[hl, wz], [hl, -wz], [-hl, wz], [-hl, -wz]]) {
        const bl = new T.Mesh(new T.SphereGeometry(0.15, 8, 6), new T.MeshBasicMaterial({ color: 0xFF9600 })); bl.position.set(bx_, wy, bz_); car.add(bl);
        const gl = new T.Sprite(new T.SpriteMaterial({ map: amberTex, transparent: true, depthWrite: false })); gl.scale.set(1.2, 1.2, 1); gl.position.copy(bl.position); car.add(gl);
      }
    }
    if (a.smoke || a.fire) addEffects(car, a);
    car.position.set(a.x, 0, a.z); scene.add(car); { const big = { bus: [3.2, 12.5], lorry: [3.2, 11.5], ambulance: [2.6, 6.4], tractor: [2.6, 4.6], scooter: [1.2, 3] }[kind] || [3, 6]; blob(a.x, a.z, big[0], big[1]); }
  }
  // Extra props named by the spec: weather, a warning triangle, cones, a trailer behind the learner's car and headlight beams at night.
  if (spec.env === 'snow' || spec.env === 'rain') {
    const m = new T.MeshBasicMaterial({ color: spec.env === 'snow' ? 0xFFFFFF : 0xDDE8F0, transparent: true, opacity: spec.env === 'snow' ? 0.9 : 0.6 });
    for (let i = 0; i < (spec.env === 'snow' ? 90 : 120); i++) {
      const f = spec.env === 'snow' ? new T.Mesh(new T.SphereGeometry(0.07, 5, 4), m) : new T.Mesh(new T.BoxGeometry(0.03, 0.9, 0.03), m);
      f.position.set((r() - 0.5) * 24, 0.5 + r() * 9, 12 - r() * 40); if (spec.env === 'rain') f.rotation.z = 0.2; scene.add(f);
    }
  }
  if (ex.triangle) { // a standing warning triangle on a small foot
    box(0.5, 0.05, 0.4, 0xD42F2F, ex.triangle.x, 0.03, ex.triangle.z, false);
    const tex = signTexture('triangle'); signTextures.push(tex);
    const m = new T.Mesh(new T.PlaneGeometry(1.2, 1.2), new T.MeshBasicMaterial({ map: tex, transparent: false, alphaTest: 0.5, side: T.DoubleSide, toneMapped: false })); m.position.set(ex.triangle.x, 0.7, ex.triangle.z); m.rotation.y = 0.35; scene.add(m);
    for (let i = 0; i < 4; i++) { const c = new T.Mesh(new T.ConeGeometry(0.26, 0.75, 8), mat(0xFF7A00)); c.position.set(0.6 + i * 1.0, 0.38, -1.2 - i * 0.3); scene.add(c); }
  }
  if (ex.hazard) {
    const tri = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.05, 3), mat(0xD42F2F)); tri.rotation.set(Math.PI / 2, Math.PI / 2, 0); tri.position.set(1.7, 0.6, ex.hazard.z); tri.add(new T.LineSegments(new T.EdgesGeometry(tri.geometry), inkMat)); scene.add(tri);
    const inner = new T.Mesh(new T.CylinderGeometry(0.33, 0.33, 0.06, 3), mat(0xFEFFED)); inner.rotation.copy(tri.rotation); inner.position.copy(tri.position); inner.position.z += 0.02; scene.add(inner);
    for (let i = 0; i < 3; i++) { const c = new T.Mesh(new T.ConeGeometry(0.28, 0.8, 8), mat(0xFF7A00)); c.position.set(-0.4 + i * 1.1, 0.4, ex.hazard.z + 3 + i * 0.4); scene.add(c); }
  }
  if (ex.wind) {
    const w = mat(0xFEFFED, { transparent: true, opacity: 0.8 });
    for (let i = 0; i < 9; i++) { const m = new T.Mesh(new T.BoxGeometry(2.6 + r() * 2, 0.07, 0.07), w); m.position.set(7 + r() * 3, 1 + r() * 3.2, 5 - i * 3.4); m.rotation.y = 0.12; scene.add(m); }
  }

  const size = () => {
    const w = Math.max(1, stage.clientWidth), h = Math.max(1, stage.clientHeight);
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 1.3 ? 46 : 36; camera.updateProjectionMatrix();
  };
  const z0 = spec.actors[0]?.z || 0;
  const reduced = () => document.body.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const draw = now => {
    const sway = reduced() ? 0 : Math.sin(now / 3200) * 0.9;
    const c = spec.cam; if (c) { const p = [c.pos[0] + (V ? (c.pos[0] > 0 ? -1.6 : 1.6) : 0), c.pos[1] * (V ? 0.85 : 1), c.pos[2]], m = spec.mark; if (m) { /* close-up on the part the question is about, seen from the rule's side, instead of a ring over it (16 Nov 2026) */ const d = p.map((v, i) => v - m[i]), k = Math.min(1, (spec.markDist || 3.2) / Math.hypot(...d)); camera.position.set(m[0] + d[0] * k + sway * k, m[1] + d[1] * k, m[2] + d[2] * k); camera.lookAt(...m); } else { camera.position.set(p[0] + sway, p[1], p[2]); camera.lookAt(...c.look); } } else { camera.position.set((exm.tunnel ? 0.8 : V ? -1.2 : 2.6) + sway, (exm.tunnel ? 4.5 : ex.trailer ? 11 : 8.4) * (V ? 0.72 : 1), z0 + (V ? 14.5 : 12.5) + (ex.trailer ? 8 : 0)); camera.lookAt(0.5, 0.2, z0 - 3.5 + (ex.trailer ? 2 : 0)); } renderer.render(scene, camera);
  };
  // Hills: the whole world is tilted about the learner's car, so the road climbs or drops away in front of it (a crest also fades out into mist).
  if (exm.hill) {
    const pivot = new T.Group(), world = new T.Group(); pivot.position.set(0, 0, z0); world.position.set(0, 0, -z0);
    for (const o of [...scene.children]) if (!o.isLight) world.add(o);
    pivot.add(world); scene.add(pivot); pivot.rotation.x = exm.hill === 'down' ? -0.2 : exm.hill === 'crest' ? 0.2 : 0.16;
    if (exm.hill === 'crest') scene.fog = new T.Fog(env.sky, 12, 38);
  }
  // Hard sun shadows, drawn once (the scene is still apart from the camera sway): sharp-edged cast shadows like a cel drawing.
  if (!spec.capture && env.sun >= 1.2) {
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
    const tz = z0 - 6; sun.target.position.set(0, 0, tz); scene.add(sun.target);
    { const sp = env.sunPos || [-8, 14, 6]; sun.position.set(sp[0], sp[1] * 2.2, sp[2] + tz); }; sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 }); sun.shadow.camera.updateProjectionMatrix(); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.04;
    scene.traverse(o => { if (!o.isMesh) return; o.receiveShadow = true; const gp = o.geometry.parameters; if (!(o.geometry.type === 'PlaneGeometry') && !(gp && gp.height !== undefined && gp.height < 0.1)) o.castShadow = true; });
    renderer.shadowMap.needsUpdate = true;
  }
  stage.append(canvas); stage.classList.add('has-sit3d'); size();
  const ro = new ResizeObserver(() => { size(); draw(performance.now()); }); ro.observe(stage);
  let raf = 0, disposed = false, last = 0;
  function dispose() {
    if (disposed) return; disposed = true; cancelAnimationFrame(raf); ro.disconnect();
    Object.values(props).forEach(pm => pm.userData.dispose?.()); Object.values(people).forEach(pm => pm.userData.dispose?.()); Object.values(effectCards).forEach(c => c.userData.dispose?.()); cyclist?.userData.dispose?.(); signTextures.forEach(t => t.dispose()); signArt.forEach(t => t.dispose());
    scene.traverse(o => { o.geometry?.dispose?.(); for (const m of [].concat(o.material || [])) { if (!paintNames.has(m.name)) if (m.map !== plateMap) m.map?.dispose?.(); m.dispose?.(); } });
    plateMap.dispose(); occupants?.dispose(); renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove(); stage.classList.remove('has-sit3d');
  }
  function frame(now) {
    if (disposed) return; raf = requestAnimationFrame(frame);
    if (!stage.isConnected) { dispose(); return; }
    const b = stage.getBoundingClientRect(); if (b.bottom < 0 || b.top > innerHeight || document.hidden || now - last < 33) return;
    last = now; draw(now);
  }
  draw(performance.now()); raf = requestAnimationFrame(frame);
  return { dispose };
}
