/* Small, deterministic vehicle and road geometry for the driving exercise.
 * X points right/east, Z decreases along the original route; heading 0 faces
 * -Z and positive headings turn right. Metres and seconds throughout. */
export const DRIVE_GEOMETRY = Object.freeze({halfRoad:3.25,halfWidth:.9,halfLength:2.1,wheelbase:2.6,maxSteeringAngle:.58,junctions:[-110,-240],roadZ:[-475,45],sideX:170,cornerChamfer:2.2});
const clamp=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
export const headingNorm=angle=>Math.atan2(Math.sin(angle),Math.cos(angle));
export function carPoint(pose,along=0,across=0){const s=Math.sin(pose.heading||0),c=Math.cos(pose.heading||0);return {x:pose.x+s*along+c*across,z:pose.z-c*along+s*across};}
export function pointOnRoad(x,z,g=DRIVE_GEOMETRY){return (Math.abs(x)<=g.halfRoad&&z>=g.roadZ[0]&&z<=g.roadZ[1])||
  (Math.abs(x)<=g.sideX&&g.junctions.some(j=>Math.abs(z-j)<=g.halfRoad))||
  // The corner of each junction is cut at an angle, so an ordinary turn does not catch the kerb.
  (g.cornerChamfer>0&&z>=g.roadZ[0]&&z<=g.roadZ[1]&&g.junctions.some(j=>{const dx=Math.abs(x)-g.halfRoad,dz=Math.abs(z-j)-g.halfRoad;return dx>=0&&dz>=0&&dx+dz<=g.cornerChamfer;}));}
/** Sample the front corners, the sides, the rear wheels and the middle of the rear bumper. The rear corners
 * overhang the kerb a little when a car pulls out, as a real car's do, so the rear wheels are checked instead. */
const ROAD_SAMPLES=g=>[[g.halfLength,-g.halfWidth],[g.halfLength,0],[g.halfLength,g.halfWidth],[0,-g.halfWidth],[0,0],[0,g.halfWidth],[-g.wheelbase/2,-g.halfWidth+.1],[-g.wheelbase/2,g.halfWidth-.1],[-g.halfLength,0]];
export function poseOnRoad(pose,g=DRIVE_GEOMETRY){for(const [along,across] of ROAD_SAMPLES(g)){
  const p=carPoint(pose,along,across);if(!pointOnRoad(p.x,p.z,g))return false;}return true;}
export function advanceVehicle(pose,speed,steering,dt,direction=1,g=DRIVE_GEOMETRY){
  if(![pose.x,pose.z,pose.heading,speed,steering,dt,direction].every(Number.isFinite)||dt<0)throw new TypeError('Invalid vehicle state');
  const distance=Math.max(0,speed)*dt*(direction<0?-1:1),angle=clamp(steering,-1,1)*g.maxSteeringAngle;
  const yaw=distance*Math.tan(angle)/g.wheelbase,mid=pose.heading+yaw/2;
  const next={x:pose.x+Math.sin(mid)*distance,z:pose.z-Math.cos(mid)*distance,heading:headingNorm(pose.heading+yaw)};
  return poseOnRoad(next,g)?{...next,blocked:false}:{x:pose.x,z:pose.z,heading:pose.heading,blocked:true};
}
/** Oriented-rectangle overlap, for the player's car and a crossing car. */
export function carsOverlap(a,b,g=DRIVE_GEOMETRY){
  const vectors=p=>[{x:Math.sin(p.heading),z:-Math.cos(p.heading)},{x:Math.cos(p.heading),z:Math.sin(p.heading)}],av=vectors(a),bv=vectors(b);
  const d={x:b.x-a.x,z:b.z-a.z},dot=(u,v)=>u.x*v.x+u.z*v.z;
  return [...av,...bv].every(axis=>Math.abs(dot(d,axis))<=g.halfLength*Math.abs(dot(av[0],axis))+g.halfWidth*Math.abs(dot(av[1],axis))+
    g.halfLength*Math.abs(dot(bv[0],axis))+g.halfWidth*Math.abs(dot(bv[1],axis)));
}
/** Route credit is reserved for a car proceeding down the original right lane. */
export function onRoute(pose,g=DRIVE_GEOMETRY){return pose.x>=g.halfWidth-.2&&pose.x<=g.halfRoad-g.halfWidth+.2&&Math.cos(pose.heading)>.85;}
