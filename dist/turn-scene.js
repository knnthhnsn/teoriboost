/**
 * Original, local Three.js scene for the Natkørsel right-turn lesson.
 *
 * World convention: +x is east/right, -z is north/forward.  The learner's
 * car travels north in the right-hand lane, then turns east across the cycle
 * track.  Keeping this data outside the renderer makes the traffic geometry
 * deterministic and directly testable.
 */

const freezePoints = points => Object.freeze(points.map(point => Object.freeze([...point])));

export const TURN_LANES = Object.freeze({
  junction: Object.freeze({
    northbound: Object.freeze({ centreX: 2.05, direction: 'north', bounds: [0.15, 4.05] }),
    southbound: Object.freeze({ centreX: -2.05, direction: 'south', bounds: [-4.05, -0.15] }),
    cycleTrack: Object.freeze({ centreX: 6.15, direction: 'north', bounds: [5.2, 7.1] }),
    crossStreet: Object.freeze({ centreZ: -10, direction: 'east-west', bounds: [-15.4, -4.6] })
  }),
  driveway: Object.freeze({
    northbound: Object.freeze({ centreX: 1.9, direction: 'north', bounds: [0.1, 3.8] }),
    southbound: Object.freeze({ centreX: -1.9, direction: 'south', bounds: [-3.8, -0.1] }),
    cycleTrack: Object.freeze({ centreX: 6.25, direction: 'north', bounds: [5.3, 7.2] }),
    access: Object.freeze({ centreZ: -7, direction: 'east-west', bounds: [-9.4, -4.6] })
  }),
  review: Object.freeze({
    northbound: Object.freeze({ centreX: 2.25, direction: 'north', bounds: [0.25, 4.25] }),
    southbound: Object.freeze({ centreX: -2.15, direction: 'south', bounds: [-4.25, -0.25] }),
    cycleTrack: Object.freeze({ centreX: 6.45, direction: 'north', bounds: [5.45, 7.45] }),
    sideStreet: Object.freeze({ centreZ: -15, direction: 'east', bounds: [-18.1, -11.9] })
  })
});

export const TURN_PATHS = Object.freeze({
  junction: Object.freeze({
    car: freezePoints([[2.05, 13], [2.05, 4], [2.05, -3.8], [2.5, -6.4], [4.15, -8.7], [6.45, -10], [12, -10], [20, -10]]),
    cyclist: freezePoints([[6.15, 20], [6.15, 10], [6.15, 0], [6.15, -10], [6.15, -20], [6.15, -28]])
  }),
  driveway: Object.freeze({
    car: freezePoints([[1.9, 15], [1.9, 5], [1.9, -1.5], [2.45, -4.5], [4.25, -6.35], [6.4, -7], [11.5, -7], [21, -7]]),
    cyclist: freezePoints([[6.25, 21], [6.25, 11], [6.25, 1], [6.25, -7], [6.25, -17], [6.25, -27]])
  }),
  review: Object.freeze({
    car: freezePoints([[2.25, 14], [2.25, 3], [2.25, -8.5], [2.7, -11.7], [4.35, -14.1], [6.7, -15], [13, -15], [22, -15]]),
    cyclist: freezePoints([[6.45, 20], [6.45, 9], [6.45, -2], [6.45, -15], [6.45, -24], [6.45, -31]])
  })
});

export const TURN_VARIANTS = Object.freeze({
  junction: Object.freeze({
    id: 'junction', kind: 'crossroad', conflict: Object.freeze([6.15, -10]),
    holdCar: 0.405, passCyclist: 0.79, unsafeCar: 0.551, unsafeCyclist: 0.58425,
    cameraCentre: Object.freeze([4, -7])
  }),
  driveway: Object.freeze({
    id: 'driveway', kind: 'driveway', conflict: Object.freeze([6.25, -7]),
    holdCar: 0.38, passCyclist: 0.76, unsafeCar: 0.5376, unsafeCyclist: 0.5472,
    cameraCentre: Object.freeze([4.4, -5])
  }),
  review: Object.freeze({
    id: 'review', kind: 't-junction', conflict: Object.freeze([6.45, -15]),
    holdCar: 0.55, passCyclist: 0.82, unsafeCar: 0.5978, unsafeCyclist: 0.6615,
    cameraCentre: Object.freeze([4.5, -12])
  })
});

export const TURN_SCENE_DATA = Object.freeze({
  coordinateSystem: Object.freeze({ east: '+x', north: '-z', units: 'metres' }),
  durationMs: 4000,
  lanes: TURN_LANES,
  paths: TURN_PATHS,
  variants: TURN_VARIANTS
});

const VALID_VIEWS = new Set(['driver', 'shoulder', 'overhead']);
const VALID_VARIANTS = new Set(Object.keys(TURN_VARIANTS));
const CLEARED_CYCLIST_PROGRESS = 0.73;
const FALLBACK_VIEW_BOXES = Object.freeze({
  overhead: Object.freeze([-13, -34, 49, 67]),
  driver: Object.freeze([-5, -30, 25, 49]),
  // Includes both the approaching and cleared cyclist in the risk-stage view.
  shoulder: Object.freeze([-1, -22, 19, 46])
});
const clamp01 = value => Math.max(0, Math.min(1, Number(value) || 0));
const smooth = value => { const t = clamp01(value); return t * t * (3 - 2 * t); };
const round = value => Math.round(value * 1000) / 1000;

function pointHitsRect(clientX, clientY, rect, minimumSize = 44) {
  if (!rect || !Number.isFinite(clientX) || !Number.isFinite(clientY)) return false;
  const width = Number(rect.width) || Math.max(0, Number(rect.right) - Number(rect.left));
  const height = Number(rect.height) || Math.max(0, Number(rect.bottom) - Number(rect.top));
  const centreX = Number(rect.left) + width / 2;
  const centreY = Number(rect.top) + height / 2;
  const halfWidth = Math.max(width, minimumSize) / 2;
  const halfHeight = Math.max(height, minimumSize) / 2;
  return clientX >= centreX - halfWidth && clientX <= centreX + halfWidth
    && clientY >= centreY - halfHeight && clientY <= centreY + halfHeight;
}

function pathMetrics(points) {
  const segments = [];
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    const dx = points[index][0] - points[index - 1][0];
    const dz = points[index][1] - points[index - 1][1];
    const length = Math.hypot(dx, dz);
    segments.push({ from: points[index - 1], to: points[index], length, start: total });
    total += length;
  }
  return { segments, total };
}

const PATH_METRICS = Object.freeze(Object.fromEntries(Object.entries(TURN_PATHS).map(([key, value]) => [key, Object.freeze({
  car: pathMetrics(value.car), cyclist: pathMetrics(value.cyclist)
})])));

