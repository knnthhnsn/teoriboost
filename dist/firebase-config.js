// The Firebase web app's config (Firebase console > Project settings > Your apps > TeoriBoost web).
// It is not a secret: it names the project; access is decided by firebase/firestore.rules.
// Set it to null to switch login and sync off (the app is then local-only, as before).

// On the live site, Google's login window runs on our own domain (vercel.json passes /__/auth/ on to
// teoriboost.firebaseapp.com), so browsers that cut off cross-site windows still let it answer.
// Firebase always uses https for this, so anywhere else (localhost) keeps the project's own domain.
const OWN_DOMAINS = ['app.teoriboost.dk', 'teoriboost.vercel.app'];
const here = globalThis.location?.hostname;

// The team's open copies have no login at all (16 Nov 2026): progress stays on the device, and onboarding skips the sign-in step.
const OPEN_HOSTS = ['teoriboost.vercel.app', 'teoriboost-team.web.app', 'teoriboost-team.firebaseapp.com'];

export const FIREBASE_CONFIG = OPEN_HOSTS.includes(here) ? null : {
  apiKey: 'AIzaSyBB4xXyecXDgo63-0Ai2OLK2vEpypontgQ',
  authDomain: OWN_DOMAINS.includes(here) ? here : 'teoriboost.firebaseapp.com',
  projectId: 'teoriboost',
  storageBucket: 'teoriboost.firebasestorage.app',
  messagingSenderId: '440103435369',
  appId: '1:440103435369:web:2c6e7c2c4fd00cca2bf6f8',
};
