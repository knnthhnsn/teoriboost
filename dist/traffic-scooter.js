// One oncoming scooter with a helmeted rider in the driving lesson. It is scenery only:
// it never takes part in conflict, collision or scoring, and the lesson runs without it.
export const SCOOTER = Object.freeze({
  cruise: 11,            // m/s, about 40 km/t; a stor knallert may do at most 45
  accel: 2.2,
  brake: 3.4,
  spawnAhead: 175,       // starts beyond the distance where traffic becomes visible
  minSpawnAhead: 130,
  despawnBehind: 70,
  firstDelay: 2,
  gap: 11,
  stopDwell: 1.2,        // full stop at the stop sign before it may go on
  yieldToCar: 24,
  junctionClear: 3.4,    // metres before the junction's edge where it stops
  crossingClear: 4,
});

export const newScooterState = () => ({ active: false, z: 0, v: 0, wait: SCOOTER.firstDelay, dwell: 0, stopped: new Set() });

// Stops are checked in driving order. The scooter drives towards +z.
function stopPoint(state, world) {
  for (const stop of world.stops(state)) if (stop.z > state.z - .5) return stop;
  return null;
}

// world: playerX, playerZ, lane (its own lane centre), roadEnd, stops(state) -> [{z, kind, id, blocked}], avoid: [z...]
export function stepScooter(state, dt, world) {
  if (!state.active) {
    state.wait -= dt;
    if (state.wait > 0) return state;
    let z = Math.max(world.playerZ - SCOOTER.spawnAhead, world.roadEnd);
    if (world.playerZ - z < SCOOTER.minSpawnAhead) { state.wait = 1; return state; }
    // Never appear so close to a junction or crossing that it could not stop in time.
    for (const a of [...world.avoid].sort((p, q) => q - p)) if (z > a - 46 && z < a + 16) z = a - 46;
    if (z < world.roadEnd) { state.wait = 1; return state; }
    Object.assign(state, { active: true, z, v: SCOOTER.cruise, dwell: 0, stopped: new Set() });
    return state;
  }
  let limit = SCOOTER.cruise;
  const stop = stopPoint(state, world);
  if (stop) {
    const left = Math.max(0, stop.z - state.z);
    if (stop.kind === 'sign' && !state.stopped.has(stop.id)) {
      limit = Math.min(limit, Math.sqrt(2 * SCOOTER.brake * left));
      if (left < .3 && state.v < .3) { state.dwell += dt; limit = 0; if (state.dwell >= SCOOTER.stopDwell) { state.stopped.add(stop.id); state.dwell = 0; } }
    }
    if (stop.blocked) limit = Math.min(limit, Math.sqrt(2 * SCOOTER.brake * left));
  }
  // A car in its lane: slow down and wait. It never counts as a collision.
  const ahead = world.playerZ - state.z;
  if (Math.abs(world.playerX - world.lane) < 1.7 && ahead > 0 && ahead < SCOOTER.yieldToCar) {
    limit = Math.min(limit, Math.sqrt(2 * SCOOTER.brake * Math.max(0, ahead - 7)));
  }
  if (state.v > limit) state.v = Math.max(limit, state.v - SCOOTER.brake * dt);
  else state.v = Math.min(limit, state.v + SCOOTER.accel * dt);
  state.z += state.v * dt;
  if (state.z > world.playerZ + SCOOTER.despawnBehind || state.z > world.roadStart) {
    Object.assign(state, { active: false, wait: SCOOTER.gap, v: 0 });
  }
  return state;
}

// Metrics of the four approved rider sheets on the real scooter (model metres, review camera).
const RIDER_VIEWS = [
  { dir: [1, 0], uv: [0, 0, .12939, 1], width: .8987, height: 1.7845, bottom: .2013, offset: .0032, shift: .3 },
  { dir: [-1, 0], uv: [.25, 0, .16748, 1], width: 1.0295, height: 1.5804, bottom: .2495, offset: .0052, shift: .3 },
  { dir: [.7071, -.7071], uv: [.5, 0, .14648, 1], width: .9855, height: 1.7284, bottom: .194, offset: -.1253, shift: .34 },
  { dir: [.7071, .7071], uv: [.75, 0, .13574, 1], width: .9214, height: 1.7484, bottom: .2219, offset: .0807, shift: .34 },
];

export function pickRiderView(dx, dz) {
  let best = 0, score = -Infinity;
  RIDER_VIEWS.forEach((view, index) => { const s = view.dir[0] * dx + view.dir[1] * dz; if (s > score) { score = s; best = index; } });
  return best;
}

export const SCOOTER_CENTRE_X = .949;

