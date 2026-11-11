import {SDK_URL, friendly} from './account.js';
// Auth-only view of the existing Firebase account. It never syncs an empty progress document.
export function createPaymentAccount({config,load=()=>Promise.all(['app','auth'].map(m=>import(SDK_URL+'firebase-'+m+'.js'))).then(mods=>Object.assign({},...mods))}){
  let fb,auth,state={state:config?'loading':'off',email:null,error:null};
  const listeners=new Set();
  const set=patch=>{state={...state,...patch};listeners.forEach(fn=>fn(state));};
  const ready=(async()=>{
    if(!config)return;
    try{
      fb=await load();const app=fb.getApps().length?fb.getApp():fb.initializeApp(config);
      auth=fb.getAuth(app);auth.languageCode='da';await auth.authStateReady();
      fb.onAuthStateChanged(auth,user=>set({state:user&&!user.isAnonymous?'user':'anon',email:user&&!user.isAnonymous?user.email:null,error:null}));
    }catch{set({state:'local',error:'Login kunne ikke indlæses. Prøv igen, når du er online.'});}
  })();
  return {ready,status:()=>state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
    firestore:async()=>auth?.currentUser&&!auth.currentUser.isAnonymous?{uid:auth.currentUser.uid,fb:{getAuth:()=>auth}}:null,
    async signInGoogle(){await ready;if(!auth)throw new Error('Login er ikke åbnet endnu.');try{await fb.signInWithPopup(auth,new fb.GoogleAuthProvider());}catch(error){throw new Error(friendly(error));}}
  };
}
