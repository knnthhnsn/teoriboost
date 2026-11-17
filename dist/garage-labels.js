// Garage 3D view: a hotspot's name pill must stay inside the card and never cover another hotspot.
// garage-3d.js moves the dots every frame and only picks "left" or "right" of the dot. This reads the real
// boxes after that and picks the side (right, left, below, above) where the pill fits.
const MARGIN = 8;      // minimum distance from the card edge
const GAP = 26;        // dot centre to pill edge (dot radius 19 + breathing room)
const PAD = 6;         // extra room around other dots

const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;

// host = the garage page. The flat drawing re-renders its stage on every tap, so stages are looked up each frame.
export function placeLabels(host) {
  let raf = 0, disposed = false;
  const side = new WeakMap();
  const written = new WeakMap();

  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!host.isConnected) { dispose(); return; }
    for (const stage of host.querySelectorAll('.gx-stage')) if (!stage.closest('.gx-mini')) place(stage);
  }
  function place(stage) {
    const S = stage.getBoundingClientRect();
    if (S.bottom < 0 || S.top > innerHeight) return;
    const pins = [...stage.querySelectorAll('.gx-pins:not([hidden]) .gx-pin:not(.is-away)')];
    const dots = pins.map(pin => {
      const r = pin.querySelector('.gx-pin-dot').getBoundingClientRect();
      return { pin, r: { l: r.left - PAD, r: r.right + PAD, t: r.top - PAD, b: r.bottom + PAD }, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
    for (const d of dots) {
      const label = d.pin.querySelector('.gx-pin-label');
      if (!label || !label.offsetParent) continue; // only the labels that are showing
      const room = S.width - MARGIN * 2;
      const Lw = Math.min(label.offsetWidth, room), Lh = label.offsetHeight;
      const clampX = x => Math.max(S.left + MARGIN, Math.min(S.right - MARGIN - Lw, x));
      const clampY = y => Math.max(S.top + MARGIN, Math.min(S.bottom - MARGIN - Lh, y));
      // side first (right, left, below, above), then the same sides nudged up/down, then one row further away
      const cands = {
        r: { x: d.cx + GAP, y: clampY(d.cy - Lh / 2) },
        l: { x: d.cx - GAP - Lw, y: clampY(d.cy - Lh / 2) },
        b: { x: clampX(d.cx - Lw / 2), y: d.cy + GAP },
        a: { x: clampX(d.cx - Lw / 2), y: d.cy - GAP - Lh },
        ru: { x: d.cx + GAP, y: clampY(d.cy - Lh - 4) },
        rd: { x: d.cx + GAP, y: clampY(d.cy + 4) },
        lu: { x: d.cx - GAP - Lw, y: clampY(d.cy - Lh - 4) },
        ld: { x: d.cx - GAP - Lw, y: clampY(d.cy + 4) },
        b2: { x: clampX(d.cx - Lw / 2), y: d.cy + GAP + Lh + 6 },
        a2: { x: clampX(d.cx - Lw / 2), y: d.cy - GAP - 2 * Lh - 6 },
      };
      const cost = c => {
        const box = { l: c.x, r: c.x + Lw, t: c.y, b: c.y + Lh };
        // how far it sticks out of the card, plus a big penalty for each dot it would cover
        let out = Math.max(0, S.left + MARGIN - box.l) + Math.max(0, box.r - (S.right - MARGIN)) + Math.max(0, S.top + MARGIN - box.t) + Math.max(0, box.b - (S.bottom - MARGIN));
        for (const o of dots) if (o !== d && hit(box, o.r)) out += 1000;
        return out;
      };
      const prev = side.get(label);
      const order = ['r', 'l', 'b', 'a', 'ru', 'rd', 'lu', 'ld', 'b2', 'a2'];
      let pick = prev && cost(cands[prev]) === 0 ? prev : order.find(k => cost(cands[k]) === 0);
      if (!pick) pick = order.reduce((best, k) => (cost(cands[k]) < cost(cands[best]) ? k : best), 'r');
      side.set(label, pick);
      // the pin's own box from its centre and layout size: its pop-in animation scales getBoundingClientRect for half a second
      const c = cands[pick], pl = d.cx - d.pin.offsetWidth / 2, pt = d.cy - d.pin.offsetHeight / 2;
      const css = `left:${Math.round(c.x - pl)}px;right:auto;top:${Math.round(c.y - pt)}px;transform:none;max-width:${Math.floor(room)}px;overflow:hidden;text-overflow:ellipsis`;
      if (written.get(label) !== css) { label.style.cssText = css; written.set(label, css); }
    }
  }
  raf = requestAnimationFrame(frame);

  function dispose() { disposed = true; cancelAnimationFrame(raf); }
  return { dispose, setZone() {}, setXray() {} };
}
