import { getDaylight } from './daylight-cycle.js';
import {loadApprovedCyclist} from './approved-cyclist-card.js';
import { createJunctionEnvironment, junctionCyclePose, transferCyclePose, transferCarHeight } from './turn-environment.js';
import { createDriverRightView } from './driver-right-view.js';

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
    cycleTrack: Object.freeze({ centreX: 5, direction: 'north', bounds: [4.2, 5.8] }),
    crossStreet: Object.freeze({ centreZ: -9, direction: 'east-west', bounds: [-13.1, -4.9] })
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
    car: freezePoints([[2.05, 13], [2.05, 4], [2.05, -3], [2.35, -5.4], [3.6, -7.7], [5, -9], [12, -9], [20, -9]]),
    cyclist: freezePoints([[5, 20], [5, 10], [5, 0], [5, -9], [5, -20], [5, -25]])
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
    id: 'junction', kind: 'crossroad', conflict: Object.freeze([5, -9]),
    holdCar: 0.285, passCyclist: 0.79, unsafeCar: 0.604, unsafeCyclist: 0.571,
    cameraCentre: Object.freeze([3.5, -6])
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
  if (canvas?.dataset) { canvas.dataset.environmentStatus = 'fallback'; canvas.dataset.environmentVariant = variantName; }

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
      ? `<rect x="-13" y="${lane.crossStreet.bounds[0]}" width="49" height="${lane.crossStreet.bounds[1] - lane.crossStreet.bounds[0]}" fill="#27323c"/><path d="M-13 ${lane.crossStreet.centreZ}H36" stroke="#d8d3bd" stroke-width=".12" stroke-dasharray="2.2 2.2"/>`
      : data.kind === 'driveway'
        ? '<rect x="7.1" y="-9.4" width="29" height="4.8" fill="#333b42"/><path d="M7.1 -9.4H36M7.1 -4.6H36" stroke="#b6ada0" stroke-width=".22"/>'
        : '<rect x="7.4" y="-18.1" width="29" height="6.2" fill="#27323c"/>';
    const answer = explanation ? `<g opacity=".95"><polyline points="${pointsAttr(paths.car)}" fill="none" stroke="#ffb24a" stroke-width=".42" stroke-linecap="round" stroke-linejoin="round"/><polyline points="${pointsAttr(paths.cyclist)}" fill="none" stroke="#42d9e8" stroke-width=".42" stroke-linecap="round"/><circle cx="${data.conflict[0]}" cy="${data.conflict[1]}" r="1.35" fill="none" stroke="#ff6f91" stroke-width=".35" stroke-dasharray=".7 .45"/></g>` : '';
    // SVG's positive rotation direction is the inverse of Three.js yaw in our
    // x/z ground plane (the model's nose points toward negative local z/y).
    const carAngle = -pose.car.heading * 180 / Math.PI;
    const bikeAngle = -pose.cyclist.heading * 180 / Math.PI;
    const roadSurface = variantName === 'junction'
      ? '<rect x="-4.05" y="-40" width="8.1" height="80" fill="#252e36"/><rect x="4.05" y="-40" width=".15" height="80" fill="#c4beb0"/><rect x="4.2" y="-40" width="1.6" height="80" fill="#777f7e"/><rect x="5.8" y="-40" width="2.3" height="80" fill="#77756c"/>'
      : '<rect x="-4.2" y="-40" width="8.4" height="80" fill="#252e36"/><rect x="4.2" y="-40" width="1" height="80" fill="#c4beb0"/><rect x="5.2" y="-40" width="1.9" height="80" fill="#777f7e"/><rect x="7.1" y="-40" width="2.3" height="80" fill="#77756c"/>';
    svg.innerHTML = `<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#16243a"/><stop offset="1" stop-color="#283b45"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation=".28"/></filter></defs><rect x="-20" y="-40" width="65" height="80" fill="url(#sky)"/>${roadSurface}${street}${data.kind === 'crossroad' ? `<rect x="${lane.cycleTrack.bounds[0]}" y="${lane.crossStreet.bounds[0]}" width="${lane.cycleTrack.bounds[1] - lane.cycleTrack.bounds[0]}" height="${lane.crossStreet.bounds[1] - lane.crossStreet.bounds[0]}" fill="#2876a8"/>` : data.kind === 't-junction' ? `<rect x="${lane.cycleTrack.bounds[0]}" y="${lane.sideStreet.bounds[0]}" width="2" height="6.2" fill="#2876a8"/>` : ''}${data.kind !== 'driveway' ? `<g transform="translate(${lane.cycleTrack.centreX} ${data.kind === 'crossroad' ? lane.crossStreet.centreZ : lane.sideStreet.centreZ})" fill="none" stroke="#fff" stroke-width=".10"><circle cy="-.40" r=".20"/><circle cy=".40" r=".20"/><path d="M0 -.40L-.20 .10L0 .40L.20 .05Z"/><circle cx=".27" cy="-.12" r=".08" fill="#fff"/></g>` : ''}<path d="M0 -40V40" stroke="#dad6c4" stroke-width=".12" stroke-dasharray="2.5 2.5"/>${answer}<g transform="translate(${pose.car.x} ${pose.car.z}) rotate(${carAngle})"><rect x="-1" y="-2.1" width="2" height="4.2" rx=".45" fill="#e4a34f" stroke="#f8d9aa" stroke-width=".1"/><rect x="-.74" y="-.8" width="1.48" height="1.55" rx=".25" fill="#17334b"/><circle cx="-.57" cy="-1.92" r=".12" fill="#fff4bc" filter="url(#glow)"/><circle cx=".57" cy="-1.92" r=".12" fill="#fff4bc" filter="url(#glow)"/></g><g data-turn-risk="cycle" transform="translate(${pose.cyclist.x} ${pose.cyclist.z}) rotate(${bikeAngle})"><circle cx="0" cy="-.55" r=".38" fill="none" stroke="#d8e5db" stroke-width=".08"/><circle cx="0" cy=".55" r=".38" fill="none" stroke="#d8e5db" stroke-width=".08"/><path d="M0 -.55L-.28 .15L0 .55L.2 .08Z" fill="none" stroke="#43d9e8" stroke-width=".13"/><circle cx="0" cy="-.08" r=".25" fill="#ffcc88"/><path d="M0 .05V.55" stroke="#ed6689" stroke-width=".34"/></g><g fill="#1c3240"><rect x="-12" y="-36" width="6.8" height="72"/><rect x="10" y="-36" width="8" height="72"/></g><g fill="#ffd68b" opacity=".8">${[-29,-20,-2,8,18,28].map(z => `<rect x="-6.2" y="${z}" width=".7" height="1.2"/><rect x="10.4" y="${z+3}" width=".7" height="1.2"/>`).join('')}</g>`;
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
      environment: { status: 'fallback', variant: variantName, glbSha256: null, error: 'WebGL unavailable' },
      progress: { car: round(progress.car), cyclist: round(progress.cyclist) },
      car: { x: round(pose.car.x), z: round(pose.car.z), heading: round(pose.car.heading) },
      cyclist: { x: round(pose.cyclist.x), z: round(pose.cyclist.z), heading: round(pose.cyclist.heading) }
    };
  }

  draw();
  const api = {
    setView(next) { if (VALID_VIEWS.has(next)) view = next; draw(); return view; },
    setVariant(next) { if (!VALID_VARIANTS.has(next)) return variantName; variantName = next; if (canvas?.dataset) canvas.dataset.environmentVariant = next; cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; draw(); return variantName; },
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
    dispose() { disposed = true; observer?.disconnect(); svg?.remove(); if (canvas) { canvas.style.visibility = ''; if (canvas.__turnScene === api) delete canvas.__turnScene; if (canvas.dataset) { delete canvas.dataset.environmentStatus; delete canvas.dataset.environmentVariant; } } }
  };
  if (canvas) canvas.__turnScene = api;
  return api;
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
  // The generated sky and physical surfaces remain editable and offline.
  // Its palette is refreshed from the local Copenhagen daylight cycle.
  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 512; skyCanvas.height = 256;
  const skyContext = skyCanvas.getContext('2d');
  const skyTexture = new T.CanvasTexture(skyCanvas);
  skyTexture.encoding = T.sRGBEncoding;
  scene.background = skyTexture;
  const legacyFog = new T.Fog(0x314a57, 55, 125);
  scene.fog = legacyFog;
  const studyBackground = new T.Color(0x768692);
  const camera = new T.PerspectiveCamera(49, 1, 0.08, 150);
  const world = new T.Group();
  scene.add(world, camera);

  const hemi = new T.HemisphereLight(0xc3d7e2, 0x40504a, 0.84);
  const dusk = new T.DirectionalLight(0xaac7de, 0.82);
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
  let sourceCycleCard = null;
  let sourceCycleRequested = false;
  let sourceCycleStatus = 'idle';
  let sourceCycleError = null;
  let usingSourceCycleCard = false;
  let mirrorCallsLastFrame = 0;
  let explanationGroup = null;
  let animationId = 0;
  let animationStart = 0;
  let disposed = false;
  let observer = null;
  let surfaceMaps = null;
  let daylightTimer = 0;
  let lightingState = null;
  let asphaltStudy = null;
  let pendingAsphaltImage = null;
  let brickStudy = null;
  let pendingBrickImage = null;
  let streetTreeImage = null;
  let pendingTreeImage = null;
  let skyStudy = null;
  let pendingSkyImage = null;
  let hedgeStudy = null;
  let pendingHedgeImage = null;
  const warmWindows = new Set();
  const coolWindows = new Set();
  const lampMaterials = new Set();
  const lampPools = [];
  const sceneLamps = [];
  let detailedCar = null;
  let detailedCarRequested = false;
  let detailedCyclist = null;
  let detailedCyclistRequested = false;
  let proxyPaletteMode = null;
  const proxyPaletteEntries = [];
  const materialCache = new Map();
  const buildingBoxes = [];
  const environment = createJunctionEnvironment(T, scene, { onChange(state) {
    if (canvas.dataset) {
      canvas.dataset.environmentStatus = state.status;
      canvas.dataset.environmentVariant = state.variant || '';
      canvas.dataset.environmentGlbSha256 = state.glbSha256 || '';
    }
    if (!disposed && state.peopleUpdate) { render(); return; }
    if (!disposed && (state.status === 'ready' || state.status === 'fallback')) { buildWorld(); render(); }
  } });
  const rightView = createDriverRightView({ T, scene, camera, renderer,
    getPose() { const pose=currentPose(); return { ...pose, car:{...pose.car,y:car?.position.y||0} }; },
    getCyclist: () => cyclist,
    beforeCameraRender: renderCamera => faceRiderForCamera(renderCamera),
    onChange(state) {
      if(disposed)return;
      canvas.dataset.observationMode=state.mode;
      canvas.dispatchEvent(new CustomEvent('turn-observation-change',{bubbles:true,detail:state}));
    }
  });
  const cockpit = new T.Group();
  const dashShape = new T.Shape();
  dashShape.moveTo(-0.50, -0.035); dashShape.lineTo(0.50, -0.035);
  dashShape.lineTo(0.44, 0.02); dashShape.lineTo(-0.44, 0.02); dashShape.closePath();
  const dashMaterial = new T.MeshBasicMaterial({ color: 0x05090c, toneMapped: false });
  const dash = new T.Mesh(new T.ShapeGeometry(dashShape), dashMaterial);
  dash.position.set(0, -0.27, -0.58);
  const hoodEdgeMaterial = new T.MeshBasicMaterial({ color: 0x343b3b, toneMapped: false });
  const hoodEdge = new T.Mesh(new T.BoxGeometry(0.52, 0.006, 0.014), hoodEdgeMaterial);
  hoodEdge.position.set(0, -0.235, -0.60);
  const leatherCanvas = document.createElement('canvas'); leatherCanvas.width = leatherCanvas.height = 128;
  const leather = leatherCanvas.getContext('2d'); leather.fillStyle = '#b8b9b5'; leather.fillRect(0, 0, 128, 128);
  let leatherSeed = 77421;
  for (let i = 0; i < 4500; i += 1) {
    leatherSeed = (Math.imul(leatherSeed, 1664525) + 1013904223) >>> 0; const x = leatherSeed % 128;
    leatherSeed = (Math.imul(leatherSeed, 1664525) + 1013904223) >>> 0; const y = leatherSeed % 128;
    leather.fillStyle = leatherSeed & 1 ? 'rgba(25,32,35,.09)' : 'rgba(240,237,223,.07)'; leather.fillRect(x, y, 1, 1);
  }
  const leatherMap = new T.CanvasTexture(leatherCanvas); leatherMap.wrapS = leatherMap.wrapT = T.RepeatWrapping;
  const wheelMaterial = new T.MeshStandardMaterial({ color: 0x252d32, map: leatherMap, roughness: .84 });
  const wheelX = -.18, wheelY = -.244;
  const wheelRim = new T.Mesh(new T.TorusGeometry(.056, .009, 12, 48), wheelMaterial);
  wheelRim.position.set(wheelX, wheelY, -.52); wheelRim.rotation.x = -.24;
  const wheelHub = new T.Mesh(new T.SphereGeometry(.018, 24, 12), wheelMaterial);
  wheelHub.position.set(wheelX, wheelY, -.505);
  const satin = new T.MeshBasicMaterial({ color: 0x414c50, toneMapped: false });
  const hubInset = new T.Mesh(new T.CircleGeometry(.007, 24), satin);
  hubInset.position.set(wheelX, wheelY, -.486);
  const spokes = [];
  for (const angle of [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6]) {
    const spoke = new T.Mesh(new T.BoxGeometry(.012, .052, .004), wheelMaterial);
    spoke.position.set(wheelX + Math.cos(angle) * .029, wheelY + Math.sin(angle) * .029, -.512);
    spoke.rotation.z = angle - Math.PI / 2; spokes.push(spoke);
  }
  const gaugeBlack = new T.MeshBasicMaterial({ color: 0x0b1419, toneMapped: false });
  const gauge = new T.Mesh(new T.CircleGeometry(.035, 40), gaugeBlack);
  gauge.position.set(wheelX, -.224, -.548);
  const gaugeRim = new T.Mesh(new T.TorusGeometry(.034, .0015, 6, 40), satin);
  gaugeRim.position.set(wheelX, -.224, -.546);
  const consoleTrim = new T.Mesh(new T.BoxGeometry(.25, .007, .008), satin);
  consoleTrim.position.set(.18, -.252, -.565);
  cockpit.add(dash, hoodEdge, gauge, gaugeRim, wheelRim, ...spokes, wheelHub, hubInset, consoleTrim); camera.add(cockpit);

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
      asphalt: '#a5aaab', paving: '#b3b3aa', cycle: '#a2a7a5',
      facade: '#b7aaa0', lawn: '#849083', hedge: '#697c65', paint: '#ebe9df', glass: '#aab4b4'
    };
    context.fillStyle = palette[kind] || '#777'; context.fillRect(0, 0, 256, 256);
    let seed = 431 + kind.length * 97;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    if (kind === 'asphalt') {
      // Fine aggregate and a few larger stones, inspired by the Figma
      // asphalt board.  Avoid painted road markings in the texture itself.
      for (let index = 0; index < 4500; index += 1) {
        const light = random() > .54;
        context.fillStyle = light ? 'rgba(225,230,226,.18)' : 'rgba(37,45,48,.18)';
        const size = .35 + random() * 1.1;
        context.fillRect(random() * 256, random() * 256, size, size);
      }
      for (let index = 0; index < 150; index += 1) {
        const x = random() * 256; const y = random() * 256;
        const radius = index < 15 ? .8 + random() * .6 : .3 + random() * .45;
        context.fillStyle = 'rgba(52,62,64,.12)';
        context.beginPath(); context.ellipse(x, y, radius * 1.3, radius, 0, 0, Math.PI * 2); context.fill();
        context.fillStyle = 'rgba(232,235,226,.10)';
        context.beginPath(); context.ellipse(x - .25, y - .25, radius * .7, radius * .45, 0, 0, Math.PI * 2); context.fill();
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
        context.fillStyle = random() > .5 ? 'rgba(220,225,218,.08)' : 'rgba(25,30,30,.12)';
        context.fillRect(random() * 256, random() * 256, 0.6 + random(), 0.6 + random());
      }
      context.strokeStyle = 'rgba(220,225,220,.05)'; context.lineWidth = 1;
      for (let x = 0; x < 256; x += 42) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 256); context.stroke(); }
    } else if (kind === 'glass') {
      const glassShade = context.createLinearGradient(0, 0, 256, 256);
      glassShade.addColorStop(0, '#d9ded7'); glassShade.addColorStop(.4, '#a3afaf'); glassShade.addColorStop(1, '#727e80');
      context.fillStyle = glassShade; context.fillRect(0, 0, 256, 256);
      context.fillStyle = 'rgba(30,40,43,.36)';
      context.fillRect(0, 0, 256, 9); context.fillRect(0, 247, 256, 9);
      context.fillRect(0, 0, 8, 256); context.fillRect(248, 0, 8, 256);
      context.fillRect(124, 0, 7, 256); context.fillRect(0, 132, 256, 6);
      context.fillStyle = 'rgba(255,255,245,.10)'; context.fillRect(12, 12, 12, 114);
    } else if (kind === 'paint') {
      for (let index = 0; index < 380; index += 1) {
        context.fillStyle = 'rgba(100,108,104,.12)';
        context.fillRect(random() * 256, random() * 256, .5 + random(), .7 + random() * 2);
      }
    } else if (kind === 'facade') {
      // Individual, subtly varied bricks rather than a flat repeated tint.
      for (let y = 0; y < 256; y += 16) {
        const offset = (Math.floor(y / 16) % 2) * 22;
        for (let x = -44 + offset; x < 256; x += 44) {
          context.fillStyle = random() > .48 ? 'rgba(220,190,168,.14)' : 'rgba(65,54,48,.12)';
          context.fillRect(x + 1, y + 1, 42, 14);
          context.fillStyle = 'rgba(242,219,194,.05)';
          context.fillRect(x + 2, y + 2, 40, 1);
        }
      }
      context.strokeStyle = 'rgba(49,46,42,.23)'; context.lineWidth = 1;
      for (let y = 0; y <= 256; y += 16) {
        context.beginPath(); context.moveTo(0, y); context.lineTo(256, y); context.stroke();
        const offset = (Math.floor(y / 16) % 2) * 22;
        for (let x = offset; x < 256; x += 44) { context.beginPath(); context.moveTo(x, y); context.lineTo(x, y + 16); context.stroke(); }
      }
    } else {
      for (let index = 0; index < 800; index += 1) {
        context.fillStyle = random() > .5 ? 'rgba(81,113,91,.12)' : 'rgba(10,24,21,.16)';
        context.fillRect(random() * 256, random() * 256, 1 + random() * 2, 1 + random() * 2);
      }
    }
    const texture = new T.CanvasTexture(surface);
    texture.encoding = T.sRGBEncoding;
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    const repeats = kind === 'facade' ? [4, 6] : [1, 1];
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

  function radialTexture(inner, middle) {
    const surface = document.createElement('canvas');
    surface.width = surface.height = 128;
    const context = surface.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 1, 64, 64, 64);
    gradient.addColorStop(0, inner); gradient.addColorStop(.52, middle); gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient; context.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(surface);
  }

  function applyAsphaltStudy() {
    const texture = surfaceMaps?.asphalt;
    const target = texture?.image;
    if (!asphaltStudy || !target) return;
    const context = target.getContext('2d');
    context.save(); context.globalAlpha = variantName === 'junction' ? .22 : 1;
    context.drawImage(asphaltStudy, 0, 0, target.width, target.height);
    context.restore(); texture.needsUpdate = true;
  }

  function requestAsphaltStudy() {
    const image = new Image(); pendingAsphaltImage = image;
    image.onload = () => {
      pendingAsphaltImage = null;
      if (disposed) return;
      // Keep only a small working tile after decoding the optional image.
      asphaltStudy = document.createElement('canvas');
      asphaltStudy.width = asphaltStudy.height = 256;
      asphaltStudy.getContext('2d').drawImage(image, 0, 0, 256, 256);
      applyAsphaltStudy(); render();
    };
    image.onerror = () => { pendingAsphaltImage = null; };
    image.src = new URL('./assets/figma-road/aerial.webp', import.meta.url).href;
  }

  // The photograph adds material variation, while the procedural tile retains
  // the continuous mortar grid if the optional image fails or is unavailable.
  function applyBrickStudy() {
    const texture = surfaceMaps?.facade;
    const target = texture?.image;
    if (!brickStudy || !target) return;
    const context = target.getContext('2d');
    context.save(); context.globalAlpha = .18;
    context.drawImage(brickStudy, 0, 0, target.width, target.height);
    context.restore(); texture.needsUpdate = true;
  }

  function requestBrickStudy() {
    const image = new Image(); pendingBrickImage = image;
    image.onload = () => {
      pendingBrickImage = null;
      if (disposed) return;
      brickStudy = document.createElement('canvas');
      brickStudy.width = brickStudy.height = 256;
      brickStudy.getContext('2d').drawImage(image, 0, 0, 256, 256);
      applyBrickStudy(); render();
    };
    image.onerror = () => { pendingBrickImage = null; };
    image.src = new URL('./assets/textures/brick-study-v1.webp', import.meta.url).href;
  }

  function requestStreetTree() {
    const image = new Image(); pendingTreeImage = image;
    image.onload = () => {
      pendingTreeImage = null;
      if (disposed) return;
      streetTreeImage = image;
      // Rebuild only the environment. Existing traffic models and paths are
      // retained by buildWorld, and remain the same interactive objects.
      buildWorld(); render();
    };
    image.onerror = () => { pendingTreeImage = null; };
    image.src = new URL('./assets/textures/street-tree-v1.webp', import.meta.url).href;
  }

  function requestSkyStudy() {
    const image = new Image(); pendingSkyImage = image;
    image.onload = () => {
      pendingSkyImage = null;
      if (disposed) return;
      skyStudy = image;
      applyDaylight(lightingState || getDaylight()); render();
    };
    image.onerror = () => { pendingSkyImage = null; };
    image.src = new URL('./assets/textures/danish-sky-v1.webp', import.meta.url).href;
  }

  function applyHedgeStudy() {
    const texture = surfaceMaps?.hedge;
    const target = texture?.image;
    if (!hedgeStudy || !target) return;
    const context = target.getContext('2d');
    context.save(); context.globalAlpha = .40;
    context.drawImage(hedgeStudy, 0, 0, target.width, target.height);
    context.restore(); texture.needsUpdate = true;
  }

  function requestHedgeStudy() {
    const image = new Image(); pendingHedgeImage = image;
    image.onload = () => {
      pendingHedgeImage = null;
      if (disposed) return;
      hedgeStudy = document.createElement('canvas');
      hedgeStudy.width = hedgeStudy.height = 256;
      hedgeStudy.getContext('2d').drawImage(image, 0, 0, 256, 256);
      applyHedgeStudy(); render();
    };
    image.onerror = () => { pendingHedgeImage = null; };
    image.src = new URL('./assets/textures/hedge-study-v1.webp', import.meta.url).href;
  }

  function windowMaterial(kind) {
    const key = `window:${kind}`;
    if (!materialCache.has(key)) {
      const m = new T.MeshStandardMaterial({ color: kind === 'dark' ? 0x536772 : 0xd5c3a4,
        map: surfaceMaps.glass, emissive: kind === 'warm' ? 0xffa344 : 0x85aeb7,
        emissiveMap: surfaceMaps.glass, emissiveIntensity: 0, roughness: .34, metalness: .10 });
      materialCache.set(key, m);
      if (kind === 'warm') warmWindows.add(m);
      if (kind === 'cool') coolWindows.add(m);
    }
    return materialCache.get(key);
  }

  function softShadow(parent, width, depth, opacity = .62) {
    const key = `soft-contact-shadow:${opacity}`;
    if (!materialCache.has(key)) materialCache.set(key, new T.MeshBasicMaterial({ map: surfaceMaps.shadow,
      transparent: true, depthWrite: false, toneMapped: false, opacity }));
    return plane(parent, width, depth, materialCache.get(key), 0, .081, 0);
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
    // Match texture scale in metres on both axes. Without this, a long road
    // stretches each stone into a streak and paving joints become stripes.
    const map = meshMaterial.map;
    const tile = map === surfaceMaps?.asphalt ? 5 : map === surfaceMaps?.cycle ? 4
      : map === surfaceMaps?.paving ? 2.4 : map === surfaceMaps?.lawn ? 5 : 0;
    if (tile) {
      const uv = mesh.geometry.attributes.uv;
      for (let i = 0; i < uv.count; i += 1) uv.setXY(i, uv.getX(i) * width / tile, uv.getY(i) * depth / tile);
      uv.needsUpdate = true;
    }
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
    // Bevelled editable body, within the same tested vehicle footprint.
    const profile = new T.Shape();
    profile.moveTo(-2.02, .47); profile.lineTo(-2.02, .76);
    profile.lineTo(-1.83, .93); profile.lineTo(-1.22, 1.01);
    profile.lineTo(1.37, 1.01); profile.lineTo(1.92, .92);
    profile.lineTo(2.02, .73); profile.lineTo(2.02, .47); profile.closePath();
    const bodyGeometry = new T.ExtrudeGeometry(profile, { depth: 1.78, bevelEnabled: true, bevelSize: .04, bevelThickness: .04, bevelSegments: 2 });
    bodyGeometry.translate(0, 0, -.89); bodyGeometry.rotateY(Math.PI / 2);
    addMesh(group, bodyGeometry, paint, 0, 0, 0, true, true);
    box(group, 1.84, 0.09, 3.55, darkPaint, 0, 0.99, 0.05, true);
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
      const centre = addMesh(group, new T.CylinderGeometry(.065, .065, .265, 12), material(0x344149, { metalness: .7, roughness: .35 }), x, .40, z);
      centre.rotation.z = Math.PI / 2;
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
    for (const side of [-1, 1]) {
      box(group, .025, .38, .025, darkPaint, side * .92, .78, .22);
      box(group, .035, .045, .25, chrome, side * .93, .91, .48);
      box(group, .035, .045, .25, chrome, side * .93, .91, -.62);
    }
    const shadow = softShadow(group, 3.05, 5.6);
    group.userData.groundShadow = shadow;
    return group;
  }

  function makeCyclist() {
    const group=new T.Group();
    const shadow=softShadow(group,1.05,2.4,.9);group.userData.groundShadow=shadow;
    return group;
  }

  function makeLamp(parent, x, z, face = -1, actualLight = false) {
    const pole = material(0x364653, { metalness: 0.52, roughness: 0.42 });
    box(parent, 0.13, 5.25, 0.13, pole, x, 2.63, z, true);
    addMesh(parent, new T.CylinderGeometry(.19, .28, .16, 12), pole, x, .08, z, true);
    box(parent, 1.25, 0.11, 0.12, pole, x + face * 0.57, 5.18, z, true);
    box(parent, 0.64, 0.16, 0.38, pole, x + face * 1.13, 5.12, z, true);
    const lampFace = material(0xffd897, { emissive: 0xffc061, emissiveIntensity: 2.4 });
    lampMaterials.add(lampFace);
    box(parent, 0.49, 0.05, 0.27, lampFace, x + face * 1.15, 5.025, z);
    const key = 'lamp-pool';
    if (!materialCache.has(key)) {
      const poolMaterial = new T.MeshBasicMaterial({ map: surfaceMaps.lampPool, transparent: true, depthWrite: false, toneMapped: false });
      materialCache.set(key, poolMaterial); lampPools.push(poolMaterial);
    }
    plane(parent, 9.6, 9.6, materialCache.get(key), x + face * 1.15, .075, z);
    if (actualLight) {
      const lamp = new T.PointLight(0xffc878, 1.15, 17, 2);
      lamp.position.set(x + face * 1.15, 4.9, z);
      parent.add(lamp); sceneLamps.push({ light: lamp, intensity: 1.15 });
    }
  }

  function makeTree(parent, x, z, scale = 1, foliage) {
    const bark = material(0x514b3f, { roughness: .96 });
    addMesh(parent, new T.CylinderGeometry(.11 * scale, .17 * scale, 2.1 * scale, 8), bark, x, 1.05 * scale, z, true);
    cylinderBetween(parent, [x, 1.5 * scale, z], [x - .43 * scale, 2.25 * scale, z], .065 * scale, bark);
    cylinderBetween(parent, [x, 1.6 * scale, z], [x + .38 * scale, 2.32 * scale, z - .14 * scale], .055 * scale, bark);
    // Asymmetric clusters catch light separately; instance them together below
    // so richer foliage does not cost a draw call for every cluster.
    const variation = (Math.abs(Math.round(z)) % 3 - 1) * .09;
    for (const [i, dx, dy, dz, size] of [[0,-.17,3.13,.03,.53],[1,.36,2.94,-.12,.52],
      [2,-.48,2.73,-.18,.52],[1,.57,2.63,.12,.49],[0,-.12,2.61,.43,.49],
      [2,.08,2.59,-.46,.50],[1,-.54,2.43,.26,.39],[0,.49,2.38,-.35,.40]]) {
      foliage[i].push({ x: x + (dx + variation) * scale, y: dy * scale, z: z + dz * scale,
        sx: size * scale, sy: size * scale * (1.05 + variation), sz: size * scale });
    }
  }

  function makeHedge(parent, x, z, length = 3.5) {
    // Planting stays outside the pavements and never occupies the cycle path.
    const stone = material(0x797f73, { roughness: 1 });
    const hedge = surfaceMaterial('hedge', 0xc1c9b7, surfaceMaps.hedge, { roughness: 1 });
    box(parent, .74, .18, length, stone, x, .09, z, false, true);
    const greenery = box(parent, .62, .66, length - .12, hedge, x, .48, z, true, true);
    // Preserve the leaf scale along the longer sides of each hedge.
    const uv = greenery.geometry.attributes.uv;
    for (let face = 0; face < 6; face += 1) {
      const horizontal = face < 2 ? (length - .12) / .8 : .62 / .8;
      const vertical = face === 2 || face === 3 ? (length - .12) / .8 : .66 / .8;
      for (let i = face * 4; i < face * 4 + 4; i += 1) uv.setXY(i, uv.getX(i) * horizontal, uv.getY(i) * vertical);
    }
    uv.needsUpdate = true;
    box(parent, .66, .08, length - .10, hedge, x, .83, z, true);
  }

  function buildingBox(parent, width, height, depth, meshMaterial, x, y, z, cast = false, receive = false) {
    buildingBoxes.push({ width, height, depth, material: meshMaterial, x, y, z, cast, receive });
  }

  function flushBuildingBoxes(parent) {
    const groups = new Map();
    for (const item of buildingBoxes) {
      const key = `${item.material.uuid}:${item.cast}:${item.receive}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    const cube = new T.BoxGeometry(1, 1, 1);
    const placement = new T.Object3D();
    for (const items of groups.values()) {
      const mesh = new T.InstancedMesh(cube, items[0].material, items.length);
      items.forEach((item, index) => {
        placement.position.set(item.x, item.y, item.z);
        placement.scale.set(item.width, item.height, item.depth); placement.updateMatrix();
        mesh.setMatrixAt(index, placement.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.castShadow = items[0].cast; mesh.receiveShadow = items[0].receive;
      // Instance positions span the street, so do not cull using the single
      // untransformed unit cube's bounds in the bundled Three.js release.
      mesh.frustumCulled = false; parent.add(mesh);
    }
    buildingBoxes.length = 0;
  }

  function makeBuilding(parent, side, z, index, setback = 0) {
    const widths = [7.6, 8.8, 6.9, 9.2];
    const heights = [8.5, 11.4, 7.4, 10.1, 12.3];
    const colours = [0xb68f77, 0xb3a79a, 0x8f786d, 0xb29d87, 0x9b9e91];
    const width = widths[index % widths.length];
    const height = heights[index % heights.length];
    const depth = 8.2;
    const x = side * (11.2 + width / 2 + setback);
    const shell = surfaceMaterial(`facade-${index % colours.length}`, colours[index % colours.length], surfaceMaps.facade, { roughness: 0.9 });
    buildingBox(parent, width, height, depth, shell, x, height / 2, z, true, true);
    const trim = material(0x263746, { roughness: 0.72 });
    const frame = material(0x192832, { metalness: 0.18, roughness: 0.42 });
    buildingBox(parent, width + 0.36, 0.36, depth + 0.36, trim, x, height + 0.04, z, true);
    if (index % 2 === 0) {
      const roof = new T.Shape();
      roof.moveTo(-width / 2 - .2, height + .12); roof.lineTo(0, height + 1.8);
      roof.lineTo(width / 2 + .2, height + .12); roof.closePath();
      addMesh(parent, new T.ExtrudeGeometry(roof, { depth: depth + .35, bevelEnabled: false }), material(0x43535a, { roughness: .96 }), x, 0, z - depth / 2 - .18, true, true);
    }
    buildingBox(parent, 0.22, height + 0.12, 0.22, trim, x - side * (width / 2 + 0.08), height / 2, z - depth / 2 + 0.15, true);
    buildingBox(parent, 0.22, height + 0.12, 0.22, trim, x - side * (width / 2 + 0.08), height / 2, z + depth / 2 - 0.15, true);
    buildingBox(parent, width * 0.72, 0.82, 0.24, frame, x - side * (width / 2 + 0.12), 0.61, z, true);
    buildingBox(parent, width * 0.29, 0.11, 0.12, material(0x9a8b72, { metalness: .25 }), x - side * (width / 2 + 0.26), 1.15, z, true);
    const litA = windowMaterial('warm');
    const litB = windowMaterial('cool');
    const darkWindow = windowMaterial('dark');
    const rows = Math.max(2, Math.floor((height - 1.8) / 2.05));
    const columns = Math.max(2, Math.floor((depth - 1.2) / 1.75));
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
      if (row === 0 && column === 0) continue; // Space for a street-level entrance.
      const lightChoice = (index * 7 + row * 3 + column) % 5;
      const windowMaterial = lightChoice === 0 ? darkWindow : lightChoice % 2 ? litA : litB;
      const windowZ = z - depth / 2 + 1.02 + column * 1.58;
      buildingBox(parent, 0.12, 1.24, 1.12, frame, x - side * (width / 2 + 0.04), 1.65 + row * 2.03, windowZ, true);
      buildingBox(parent, 0.08, 1.02, 0.89, windowMaterial, x - side * (width / 2 + 0.11), 1.65 + row * 2.03, windowZ);
      // Layered masonry sills and lintels make the windows read as openings
      // in a wall, not flat squares painted on a block.
      buildingBox(parent, .23, .09, 1.22, trim, x - side * (width / 2 + .14), 1.02 + row * 2.03, windowZ, true);
      buildingBox(parent, .16, .10, 1.18, trim, x - side * (width / 2 + .08), 2.31 + row * 2.03, windowZ, true);
      if (row > 0 && column % 2 === 0) buildingBox(parent, 0.65, 0.09, 1.18, material(0x303d45, { metalness: 0.3 }), x - side * (width / 2 + 0.34), 1.1 + row * 2.03, windowZ, true);
    }
    const frontColumns = Math.max(2, Math.floor(width / 1.8));
    for (let row = 0; row < rows; row += 1) for (let column = 0; column < frontColumns; column += 1) {
      const windowX = x - width / 2 + 1.05 + column * 1.65;
      buildingBox(parent, 1.18, 1.24, 0.11, frame, windowX, 1.65 + row * 2.03, z + depth / 2 + 0.035, true);
      buildingBox(parent, 0.98, 1.02, 0.07, (index + row + column) % 4 ? litA : darkWindow, windowX, 1.65 + row * 2.03, z + depth / 2 + 0.105);
      buildingBox(parent, 1.22, 0.07, 0.17, trim, windowX, 1.05 + row * 2.03, z + depth / 2 + 0.14, true);
    }
    const entranceZ = z - depth / 2 + 1.02;
    const faceX = x - side * (width / 2 + .08);
    buildingBox(parent, .15, 2.18, 1.23, frame, faceX, 1.09, entranceZ, true);
    buildingBox(parent, .08, 1.92, .96, material(0x324856, { metalness: .18, roughness: .55 }), faceX - side * .10, 1.04, entranceZ);
    buildingBox(parent, .04, .60, .72, litB, faceX - side * .15, 1.42, entranceZ);
    buildingBox(parent, .035, .08, .08, chromeForStreet(), faceX - side * .17, .94, entranceZ + .30);
    buildingBox(parent, .68, .10, 1.42, trim, faceX - side * .29, 2.30, entranceZ, true);
    buildingBox(parent, .40, .11, 1.28, curbMaterialForBuilding(), faceX - side * .24, .055, entranceZ, false, true);
    // Some entrances have a simple canopy and house number plate. Details use
    // the same instanced material groups as the building, keeping draw calls low.
    if (index % 3 === 0) {
      buildingBox(parent, 1.12, .12, 1.65, material(0x35433f, { metalness: .25 }), faceX - side * .52, 2.45, entranceZ, true);
      buildingBox(parent, .05, .23, .30, material(0xd9d1bd), faceX - side * .13, 1.76, entranceZ + .79);
      for (const dz of [-.57, .57]) buildingBox(parent, .055, .85, .055,
        material(0x48534f, { metalness: .35 }), faceX - side * .88, 2.01, entranceZ + dz, true);
    }
    const walkEnd = side < 0 ? -6.6 : 10.0;
    const walkLength = Math.abs(walkEnd - faceX);
    plane(parent, walkLength, 1.15, surfaceMaterial('entrance-paving', 0xa9aaa1, surfaceMaps.paving, { roughness: .98 }), (walkEnd + faceX) / 2, .003, entranceZ);
    buildingBox(parent, 0.10, height - .7, 0.10, material(0x52616a, { metalness: .48, roughness: .36 }), x + width * .39, (height - .7) / 2, z + depth / 2 + .12, true);
    if (index % 2 === 0) buildingBox(parent, 0.75, 1.05, 0.75, trim, x + width * .23, height + .55, z - .9, true);
    if (index % 3 === 1) {
      buildingBox(parent, width * 0.67, 0.18, 1.15, material(0x30414c, { metalness: 0.22 }), x, 3.35, z + depth / 2 + 0.48, true);
      cylinderBetween(parent, [x - width * 0.31, 3.35, z + depth / 2 + 0.85], [x - width * 0.31, 2.75, z + depth / 2 + 0.85], 0.045, material(0x718087, { metalness: 0.6 }));
      cylinderBetween(parent, [x + width * 0.31, 3.35, z + depth / 2 + 0.85], [x + width * 0.31, 2.75, z + depth / 2 + 0.85], 0.045, material(0x718087, { metalness: 0.6 }));
    }
  }

  function chromeForStreet() { return material(0xabb8b4, { metalness: .6, roughness: .35 }); }
  function curbMaterialForBuilding() { return material(0xa7a79c, { roughness: .94 }); }

  function addRoadMark(parent, x, z, width = 0.11, depth = 2.8) {
    plane(parent, width, depth, surfaceMaterial('road-paint', 0xffffff, surfaceMaps.paint, { roughness: 0.9 }), x, 0.036, z);
  }

  function groundStroke(parent, x1, z1, x2, z2, thickness, ink, y = .073) {
    const dx = x2 - x1; const dz = z2 - z1;
    const stroke = box(parent, Math.hypot(dx, dz), .009, thickness, ink, (x1 + x2) / 2, y, (z1 + z2) / 2);
    stroke.rotation.y = -Math.atan2(dz, dx);
  }

  function addCycleSymbol(parent, x, z, y = .073) {
    const ink = material(0xd8d5c7, { roughness: .98 });
    for (const offset of [-.37, .37]) {
      const wheel = addMesh(parent, new T.RingGeometry(.19, .23, 20), ink, x - .23, y, z + offset);
      wheel.rotation.x = -Math.PI / 2;
    }
    for (const [x1, z1, x2, z2] of [
      [-.37, .23, -.08, -.10], [-.08, -.10, .11, .23], [.11, .23, -.37, .23],
      [.11, .23, .37, .23], [.11, .23, .25, -.12], [.25, -.12, .37, .23],
      [-.08, -.10, -.17, -.25], [-.27, -.25, -.07, -.25], [.19, -.16, .32, -.16]
    ]) groundStroke(parent, x - z1, z + x1, x - z2, z + x2, .055, ink, y);
    const head = addMesh(parent, new T.CircleGeometry(.10, 16), ink, x + .47, y + .001, z);
    head.rotation.x = -Math.PI / 2;
    groundStroke(parent, x + .35, z, x + .12, z + .11, .09, ink, y);
  }

  function addDrain(parent, x, z) {
    const rim = material(0x535e5e, { metalness: .42, roughness: .72 });
    const slot = material(0x222b2d, { roughness: .98 });
    plane(parent, .32, .62, rim, x, .024, z);
    for (let i = -2; i <= 2; i += 1) plane(parent, .24, .034, slot, x, .027, z + i * .105);
  }

  function segmentedCurb(parent, x, gap, materialForCurb) {
    // The curb is lowered where the car crosses into the side street or
    // driveway; a continuous 15 cm wall would misrepresent the manoeuvre.
    for (const [from, to] of [[-56, gap[0]], [gap[1], 44]]) {
      const profile = new T.Shape();
      profile.moveTo(-.09, 0); profile.lineTo(.09, 0); profile.lineTo(.09, .12);
      profile.lineTo(.065, .15); profile.lineTo(-.065, .15); profile.lineTo(-.09, .12); profile.closePath();
      addMesh(parent, new T.ExtrudeGeometry(profile, {depth: to - from, bevelEnabled: false, steps: 1}), materialForCurb, x, 0, from, false, true);
    }
  }

  function segmentedSidewalk(parent, x, width, gap, paving) {
    for (const [from, to] of [[-56, gap[0]], [gap[1], 44]]) {
      plane(parent, width, to - from, paving, x, .025, (from + to) / 2);
    }
  }

  function pathLine(parent, points, color, height = .105) {
    const vectors = points.map(point => new T.Vector3(point[0], height, point[1]));
    const curve = new T.CatmullRomCurve3(vectors, false, 'catmullrom', 0.28);
    return addMesh(parent, new T.TubeGeometry(curve, 72, 0.095, 7, false), basic(color, 0.9));
  }

  function finishWorld(data, paths, studyLoaded = false) {
    explanationGroup = new T.Group();
    pathLine(explanationGroup, paths.car, 0xffad45, studyLoaded ? .35 : .105);
    pathLine(explanationGroup, paths.cyclist, 0x3ed8e8, studyLoaded ? .35 : .105);
    const ring = addMesh(explanationGroup, new T.TorusGeometry(1.28, 0.10, 8, 36), basic(0xff6287, 0.9), data.conflict[0], studyLoaded ? .25 : .14, data.conflict[1]);
    ring.rotation.x = Math.PI / 2; explanationGroup.visible = explanation; world.add(explanationGroup);
    car = makeCar(); cyclist = makeCyclist(); world.add(car, cyclist); attachDetailedCar(); attachDetailedCyclist();
    if (!studyLoaded) {
      const warmPool = new T.PointLight(0xffbf6d, 0.52, 12, 2);
      warmPool.position.set(data.conflict[0] + 1.2, 4.5, data.conflict[1] + 1.8);
      world.add(warmPool); sceneLamps.push({ light: warmPool, intensity: .52 });
    }
    applyPose(); if (lightingState) applyDaylight(lightingState);
  }

  function buildWorld() {
    // The optional models belong to the scene, not a particular road variant.
    // Keep them out of the old world's disposal traversal while rebuilding.
    if (detailedCar?.parent) detailedCar.parent.remove(detailedCar);
    if (detailedCyclist?.parent) detailedCyclist.parent.remove(detailedCyclist);
    if(sourceCycleCard?.object.parent)sourceCycleCard.object.parent.remove(sourceCycleCard.object);
    disposeChildren(world);
    materialCache.clear();
    warmWindows.clear(); coolWindows.clear(); lampMaterials.clear(); lampPools.length = 0; sceneLamps.length = 0;
    surfaceMaps = {
      asphalt: surfaceTexture('asphalt'), paving: surfaceTexture('paving'),
      cycle: surfaceTexture('cycle'), facade: surfaceTexture('facade'), lawn: surfaceTexture('lawn'), hedge: surfaceTexture('hedge'),
      paint: surfaceTexture('paint'), glass: surfaceTexture('glass'),
      shadow: radialTexture('rgba(9,16,17,.82)', 'rgba(9,16,17,.28)'),
      lampPool: radialTexture('rgba(255,190,98,.26)', 'rgba(255,190,98,.08)')
    };
    applyAsphaltStudy();
    applyBrickStudy();
    applyHedgeStudy();
    const data = TURN_VARIANTS[variantName];
    const lane = TURN_LANES[variantName];
    const paths = TURN_PATHS[variantName];
    const environmentStatus = environment.snapshot().status;
    if (variantName === 'junction' && environmentStatus === 'ready') { finishWorld(data, paths, true); return; }
    const asphalt = surfaceMaterial('asphalt', 0x646f72, surfaceMaps.asphalt, { roughness: .96 });
    const paving = surfaceMaterial('paving', 0xb6b8ac, surfaceMaps.paving, { roughness: .98 });
    // Danish raised cycle track: grey asphalt behind a kerb, not a continuous red lane.
    const cycleSurface = surfaceMaterial('cycle', 0x9ca4a2, surfaceMaps.cycle, { roughness: .96 });
    const cycleCrossing = material(0x2876a8, { roughness: .94 });
    const roadEdge = variantName === 'junction' ? 4.05 : Math.max(4.2, lane.northbound.bounds[1]);
    const cycleWest = lane.cycleTrack.bounds[0]; const cycleEast = lane.cycleTrack.bounds[1];
    const curbGap = data.kind === 'crossroad' ? lane.crossStreet.bounds : data.kind === 'driveway' ? lane.access.bounds : lane.sideStreet.bounds;
    // Carry the ground beneath the quiet background silhouettes in either
    // direction; the traffic surfaces and paths remain where they were.
    plane(world, 120, 164, surfaceMaterial('lawn', 0x6c8072, surfaceMaps.lawn, { roughness: 1 }), 5, -0.04, -6);
    plane(world, roadEdge * 2, 100, asphalt, 0, 0, -6);
    segmentedSidewalk(world, -roadEdge - 1.2, 2.4, curbGap, paving);
    segmentedSidewalk(world, (cycleWest + roadEdge) / 2, cycleWest - roadEdge, curbGap, paving);
    const trackWidth=cycleEast-cycleWest;
    if(variantName==='junction')plane(world,trackWidth,100,cycleSurface,lane.cycleTrack.centreX,.045,-6);
    else if(variantName==='driveway')plane(world,trackWidth,100,cycleSurface,lane.cycleTrack.centreX,.18,-6);
    else {
      plane(world,trackWidth,36.9,cycleSurface,lane.cycleTrack.centreX,.18,-37.55);
      plane(world,trackWidth,54.9,cycleSurface,lane.cycleTrack.centreX,.18,16.55);
      const ramp=(z0,y0,z1,y1)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([cycleWest,y0,z0,cycleWest,y1,z1,cycleEast,y1,z1,cycleEast,y0,z0],3));g.setAttribute('uv',new T.Float32BufferAttribute([0,0,0,1,1,1,1,0],2));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();addMesh(world,g,cycleSurface);};
      ramp(-19.1,.18,-18.1,.062);ramp(-11.9,.062,-10.9,.18);
    }
    segmentedSidewalk(world, cycleEast + 1.225, 2.45, curbGap, paving);
    const curbMaterial = material(0xb2aa9b, { roughness: .9 });
    segmentedCurb(world, -roadEdge, curbGap, curbMaterial);
    segmentedCurb(world, roadEdge, curbGap, curbMaterial);
    segmentedCurb(world, cycleEast, curbGap, curbMaterial);
    // Restrained cool road sheen adds depth without implying wet or slippery conditions.
    for (const [x, z, width, depth] of [[-1.15, 19, .46, 12], [1.35, -28, .33, 10], [-2.7, -2, .25, 7]]) {
      plane(world, width, depth, basic(0x87a9b4, .055), x, .018, z);
    }
    for (let z = -48; z < 45; z += 7) {
      if (data.kind !== 'crossroad' || z < curbGap[0] - 2 || z > curbGap[1] + 2) addRoadMark(world, 0, z);
    }
    for (const z of [-34, 7, 32]) addCycleSymbol(world, lane.cycleTrack.centreX, z, variantName==='junction'?.073:.188);
    for (const z of [-39, -25, 8, 29]) addDrain(world, roadEdge - .22, z);

    if (data.kind === 'crossroad') {
      const crossWidth = lane.crossStreet.bounds[1] - lane.crossStreet.bounds[0];
      plane(world, 70, crossWidth, asphalt, 5, 0.018, lane.crossStreet.centreZ);
      // S 21: blue only through the junction, with the required cycle symbol.
      plane(world, cycleEast - cycleWest, crossWidth, cycleCrossing, lane.cycleTrack.centreX, 0.058, lane.crossStreet.centreZ);
      addCycleSymbol(world, lane.cycleTrack.centreX, lane.crossStreet.centreZ);
      for (let x = -27; x < 34; x += 7) if (x < -roadEdge - 2 || x > cycleEast + 4) addRoadMark(world, x, lane.crossStreet.centreZ, 2.9, 0.11);
      for (const z of [lane.crossStreet.bounds[0], lane.crossStreet.bounds[1]]) {
        box(world, 25.8, .15, .18, curbMaterial, -17.1, .075, z);
        box(world, 30.4, .15, .18, curbMaterial, 24.8, .075, z);
      }
    } else if (data.kind === 'driveway') {
      plane(world, 31, 4.8, surfaceMaterial('access-paving', 0x858684, surfaceMaps.paving, { roughness: .95 }), 21.5, 0.027, lane.access.centreZ);
      // Raised grey track continues across the driveway.
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
      plane(world, 2.0, 6.2, cycleCrossing, lane.cycleTrack.centreX, 0.062, lane.sideStreet.centreZ);
      addCycleSymbol(world, lane.cycleTrack.centreX, lane.sideStreet.centreZ);
      for (let x = 9; x < 34; x += 6.5) addRoadMark(world, x, lane.sideStreet.centreZ, 3.0, 0.11);
    }

    // Loading shows only the functional road and actors, avoiding a flash of
    // the old decorative world before the approved study replaces it.
    if (environmentStatus === 'loading' || (variantName !== 'junction' && environmentStatus === 'ready')) { finishWorld(data, paths); return; }

    const exclusion = data.kind === 'crossroad' ? 12 : data.kind === 'driveway' ? 7 : 10;
    const centreZ = data.kind === 'crossroad' ? -10 : data.kind === 'driveway' ? -7 : -15;
    let buildingIndex = 0;
    for (const z of [-43, -31, -20, -8, 5, 18, 31]) {
      if (Math.abs(z - centreZ) < exclusion) continue;
      makeBuilding(world, -1, z, buildingIndex++);
      makeBuilding(world, 1, z + 2.1, buildingIndex++, 0.3);
    }
    flushBuildingBoxes(world);
    for (const [index, z] of [-39, -24, -2, 14, 29].entries()) {
      makeLamp(world, -5.25, z, 1, index === 1);
      makeLamp(world, 9.75, z + 6, -1, index === 3);
    }
    const foliage = [[], [], []];
    const trees = [[10.6, 11, .8], [10.7, -27, .86], [-7.45, 23, .92], [-7.5, -35, .8],
      [10.6, 24, .92], [10.65, 36, .78], [-7.45, 36, .84], [10.7, -39, .8], [-7.5, 11, .78]];
    if (!streetTreeImage) for (const [x, z, scale] of trees) makeTree(world, x, z, scale, foliage);
    if (streetTreeImage) {
      // Two crossed, alpha-cut planes give the street trees volume from both
      // views. A single instanced mesh keeps this decorative layer inexpensive.
      const treeTexture = new T.Texture(streetTreeImage);
      treeTexture.encoding = T.sRGBEncoding; treeTexture.needsUpdate = true;
      treeTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy?.() || 1);
      const treeMaterial = new T.MeshStandardMaterial({ map: treeTexture, color: 0xa5b6a6, side: T.DoubleSide,
        alphaTest: .48, roughness: .95, metalness: 0 });
      const cards = new T.InstancedMesh(new T.PlaneGeometry(1, 1), treeMaterial, trees.length * 2);
      const placement = new T.Object3D();
      trees.forEach(([x, z, scale], index) => {
        for (let side = 0; side < 2; side += 1) {
          placement.position.set(x, 3.15 * scale, z);
          placement.scale.set(4.25 * scale, 6.3 * scale, 1);
          placement.rotation.set(0, side * Math.PI / 2 + (index % 3 - 1) * .16, 0);
          placement.updateMatrix(); cards.setMatrixAt(index * 2 + side, placement.matrix);
        }
      });
      cards.instanceMatrix.needsUpdate = true; cards.frustumCulled = false;
      world.add(cards);
    }
    if (!streetTreeImage) for (const [colourIndex, colour] of [0x355645, 0x4c7057, 0x2d4b3c].entries()) {
      const clusters = foliage[colourIndex];
      const crown = new T.InstancedMesh(new T.IcosahedronGeometry(1, 1),
        new T.MeshStandardMaterial({ color: colour, roughness: .98, flatShading: true }), clusters.length);
      const placement = new T.Object3D();
      clusters.forEach((item, index) => {
        placement.position.set(item.x, item.y, item.z); placement.scale.set(item.sx, item.sy, item.sz);
        placement.rotation.y = index * .71; placement.updateMatrix(); crown.setMatrixAt(index, placement.matrix);
      });
      crown.instanceMatrix.needsUpdate = true; crown.castShadow = true; world.add(crown);
    }
    const treeWells = new T.InstancedMesh(new T.CylinderGeometry(.41, .41, .035, 8), material(0x555c51, { roughness: 1 }), trees.length);
    const wellPlacement = new T.Object3D();
    trees.forEach(([x, z], index) => { wellPlacement.position.set(x, .015, z); wellPlacement.updateMatrix(); treeWells.setMatrixAt(index, wellPlacement.matrix); });
    treeWells.instanceMatrix.needsUpdate = true;
    if (!streetTreeImage) world.add(treeWells);
    else { treeWells.geometry.dispose(); }
    for (const z of [-40, -28, -16, 5, 19, 32, 40]) {
      if (Math.abs(z - centreZ) < exclusion + 2) continue;
      makeHedge(world, -7.15, z, 3.5);
      makeHedge(world, 10.45, z + 1.5, 3.1);
    }
    const distantWindows = { warm: [], dark: [] }; const distantBuildings = [];
    for (const direction of [-1, 1]) for (let index = 0; index < 8; index += 1) {
      const towerX = -30 + index * 9;
      // Leave the road's vanishing point open instead of placing a wall of
      // background blocks across the driving direction.
      if (Math.abs(towerX) < 13) continue;
      const height = (direction < 0 ? 8 : 6) + (index % 4) * 1.35;
      const towerZ = direction * (61 + (index % 2) * 5);
      distantBuildings.push({ x: towerX, y: height / 2, z: towerZ, height });
      for (let y = 2.5; y < height - .5; y += 2.5) for (const dx of [-1.5, 0, 1.5]) {
        const kind = (index + Math.round(y) + dx) % 3 ? 'warm' : 'dark';
        distantWindows[kind].push([towerX + dx, y, towerZ - direction * 3.12]);
      }
    }
    const distantWalls = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1),
      surfaceMaterial('distant-facade', 0x748984, surfaceMaps.facade, { roughness: .96 }), distantBuildings.length);
    const distantRooflines = new T.InstancedMesh(new T.BoxGeometry(1, 1, 1), material(0x52686b, { roughness: .96 }), distantBuildings.length);
    const buildingPlacement = new T.Object3D();
    distantBuildings.forEach((building, index) => {
      buildingPlacement.position.set(building.x, building.y, building.z); buildingPlacement.scale.set(6.6, building.height, 6.2);
      buildingPlacement.updateMatrix(); distantWalls.setMatrixAt(index, buildingPlacement.matrix);
      buildingPlacement.position.y = building.height; buildingPlacement.scale.set(6.85, .18, 6.45);
      buildingPlacement.updateMatrix(); distantRooflines.setMatrixAt(index, buildingPlacement.matrix);
    });
    distantWalls.instanceMatrix.needsUpdate = true; distantRooflines.instanceMatrix.needsUpdate = true;
    distantWalls.receiveShadow = true; world.add(distantWalls, distantRooflines);
    // Low, soft-coloured tree crowns fill the distant horizon without adding
    // traffic or putting foliage on the road and cycle track.
    const treePositions = [-35, -28, -21, -14, 14, 21, 28, 35];
    const farCrowns = new T.InstancedMesh(new T.IcosahedronGeometry(1, 1), material(0x546e61, { roughness: 1 }), treePositions.length * 2);
    const crownPlacement = new T.Object3D();
    for (const [sideIndex, direction] of [-1, 1].entries()) treePositions.forEach((x, index) => {
      const scale = 1.4 + (index % 3) * .24;
      crownPlacement.position.set(x, 2.1 + scale, direction * (51 + (index % 2) * 2));
      crownPlacement.scale.set(scale, scale * 1.15, scale); crownPlacement.updateMatrix();
      farCrowns.setMatrixAt(sideIndex * treePositions.length + index, crownPlacement.matrix);
    });
    farCrowns.instanceMatrix.needsUpdate = true;
    if (!streetTreeImage) world.add(farCrowns);
    else { farCrowns.geometry.dispose(); }
    // The distant windows share two draw calls instead of creating a separate
    // mesh for every pane. Their materials still follow the same day cycle.
    for (const [kind, positions] of Object.entries(distantWindows)) {
      const instances = new T.InstancedMesh(new T.BoxGeometry(.65, .85, .06), windowMaterial(kind), positions.length);
      const placement = new T.Object3D();
      positions.forEach(([x, y, z], index) => {
        placement.position.set(x, y, z); placement.updateMatrix();
        instances.setMatrixAt(index, placement.matrix);
      });
      instances.instanceMatrix.needsUpdate = true;
      world.add(instances);
    }

    finishWorld(data, paths);
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

  function attachDetailedCar() {
    if (!car || !detailedCar) return;
    for (const child of car.children) if (child !== car.userData.groundShadow && child !== detailedCar) child.visible = false;
    car.add(detailedCar);
  }

  async function requestDetailedCar() {
    if (disposed || detailedCarRequested) return;
    detailedCarRequested = true;
    let pendingModel = null;
    try {
      if (!T.GLTFLoader) await import('./assets/GLTFLoader-r128.js');
      const result = await new T.GLTFLoader().loadAsync(new URL('./assets/environments/trafiklab-placeholder-car-batched.glb', import.meta.url).href);
      const model = result.scene; pendingModel = model;
      if (disposed) { disposeChildren(model); pendingModel = null; return; }
      const bounds = new T.Box3().setFromObject(model);
      const size = bounds.getSize(new T.Vector3());
      const centre = bounds.getCenter(new T.Vector3());
      if (![size.x, size.y, size.z, centre.x, centre.z, bounds.min.y].every(Number.isFinite) || Math.min(size.x, size.y, size.z) <= .01) {
        disposeChildren(model); pendingModel = null; return;
      }
      // The source car points along +x. Align its centre and nose with the
      // existing car, and retain the conservative, tested 2.31 x 4.24 m body.
      model.position.sub(new T.Vector3(centre.x, bounds.min.y, centre.z));
      const pivot = new T.Group();
      pivot.rotation.y = Math.PI / 2;
      pivot.scale.set(4.24 / size.x, 1.7 / size.y, 2.31 / size.z);
      pivot.add(model);
      detailedCar = pivot;
      pendingModel = null;
      attachDetailedCar();
      render();
    } catch {
      if (pendingModel) disposeChildren(pendingModel);
      // WebGL and the locally generated procedural car remain fully usable
      // if the optional loader or model is unavailable, including offline.
    }
  }

  function exactModelBounds(model) {
    // Rotated parts have broad axis-aligned boxes; use the actual static
    // vertices to retain the traffic geometry's tested envelope.
    model.updateMatrixWorld(true);
    const bounds = new T.Box3().makeEmpty();
    const point = new T.Vector3();
    model.traverse(object => {
      const positions = object.isMesh && object.geometry?.attributes?.position;
      if (!positions) return;
      for (let i = 0; i < positions.count; i += 1) {
        point.fromBufferAttribute(positions, i).applyMatrix4(object.matrixWorld);
        bounds.expandByPoint(point);
      }
    });
    return bounds;
  }

  function attachDetailedCyclist() {
    if (!cyclist || !detailedCyclist) return;
    for (const child of cyclist.children) if (child !== cyclist.userData.groundShadow && child !== detailedCyclist) child.visible = false;
    cyclist.add(detailedCyclist);
  }

  async function requestSourceCyclist(){
    if(disposed||sourceCycleRequested||sourceCycleCard)return;
    sourceCycleRequested=true;sourceCycleStatus='loading';sourceCycleError=null;
    let candidate=null;
    try{
      const {create}=await import('./cse-cyclist-a.js');
      candidate=await create({THREE:T,height:1.96});
      if(disposed){candidate.dispose();return;}
      sourceCycleCard=candidate;candidate=null;sourceCycleStatus='ready';
      if(cyclist)cyclist.add(sourceCycleCard.object);
      render();
    }catch(error){candidate?.dispose();if(disposed)return;sourceCycleStatus='fallback';sourceCycleError=String(error?.message||error);sourceCycleRequested=false;render();}
  }

  function faceRiderForCamera(renderCamera){
    if(!cyclist)return;
    const paletteMode=true;
    if(proxyPaletteMode!==paletteMode){for(const entry of proxyPaletteEntries)entry.material.color.copy(paletteMode?entry.illustrated:entry.original);proxyPaletteMode=paletteMode;}
    if(sourceCycleCard&&sourceCycleCard.object.parent!==cyclist)cyclist.add(sourceCycleCard.object);
    const position=cyclist.getWorldPosition(new T.Vector3()),observer=renderCamera.getWorldPosition(new T.Vector3());
    const heading=new T.Vector3(0,0,-1).applyQuaternion(cyclist.getWorldQuaternion(new T.Quaternion()));
    // The registered art is a front-quarter view. Use it only for the driver
    // observing a rider behind the car, never as a face on the back of a head.
    usingSourceCycleCard=!!sourceCycleCard&&variantName==='junction'&&view==='shoulder'&&observer.sub(position).dot(heading)>0;
    for(const child of cyclist.children){
      if(child===cyclist.userData.groundShadow)continue;
      if(child===sourceCycleCard?.object)child.visible=usingSourceCycleCard;
      else if(child===detailedCyclist)child.visible=!usingSourceCycleCard;
      else child.visible=!usingSourceCycleCard&&!detailedCyclist;
    }
    if(usingSourceCycleCard){
      // A cached mirror needs new puppet pixels only when its own camera is
      // rendered. Do not repaint hidden limbs during the main windscreen pass.
      if(observer.dot(renderCamera.getWorldDirection(new T.Vector3()))<0)
        sourceCycleCard.updateByDistance(PATH_METRICS.junction.cyclist.total*progress.cyclist,motionEnabled&&!!animationId);
      sourceCycleCard.faceCamera(renderCamera);
    }
  }

  async function requestDetailedCyclist() {
    if(disposed||detailedCyclistRequested)return;
    detailedCyclistRequested=true;canvas.dataset.cyclistModel='loading';
    let notice=canvas.parentElement?.querySelector('[data-cyclist-notice]');
    if(!notice&&canvas.parentElement){notice=document.createElement('p');notice.dataset.cyclistNotice='';notice.setAttribute('role','status');canvas.parentElement.append(notice);}
    if(notice){notice.hidden=false;notice.textContent='Henter cyklisten …';}
    try{
      const card=await loadApprovedCyclist(T,{height:1.96});
      if(disposed){card.userData.disposeApprovedCyclist();return;}
      detailedCyclist=card;canvas.dataset.cyclistModel='approved-static';if(notice)notice.hidden=true;attachDetailedCyclist();render();
    }catch{
      if(disposed)return;canvas.dataset.cyclistModel='unavailable';if(notice){notice.hidden=false;notice.textContent='Vi kunne ikke hente cyklisten lige nu. Situationen står stadig i teksten.';}
    }
  }

  function applyDaylight(state) {
    if (variantName === 'junction' && environment.snapshot().status === 'ready') {
      // The approved environment is a fixed dusk bake, not a live day cycle.
      renderer.shadowMap.enabled=false;
      scene.background = environment.skyTexture() || studyBackground; scene.fog = null;
      renderer.toneMapping = T.NoToneMapping; renderer.toneMappingExposure = 1;
      hemi.color.setHex(0xc3d1d4); hemi.groundColor.setHex(0x586862); hemi.intensity = .75;
      dusk.color.setHex(0xaac4d1); dusk.intensity = .7; dusk.position.set(-18, 30, 22);
      return;
    }
    renderer.shadowMap.enabled=true;
    scene.background = skyTexture; scene.fog = legacyFog; renderer.toneMapping = T.ACESFilmicToneMapping;
    const day = clamp01(state.day); const twilight = clamp01(state.twilight);
    const night = 1 - day;
    const mixRgb = (a, b, t) => a.map((value, index) => Math.round(value + (b[index] - value) * t));
    const css = rgb => `rgb(${rgb.join(',')})`;
    const top = mixRgb([42, 61, 90], [132, 174, 202], day);
    const mid = mixRgb([58, 76, 99], [176, 199, 211], day);
    const horizon = mixRgb(mixRgb([77, 91, 103], [212, 221, 216], day), [174, 133, 116], twilight * .33);
    const gradient = skyContext.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, css(top)); gradient.addColorStop(.55, css(mid)); gradient.addColorStop(1, css(horizon));
    skyContext.fillStyle = gradient; skyContext.fillRect(0, 0, 512, 256);
    if (skyStudy) {
      skyContext.save(); skyContext.globalAlpha = .08 + day * .42;
      // The scene background fills the viewport. Crop to that viewport's
      // aspect before drawing, otherwise clouds stretch on portrait phones.
      const sourceWidth = skyStudy.naturalWidth, sourceHeight = skyStudy.naturalHeight;
      const targetAspect = Math.max(.2, camera.aspect || 1);
      let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
      if (sourceWidth / sourceHeight > targetAspect) {
        sw = sourceHeight * targetAspect; sx = (sourceWidth - sw) / 2;
      } else {
        sh = sourceWidth / targetAspect; sy = (sourceHeight - sh) / 2;
      }
      skyContext.drawImage(skyStudy, sx, sy, sw, sh, 0, 0, 512, 256); skyContext.restore();
    }
    // Layered translucent cloud banks, kept deliberately quiet behind the
    // road. The fixed seed avoids a visible jump when daylight refreshes.
    let cloudSeed = 24719;
    const cloudRandom = () => { cloudSeed = (Math.imul(cloudSeed, 1664525) + 1013904223) >>> 0; return cloudSeed / 4294967296; };
    for (let i = 0; i < 65; i += 1) {
      const x = cloudRandom() * 580 - 34, y = 54 + cloudRandom() * 107;
      const radius = 15 + cloudRandom() * 45;
      const cloud = skyContext.createRadialGradient(x, y, 0, x, y, radius);
      cloud.addColorStop(0, `rgba(239,235,224,${(.014 + .035 * day).toFixed(3)})`);
      cloud.addColorStop(1, 'rgba(239,235,224,0)');
      skyContext.fillStyle = cloud; skyContext.save(); skyContext.translate(x, y);
      skyContext.scale(1, .22); skyContext.translate(-x, -y);
      skyContext.fillRect(x - radius, y - radius, radius * 2, radius * 2); skyContext.restore();
    }
    skyTexture.needsUpdate = true;
    hemi.color.setHex(0x91a7bf).lerp(new T.Color(0xd3e5e8), day);
    hemi.groundColor.setHex(0x293a35).lerp(new T.Color(0x78877a), day);
    hemi.intensity = .56 + .48 * day;
    dusk.color.setHex(0x7692b4).lerp(new T.Color(0xffe6c7), day).lerp(new T.Color(0xffbc8a), twilight * .28);
    dusk.intensity = .36 + .57 * day + .10 * twilight;
    const angle = Number.isFinite(state.azimuth) ? state.azimuth : 0;
    const altitude = Math.max(.16, Math.sin((Number(state.altitude) || 0) * Math.PI / 180));
    if (day > .02) {
      const horizontal = Math.sqrt(Math.max(0, 1 - altitude * altitude));
      dusk.position.set(Math.sin(angle) * horizontal * 40, altitude * 40, -Math.cos(angle) * horizontal * 40);
    } else dusk.position.set(-18, 30, 22);
    scene.fog.color.setHex(0x344957).lerp(new T.Color(0xa6b8be), day);
    renderer.toneMappingExposure = .96 + .10 * day;
    for (const m of warmWindows) {
      m.color.setHex(0xffc17a).lerp(new T.Color(0xb8c8cb), day);
      m.emissiveIntensity = .75 * night;
    }
    for (const m of coolWindows) {
      m.color.setHex(0x9cb8b9).lerp(new T.Color(0xb5c6ca), day);
      m.emissiveIntensity = .18 * night;
    }
    for (const m of lampMaterials) {
      m.color.setHex(0xffd897).lerp(new T.Color(0xd0d6d4), day);
      m.emissiveIntensity = 2.2 * night;
    }
    for (const m of lampPools) m.opacity = night;
    for (const entry of sceneLamps) entry.light.intensity = entry.intensity * night;
  }

  function refreshDaylight() {
    if (disposed) return;
    lightingState = getDaylight();
    applyDaylight(lightingState);
    render();
  }

  function currentPose() {
    const metrics = PATH_METRICS[variantName];
    return { car: samplePath(metrics.car, progress.car), cyclist: samplePath(metrics.cyclist, progress.cyclist) };
  }

  function applyPose() {
    if (!car || !cyclist) return;
    const pose = currentPose();
    const study = variantName === 'junction' && environment.snapshot().status === 'ready';
    const lane=TURN_LANES[variantName];
    const carY = study ? .04 + .0525 * clamp01((-4.6 - pose.car.z) / .6) : variantName==='junction'?0:transferCarHeight(variantName,pose.car.x,...lane.cycleTrack.bounds);
    const cycleGround = study ? junctionCyclePose(pose.cyclist.z) : variantName==='junction'?{height:0,pitch:0}:transferCyclePose(variantName,pose.cyclist.z);
    car.position.set(pose.car.x, carY, pose.car.z); car.rotation.y = pose.car.heading;
    cyclist.position.set(pose.cyclist.x, cycleGround.height, pose.cyclist.z);
    cyclist.rotation.y = pose.cyclist.heading; cyclist.rotation.x = cycleGround.pitch;
  }

  function updateCamera() {
    if (!car || !cyclist) return;
    camera.far = variantName === 'junction' ? 400 : 150;
    const pose = currentPose();
    const forward = new T.Vector3(-Math.sin(pose.car.heading), 0, -Math.cos(pose.car.heading));
    if (view === 'driver') {
      camera.fov = camera.aspect < 0.82 ? 57 : 50;
      camera.position.set(pose.car.x, 1.79 + car.position.y, pose.car.z).addScaledVector(forward, 0.25);
      const look = new T.Vector3(pose.car.x, 1.22 + car.position.y, pose.car.z).addScaledVector(forward, 22);
      if(variantName!=='junction')look.x+=Math.max(-2,Math.min(2,(TURN_VARIANTS[variantName].conflict[0]-pose.car.x)*.32));
      camera.lookAt(look);
    } else if (view === 'shoulder') {
      camera.fov = camera.aspect < 0.82 ? 61 : 54;
      if (variantName === 'junction') {
        rightView.updateCamera();
      } else {
        camera.position.set(pose.car.x + 0.25, 2.0 + car.position.y, pose.car.z + 0.20);
        const cyclistTarget = new T.Vector3(pose.cyclist.x, 1.02 + cyclist.position.y, pose.cyclist.z);
        camera.lookAt(cyclistTarget);
      }
    } else {
      const conflict = TURN_VARIANTS[variantName].conflict;
      // Frame the two actors as well as their conflict point.  A fixed target
      // at the junction put the initial car behind the oblique phone camera.
      const minX = Math.min(pose.car.x, pose.cyclist.x, conflict[0]);
      const maxX = Math.max(pose.car.x, pose.cyclist.x, conflict[0]);
      const minZ = Math.min(pose.car.z, pose.cyclist.z, conflict[1]);
      const maxZ = Math.max(pose.car.z, pose.cyclist.z, conflict[1]);
      const centre = [(minX + maxX) / 2, (minZ + maxZ) / 2];
      camera.fov = camera.aspect < 0.82 ? 57 : 48;
      // As the two vehicles converge, bring the camera closer while keeping a
      // conservative margin around their full footprints and the crossing.
      const radius = Math.hypot((maxX - minX) / 2 + 3, (maxZ - minZ) / 2 + 3);
      const height = Math.max(24, radius / (Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect)) + 5);
      camera.position.set(centre[0] + (camera.aspect < 0.82 ? 4 : 5), height, centre[1] + (camera.aspect < 0.82 ? 6 : 7));
      camera.lookAt(centre[0], 0, centre[1]);
    }
    camera.updateProjectionMatrix();
  }

  function render() {
    if (disposed) return;
    environment.setView?.(view);
    applyPose();rightView.setActive(view==='shoulder'&&variantName==='junction');updateCamera();
    // Occupant cameras stay inside the car; its complete body is reserved for
    // the external overview so the roof cannot obscure an observation.
    if (car) car.visible = view === 'overhead';
    cockpit.visible = view === 'driver';
    const mirrorRendered=rightView.renderMirror();
    mirrorCallsLastFrame=mirrorRendered?renderer.info.render.calls:0;
    faceRiderForCamera(camera);
    renderer.render(scene, camera);
  }

  function projectedBounds(object) {
    if (!object || disposed) return null;
    const rect = canvas.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return null;
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true);
    const centre=object.getWorldPosition(new T.Vector3());centre.y+=1;
    if(centre.sub(camera.position).dot(camera.getWorldDirection(new T.Vector3()))<=0)return null;
    // Keep the clickable area tied to the teaching footprint. Broad boxes of
    // the imported model's rotated parts would inflate the risk target.
    const bounds = new T.Box3(new T.Vector3(-.305, 0, -.995), new T.Vector3(.305, 1.96, .995));
    const projected = [];
    for (const x of [bounds.min.x, bounds.max.x]) for (const y of [bounds.min.y, bounds.max.y]) for (const z of [bounds.min.z, bounds.max.z]) {
      const point = new T.Vector3(x, y, z).applyMatrix4(object.matrixWorld).project(camera);
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
    if (lightingState) applyDaylight(lightingState);
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
      environment: environment.snapshot(), rightObservation:rightView.snapshot(), camera: { position: camera.position.toArray(), fov: camera.fov, far: camera.far }, graphics: { calls: renderer.info.render.calls, mirrorCallsLastFrame, shadows:renderer.shadowMap.enabled, triangles: renderer.info.render.triangles,
        geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures },
      models: { cyclist: usingSourceCycleCard?'cse-front-cutout-2d':detailedCyclist ? 'approved-cse-static' : 'unavailable', car: detailedCar ? '3d-gltf' : 'procedural-3d', sourceCyclist:{status:sourceCycleStatus,error:sourceCycleError,scope:'Generated-parts front-quarter 2.5D candidate; original upper body, new bicycle and limbs. Other angles use the approved static cyclist cut-out.'} },
      progress: { car: round(progress.car), cyclist: round(progress.cyclist) },
      car: { x: round(pose.car.x), y: round(car?.position.y || 0), z: round(pose.car.z), heading: round(pose.car.heading) },
      cyclist: { x: round(pose.cyclist.x), y: round(cyclist?.position.y || 0), z: round(pose.cyclist.z), heading: round(pose.cyclist.heading), pitch: round(cyclist?.rotation.x || 0) }
    };
  }

  lightingState = getDaylight();
  environment.setVariant(variantName);
  buildWorld();
  requestAsphaltStudy();
  requestBrickStudy();
  requestStreetTree();
  requestSkyStudy();
  requestHedgeStudy();
  void requestDetailedCyclist();
  if (typeof ResizeObserver !== 'undefined') { observer = new ResizeObserver(resize); observer.observe(canvas); }
  else if (typeof window !== 'undefined') window.addEventListener('resize', resize);
  resize();
  // Static WebGL buffers can be discarded after composition. Redraw once per
  // scroll frame so scrolling the lesson cannot reveal a cleared black canvas.
  let scrollFrame = 0;
  const repaintOnScroll = () => {
    if (!scrollFrame && !disposed) scrollFrame = requestAnimationFrame(() => { scrollFrame = 0; render(); });
  };
  if (typeof window !== 'undefined') window.addEventListener('scroll', repaintOnScroll, { passive: true });
  const contextLost = event => { event.preventDefault(); canvas.dataset.contextLost = 'true'; };
  canvas.addEventListener('webglcontextlost', contextLost);
  daylightTimer = setInterval(refreshDaylight, 30000);
  const onVisibility = () => { if (!document.hidden) refreshDaylight(); };
  document.addEventListener('visibilitychange', onVisibility);

  const api = {
    setView(next) { if (VALID_VIEWS.has(next)) view = next; if (view === 'overhead') void requestDetailedCar();if(view==='shoulder'&&variantName==='junction')void requestSourceCyclist();render(); return view; },
    setObservationMode(mode) { if(view!=='shoulder'||variantName!=='junction')return 'window';const result=rightView.setMode(mode);render();return result; },
    hitTestMirror(clientX,clientY) { return rightView.hitTestMirror(clientX,clientY); },
    inspectAt(clientX,clientY) { if(!rightView.hitTestMirror(clientX,clientY))return false;rightView.setMode('mirror');render();return true; },
    setVariant(next) { if (!VALID_VARIANTS.has(next) || next === variantName) return variantName; stopAnimation(); variantName = next; cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; environment.setVariant(next); buildWorld(); render(); return variantName; },
    setExplanation(value) { explanation = !!value; if (explanationGroup) explanationGroup.visible = explanation; render(); return explanation; },
    pickRisk(clientX, clientY) {
      const hit=rightView.hitTestMirror(clientX,clientY);
      if(hit)return hit.insideLens&&pointHitsRect(clientX,clientY,rightView.projectCyclistInMirror())?'cycle':'mirror';
      return pointHitsRect(clientX,clientY,projectedBounds(cyclist))?'cycle':'other';
    },
    setCyclistCleared(value) {
      const next = !!value;
      if (next === cyclistCleared) return cyclistCleared;
      stopAnimation(); cyclistCleared = next;
      replayKind = null; phase = 'ready';
      progress = { car: 0, cyclist: cyclistCleared ? CLEARED_CYCLIST_PROGRESS : 0 };
      render(); return cyclistCleared;
    },
    replay,
    reset() { stopAnimation();sourceCycleCard?.reset();rightView.resetChecks();rightView.setMode('window',{record:false});cyclistCleared = false; replayKind = null; phase = 'ready'; progress = { car: 0, cyclist: 0 }; render(); },
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
      disposed = true; canvas.parentElement?.querySelector('[data-cyclist-notice]')?.remove(); stopAnimation();rightView.dispose();sourceCycleCard?.dispose?.();observer?.disconnect();
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      if (typeof window !== 'undefined') { window.removeEventListener('resize', resize); window.removeEventListener('scroll', repaintOnScroll); }
      canvas.removeEventListener('webglcontextlost', contextLost);
      clearInterval(daylightTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      if (pendingAsphaltImage) { pendingAsphaltImage.onload = null; pendingAsphaltImage.onerror = null; pendingAsphaltImage = null; }
      if (pendingBrickImage) { pendingBrickImage.onload = null; pendingBrickImage.onerror = null; pendingBrickImage = null; }
      if (pendingTreeImage) { pendingTreeImage.onload = null; pendingTreeImage.onerror = null; pendingTreeImage = null; }
      if (pendingSkyImage) { pendingSkyImage.onload = null; pendingSkyImage.onerror = null; pendingSkyImage = null; }
      if (pendingHedgeImage) { pendingHedgeImage.onload = null; pendingHedgeImage.onerror = null; pendingHedgeImage = null; }
      environment.dispose();
      asphaltStudy = null;
      brickStudy = null;
      streetTreeImage = null;
      skyStudy = null;
      hedgeStudy = null;
      disposeChildren(world);
      detailedCar = null;
      detailedCyclist = null;
      disposeChildren(cockpit); skyTexture.dispose();
      dusk.shadow.map?.dispose();
      renderer.dispose();
      if (typeof renderer.forceContextLoss === 'function') renderer.forceContextLoss();
      if (canvas.__turnScene === api) delete canvas.__turnScene;
      if (canvas.dataset) { delete canvas.dataset.environmentStatus; delete canvas.dataset.environmentVariant; delete canvas.dataset.environmentGlbSha256; }
    }
  };
  canvas.__turnScene = api;
  return api;
}
