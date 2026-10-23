// A small writer for Rive's runtime format (.riv, major 7). It knows only the objects TeoriBoost needs:
// shapes, fills/strokes, keyframe animations and state machines with triggers/booleans/numbers.
// Type and property numbers come from rive-runtime's generated headers (include/rive/generated/*_base.hpp).
//
// Structure of the file: "RIVE", major, minor, file id, a list of property keys the runtime might not know
// (empty: we only write known ones), then a flat stream of objects: typeKey, (propertyKey, value)*, 0.
// Inside an artboard, components refer to each other by their index in that artboard's list (artboard = 0);
// animations and state machines follow the artboard and refer to components and animations by index.

const T = { // typeKey
  Backboard: 23, Artboard: 1, Node: 2, Shape: 3, Ellipse: 4, Rectangle: 7, Polygon: 51, Star: 52,
  PointsPath: 16, StraightVertex: 5, CubicMirroredVertex: 35,
  Fill: 20, Stroke: 24, SolidColor: 18, LinearGradient: 22, RadialGradient: 17, GradientStop: 19,
  LinearAnimation: 31, KeyedObject: 25, KeyedProperty: 26, KeyFrameDouble: 30, KeyFrameColor: 37,
  CubicEaseInterpolator: 28, TrimPath: 47,
  StateMachine: 53, StateMachineLayer: 57, StateMachineTrigger: 58, StateMachineBool: 59, StateMachineNumber: 56,
  AnimationState: 61, EntryState: 63, AnyState: 62, ExitState: 64, StateTransition: 65,
  TransitionTriggerCondition: 68, TransitionBoolCondition: 71, TransitionNumberCondition: 70,
};
// property key -> [key, type]  type: u=varuint, d=float32, s=string, b=bool, c=color(uint32)
export const P = {
  name: [4, 's'], parentId: [5, 'u'],
  width: [7, 'd'], height: [8, 'd'], originX: [11, 'd'], originY: [12, 'd'], clip: [196, 'b'],
  x: [13, 'd'], y: [14, 'd'], rotation: [15, 'd'], scaleX: [16, 'd'], scaleY: [17, 'd'], opacity: [18, 'd'],
  pathWidth: [20, 'd'], pathHeight: [21, 'd'], pathOriginX: [123, 'd'], pathOriginY: [124, 'd'],
  cornerRadiusTL: [31, 'd'], cornerRadiusTR: [161, 'd'], cornerRadiusBL: [162, 'd'], cornerRadiusBR: [163, 'd'], linkCornerRadius: [164, 'b'],
  points: [125, 'u'], cornerRadius: [126, 'd'], innerRadius: [127, 'd'],
  isClosed: [32, 'b'], vx: [24, 'd'], vy: [25, 'd'], vradius: [26, 'd'], vrotation: [82, 'd'], vdistance: [83, 'd'],
  colorValue: [37, 'c'], fillRule: [40, 'u'], isVisible: [41, 'b'],
  thickness: [47, 'd'], cap: [48, 'u'], join: [49, 'u'], transformAffectsStroke: [50, 'b'],
  startX: [42, 'd'], startY: [33, 'd'], endX: [34, 'd'], endY: [35, 'd'], stopColor: [38, 'c'], stopPosition: [39, 'd'],
  animName: [55, 's'], fps: [56, 'u'], duration: [57, 'u'], speed: [58, 'd'], loopValue: [59, 'u'],
  objectId: [51, 'u'], propertyKey: [53, 'u'], frame: [67, 'u'], interpolationType: [68, 'u'], interpolatorId: [69, 'u'],
  kfValue: [70, 'd'], kfColor: [88, 'c'], x1: [63, 'd'], y1: [64, 'd'], x2: [65, 'd'], y2: [66, 'd'],
  smName: [138, 's'], boolValue: [141, 'b'], numberValue: [140, 'd'],
  animationId: [149, 'u'], stateToId: [151, 'u'], flags: [152, 'u'], tDuration: [158, 'u'], exitTime: [160, 'u'],
  inputId: [155, 'u'], opValue: [156, 'u'], condValue: [157, 'd'],
  trimStart: [114, 'd'], trimEnd: [115, 'd'], trimOffset: [116, 'd'], trimMode: [117, 'u'],
};
// property keys that animations target (KeyedProperty.propertyKey)
export const K = { x: 13, y: 14, rotation: 15, scaleX: 16, scaleY: 17, opacity: 18, width: 20, height: 21, color: 37, thickness: 47, cornerRadius: 31, trimStart: 114, trimEnd: 115, trimOffset: 116 };

