// The approved registered Sneglen: the image remains visible while the compact
// rig loads, if it fails, and whenever motion is disabled.
import { loadRiveRuntime, loadRiveFile } from './rive-fx.js';

export function mountRoadCast(host) {
  const learn = host?.querySelector('.learn');
  const panel = learn?.querySelector('.learn-path-wrap');
  if (!learn || !panel) return { dispose() {} };
  learn.querySelector('.learn-guide')?.remove();
  const pose = document.createElement('span');
  pose.className = 'learn-guide-figure';
  pose.setAttribute('aria-hidden', 'true');
  pose.innerHTML = '<img src="assets/rive/registered-guide-web.webp" alt="" decoding="async">';
  learn.append(pose);
  pose.addEventListener('click', () => { if (innerWidth < 1100) location.hash = '#chat'; });
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const still = () => media.matches || document.body.classList.contains('no-motion');
  let instance = null, visible = false, loading = false, disposed = false, generation = 0, touchTarget = null, navigationTimer = 0;

  function layout() {
    if (disposed || !panel.isConnected) return;
    const p = panel.getBoundingClientRect(), root = learn.getBoundingClientRect();
    const desktop = innerWidth >= 1100;
    const width = desktop ? Math.min(274, p.width * .38) : Math.min(190, Math.max(130, innerWidth * .44));
    const height = width * 1118 / 1407;
    let x, y;
    if (desktop) {
      pose.style.transform = ''; pose.style.clipPath = '';
      x = p.right - root.left - 10 - width * 72 / 1407;
      y = p.top - root.top + p.height * .5 - height * .5;
    } else {
      // Phone: its own composition. Sneglen leans on the road panel's right edge at the height of the learner's
      // next step (cropped by the edge, mirrored to look at the road, as in the approved layout) and never
      // covers the road or the vertical title.
      const title = panel.querySelector('.learn-poster-word'), t = title?.getBoundingClientRect();
      const node = panel.querySelector('.pn--next') || panel.querySelector('.pn');
      const edge = p.right - root.left, bleed = width * .36;
      x = edge - width + bleed;
      pose.style.transform = 'scaleX(-1)';
      const centre = node ? node.getBoundingClientRect().top + node.getBoundingClientRect().height * .5 : p.top + p.height * .3;
      y = centre - height * .55 - root.top;
      if (t) y = Math.max(y, t.bottom - root.top + 10);
      const over = Math.max(0, x + width - edge);
      pose.style.clipPath = `polygon(${over}px 0, 100% 0, 100% 100%, ${over}px 100%)`; // mirrored, so the figure's local left is the visual right
    }
    pose.style.width = width + 'px'; pose.style.left = x + 'px'; pose.style.top = y + 'px';
    pose.style.pointerEvents = desktop ? 'none' : 'auto'; pose.style.cursor = desktop ? '' : 'pointer';
    if (!pose.style.transition && !still()) requestAnimationFrame(() => { pose.style.transition = 'left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)'; });
  }
  function fit() {
    if (!instance) return;
    const canvas = instance.canvas, dpr = Math.min(2, devicePixelRatio || 1);
    if (!pose.clientWidth || !pose.clientHeight) return;
    canvas.width = Math.round(pose.clientWidth * dpr); canvas.height = Math.round(pose.clientHeight * dpr);
    instance.resizeToCanvas();
  }
  function clear() {
    generation++; loading = false;
    instance?.cleanup(); instance = null;
    pose.querySelector('canvas')?.remove(); pose.classList.remove('is-live');
  }
  async function start() {
    if (disposed || still() || loading || instance || !visible || document.hidden) return;
    loading = true; const token = ++generation;
    try {
      const r = await loadRiveRuntime();
      if (disposed || token !== generation || still() || !visible || document.hidden) { if (token === generation) loading = false; return; }
      const bytes = await loadRiveFile('registered-guide-compact.riv');
      if (disposed || token !== generation || still() || !visible || document.hidden) { if (token === generation) loading = false; return; }
      const canvas = document.createElement('canvas'); canvas.setAttribute('aria-hidden', 'true'); pose.append(canvas);
      const created = new r.Rive({
        buffer: bytes.slice(0), canvas, artboard: 'RegisteredGuide', autoplay: false,
        layout: new r.Layout({fit:r.Fit.Contain, alignment:r.Alignment.Center}),
        onLoad() {
          if (disposed || token !== generation || still()) { created.cleanup(); canvas.remove(); return; }
          fit(); created.play('Guide'); pose.classList.add('is-live'); loading = false;
          created.on('statechange', event => pose.dispatchEvent(new CustomEvent('guide-statechange', {detail:event.data})));
          pose.dispatchEvent(new CustomEvent('guide-ready', {detail:created}));
          installEyes(created);
          if (!visible || document.hidden) created.pause();
        },
        onLoadError() {
          if (token === generation) { loading = false; instance = null; pose.classList.remove('is-live'); }
          created.cleanup(); canvas.remove();
        }
      });
      instance = created;
    } catch (error) {
      if (token === generation) loading = false;
      if (!disposed) console.warn('Sneglen fallback:', error?.message || error);
    }
  }
  const intersection = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    if (!visible) instance?.pause();
    else if (instance && !document.hidden && !still()) instance.play('Guide');
    else void start();
  });
  intersection.observe(pose);
  const resize = new ResizeObserver(() => { layout(); fit(); });
  resize.observe(panel); resize.observe(pose);
  /* The rig only moves the pupils 3-5 artboard px (a quarter of a screen px), so the eyes looked frozen.
     The look target now drives the pupil nodes directly, right before every draw, with a much longer travel. */
  const EYE_TRAVEL = 36, EYE_REACH = 140, look = {tx:0, ty:0, x:0, y:0};
  function installEyes(rive) {
    const board = rive.artboard;
    if (!board || board.__eyesInstalled) return;
    board.__eyesInstalled = true;
    const draw = board.draw.bind(board);
    const nodes = ['upperPupilX', 'lowerPupilX'].map(name => board.node(name)), nodesY = ['upperPupilY', 'lowerPupilY'].map(name => board.node(name));
    board.draw = renderer => {
      look.x += (look.tx - look.x) * 0.28; look.y += (look.ty - look.y) * 0.28;
      for (const node of nodes) if (node) node.x = look.x * EYE_TRAVEL;
      for (const node of nodesY) if (node) node.y = look.y * EYE_TRAVEL;
      return draw(renderer);
    };
  }
  const onPointer = event => {
    if (event.pointerType !== 'mouse' || !instance || !visible || still()) return;
    const r = pose.getBoundingClientRect(), flip = innerWidth < 1100 ? -1 : 1;
    const inputs = instance.stateMachineInputs('Guide') || [];
    const x = inputs.find(input => input.name === 'lookX'), y = inputs.find(input => input.name === 'lookY');
    if (x) x.value = Math.max(-1, Math.min(1, (event.clientX - r.left - r.width / 2) / 200)) * flip;
    if (y) y.value = Math.max(-1, Math.min(1, (event.clientY - r.top - r.height / 2) / 200));
    // Eyes sit in the upper right of the figure, so aim from there rather than from the centre.
    const ex = r.left + r.width * 0.78, ey = r.top + r.height * 0.45;
    look.tx = Math.max(-1, Math.min(1, (event.clientX - ex) / EYE_REACH)) * flip;
    look.ty = Math.max(-1, Math.min(1, (event.clientY - ey) / EYE_REACH));
  };
  const onLesson = event => {
    const link = event.target.closest('.pn-btn');
    if (event.pointerType !== 'touch') touchTarget = null;
    if (!link || !instance || !visible || still()) return;
    if (event.pointerType === 'touch') {
      touchTarget = {link, until:performance.now() + 1500};
      if (navigationTimer) return;
    }
    instance.stateMachineInputs('Guide')?.find(input => input.name === 'react')?.fire();
  };
  // Give a touch reaction a moment to render before navigating. Mouse,
  // keyboard, modified clicks, disabled motion and the fallback remain native.
  const onLessonClick = event => {
    const link = event.target.closest('.pn-btn');
    if (!touchTarget || touchTarget.link !== link || performance.now() > touchTarget.until || event.detail === 0 || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.defaultPrevented || still()) return;
    const href = link.getAttribute('href'); touchTarget = null;
    if (!href?.startsWith('#')) return;
    event.preventDefault();
    if (!navigationTimer) navigationTimer = setTimeout(() => { navigationTimer = 0; if (!disposed && link.isConnected) location.hash = href; }, 180);
  };
  const onCancel = () => { touchTarget = null; };
  const onVisibility = () => { if (document.hidden) instance?.pause(); else if (visible && !still()) { if (instance) instance.play('Guide'); else void start(); } };
  const onMedia = () => { if (still()) clear(); else void start(); };
  window.addEventListener('resize', layout);
  document.addEventListener('pointermove', onPointer);
  document.addEventListener('visibilitychange', onVisibility);
  learn.addEventListener('pointerdown', onLesson);
  learn.addEventListener('pointercancel', onCancel);
  learn.addEventListener('click', onLessonClick);
  media.addEventListener('change', onMedia);
  document.fonts?.ready.then(layout); pose.querySelector('img').addEventListener('load', layout); layout();
  return { dispose() {
    disposed = true; clearTimeout(navigationTimer); clear(); intersection.disconnect(); resize.disconnect();
    window.removeEventListener('resize', layout); document.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVisibility); learn.removeEventListener('pointerdown', onLesson);
    learn.removeEventListener('pointercancel', onCancel); learn.removeEventListener('click', onLessonClick);
    media.removeEventListener('change', onMedia); pose.remove();
  } };
}
