// The cyclist on the road in the driving lesson: the approved character as a card that always faces the
// camera. The picture follows the side the camera is on, because the rider is seen from the front in the
// mirrors and from behind once they have passed the car.
const FRONT_URL = new URL('./assets/people-cse/a_cyclist.png', import.meta.url).href;
const REAR_URL = new URL('./assets/people-cse/a_cyclist_rear.webp', import.meta.url).href;

// The rider rides towards -z, so a camera at lower z is ahead of them and sees them from the front.
export const riderViewFor = (cameraZ, riderZ) => cameraZ < riderZ ? 'front' : 'rear';

export async function createRoadRider(THREE, attachBillboard, { height = 1.7 } = {}) {
  const load = url => new Promise((resolve, reject) => new THREE.TextureLoader().load(url, texture => { texture.encoding = THREE.sRGBEncoding; resolve(texture); }, undefined, reject));
  const [front, rear] = await Promise.all([load(FRONT_URL), load(REAR_URL)]);
  const sizes = { front: height * front.image.width / front.image.height, rear: height * rear.image.width / rear.image.height };
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.translate(0, .5, 0);
  const material = new THREE.MeshBasicMaterial({ map: front, transparent: true, alphaTest: .05, depthWrite: false, side: THREE.DoubleSide });
  const mesh = attachBillboard(THREE, new THREE.Mesh(geometry, material));
  mesh.name = 'road-rider-card';
  mesh.frustumCulled = false;
  mesh.scale.set(sizes.front, height, 1);
  const eye = new THREE.Vector3(), orient = mesh.onBeforeRender;
  let shown = 'front';
  mesh.onBeforeRender = function (renderer, scene, camera, ...rest) {
    camera.getWorldPosition(eye);
    this.parent.getWorldPosition(this.userData.at || (this.userData.at = new THREE.Vector3()));
    const view = riderViewFor(eye.z, this.userData.at.z);
    if (view !== shown) {
      shown = view;
      material.map = view === 'front' ? front : rear;
      material.uniformsNeedUpdate = true;
      this.scale.set(sizes[view], height, 1);
    }
    orient.call(this, renderer, scene, camera, ...rest);
  };
  return {
    mesh,
    view: () => shown,
    dispose() { mesh.parent?.remove(mesh); geometry.dispose(); material.dispose(); front.dispose(); rear.dispose(); },
  };
}
