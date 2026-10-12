import {VERSION,blankState,restoreState} from './core.js';

function validSnapshot(raw){
  if(raw===null || raw===undefined)return null;
  try{
    const parsed=typeof raw==='string'?JSON.parse(raw):raw;
    return parsed && parsed.version===VERSION ? restoreState(parsed) : null;
  }catch{return null;}
}

/** Old app builds know only legacyKey; they cannot delete protectedKey on pagehide. */
export function readProtectedProfile(storage,{legacyKey,protectedKey,merge}){
  const legacy=validSnapshot(storage.getItem(legacyKey));
  const protectedProfile=validSnapshot(storage.getItem(protectedKey));
  if(legacy && protectedProfile)return merge(legacy,protectedProfile);
  return protectedProfile || legacy || blankState();
}

export function writeProtectedProfile(storage,state,{legacyKey,protectedKey}){
  const serialized=JSON.stringify(state);
  // Do not overwrite the compatibility copy unless the protected write succeeds.
  storage.setItem(protectedKey,serialized);
  storage.setItem(legacyKey,serialized);
}
