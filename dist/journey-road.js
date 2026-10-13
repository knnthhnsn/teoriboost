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