// Rider card parented to the scooter model group (+X forward, Y up, origin at the scooter's centre).
export async function createScooterRider(THREE, attachBillboard, url = new URL('./assets/people-cse/scooter-rider-v1.webp', import.meta.url).href) {
  const texture = await new Promise((resolve, reject) => new THREE.TextureLoader().load(url, resolve, undefined, reject));
  texture.encoding = THREE.sRGBEncoding;
  const frame = { value: new THREE.Vector4(0, 0, 1, 1) };
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: false, alphaTest: .5, side: THREE.DoubleSide, depthWrite: true });
  material.onBeforeCompile = shader => {
    shader.uniforms.riderFrame = frame;
    shader.fragmentShader = 'uniform vec4 riderFrame;\n' + shader.fragmentShader.replace('#include <map_fragment>', 'vec4 sampledDiffuseColor=texture2D(map,riderFrame.xy+vUv*riderFrame.zw);\nsampledDiffuseColor=mapTexelToLinear(sampledDiffuseColor);\ndiffuseColor*=sampledDiffuseColor;');
    const token = '#include <alphatest_fragment>';
    if (!shader.fragmentShader.includes(token)) throw new Error('Scooter rider alpha-test shader chunk unavailable');
    shader.fragmentShader = shader.fragmentShader.replace(token, token + '\n diffuseColor.a = 1.0;');
  };
  material.customProgramCacheKey = () => 'scooter-rider-v1';
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.translate(0, .5, 0);
  const mesh = attachBillboard(THREE, new THREE.Mesh(geometry, material));
  mesh.name = 'scooter-rider';
  mesh.frustumCulled = false;
  const camera3 = new THREE.Vector3(), orient = mesh.onBeforeRender;
  mesh.onBeforeRender = function (renderer, scene, camera, ...rest) {
    camera.getWorldPosition(camera3);
    this.parent.worldToLocal(camera3);
    const length = Math.hypot(camera3.x, camera3.z) || 1, dx = camera3.x / length, dz = camera3.z / length;
    const index = pickRiderView(dx, dz), view = RIDER_VIEWS[index];
    frame.value.set(view.uv[0], view.uv[1], view.uv[2], view.uv[3]);
    // Stand the card just in front of the scooter's centre, so the saddle does not cut through the near leg.
    this.position.set(dz * view.offset + dx * view.shift, view.bottom, -dx * view.offset + dz * view.shift);
    this.scale.set(view.width, view.height, 1);
    this.userData.view = index;
    orient.call(this, renderer, scene, camera, ...rest);
  };
  mesh.dispose = () => { geometry.dispose(); material.dispose(); texture.dispose(); };
  return mesh;
}

// A stor knallert carries a white plate with a red border. The model's plate is plain white, so the border
// is added here without changing the approved model file. Input: the plate's corner points in model space,
// where the rear of the scooter is at low x. Returns flat triangle positions for a frame on the outer face.
export function plateBorderTriangles(points, border = .01, lift = .0015) {
  const rear = points.filter(p => p[0] < .5), low = Math.min(...rear.map(p => p[1])), high = Math.max(...rear.map(p => p[1]));
  const outer = (y, side) => { const row = rear.filter(p => Math.abs(p[1] - y) < .01 && Math.sign(p[2]) === side); return row.reduce((a, b) => b[0] < a[0] ? b : a); };
  const corners = [outer(low, -1), outer(low, 1), outer(high, 1), outer(high, -1)].map(p => [p[0] - lift, p[1], p[2]]);
  const height = Math.hypot(corners[3][0] - corners[0][0], corners[3][1] - corners[0][1]), width = Math.abs(corners[1][2] - corners[0][2]);
  const inset = (p, q, r) => p.map((v, i) => v + (q[i] - p[i]) * border / width + (r[i] - p[i]) * border / height);
  const inner = [inset(corners[0], corners[1], corners[3]), inset(corners[1], corners[0], corners[2]), inset(corners[2], corners[3], corners[1]), inset(corners[3], corners[2], corners[0])];
  const out = [];
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; out.push(...corners[i], ...corners[j], ...inner[j], ...corners[i], ...inner[j], ...inner[i]); }
  return out;
}

export function addPlateBorder(THREE, asset, colour = 0xD42F2F) {
  asset.updateMatrixWorld(true);
  const points = [], v = new THREE.Vector3();
  asset.traverse(part => {
    if (!part.isMesh || ![].concat(part.material).some(m => m.name === 'portable_plate')) return;
    const position = part.geometry.attributes.position;
    for (let i = 0; i < position.count; i++) { v.fromBufferAttribute(position, i).applyMatrix4(part.matrixWorld); points.push([v.x, v.y, v.z]); }
  });
  if (!points.some(p => p[0] < .5)) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(plateBorderTriangles(points), 3));
  const material = new THREE.MeshBasicMaterial({ color: colour, side: THREE.DoubleSide });
  material.color.convertSRGBToLinear();
  const border = new THREE.Mesh(geometry, material);
  border.name = 'plate_red_border';
  asset.add(border);
  return border;
}