function samplePath(metrics, progress) {
  const distance = clamp01(progress) * metrics.total;
  let segment = metrics.segments[metrics.segments.length - 1];
  for (const candidate of metrics.segments) {
    if (distance <= candidate.start + candidate.length) { segment = candidate; break; }
  }
  const local = segment.length ? clamp01((distance - segment.start) / segment.length) : 0;
  const x = segment.from[0] + (segment.to[0] - segment.from[0]) * local;
  const z = segment.from[1] + (segment.to[1] - segment.from[1]) * local;
  const dx = segment.to[0] - segment.from[0];
  const dz = segment.to[1] - segment.from[1];
  return { x, z, heading: -Math.atan2(dx, -dz) };
}

function replayProgress(kind, time, variant) {
  const t = clamp01(time);
  if (kind === 'turn') {
    const approach = smooth(Math.min(t / 0.78, 1));
    return { car: variant.unsafeCar * approach, cyclist: variant.unsafeCyclist * approach, phase: t < 0.78 ? 'approaching' : 'conflict' };
  }
  if (t < 0.28) {
    const step = smooth(t / 0.28);
    return { car: variant.holdCar * step, cyclist: 0.44 * step, phase: 'approaching' };
  }
  if (t < 0.66) {
    const step = smooth((t - 0.28) / 0.38);
    return { car: variant.holdCar, cyclist: 0.44 + (variant.passCyclist - 0.44) * step, phase: 'waiting' };
  }
  const step = smooth((t - 0.66) / 0.34);
  return { car: variant.holdCar + (1 - variant.holdCar) * step, cyclist: variant.passCyclist + (1 - variant.passCyclist) * step, phase: t < 1 ? 'turning' : 'complete' };
}

// Pure sampler for deterministic geometry checks and non-rendering consumers.
// It deliberately delegates to the same replay and arc-length path functions
// used by both the WebGL and SVG renderers.
export function sampleTurnReplay(variantName = 'junction', kind = 'wait', time = 0) {
  const selectedVariant = VALID_VARIANTS.has(variantName) ? variantName : 'junction';
  const selectedKind = kind === 'turn' ? 'turn' : 'wait';
  const progress = replayProgress(selectedKind, time, TURN_VARIANTS[selectedVariant]);
  const metrics = PATH_METRICS[selectedVariant];
  return Object.freeze({
    variant: selectedVariant,
    kind: selectedKind,
    phase: progress.phase,
    progress: Object.freeze({ car: progress.car, cyclist: progress.cyclist }),
    car: Object.freeze(samplePath(metrics.car, progress.car)),
    cyclist: Object.freeze(samplePath(metrics.cyclist, progress.cyclist))
  });
}

function createFallback(canvas, options) {
  let variantName = VALID_VARIANTS.has(options.variant) ? options.variant : 'junction';
  let view = 'driver';
  let explanation = false;
  let motion = !!options.motion;
  let replayKind = null;
  let phase = 'ready';
  let progress = { car: 0, cyclist: 0 };
  let cyclistCleared = false;
  let disposed = false;
  const parent = canvas && canvas.parentElement;
  const doc = canvas && canvas.ownerDocument;
  let svg = null;
  let observer = null;

  if (parent && doc && doc.createElementNS) {
    const oldPosition = parent.style.position;
    if (!oldPosition || oldPosition === 'static') parent.style.position = 'relative';
    svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Trafikscene: bil drejer til højre over en cykelsti');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;background:#101b2b;pointer-events:none';
    // Keep controls and the status badge above the fallback artwork.
    parent.insertBefore(svg, canvas.nextSibling);
    canvas.style.visibility = 'hidden';
    if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(() => draw()); observer.observe(parent); }
  }

  function currentPose() {
    const metrics = PATH_METRICS[variantName];
    return { car: samplePath(metrics.car, progress.car), cyclist: samplePath(metrics.cyclist, progress.cyclist) };
  }

  function pointsAttr(points) { return points.map(point => `${point[0]},${point[1]}`).join(' '); }

  function draw() {
    if (!svg || disposed) return;
    const data = TURN_VARIANTS[variantName];
    const paths = TURN_PATHS[variantName];
    const lane = TURN_LANES[variantName];
    const pose = currentPose();
    svg.setAttribute('viewBox', FALLBACK_VIEW_BOXES[view].join(' '));
    const street = data.kind === 'crossroad'
      ? '<rect x="-13" y="-15.4" width="49" height="10.8" fill="#27323c"/><path d="M-13 -10H36" stroke="#d8d3bd" stroke-width=".12" stroke-dasharray="2.2 2.2"/>'
      : data.kind === 'driveway'
        ? '<rect x="7.1" y="-9.4" width="29" height="4.8" fill="#333b42"/><path d="M7.1 -9.4H36M7.1 -4.6H36" stroke="#b6ada0" stroke-width=".22"/>'
        : '<rect x="7.4" y="-18.1" width="29" height="6.2" fill="#27323c"/>';
    const answer = explanation ? `<g opacity=".95"><polyline points="${pointsAttr(paths.car)}" fill="none" stroke="#ffb24a" stroke-width=".42" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pointsAttr(paths.cyclist)}" fill="none" stroke="#42d9e8" stroke-width=".42" stroke-linecap="round"/><circle cx="${data.conflict[0]}" cy="${data.conflict[1]}" r="1.35" fill="none" stroke="#ff6f91" stroke-width=".35" stroke-dasharray=".7 .45"/></g>` : '';
    // SVG's positive rotation direction is the inverse of Three.js yaw in our
    // x/z ground plane (the model's nose points toward negative local z/y).
    const carAngle = -pose.car.heading * 180 / Math.PI;
    const bikeAngle = -pose.cyclist.heading * 180 / Math.PI;
    svg.innerHTML = `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#16243a"/><stop offset="1" stop-color="#283b45"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation=".28"/></filter></defs><rect x="-20" y="-40" width="65" height="80" fill="url(#sky)"/><rect x="-4.2" y="-40" width="8.4" height="80" fill="#252e36"/><rect x="4.2" y="-40" width="1" height="80" fill="#c4beb0"/><rect x="5.2" y="-40" width="1.9" height="80" fill="#7d4144"/><rect x="7.1" y="-40" width="2.3" height="80" fill="#77756c"/>${street}<path d="M0 -40V40" stroke="#dad6c4" stroke-width=".12" stroke-dasharray="2.5 2.5"/><path d="M${lane.cycleTrack.bounds[0]} -40V40M${lane.cycleTrack.bounds[1]} -40V40" stroke="#eee4d0" stroke-width=".1" stroke-dasharray="1.2 .8"/>${answer}<g transform="translate(${pose.car.x} ${pose.car.z}) rotate(${carAngle})"><rect x="-1" y="-2.1" width="2" height="4.2" rx=".45" fill="#e4a34f" stroke="#f8d9aa" stroke-width=".1"/><rect x="-.74" y="-.8" width="1.48" height="1.55" rx=".25" fill="#17334b"/><circle cx="-.57" cy="-1.92" r=".12" fill="#fff4bc" filter="url(#glow)"/><circle cx=".57" cy="-1.92" r=".12" fill="#fff4bc" filter="url(#glow)"/></g><g data-turn-risk="cycle" transform="translate(${pose.cyclist.x} ${pose.cyclist.z}) rotate(${bikeAngle})"><circle cx="0" cy="-.55" r=".38" fill="none" stroke="#d8e5db" stroke-width=".08"/><circle cx="0" cy=".55" r=".38" fill="none" stroke="#d8e5db" stroke-width=".08"/><path d="M0 -.55L-.28 .15L0 .55L.2 .08Z" fill="none" stroke="#43d9e8" stroke-width=".13"/><circle cx="0" cy="-.08" r=".25" fill="#ffcc88"/><path d="M0 .05V.55" stroke="#ed6689" stroke-width=".34"/></g><g fill="#1c3240"><rect x="-12" y="-36" width="6.8" height="72"/><rect x="10" y="-36" width="8" height="72"/></g><g fill="#ffd68b" opacity=".8">${[-29,-20,-2,8,18,28].map(z => `<rect x="-6.2" y="${z}" width=".7" height="1.2"/><rect x="10.4" y="${z+3}" width=".7" height="1.2"/>`).join('')}</g>`;
  }

  function finishReplay(kind) {
    cyclistCleared = false;
    replayKind = kind;
    const result = replayProgress(kind, 1, TURN_VARIANTS[variantName]);
    progress = { car: result.car, cyclist: result.cyclist };
    phase = result.phase;
    draw();
    if (!disposed) options.onReplayEnd();
  }

  function snapshot() {
    const pose = currentPose();
    return { renderer: 'svg-fallback', variant: variantName, view, explanation, motion, replay: replayKind, phase, cyclistCleared,
      progress: { car: round(progress.car), cyclist: round(progress.cyclist) },
      car: { x: round(pose.car.x), z: round(pose.car.z), heading: round(pose.car.heading) },
      cyclist: { x: round(pose.cyclist.x), z: round(pose.cyclist.z), heading: round(pose.cyclist.heading) }
    };
  }

  draw();
  return {
    setView(next) { if (VALID_VIEWS.has(next)) view = next; draw(); return view; },
    setVariant(next) { if (!VALID_VARIANTS.has(next)) return variantName; variantName = next; cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; draw(); return variantName; },
    setExplanation(value) { explanation = !!value; draw(); return explanation; },
    pickRisk(clientX, clientY) {
      if (disposed || !svg) return 'other';
      const target = svg.querySelector?.('[data-turn-risk="cycle"]');
      return pointHitsRect(clientX, clientY, target?.getBoundingClientRect?.()) ? 'cycle' : 'other';
    },
    setCyclistCleared(value) {
      const next = !!value;
      if (next === cyclistCleared) return cyclistCleared;
      cyclistCleared = next;
      replayKind = null; phase = 'ready';
      progress = { car: 0, cyclist: cyclistCleared ? CLEARED_CYCLIST_PROGRESS : 0 };
      draw(); return cyclistCleared;
    },
    replay(kind = 'wait') { finishReplay(kind === 'turn' ? 'turn' : 'wait'); },
    reset() { cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; draw(); },
    setMotion(value) { motion = !!value; return motion; },
    snapshot,
    dispose() { disposed = true; observer?.disconnect(); svg?.remove(); if (canvas) canvas.style.visibility = ''; }
  };
}