class Writer {
  constructor() { this.bytes = []; }
  byte(b) { this.bytes.push(b & 255); }
  varuint(n) { n = Math.floor(n); do { let b = n & 127; n = Math.floor(n / 128); if (n) b |= 128; this.byte(b); } while (n); }
  f32(v) { const b = new DataView(new ArrayBuffer(4)); b.setFloat32(0, v, true); for (let i = 0; i < 4; i++) this.byte(b.getUint8(i)); }
  u32(v) { const b = new DataView(new ArrayBuffer(4)); b.setUint32(0, v >>> 0, true); for (let i = 0; i < 4; i++) this.byte(b.getUint8(i)); }
  str(s) { const e = new TextEncoder().encode(s); this.varuint(e.length); e.forEach(x => this.byte(x)); }
  value(t, v) { ({ u: () => this.varuint(v), d: () => this.f32(v), s: () => this.str(v), b: () => this.byte(v ? 1 : 0), c: () => this.u32(v) })[t](); }
}

/** '#RRGGBB' or '#RRGGBBAA' -> ARGB uint32 */
export function color(hex, alpha) {
  const h = hex.replace('#', ''); const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const a = alpha != null ? Math.round(alpha * 255) : h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
  return ((a << 24) | (r << 16) | (g << 8) | b) >>> 0;
}

/**
 * Builds one artboard. Components are added in order and get their index back.
 * add('Shape', { parent, name, x, y }) etc. Animations and state machines are described as data and written after.
 */
export class Artboard {
  constructor(name, width, height, { originX = 0, originY = 0, clip = true } = {}) {
    this.items = [{ type: 'Artboard', props: { name, width, height, originX, originY, clip } }];
    this.animations = []; this.machines = []; this.interpolators = new Map();
  }
  add(type, props = {}) {
    const { parent = 0, ...rest } = props;
    this.items.push({ type, props: { ...rest, parentId: parent } });
    return this.items.length - 1;
  }
  /** a cubic ease shared by keyframes; returns its component index */
  ease(x1, y1, x2, y2) {
    const key = [x1, y1, x2, y2].join(',');
    if (!this.interpolators.has(key)) { this.items.push({ type: 'CubicEaseInterpolator', props: { x1, y1, x2, y2 }, noParent: true }); this.interpolators.set(key, this.items.length - 1); }
    return this.interpolators.get(key);
  }
  /**
   * animation(name, { fps, duration (frames), loop: 'oneShot'|'loop'|'pingPong', tracks: [{ object, prop, keys: [[frame, value, ease?]] }] })
   * value is a number, or a '#hex' colour for prop 'color'. ease is [x1,y1,x2,y2], 'hold' or omitted (linear).
   */
  animation(name, { fps = 60, duration, loop = 'oneShot', speed = 1, tracks }) {
    this.animations.push({ name, fps, duration, loop, speed, tracks }); return this.animations.length - 1;
  }
  /**
   * stateMachine(name, { inputs: [{ name, type: 'trigger'|'bool'|'number', value }], layers: [{ name, states: [...], transitions: [...] }] })
   * states: [{ name, animation }] (animation index); entry/any/exit states are added for you.
   * transitions: [{ from: stateName|'entry'|'any', to: stateName|'exit', duration?, exitTime?, when?: [{ input, op?, value? }] }]
   */
  stateMachine(name, spec) { this.machines.push({ name, ...spec }); }
}

const LOOP = { oneShot: 0, loop: 1, pingPong: 2 };
// shape-level props whose names collide with Path/Vertex props in our flat key table
const RENAME = {
  Rectangle: { width: 'pathWidth', height: 'pathHeight', originX: 'pathOriginX', originY: 'pathOriginY' },
  Ellipse: { width: 'pathWidth', height: 'pathHeight', originX: 'pathOriginX', originY: 'pathOriginY' },
  Polygon: { width: 'pathWidth', height: 'pathHeight', originX: 'pathOriginX', originY: 'pathOriginY' },
  Star: { width: 'pathWidth', height: 'pathHeight', originX: 'pathOriginX', originY: 'pathOriginY' },
  StraightVertex: { x: 'vx', y: 'vy', radius: 'vradius' },
  CubicMirroredVertex: { x: 'vx', y: 'vy', rotation: 'vrotation', distance: 'vdistance' },
  GradientStop: { color: 'stopColor', position: 'stopPosition' },
  SolidColor: { color: 'colorValue' },
};

function writeObject(w, type, props) {
  if (!(type in T)) throw new Error('riv: unknown type ' + type);
  w.varuint(T[type]);
  const ren = RENAME[type] || {};
  for (const [k0, v] of Object.entries(props)) {
    if (v === undefined || v === null) continue;
    const k = ren[k0] || k0; const def = P[k]; if (!def) throw new Error(`riv: unknown property ${k0} on ${type}`);
    w.varuint(def[0]); w.value(def[1], typeof v === 'string' && def[1] === 'c' ? color(v) : v);
  }
  w.varuint(0);
}

