/** The road follows rendered node centres, including wrapped titles and the buddy. */
export function mountJourneyRoad(host) {
  const road = host?.querySelector('.journey-road');
  if (!road) return { dispose() {} };
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('class', 'journey-road-line');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(namespace, 'path');
  svg.append(path); road.append(svg);
  let disposed = false;
  function draw() {
    if (disposed || !road.isConnected) return;
    const bounds = road.getBoundingClientRect();
    const points = [...road.querySelectorAll('.journey-node__circle')].map(node => {
      const box = node.getBoundingClientRect();
      return [box.left + box.width / 2 - bounds.left, box.top + box.height / 2 - bounds.top];
    });
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    if (!points.length) return;
    let curve = `M ${points[0].join(' ')}`;
    for (let index = 1; index < points.length; index++) {
      const [x, y] = points[index], [previousX, previousY] = points[index - 1];
      const middle = (previousY + y) / 2;
      curve += ` C ${previousX} ${middle}, ${x} ${middle}, ${x} ${y}`;
    }
    path.setAttribute('d', curve);
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null;
  observer?.observe(road); window.addEventListener('resize', draw); draw();
  return { dispose() { disposed = true; observer?.disconnect(); window.removeEventListener('resize', draw); svg.remove(); } };
}

/** The Lær path as a poster road: a thick asphalt road with a dashed centre line that winds through the lesson
 *  buttons on a yellow panel, coming in at the top and leaving at the bottom. */
export function mountLearnRoad(host) {
  const wrap = host?.querySelector('.learn-path-wrap');
  if (!wrap) return { dispose() {} };
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');
  svg.setAttribute('class', 'learn-road'); svg.setAttribute('aria-hidden', 'true');
  const asphalt = document.createElementNS(namespace, 'path'), line = document.createElementNS(namespace, 'path');
  asphalt.setAttribute('class', 'learn-road-asphalt'); line.setAttribute('class', 'learn-road-line');
  svg.append(asphalt, line); wrap.prepend(svg);
  let disposed = false;
  function draw() {
    if (disposed || !wrap.isConnected) return;
    const bounds = wrap.getBoundingClientRect();
    const points = [...wrap.querySelectorAll('.pn-btn')].map(node => {
      const box = node.getBoundingClientRect();
      return [box.left + box.width / 2 - bounds.left, box.top + box.height / 2 - bounds.top];
    });
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    if (!points.length) return;
    // in from above the panel and out below it, swinging the other way than the nearest bend
    const [fx, fy] = points[0], [lx, ly] = points.at(-1), swing = bounds.width * .22;
    const all = [[fx + (points[1] && points[1][0] > fx ? -swing : swing), -40], ...points, [lx + (points.at(-2) && points.at(-2)[0] > lx ? -swing : swing), bounds.height + 40]];
    let curve = `M ${all[0].join(' ')}`;
    for (let index = 1; index < all.length; index++) {
      const [x, y] = all[index], [previousX, previousY] = all[index - 1];
      const middle = (previousY + y) / 2;
      curve += ` C ${previousX} ${middle}, ${x} ${middle}, ${x} ${y}`;
    }
    asphalt.setAttribute('d', curve); line.setAttribute('d', curve);
    // the poster's giant word stays on one line: shrink it until it fits the panel's height
    const word = wrap.querySelector('.learn-poster-word');
    if (word && getComputedStyle(word).display !== 'none') {
      let size = 84; word.style.fontSize = size + 'px';
      while (word.scrollHeight > word.clientHeight + 1 && size > 32) word.style.fontSize = (size -= 4) + 'px';
    }
  }
  const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(draw) : null;
  // the stops slide in and the fonts may still be loading: draw again when they settle
  wrap.addEventListener('animationend', draw); document.fonts?.ready.then(draw);
  observer?.observe(wrap); window.addEventListener('resize', draw); draw();
  return { dispose() { disposed = true; observer?.disconnect(); window.removeEventListener('resize', draw); wrap.removeEventListener('animationend', draw); svg.remove(); } };
}