export function createTurnScene(canvas, { motion = true, variant = 'junction', onReplayEnd = () => {} } = {}) {
  const safeOptions = { motion: !!motion, variant: VALID_VARIANTS.has(variant) ? variant : 'junction', onReplayEnd: typeof onReplayEnd === 'function' ? onReplayEnd : () => {} };
  const T = typeof window !== 'undefined' ? window.THREE : null;
  if (!T || !canvas) return createFallback(canvas, safeOptions);

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  } catch {
    return createFallback(canvas, safeOptions);
  }

  renderer.setPixelRatio(Math.min(typeof devicePixelRatio === 'number' ? devicePixelRatio : 1, 1.75));
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  scene.background = new T.Color(0x091522);
  scene.fog = new T.Fog(0x0b1825, 40, 112);
  const camera = new T.PerspectiveCamera(49, 1, 0.08, 150);
  const world = new T.Group();
  scene.add(world, camera);

  const hemi = new T.HemisphereLight(0x7194bf, 0x18251e, 0.52);
  const dusk = new T.DirectionalLight(0x9ebbe1, 0.62);
  dusk.position.set(-18, 30, 22);
  dusk.castShadow = true;
  dusk.shadow.mapSize.set(1024, 1024);
  dusk.shadow.camera.left = -32; dusk.shadow.camera.right = 32;
  dusk.shadow.camera.top = 36; dusk.shadow.camera.bottom = -36;
  scene.add(hemi, dusk);

  let variantName = safeOptions.variant;
  let view = 'driver';
  let explanation = false;
  let motionEnabled = safeOptions.motion && !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let replayKind = null;
  let phase = 'ready';
  let progress = { car: 0, cyclist: 0 };
  let cyclistCleared = false;
  let car = null;
  let cyclist = null;
  let explanationGroup = null;
  let animationId = 0;
  let animationStart = 0;
  let disposed = false;
  let observer = null;
  let surfaceMaps = null;
  const materialCache = new Map();
  const cockpit = new T.Group();
  const dashShape = new T.Shape();
  dashShape.moveTo(-0.50, -0.035); dashShape.lineTo(0.50, -0.035);
  dashShape.lineTo(0.44, 0.02); dashShape.lineTo(-0.44, 0.02); dashShape.closePath();
  const dashMaterial = new T.MeshBasicMaterial({ color: 0x05090c, toneMapped: false });
  const dash = new T.Mesh(new T.ShapeGeometry(dashShape), dashMaterial);
  dash.position.set(0, -0.27, -0.58);
  const hoodEdgeMaterial = new T.MeshBasicMaterial({ color: 0x5b3c2f, toneMapped: false });
  const hoodEdge = new T.Mesh(new T.BoxGeometry(0.52, 0.006, 0.014), hoodEdgeMaterial);
  hoodEdge.position.set(0, -0.235, -0.60);
  cockpit.add(dash, hoodEdge); camera.add(cockpit);

  function material(color, options = {}) {
    const key = `${color}:${options.emissive || 0}:${options.metalness || 0}:${options.roughness ?? 0.72}:${options.opacity ?? 1}`;
    const parameters = {
      color, roughness: options.roughness ?? 0.72, metalness: options.metalness ?? 0.03,
      emissive: options.emissive || 0x000000, emissiveIntensity: options.emissiveIntensity ?? 1,
      transparent: (options.opacity ?? 1) < 1, opacity: options.opacity ?? 1
    };
    if (options.side !== undefined) parameters.side = options.side;
    if (!materialCache.has(key)) materialCache.set(key, new T.MeshStandardMaterial(parameters));
    return materialCache.get(key);
  }

  function basic(color, opacity = 1) {
    const key = `basic:${color}:${opacity}`;
    if (!materialCache.has(key)) materialCache.set(key, new T.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false, depthWrite: opacity >= 1 }));
    return materialCache.get(key);
  }

  function surfaceTexture(kind) {
    const surface = document.createElement('canvas');
    surface.width = surface.height = 256;
    const context = surface.getContext('2d');
    const palette = {
      asphalt: '#252c33', paving: '#777872', cycle: '#754148',
      facade: '#73777a', lawn: '#233f38'
    };
    context.fillStyle = palette[kind] || '#777'; context.fillRect(0, 0, 256, 256);
    let seed = 431 + kind.length * 97;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    if (kind === 'asphalt') {
      for (let index = 0; index < 1250; index += 1) {
        const shade = 34 + Math.floor(random() * 32);
        context.fillStyle = `rgba(${shade + 5},${shade + 8},${shade + 11},${0.16 + random() * 0.22})`;
        const size = 0.4 + random() * 1.6;
        context.fillRect(random() * 256, random() * 256, size, size);
      }
      context.strokeStyle = 'rgba(8,13,17,.22)'; context.lineWidth = 1.3;
      for (let line = 0; line < 4; line += 1) {
        context.beginPath(); context.moveTo(random() * 256, random() * 256);
        for (let part = 0; part < 5; part += 1) context.lineTo(random() * 256, random() * 256);
        context.stroke();
      }
    } else if (kind === 'paving') {
      context.strokeStyle = 'rgba(40,44,44,.28)'; context.lineWidth = 2;
      for (let y = 0; y <= 256; y += 32) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(256, y); context.stroke();
        const offset = (y / 32) % 2 ? 16 : 0;
        for (let x = offset; x <= 256; x += 32) { context.beginPath(); context.moveTo(x, y); context.lineTo(x, y + 32); context.stroke(); }
      }
      context.strokeStyle = 'rgba(224,219,204,.08)'; context.lineWidth = 1;
      for (let y = 2; y < 256; y += 32) { context.beginPath(); context.moveTo(0, y); context.lineTo(256, y); context.stroke(); }
    } else if (kind === 'cycle') {
      for (let index = 0; index < 700; index += 1) {
        context.fillStyle = random() > .5 ? 'rgba(255,210,195,.08)' : 'rgba(25,15,19,.12)';
        context.fillRect(random() * 256, random() * 256, 0.6 + random(), 0.6 + random());
      }
      context.strokeStyle = 'rgba(240,213,194,.08)'; context.lineWidth = 1;
      for (let x = 0; x < 256; x += 42) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 256); context.stroke(); }
    } else if (kind === 'facade') {
      context.strokeStyle = 'rgba(28,34,39,.22)'; context.lineWidth = 1;
      for (let y = 0; y <= 256; y += 18) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(256, y); context.stroke();
        const offset = (y / 18) % 2 ? 20 : 0;
        for (let x = offset; x < 256; x += 40) { context.beginPath(); context.moveTo(x, y); context.lineTo(x, y + 18); context.stroke(); }
      }
      const shade = context.createLinearGradient(0, 0, 256, 0);
      shade.addColorStop(0, 'rgba(255,255,255,.10)'); shade.addColorStop(.55, 'rgba(255,255,255,0)'); shade.addColorStop(1, 'rgba(0,0,0,.12)');
      context.fillStyle = shade; context.fillRect(0, 0, 256, 256);
    } else {
      for (let index = 0; index < 800; index += 1) {
        context.fillStyle = random() > .5 ? 'rgba(81,113,91,.12)' : 'rgba(10,24,21,.16)';
        context.fillRect(random() * 256, random() * 256, 1 + random() * 2, 1 + random() * 2);
      }
    }
    const texture = new T.CanvasTexture(surface);
    texture.encoding = T.sRGBEncoding;
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    const repeats = kind === 'facade' ? [2, 3] : kind === 'paving' ? [5, 18] : [7, 12];
    texture.repeat.set(repeats[0], repeats[1]);
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy?.() || 1);
    return texture;
  }

  function surfaceMaterial(name, color, texture, options = {}) {
    const key = `surface:${name}:${color}:${options.roughness ?? .88}`;
    if (!materialCache.has(key)) materialCache.set(key, new T.MeshStandardMaterial({
      color, map: texture, roughness: options.roughness ?? .88, metalness: options.metalness ?? .02
    }));
    return materialCache.get(key);
  }

  function addMesh(parent, geometry, meshMaterial, x = 0, y = 0, z = 0, cast = false, receive = false) {
    const mesh = new T.Mesh(geometry, meshMaterial);
    mesh.position.set(x, y, z);
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    parent.add(mesh);
    return mesh;
  }

  function box(parent, width, height, depth, meshMaterial, x, y, z, cast = false, receive = false) {
    return addMesh(parent, new T.BoxGeometry(width, height, depth), meshMaterial, x, y, z, cast, receive);
  }

  function plane(parent, width, depth, meshMaterial, x, y, z) {
    const mesh = addMesh(parent, new T.PlaneGeometry(width, depth), meshMaterial, x, y, z, false, true);
    mesh.rotation.x = -Math.PI / 2;
    return mesh;
  }

  function cylinderBetween(parent, from, to, radius, meshMaterial, radial = 10) {
    const start = new T.Vector3(...from); const end = new T.Vector3(...to);
    const delta = end.clone().sub(start);
    const mesh = addMesh(parent, new T.CylinderGeometry(radius, radius, delta.length(), radial), meshMaterial);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize());
    mesh.castShadow = true;
    return mesh;
  }

  function makeCar() {
    const group = new T.Group();
    const paint = material(0xd99542, { metalness: 0.45, roughness: 0.27 });
    const darkPaint = material(0x8f4d24, { metalness: 0.4, roughness: 0.31 });
    const glass = material(0x102a42, { metalness: 0.38, roughness: 0.12, opacity: 0.88 });
    const rubber = material(0x0d1218, { roughness: 0.93 });
    const chrome = material(0x9ca7aa, { metalness: 0.84, roughness: 0.2 });
    box(group, 1.92, 0.58, 4.18, paint, 0, 0.67, 0, true, true);
    box(group, 1.84, 0.18, 3.88, darkPaint, 0, 0.96, 0.05, true);
    box(group, 1.74, 0.16, 1.22, paint, 0, 1.08, -1.40, true);
    box(group, 1.58, 0.66, 2.18, glass, 0, 1.30, 0.02, true);
    box(group, 1.62, 0.10, 2.18, paint, 0, 1.66, 0.03, true);
    box(group, 1.78, 0.14, 0.22, chrome, 0, 0.50, -2.08);
    box(group, 1.78, 0.14, 0.20, chrome, 0, 0.51, 2.08);
    for (const x of [-0.98, 0.98]) for (const z of [-1.30, 1.30]) {
      const wheel = addMesh(group, new T.CylinderGeometry(0.37, 0.37, 0.24, 18), rubber, x, 0.40, z, true);
      wheel.rotation.z = Math.PI / 2;
      const hub = addMesh(group, new T.CylinderGeometry(0.18, 0.18, 0.252, 14), chrome, x, 0.40, z);
      hub.rotation.z = Math.PI / 2;
    }
    for (const x of [-0.59, 0.59]) {
      box(group, 0.39, 0.18, 0.045, material(0xfff1b6, { emissive: 0xffcc72, emissiveIntensity: 1.8 }), x, 0.76, -2.105);
      box(group, 0.42, 0.16, 0.045, material(0xd83e4f, { emissive: 0xa8162b, emissiveIntensity: 1.2 }), x, 0.78, 2.105);
    }
    box(group, 0.62, 0.10, 0.05, basic(0xe5e6d3), 0, 0.54, 2.11);
    box(group, 0.92, 0.16, 0.05, material(0x172028, { metalness: .35 }), 0, .53, -2.115);
    box(group, 0.16, 0.13, 0.05, material(0xffa33f, { emissive: 0xf3791d, emissiveIntensity: 2.2 }), .84, .78, -2.12);
    box(group, 0.16, 0.13, 0.05, material(0xffa33f, { emissive: 0xf3791d, emissiveIntensity: 2.2 }), .84, .78, 2.12);
    const mirror = material(0x182b38, { metalness: 0.35, roughness: 0.22 });
    box(group, 0.23, 0.16, 0.34, mirror, -1.04, 1.23, -0.55, true);
    box(group, 0.23, 0.16, 0.34, mirror, 1.04, 1.23, -0.55, true);
    const shadow = addMesh(group, new T.CircleGeometry(1.48, 28), basic(0x05080b, .24), 0, .018, .05);
    shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1, 2.05, 1);
    return group;
  }

  function makeCyclist() {
    const group = new T.Group();
    const tyre = material(0x11161b, { roughness: 0.95 });
    const metal = material(0x37c7d5, { metalness: 0.44, roughness: 0.3 });
    const skin = material(0xd9a477, { roughness: 0.8 });
    const jacket = material(0xd95072, { roughness: 0.72 });
    const dark = material(0x1a2638, { roughness: 0.78 });
    for (const z of [-0.58, 0.58]) {
      const wheel = addMesh(group, new T.TorusGeometry(0.38, 0.035, 8, 24), tyre, 0, 0.42, z, true);
      wheel.rotation.y = Math.PI / 2;
      const hub = addMesh(group, new T.CylinderGeometry(0.045, 0.045, 0.11, 8), metal, 0, 0.42, z);
      hub.rotation.z = Math.PI / 2;
    }
    cylinderBetween(group, [0, 0.42, -0.58], [0, 0.82, 0.05], 0.035, metal);
    cylinderBetween(group, [0, 0.42, 0.58], [0, 0.82, 0.05], 0.035, metal);
    cylinderBetween(group, [0, 0.42, 0.58], [0, 0.67, -0.22], 0.035, metal);
    cylinderBetween(group, [0, 0.67, -0.22], [0, 0.42, -0.58], 0.035, metal);
    cylinderBetween(group, [0, 0.42, -0.58], [0, 0.95, -0.48], 0.032, metal);
    cylinderBetween(group, [-0.28, 0.98, -0.52], [0.28, 0.98, -0.52], 0.025, material(0xaeb8bb, { metalness: 0.65 }));
    box(group, 0.31, 0.59, 0.24, jacket, 0, 1.27, 0.02, true);
    const head = addMesh(group, new T.SphereGeometry(0.17, 14, 10), skin, 0, 1.72, -0.06, true);
    const helmet = addMesh(group, new T.SphereGeometry(0.18, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), dark, 0, 1.78, -0.07, true);
    helmet.rotation.x = -0.08;
    cylinderBetween(group, [-0.12, 1.49, -0.03], [-0.25, 1.02, -0.50], 0.055, skin);
    cylinderBetween(group, [0.12, 1.49, -0.03], [0.25, 1.02, -0.50], 0.055, skin);
    cylinderBetween(group, [-0.09, 1.02, 0.02], [-0.12, 0.53, -0.18], 0.07, dark);
    cylinderBetween(group, [0.09, 1.02, 0.02], [0.12, 0.53, 0.28], 0.07, dark);
    box(group, 0.12, 0.09, 0.06, material(0xff463f, { emissive: 0xc92020, emissiveIntensity: 2 }), 0, 0.75, 0.64);
    box(group, .32, .42, .17, material(0x314351, { roughness: .82 }), 0, 1.25, .18, true);
    const shadow = addMesh(group, new T.CircleGeometry(.42, 22), basic(0x05080b, .25), 0, .016, 0);
    shadow.rotation.x = -Math.PI / 2; shadow.scale.set(.72, 1.8, 1);
    group.userData.head = head;
    return group;
  }

  function makeLamp(parent, x, z, face = -1, actualLight = false) {
    const pole = material(0x364653, { metalness: 0.52, roughness: 0.42 });
    box(parent, 0.13, 5.25, 0.13, pole, x, 2.63, z, true);
    addMesh(parent, new T.CylinderGeometry(.19, .28, .16, 12), pole, x, .08, z, true);
    box(parent, 1.25, 0.11, 0.12, pole, x + face * 0.57, 5.18, z, true);
    box(parent, 0.64, 0.16, 0.38, pole, x + face * 1.13, 5.12, z, true);
    box(parent, 0.49, 0.05, 0.27, material(0xffd897, { emissive: 0xffc061, emissiveIntensity: 2.4 }), x + face * 1.15, 5.025, z);
    const pool = addMesh(parent, new T.CircleGeometry(4.8, 28), basic(0xffc879, .055), x + face * 1.15, .072, z);
    pool.rotation.x = -Math.PI / 2;
    if (actualLight) {
      const lamp = new T.PointLight(0xffc878, 1.15, 17, 2);
      lamp.position.set(x + face * 1.15, 4.9, z);
      parent.add(lamp);
    }
  }

  function makeTree(parent, x, z, scale = 1) {
    box(parent, 0.25 * scale, 2.1 * scale, 0.25 * scale, material(0x493a30), x, 1.05 * scale, z, true);
    const crown = addMesh(parent, new T.IcosahedronGeometry(1.05 * scale, 1), material(0x27544b, { roughness: 0.96 }), x, 2.65 * scale, z, true);
    crown.scale.set(0.86, 1.25, 0.88);
  }

  function makeBuilding(parent, side, z, index, setback = 0) {
    const widths = [7.6, 8.8, 6.9, 9.2];
    const heights = [8.5, 11.4, 7.4, 10.1, 12.3];
    const colours = [0x8a9aaa, 0x9e7f8e, 0x87928f, 0xa19278, 0x6f9698];
    const width = widths[index % widths.length];
    const height = heights[index % heights.length];
    const depth = 8.2;
    const x = side * (11.2 + width / 2 + setback);
    const shell = surfaceMaterial(`facade-${index % colours.length}`, colours[index % colours.length], surfaceMaps.facade, { roughness: 0.9 });
    box(parent, width, height, depth, shell, x, height / 2, z, true, true);
    const trim = material(0x263746, { roughness: 0.72 });
    const frame = material(0x192832, { metalness: 0.18, roughness: 0.42 });
    box(parent, width + 0.36, 0.36, depth + 0.36, trim, x, height + 0.04, z, true);
    box(parent, 0.22, height + 0.12, 0.22, trim, x - side * (width / 2 + 0.08), height / 2, z - depth / 2 + 0.15, true);
    box(parent, 0.22, height + 0.12, 0.22, trim, x - side * (width / 2 + 0.08), height / 2, z + depth / 2 - 0.15, true);
    box(parent, width * 0.72, 0.82, 0.24, frame, x - side * (width / 2 + 0.12), 0.61, z, true);
    box(parent, width * 0.29, 0.11, 0.12, material(0x9a8b72, { metalness: .25 }), x - side * (width / 2 + 0.26), 1.15, z, true);
    const litA = material(0xffc67a, { emissive: 0xc27a32, emissiveIntensity: 0.92 });
    const litB = material(0x7ab6c5, { emissive: 0x2f6977, emissiveIntensity: 0.7 });
    const darkWindow = material(0x172a37, { metalness: 0.24, roughness: 0.25 });
    const rows = Math.max(2, Math.floor((height - 1.8) / 2.05));
    const columns = Math.max(2, Math.floor((depth - 1.2) / 1.75));
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
      const lightChoice = (index * 7 + row * 3 + column) % 5;
      const windowMaterial = lightChoice === 0 ? darkWindow : lightChoice % 2 ? litA : litB;
      const windowZ = z - depth / 2 + 1.02 + column * 1.58;
      box(parent, 0.12, 1.24, 1.12, frame, x - side * (width / 2 + 0.04), 1.65 + row * 2.03, windowZ, true);
      const window = box(parent, 0.08, 1.02, 0.89, windowMaterial, x - side * (width / 2 + 0.11), 1.65 + row * 2.03, windowZ);
      window.rotation.y = 0;
      if (row > 0 && column % 2 === 0) box(parent, 0.65, 0.09, 1.18, material(0x303d45, { metalness: 0.3 }), x - side * (width / 2 + 0.34), 1.1 + row * 2.03, window.position.z, true);
    }
    const frontColumns = Math.max(2, Math.floor(width / 1.8));
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < frontColumns; column += 1) {
      const windowX = x - width / 2 + 1.05 + column * 1.65;
      box(parent, 1.18, 1.24, 0.11, frame, windowX, 1.65 + row * 2.03, z + depth / 2 + 0.035, true);
      box(parent, 0.98, 1.02, 0.07, (index + row + column) % 4 ? litA : darkWindow, windowX, 1.65 + row * 2.03, z + depth / 2 + 0.105);
      box(parent, 1.22, 0.07, 0.17, trim, windowX, 1.05 + row * 2.03, z + depth / 2 + 0.14, true);
    }
    box(parent, 0.10, height - .7, 0.10, material(0x52616a, { metalness: .48, roughness: .36 }), x + width * .39, (height - .7) / 2, z + depth / 2 + .12, true);
    if (index % 2 === 0) box(parent, 0.75, 1.05, 0.75, trim, x + width * .23, height + .55, z - .9, true);
    if (index % 3 === 1) {
      box(parent, width * 0.67, 0.18, 1.15, material(0x30414c, { metalness: 0.22 }), x, 3.35, z + depth / 2 + 0.48, true);
      cylinderBetween(parent, [x - width * 0.31, 3.35, z + depth / 2 + 0.85], [x - width * 0.31, 2.75, z + depth / 2 + 0.85], 0.045, material(0x718087, { metalness: 0.6 }));
      cylinderBetween(parent, [x + width * 0.31, 3.35, z + depth / 2 + 0.85], [x + width * 0.31, 2.75, z + depth / 2 + 0.85], 0.045, material(0x718087, { metalness: 0.6 }));
    }
  }

  function addRoadMark(parent, x, z, width = 0.11, depth = 2.8) {
    plane(parent, width, depth, material(0xe8e5d4, { roughness: 0.82 }), x, 0.036, z);
  }

  function pathLine(parent, points, color) {
    const vectors = points.map(point => new T.Vector3(point[0], 0.105, point[1]));
    const curve = new T.CatmullRomCurve3(vectors, false, 'catmullrom', 0.28);
    return addMesh(parent, new T.TubeGeometry(curve, 72, 0.095, 7, false), basic(color, 0.9));
  }

  function buildWorld() {
    disposeChildren(world);
    materialCache.clear();
    surfaceMaps = {
      asphalt: surfaceTexture('asphalt'), paving: surfaceTexture('paving'),
      cycle: surfaceTexture('cycle'), facade: surfaceTexture('facade'), lawn: surfaceTexture('lawn')
    };
    const data = TURN_VARIANTS[variantName];
    const lane = TURN_LANES[variantName];
    const paths = TURN_PATHS[variantName];
    const asphalt = surfaceMaterial('asphalt', 0x68727b, surfaceMaps.asphalt, { roughness: .9 });
    const paving = surfaceMaterial('paving', 0xa9aaa3, surfaceMaps.paving, { roughness: .96 });
    const cycleSurface = surfaceMaterial('cycle', 0xb27077, surfaceMaps.cycle, { roughness: .9 });
    plane(world, 92, 116, surfaceMaterial('lawn', 0x56786c, surfaceMaps.lawn, { roughness: 1 }), 5, -0.04, -6);
    plane(world, 8.4, 100, asphalt, 0, 0, -6);
    plane(world, 1.0, 100, paving, 4.7, 0.035, -6);
    plane(world, lane.cycleTrack.bounds[1] - lane.cycleTrack.bounds[0], 100, cycleSurface, lane.cycleTrack.centreX, 0.045, -6);
    plane(world, 2.45, 100, paving, 8.35, 0.025, -6);
    box(world, 0.18, 0.15, 100, material(0xb2aa9b, { roughness: .9 }), 4.16, 0.075, -6, false, true);
    box(world, 0.18, 0.15, 100, material(0xb2aa9b, { roughness: .9 }), 7.18, 0.075, -6, false, true);
    // Restrained cool road sheen adds depth without implying wet or slippery conditions.
    for (const [x, z, width, depth] of [[-1.15, 19, .46, 12], [1.35, -28, .33, 10], [-2.7, -2, .25, 7]]) {
      plane(world, width, depth, basic(0x87a9b4, .055), x, .018, z);
    }
    for (let z = -48; z < 45; z += 7) addRoadMark(world, 0, z);
    for (let z = -48; z < 45; z += 4.1) {
      addRoadMark(world, lane.cycleTrack.bounds[0] + 0.03, z, 0.075, 2.0);
      addRoadMark(world, lane.cycleTrack.bounds[1] - 0.03, z, 0.075, 2.0);
    }

    if (data.kind === 'crossroad') {
      plane(world, 70, 10.8, asphalt, 5, 0.018, lane.crossStreet.centreZ);
      plane(world, 1.9, 10.8, cycleSurface, lane.cycleTrack.centreX, 0.058, lane.crossStreet.centreZ);
      for (let x = -27; x < 34; x += 7) addRoadMark(world, x, lane.crossStreet.centreZ, 2.9, 0.11);
      for (const z of [lane.crossStreet.bounds[0], lane.crossStreet.bounds[1]]) box(world, 70, 0.15, 0.18, material(0xc1b9a8), 5, 0.075, z);
    } else if (data.kind === 'driveway') {
      plane(world, 31, 4.8, surfaceMaterial('access-paving', 0x858684, surfaceMaps.paving, { roughness: .95 }), 21.5, 0.027, lane.access.centreZ);
      plane(world, 1.9, 4.8, cycleSurface, lane.cycleTrack.centreX, 0.062, lane.access.centreZ);
      box(world, 29, 0.14, 0.17, material(0xb8b0a2), 21.5, 0.07, lane.access.bounds[0]);
      box(world, 29, 0.14, 0.17, material(0xb8b0a2), 21.5, 0.07, lane.access.bounds[1]);
      for (let x = 8.2; x < 34; x += 3.2) plane(world, 1.5, 0.08, material(0xd8d2c2), x, 0.06, lane.access.centreZ);
      for (const z of [lane.access.bounds[0] - .28, lane.access.bounds[1] + .28]) {
        box(world, 2.8, .62, .34, surfaceMaterial('gate-wall', 0x9e9588, surfaceMaps.facade), 10.6, .31, z, true, true);
        box(world, .42, 1.35, .42, material(0x404e56), 9.15, .675, z, true);
        box(world, .18, .08, .08, material(0xffd18d, { emissive: 0xe29a47, emissiveIntensity: 1.1 }), 8.92, 1.03, z);
      }
    } else {
      plane(world, 31, 6.2, asphalt, 21.5, 0.024, lane.sideStreet.centreZ);
      plane(world, 2.0, 6.2, cycleSurface, lane.cycleTrack.centreX, 0.062, lane.sideStreet.centreZ);
      for (let x = 9; x < 34; x += 6.5) addRoadMark(world, x, lane.sideStreet.centreZ, 3.0, 0.11);
    }

    const exclusion = data.kind === 'crossroad' ? 12 : data.kind === 'driveway' ? 7 : 10;
    const centreZ = data.kind === 'crossroad' ? -10 : data.kind === 'driveway' ? -7 : -15;
    let buildingIndex = 0;
    for (const z of [-43, -31, -20, -8, 5, 18, 31]) {
      if (Math.abs(z - centreZ) < exclusion) continue;
      makeBuilding(world, -1, z, buildingIndex++);
      makeBuilding(world, 1, z + 2.1, buildingIndex++, 0.3);
    }
    for (const [index, z] of [-39, -24, -2, 14, 29].entries()) {
      makeLamp(world, -5.25, z, 1, index === 1);
      makeLamp(world, 9.75, z + 6, -1, index === 3);
    }
    for (const [x, z, scale] of [[9.2, 11, .8], [9.1, -27, .86], [-6.1, 23, .92], [-6.2, -35, .8]]) makeTree(world, x, z, scale);
    for (let index = 0; index < 8; index += 1) {
      const towerX = -30 + index * 9;
      const height = 14 + (index % 3) * 5;
      box(world, 6.6, height, 6.2, material(0x223342, { roughness: 0.94 }), towerX, height / 2, -66 - (index % 2) * 6, false, true);
      for (let y = 3; y < height; y += 3.4) box(world, 4.8, 0.12, 0.06, material(0x7895a0, { emissive: 0x314f5d, emissiveIntensity: .7 }), towerX, y, -62.87 - (index % 2) * 6);
    }

    explanationGroup = new T.Group();
    pathLine(explanationGroup, paths.car, 0xffad45);
    pathLine(explanationGroup, paths.cyclist, 0x3ed8e8);
    const ring = addMesh(explanationGroup, new T.TorusGeometry(1.28, 0.10, 8, 36), basic(0xff6287, 0.9), data.conflict[0], 0.14, data.conflict[1]);
    ring.rotation.x = Math.PI / 2;
    explanationGroup.visible = explanation;
    world.add(explanationGroup);

    car = makeCar(); cyclist = makeCyclist();
    world.add(car, cyclist);
    const warmPool = new T.PointLight(0xffbf6d, 0.52, 12, 2);
    warmPool.position.set(data.conflict[0] + 1.2, 4.5, data.conflict[1] + 1.8);
    world.add(warmPool);
    applyPose();
  }

  function disposeChildren(parent) {
    const geometries = new Set(); const materials = new Set(); const textures = new Set();
    parent.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      const list = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      for (const item of list) {
        materials.add(item);
        for (const value of Object.values(item)) if (value && value.isTexture) textures.add(value);
      }
    });
    while (parent.children.length) parent.remove(parent.children[0]);
    geometries.forEach(item => item.dispose()); materials.forEach(item => item.dispose()); textures.forEach(item => item.dispose());
  }

  function currentPose() {
    const metrics = PATH_METRICS[variantName];
    return { car: samplePath(metrics.car, progress.car), cyclist: samplePath(metrics.cyclist, progress.cyclist) };
  }

  function applyPose() {
    if (!car || !cyclist) return;
    const pose = currentPose();
    car.position.set(pose.car.x, 0, pose.car.z); car.rotation.y = pose.car.heading;
    cyclist.position.set(pose.cyclist.x, 0, pose.cyclist.z); cyclist.rotation.y = pose.cyclist.heading;
  }

  function updateCamera() {
    if (!car || !cyclist) return;
    const pose = currentPose();
    const forward = new T.Vector3(-Math.sin(pose.car.heading), 0, -Math.cos(pose.car.heading));
    if (view === 'driver') {
      camera.fov = camera.aspect < 0.82 ? 57 : 50;
      camera.position.set(pose.car.x, 1.79, pose.car.z).addScaledVector(forward, 0.25);
      const look = new T.Vector3(pose.car.x, 1.22, pose.car.z).addScaledVector(forward, 22);
      camera.lookAt(look);
    } else if (view === 'shoulder') {
      camera.fov = camera.aspect < 0.82 ? 61 : 54;
      camera.position.set(pose.car.x + 0.25, 2.0, pose.car.z + 0.20);
      const cyclistTarget = new T.Vector3(pose.cyclist.x, 1.02, pose.cyclist.z);
      camera.lookAt(cyclistTarget);
    } else {
      const conflict = TURN_VARIANTS[variantName].conflict;
      // Frame the two actors as well as their conflict point.  A fixed target
      // at the junction put the initial car behind the oblique phone camera.
      const centre = [
        (Math.min(pose.car.x, pose.cyclist.x, conflict[0]) + Math.max(pose.car.x, pose.cyclist.x, conflict[0])) / 2,
        (Math.min(pose.car.z, pose.cyclist.z, conflict[1]) + Math.max(pose.car.z, pose.cyclist.z, conflict[1])) / 2
      ];
      camera.fov = camera.aspect < 0.82 ? 57 : 48;
      camera.position.set(centre[0] + (camera.aspect < 0.82 ? 4 : 5), camera.aspect < 0.82 ? 46 : 42, centre[1] + (camera.aspect < 0.82 ? 6 : 7));
      camera.lookAt(centre[0], 0, centre[1]);
    }
    camera.updateProjectionMatrix();
  }

  function render() {
    if (disposed) return;
    applyPose(); updateCamera();
    // The complete car is shown in the external overview.  From either
    // occupant view the camera sits inside that model, so hide its body rather
    // than letting an opaque roof/bonnet cover the traffic information.
    if (car) car.visible = view === 'overhead';
    cockpit.visible = view === 'driver';
    renderer.render(scene, camera);
  }

  function projectedBounds(object) {
    if (!object || disposed) return null;
    const rect = canvas.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return null;
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    const bounds = new T.Box3().setFromObject(object);
    if (bounds.isEmpty()) return null;
    const projected = [];
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const point = new T.Vector3(x, y, z).project(camera);
      projected.push({ x: rect.left + (point.x + 1) * rect.width / 2, y: rect.top + (1 - point.y) * rect.height / 2 });
    }
    const xs = projected.map(point => point.x); const ys = projected.map(point => point.y);
    const left = Math.min(...xs); const top = Math.min(...ys);
    return { left, top, right: Math.max(...xs), bottom: Math.max(...ys), width: Math.max(...xs) - left, height: Math.max(...ys) - top };
  }

  function resize() {
    if (disposed) return;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    render();
  }

  function stopAnimation() {
    if (animationId) cancelAnimationFrame(animationId);
    animationId = 0;
  }

  function animate(now) {
    if (disposed || !replayKind) return;
    const elapsed = clamp01((now - animationStart) / TURN_SCENE_DATA.durationMs);
    const result = replayProgress(replayKind, elapsed, TURN_VARIANTS[variantName]);
    progress = { car: result.car, cyclist: result.cyclist }; phase = result.phase;
    render();
    if (elapsed < 1 && motionEnabled) animationId = requestAnimationFrame(animate);
    else {
      animationId = 0;
      safeOptions.onReplayEnd();
    }
  }

  function replay(nextKind = 'wait') {
    stopAnimation();
    cyclistCleared = false;
    replayKind = nextKind === 'turn' ? 'turn' : 'wait';
    phase = 'approaching'; progress = { car: 0, cyclist: 0 };
    if (!motionEnabled) {
      const result = replayProgress(replayKind, 1, TURN_VARIANTS[variantName]);
      progress = { car: result.car, cyclist: result.cyclist }; phase = result.phase; render();
      if (!disposed) safeOptions.onReplayEnd();
      return;
    }
    animationStart = performance.now();
    render();
    animationId = requestAnimationFrame(animate);
  }

  function snapshot() {
    const pose = currentPose();
    return { renderer: 'webgl', variant: variantName, view, explanation, motion: motionEnabled, replay: replayKind, phase, cyclistCleared,
      progress: { car: round(progress.car), cyclist: round(progress.cyclist) },
      car: { x: round(pose.car.x), z: round(pose.car.z), heading: round(pose.car.heading) },
      cyclist: { x: round(pose.cyclist.x), z: round(pose.cyclist.z), heading: round(pose.cyclist.heading) }
    };
  }

  buildWorld();
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(canvas); }
  else if (typeof window !== 'undefined') window.addEventListener('resize', resize);
  resize();
  const contextLost = event => { event.preventDefault(); canvas.dataset.contextLost = 'true'; };
  canvas.addEventListener('webglcontextlost', contextLost);

  return {
    setView(next) { if (VALID_VIEWS.has(next)) view = next; render(); return view; },
    setVariant(next) { if (!VALID_VARIANTS.has(next) || next === variantName) return variantName; stopAnimation(); variantName = next; cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; buildWorld(); render(); return variantName; },
    setExplanation(value) { explanation = !!value; if (explanationGroup) explanationGroup.visible = explanation; render(); return explanation; },
    pickRisk(clientX, clientY) { return pointHitsRect(clientX, clientY, projectedBounds(cyclist)) ? 'cycle' : 'other'; },
    setCyclistCleared(value) {
      const next = !!value;
      if (next === cyclistCleared) return cyclistCleared;
      stopAnimation(); cyclistCleared = next;
      replayKind = null; phase = 'ready';
      progress = { car: 0, cyclist: cyclistCleared ? CLEARED_CYCLIST_PROGRESS : 0 };
      render(); return cyclistCleared;
    },
    replay,
    reset() { stopAnimation(); cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; render(); },
    setMotion(value) {
      const next = !!value && !(typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (next === motionEnabled) return motionEnabled;
      const endingActiveReplay = !next && !!animationId;
      motionEnabled = next;
      if (endingActiveReplay) {
        stopAnimation();
        const result = replayProgress(replayKind || 'wait', 1, TURN_VARIANTS[variantName]);
        progress = { car: result.car, cyclist: result.cyclist }; phase = result.phase; render();
        if (!disposed) safeOptions.onReplayEnd();
      }
      return motionEnabled;
    },
    snapshot,
    dispose() {
      if (disposed) return;
      disposed = true; stopAnimation(); observer?.disconnect();
      if (typeof window !== 'undefined') window.removeEventListener('resize', resize);
      canvas.removeEventListener('webglcontextlost', contextLost);
      disposeChildren(world);
      dash.geometry.dispose(); hoodEdge.geometry.dispose(); dashMaterial.dispose(); hoodEdgeMaterial.dispose();
      dusk.shadow.map?.dispose();
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') renderer.forceContextLoss();
    }
  };
}