export function writeRiv(artboards, { fileId = 0 } = {}) {
  const w = new Writer();
  'RIVE'.split('').forEach(c => w.byte(c.charCodeAt(0)));
  w.varuint(7); w.varuint(4); w.varuint(fileId);
  w.varuint(0); // no unknown property keys -> no field-type table
  writeObject(w, 'Backboard', {});
  for (const ab of artboards) {
    // interpolators live in the artboard's object list, so register every ease before writing it
    for (const a of ab.animations) for (const t of a.tracks) for (const k of t.keys) if (Array.isArray(k[2])) ab.ease(...k[2]);
    ab.items.forEach((it, i) => {
      const props = { ...it.props }; if (i === 0 || it.noParent) delete props.parentId;
      writeObject(w, it.type, props);
    });
    for (const a of ab.animations) {
      writeObject(w, 'LinearAnimation', { animName: a.name, fps: a.fps, duration: a.duration, loopValue: LOOP[a.loop], speed: a.speed });
      // group tracks by object, as the runtime expects: KeyedObject, then its KeyedProperties, each followed by keyframes
      const byObject = new Map();
      for (const t of a.tracks) { if (!byObject.has(t.object)) byObject.set(t.object, []); byObject.get(t.object).push(t); }
      for (const [object, tracks] of byObject) {
        writeObject(w, 'KeyedObject', { objectId: object });
        for (const t of tracks) {
          writeObject(w, 'KeyedProperty', { propertyKey: K[t.prop] ?? t.prop });
          for (const [frame, value, ease] of t.keys) {
            const interp = ease === 'hold' ? { interpolationType: 0 } : Array.isArray(ease) ? { interpolationType: 2, interpolatorId: ab.ease(...ease) } : { interpolationType: 1 };
            if (t.prop === 'color') writeObject(w, 'KeyFrameColor', { frame, kfColor: color(value), ...interp });
            else writeObject(w, 'KeyFrameDouble', { frame, kfValue: value, ...interp });
          }
        }
      }
    }
    for (const sm of ab.machines) {
      writeObject(w, 'StateMachine', { animName: sm.name });
      const inputIndex = new Map();
      (sm.inputs || []).forEach((inp, i) => {
        inputIndex.set(inp.name, i);
        if (inp.type === 'trigger') writeObject(w, 'StateMachineTrigger', { smName: inp.name });
        else if (inp.type === 'bool') writeObject(w, 'StateMachineBool', { smName: inp.name, boolValue: !!inp.value });
        else writeObject(w, 'StateMachineNumber', { smName: inp.name, numberValue: inp.value || 0 });
      });
      for (const layer of sm.layers) {
        writeObject(w, 'StateMachineLayer', { smName: layer.name || 'Layer' });
        // fixed order: entry 0, any 1, exit 2, then the animation states
        const names = ['entry', 'any', 'exit', ...layer.states.map(s => s.name)];
        const idx = n => { const i = names.indexOf(n); if (i < 0) throw new Error('riv: unknown state ' + n); return i; };
        const trans = name => layer.transitions.filter(t => t.from === name);
        const writeTransitions = name => {
          for (const t of trans(name)) {
            // flags: 1 = disabled, 2 = durationIsPercentage, 4 = enableExitTime, 8 = exitTimeIsPercentage
            let flags = 0; if (t.exitTime != null) flags |= 4;
            writeObject(w, 'StateTransition', { stateToId: idx(t.to), flags, tDuration: t.duration || 0, exitTime: t.exitTime });
            for (const c of t.when || []) {
              const i = sm.inputs.find(x => x.name === c.input); if (!i) throw new Error('riv: unknown input ' + c.input);
              if (i.type === 'trigger') writeObject(w, 'TransitionTriggerCondition', { inputId: inputIndex.get(c.input) });
              else if (i.type === 'bool') writeObject(w, 'TransitionBoolCondition', { inputId: inputIndex.get(c.input), opValue: c.value ? 0 : 1 });
              else writeObject(w, 'TransitionNumberCondition', { inputId: inputIndex.get(c.input), opValue: c.op ?? 0, condValue: c.value });
            }
          }
        };
        writeObject(w, 'EntryState', {}); writeTransitions('entry');
        writeObject(w, 'AnyState', {}); writeTransitions('any');
        writeObject(w, 'ExitState', {}); writeTransitions('exit');
        for (const s of layer.states) { writeObject(w, 'AnimationState', { animationId: s.animation }); writeTransitions(s.name); }
      }
    }
  }
  return new Uint8Array(w.bytes);
}
