// The Nordic GT's number plates read TEORIBOOST. The model has a blank rear plate only, so both plates are drawn as planes on its bumpers (model coordinates).
export function plateTexture(T) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 112;
  const g = c.getContext('2d'); g.fillStyle = '#FEFFED'; g.fillRect(0, 0, 512, 112);
  g.fillStyle = '#1CB0F6'; g.fillRect(0, 0, 44, 112);
  g.strokeStyle = '#1F2328'; g.lineWidth = 6; g.strokeRect(3, 3, 506, 106);
  g.fillStyle = '#1F2328'; g.font = '900 68px Rubik, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('TEORIBOOST', 278, 60, 380);
  const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
}

export function addPlates(T, body, map) {
  for (const [x, y, ry] of [[0.1, 0.71, -Math.PI / 2], [4.745, 0.5, Math.PI / 2]]) {
    const pl = new T.Mesh(new T.PlaneGeometry(0.52, 0.113), new T.MeshBasicMaterial({ map, toneMapped: false }));
    pl.position.set(x, y, 0); pl.rotation.y = ry; body.add(pl);
  }
}
