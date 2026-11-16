// Vehicles we have no 3D model of yet, built from boxes in the same flat look with ink edges: bus, lorry, ambulance, plus the police
// markings for the Nordic GT. Same convention as the models: nose points +x, middle at the origin, y up, ground at y = 0.
const GLASS = '#243542', INK = '#0F1215';

export function buildExtra(T, kind, color = '#C2CCD6') {
  const g = new T.Group(), edge = new T.LineBasicMaterial({ color: INK });
  const bx = (w, h, d, c, x, y, z, edges = true, basic = false) => {
    const geo = new T.BoxGeometry(w, h, d);
    const m = new T.Mesh(geo, basic ? new T.MeshBasicMaterial({ color: c }) : new T.MeshStandardMaterial({ color: c, roughness: 0.95, flatShading: true }));
    m.position.set(x, y, z); if (edges) m.add(new T.LineSegments(new T.EdgesGeometry(geo), edge)); g.add(m); return m;
  };
  const wheel = (x, z, r = 0.55, wd = 0.38) => { const w = new T.Mesh(new T.CylinderGeometry(r, r, wd, 16), new T.MeshStandardMaterial({ color: '#1F2328', roughness: 1, flatShading: true })); w.rotation.x = Math.PI / 2; w.position.set(x, r, z); g.add(w); };
  const lights = (x, y, c, zs) => zs.forEach(z => bx(0.06, 0.22, 0.42, c, x, y, z, false, true));
  if (kind === 'bus') {
    bx(11.4, 0.6, 2.5, '#2B3138', 0, 0.62, 0); bx(11.4, 2.3, 2.55, color, 0, 2.05, 0);
    bx(9.4, 0.95, 2.58, GLASS, -0.4, 2.55, 0, false); bx(0.06, 1.5, 2.2, GLASS, 5.72, 2.4, 0, false);
    bx(1.5, 1.9, 0.06, GLASS, 3.0, 1.85, 1.29, false); bx(0.06, 0.34, 1.6, INK, 5.72, 3.05, 0, false, true);
    bx(2.6, 0.35, 1.6, '#E3E5E8', -2, 3.35, 0); lights(5.72, 0.95, '#FFF2B0', [-0.85, 0.85]); lights(-5.72, 0.95, '#FF3B30', [-0.85, 0.85]);
    for (const x of [3.8, -3.4]) for (const z of [-1.2, 1.2]) wheel(x, z);
  } else if (kind === 'lorry') {
    bx(8.2, 0.35, 2.4, '#1F2328', -1.5, 0.58, 0); bx(8.2, 3.0, 2.55, color, -1.5, 2.35, 0);
    bx(2.3, 2.6, 2.5, '#3F5F73', 4.55, 1.95, 0); bx(0.06, 1.1, 2.1, GLASS, 5.72, 2.55, 0, false); bx(0.06, 0.8, 1.6, '#2B3138', 5.72, 1.25, 0, false);
    lights(5.72, 0.95, '#FFF2B0', [-0.85, 0.85]); lights(-5.62, 0.95, '#FF3B30', [-0.9, 0.9]);
    for (const x of [5.0, -1.0, -2.4, -4.0]) for (const z of [-1.2, 1.2]) wheel(x, z);
  } else if (kind === 'ambulance') {
    bx(5.7, 0.5, 2.0, '#2B3138', 0, 0.6, 0); bx(5.8, 1.9, 2.1, '#F4F5F7', 0, 1.6, 0);
    bx(0.06, 1.0, 1.8, GLASS, 2.92, 2.15, 0, false); bx(5.82, 0.32, 2.12, '#D42F2F', 0, 1.2, 0, false);
    for (const z of [-1.08, 1.08]) for (let i = 0; i < 10; i++) bx(0.5, 0.3, 0.05, i % 2 ? '#FFD60A' : '#2D7BFF', -2.5 + i * 0.55, 1.62, z, false, true);
    bx(0.5, 0.18, 1.7, '#2D7BFF', 1.6, 2.65, 0, false, true); lights(2.92, 0.95, '#FFF2B0', [-0.7, 0.7]); lights(-2.92, 0.95, '#FF3B30', [-0.7, 0.7]);
    for (const x of [1.8, -1.8]) for (const z of [-1, 1]) wheel(x, z, 0.5);
  }
  else if (kind === 'trailer' || kind === 'caravan') {
    const L = kind === 'caravan' ? 4.8 : 3.0, H = kind === 'caravan' ? 2.2 : 0.8;
    bx(L, H, 2.0, kind === 'caravan' ? '#F4F5F7' : '#7C8FA0', 0, 0.55 + H / 2, 0); if (kind === 'caravan') bx(L - 0.6, 0.6, 2.04, GLASS, 0, 1.9, 0, false);
    bx(1.6, 0.08, 0.08, '#2B3138', L / 2 + 0.8, 0.5, 0, false); wheel(-0.2, -1.05, 0.38, 0.25); wheel(-0.2, 1.05, 0.38, 0.25);
    lights(-L / 2 - 0.02, 0.9, '#FF3B30', [-0.8, 0.8]);
  } else if (kind === 'tractor') {
    bx(3.8, 0.4, 1.1, '#1F2328', 0, 0.95, 0); bx(2.2, 1.0, 1.2, color, 1.2, 1.6, 0); bx(1.7, 1.9, 1.9, GLASS, -0.9, 2.2, 0, false);
    bx(2.0, 0.16, 2.1, color, -0.9, 3.2, 0); bx(0.2, 0.2, 0.3, '#FF9600', -0.9, 3.4, 0, false, true);
    const pipe = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 1.1, 8), new T.MeshStandardMaterial({ color: '#2B3138' })); pipe.position.set(1.9, 2.55, 0.45); g.add(pipe);
    lights(2.32, 1.5, '#FFF2B0', [-0.4, 0.4]);
    for (const z of [-1.2, 1.2]) wheel(-1.2, z, 0.9, 0.55); for (const z of [-0.9, 0.9]) wheel(1.7, z, 0.55, 0.3);
  }
  return g;
}

// Police: the Nordic GT in white with a blue-and-yellow check band along the doors and a blue light bar on the roof.
export function addPoliceMarkings(T, g) {
  const edge = new T.LineBasicMaterial({ color: INK });
  const mk = (w, h, d, c, x, y, z) => { const geo = new T.BoxGeometry(w, h, d), m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: c })); m.position.set(x, y, z); m.add(new T.LineSegments(new T.EdgesGeometry(geo), edge)); g.add(m); };
  for (const z of [-1.22, 1.22]) for (let i = 0; i < 8; i++) mk(0.4, 0.26, 0.04, i % 2 ? '#FFD60A' : '#2D7BFF', -1.4 + i * 0.4, 0.78, z);
  mk(0.3, 0.12, 0.95, '#2D7BFF', 0.1, 1.6, 0);
}
