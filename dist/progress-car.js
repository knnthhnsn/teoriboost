// The learner's own car, drawn at the tip of the progress bars.
import {loadGarage,vehicleLayers} from './mybil.js';
export const progressCar=()=>{try{return `<b class="pbar-car" aria-hidden="true">${vehicleLayers(loadGarage())}</b>`}catch{return ''}};
