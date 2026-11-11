// Keep a vertical +Z-facing card aligned against the camera view for each render pass.
// The card's parent retains its own route/position and any separate ground shadow.
export function attachCylindricalBillboard(THREE, mesh) {
  if (!mesh?.isObject3D || mesh.userData.cylindricalBillboard) return mesh;
  const direction=new THREE.Vector3(),up=new THREE.Vector3(0,1,0);
  const parentRotation=new THREE.Quaternion(),worldYaw=new THREE.Quaternion();
  const previous=mesh.onBeforeRender;
  mesh.onBeforeRender=function(renderer,scene,camera,geometry,material,group){
    previous?.call(this,renderer,scene,camera,geometry,material,group);
    camera.getWorldDirection(direction);
    const dx=-direction.x,dz=-direction.z;
    if(dx*dx+dz*dz<1e-12)return;
    worldYaw.setFromAxisAngle(up,Math.atan2(dx,dz));
    if(this.parent){this.parent.getWorldQuaternion(parentRotation);this.quaternion.copy(parentRotation.invert()).multiply(worldYaw);}else this.quaternion.copy(worldYaw);
    this.updateMatrix();this.updateMatrixWorld(true);
  };
  mesh.userData.cylindricalBillboard=true;
  return mesh;
}
