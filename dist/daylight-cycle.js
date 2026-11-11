/**
 * Approximate solar illumination for the illustrative Danish scenes.
 * Coordinates are Copenhagen; no location permission or network is used.
 * NOAA fractional-year solar equations: https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 * Geometric altitude is an approximation, not a navigation or weather service.
 */
const RAD = Math.PI / 180;
const LATITUDE = 55.6761 * RAD;
const LONGITUDE = 12.5683;
const smooth = (a, b, x) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); };
export function getDaylight(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (!Number.isFinite(d.getTime())) throw new RangeError('Invalid date for daylight');
  const year=d.getUTCFullYear(), start=Date.UTC(year,0,1), elapsed=(d.getTime()-start)/86400000;
  const days=(Date.UTC(year+1,0,1)-start)/86400000;
  const hour=d.getUTCHours()+d.getUTCMinutes()/60+d.getUTCSeconds()/3600+d.getUTCMilliseconds()/3600000;
  const gamma=2*Math.PI/days*(Math.floor(elapsed)+(hour-12)/24);
  const eq=229.18*(.000075+.001868*Math.cos(gamma)-.032077*Math.sin(gamma)-.014615*Math.cos(2*gamma)-.040849*Math.sin(2*gamma));
  const decl=.006918-.399912*Math.cos(gamma)+.070257*Math.sin(gamma)-.006758*Math.cos(2*gamma)+.000907*Math.sin(2*gamma)-.002697*Math.cos(3*gamma)+.00148*Math.sin(3*gamma);
  const solarMinutes=((hour*60+eq+4*LONGITUDE)%1440+1440)%1440;
  const angle=(solarMinutes/4-180)*RAD;
  const sine=Math.sin(LATITUDE)*Math.sin(decl)+Math.cos(LATITUDE)*Math.cos(decl)*Math.cos(angle);
  const altitude=Math.asin(Math.max(-1,Math.min(1,sine)))/RAD;
  const azimuth=(Math.atan2(Math.sin(angle),Math.cos(angle)*Math.sin(LATITUDE)-Math.tan(decl)*Math.cos(LATITUDE))+Math.PI)%(2*Math.PI);
  const day=smooth(-7, 6, altitude);
  const twilight=smooth(-10,-3,altitude)*(1-smooth(4,16,altitude));
  return {day,twilight,azimuth,altitude};
}
