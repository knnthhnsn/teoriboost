import { readFile } from 'node:fs/promises';
import { createHmac, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import vm from 'node:vm';
import { AI_CONFIG, aiDayKey, aiResetAt } from '../../ai-config.js';
import { ApiError, summarize } from './_core.mjs';
import { getAdminResources, requestIp } from './_runtime.mjs';
export { ApiError };

const fail = (status, code, message, quota) => {
  const error = new ApiError(status, code, message);
  if (quota) error.quota = quota;
  throw error;
};
const validUid = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(value);
const validDevice = value => typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value);
const validRequest = value => typeof value === 'string' && /^[A-Za-z0-9_-]{8,128}$/.test(value);
const RETAIN_MS = 14 * 24 * 60 * 60 * 1000;

// A validated server-only key is required before any persistent identifier or
// quota is created. No unkeyed fallback, question or token is stored.
function identifier(kind, value, key) {
  const input = `teoriboost-ai-v1\0${kind}\0${value}`;
  return createHmac('sha256', key).update(input).digest('hex');
}

let warnedFallback = false;
function logFallback(reason = 'shared_store_unavailable') {
  if (warnedFallback) return;
  warnedFallback = true;
  console.warn(`[ai-quota] Shared server quota is unavailable (${reason}). Client-only question limits are not authoritative; web search is disabled.`);
}

// Firebase ID token signature, issuer, audience and expiry verification needs
// only the project ID and Google's public certificates, not Admin credentials.
// Revocation checking is intentionally not requested: that would need IAM.
const validProjectId = value => typeof value === 'string' && /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value);
export function projectIdFromPublicConfig(source) {
  try {
    if (typeof source !== 'string' || (source.match(/\bexport\s+const\s+FIREBASE_CONFIG\s*=/g) || []).length !== 1) return null;
    const script = source.replace(/\bexport\s+const\s+FIREBASE_CONFIG\s*=/, 'const FIREBASE_CONFIG =');
    const config = vm.runInNewContext(`${script}\n;FIREBASE_CONFIG`, { location: { hostname: 'app.teoriboost.dk' } }, { timeout: 1000 });
    return validProjectId(config?.projectId) ? config.projectId : null;
  } catch { return null; }
}
let publicProjectIdPromise;
async function publicProjectId() {
  return publicProjectIdPromise ||= readFile(new URL('../../firebase-config.js', import.meta.url), 'utf8')
    .then(projectIdFromPublicConfig).catch(() => null);
}
async function verifyFirebaseIdToken(token, env) {
  const projectId = env.FIREBASE_PROJECT_ID || await publicProjectId();
  if (!validProjectId(projectId)
      || ((env.VERCEL === '1' || env.VERCEL_ENV) && env.FIREBASE_AUTH_EMULATOR_HOST)) {
    fail(503, 'AI_AUTH_UNAVAILABLE', 'Din profil kan ikke bekræftes lige nu. Prøv igen senere.');
  }
  const [{ getApps, initializeApp }, { getAuth }] = await Promise.all([
    import('firebase-admin/app'), import('firebase-admin/auth'),
  ]);
  const name = `teoriboost-ai-verifier-${projectId}`;
  const app = getApps().find(item => item.name === name) || initializeApp({ projectId }, name);
  return getAuth(app).verifyIdToken(token, false);
}

function usage(record, day) {
  if (!record || record.day !== day) return { used: 0, webUsed: 0, requests: [], reservations: {} };
  if (!Number.isSafeInteger(record.used) || record.used < 0 || !Array.isArray(record.requests)
      // Existing records may exceed a newly lowered allowance; that is a
      // normal exhausted quota, not corrupted data.
      || record.requests.length > 10000
      || (record.webUsed !== undefined && (!Number.isSafeInteger(record.webUsed) || record.webUsed < 0))
      || (record.reservations !== undefined && (!record.reservations || typeof record.reservations !== 'object'
        || Array.isArray(record.reservations) || Object.entries(record.reservations).some(([key, value]) => !/^[a-f0-9]{64}$/.test(key) || !Number.isSafeInteger(value) || value < 1 || value > 1000)))
      || !record.requests.every(id => typeof id === 'string' && /^[a-f0-9]{64}$/.test(id))) {
    fail(503, 'AI_USAGE_INVALID', 'Snejlens forbrug kan ikke bekræftes lige nu.');
  }
  return { used: record.used, webUsed: record.webUsed ?? 0, requests: record.requests, reservations: record.reservations || {} };
}

// Trusted injection is a test seam only. No HTTP input selects a store, clock,
// token verifier, entitlement, tier or limit.
export function makeAiAccess({ publicConfig, resourceProvider = getAdminResources, verifyToken, env = {}, now = Date.now, onFallback = logFallback } = {}) {
  return async function check(req) {
    let statusOnly = false;
    try { statusOnly = req.method === 'GET' && new URL(req.url, 'http://internal.invalid').searchParams.get('quota') === '1'; } catch {}
    if (req.method !== 'POST' && !statusOnly) fail(405, 'METHOD_NOT_ALLOWED', 'Metoden er ikke tilladt.');
    if (env.APP_ORIGIN && (statusOnly ? req.headers?.origin && req.headers.origin !== env.APP_ORIGIN : req.headers?.origin !== env.APP_ORIGIN))
      fail(403, 'ORIGIN_INVALID', 'Åbn TeoriBoost for at fortsætte.');

    const authorization = req.headers?.authorization;
    let user = null;
    if (authorization !== undefined) {
      const token = typeof authorization === 'string' && /^Bearer ([A-Za-z0-9._-]{1,8192})$/.exec(authorization)?.[1];
      if (!token) fail(401, 'AUTH_INVALID', 'Din profil kan ikke bekræftes. Prøv at logge ind igen.');
      try {
        user = await (verifyToken ? verifyToken(token, false) : verifyFirebaseIdToken(token, env));
      } catch (error) {
        if (error instanceof ApiError) throw error;
        if (['app/invalid-credential', 'app/network-error', 'auth/invalid-credential', 'auth/internal-error'].includes(error?.code))
          fail(503, 'AI_AUTH_UNAVAILABLE', 'Din profil kan ikke bekræftes lige nu. Prøv igen senere.');
        fail(401, 'AUTH_INVALID', 'Din profil kan ikke bekræftes. Prøv at logge ind igen.');
      }
      if (!validUid(user?.uid) || typeof user.firebase?.sign_in_provider !== 'string' || !user.firebase.sign_in_provider)
        fail(401, 'AUTH_INVALID', 'Din profil kan ikke bekræftes. Prøv at logge ind igen.');
    }

    const signedIn = !!user && user.firebase.sign_in_provider !== 'anonymous';
    const device = req.headers?.['x-teoriboost-device'];
    if (!signedIn && !validDevice(device))
      fail(400, 'AI_DEVICE_INVALID', 'Din enhed kunne ikke bekræftes. Genindlæs siden, og prøv igen.');
    const requestId = statusOnly ? null : (req.headers?.['x-teoriboost-request'] ?? randomUUID());
    if (!statusOnly && !validRequest(requestId)) fail(400, 'REQUEST_INVALID', 'Spørgsmålet kunne ikke bekræftes. Prøv igen.');

    const stamp = now(), day = aiDayKey(stamp), resetAt = aiResetAt(stamp);
    const fallbackTier = signedIn ? 'free' : 'guest';
    let actorId = null;
    const fallback = reason => {
      onFallback(reason);
      return { mode: 'client', tier: fallbackTier, limit: AI_CONFIG.dailyLimits[fallbackTier], remaining: null, resetAt,
        actorId, day, webSearchesAllowed: 0 };
    };
    const hashKey = env.AI_QUOTA_HASH_KEY;
    if (typeof hashKey !== 'string' || hashKey.trim().length < 32)
      return fallback('hash_key_missing_or_invalid');
    actorId = identifier(signedIn ? 'actor-user' : 'actor-device', signedIn ? user.uid : device, hashKey);
    const ip = signedIn ? null : requestIp(req, env);
    // A missing platform-provided address must never be represented as an
    // authoritative per-IP allowance shared by everyone under "unknown".
    if (!signedIn && !isIP(ip)) return fallback('guest_ip_unavailable');

    let store;
    try { ({ store } = await resourceProvider()); }
    catch { return fallback('shared_store_unavailable'); }
    if (!store || typeof store.transaction !== 'function') return fallback('shared_store_invalid');

    try {
      const reserved = await store.transaction(async tx => {
        const paymentsEnabled = publicConfig?.enabled === true && env.BILLING_ENABLED === 'true';
        const entitlement = signedIn && paymentsEnabled ? await tx.get(`entitlements/${user.uid}`) : null;
        const tier = signedIn ? (paymentsEnabled && summarize(entitlement, stamp).premium ? 'premium' : 'free') : 'guest';
        const limit = AI_CONFIG.dailyLimits[tier];
        const paths = signedIn
          ? [`aiQuota/u_${identifier('user', user.uid, hashKey)}`]
          : [`aiQuota/d_${identifier('device', device, hashKey)}`, `aiQuota/i_${identifier('ip', ip, hashKey)}`];
        const records = await Promise.all(paths.map(path => tx.get(path)));
        const states = records.map(record => usage(record, day));
        const requestHash = statusOnly ? null : identifier('request', requestId, hashKey);
        if (!statusOnly && states[0].requests.includes(requestHash))
          fail(409, 'AI_REQUEST_REPLAY', 'Dette spørgsmål er allerede sendt. Vent på svaret, før du prøver igen.');
        // The per-IP counter is only a loose guest abuse backstop. A shared
        // network is not a single guest; each device keeps its own allowance.
        const limits = signedIn ? [limit] : [limit, AI_CONFIG.guestIpDailyLimit];
        const remainingBefore = Math.min(...states.map((state, index) => Math.max(0, limits[index] - state.used)));
        const quota = { mode: 'server', tier, limit, remaining: remainingBefore, resetAt };
        if (statusOnly) return { quota: { ...quota, actorId, day, webSearchesAllowed: 0 }, paths, requestHash };
        if (remainingBefore === 0) {
          const free = AI_CONFIG.dailyLimits.free, premium = AI_CONFIG.dailyLimits.premium;
          const message = tier === 'guest' ? `Log ind for at stille ${free} spørgsmål om dagen`
            : tier === 'free' ? (paymentsEnabled ? `Du har brugt dagens ${free} spørgsmål. Med Premium får du ${premium} om dagen.` : `Du har brugt dagens ${free} spørgsmål. Kom igen i morgen.`)
            : `Du har brugt dagens ${premium} spørgsmål. Kom igen i morgen.`;
          fail(429, 'AI_LIMIT_REACHED', message, quota);
        }

        // Reserve the whole question allowance before any model call. One
        // transaction caps parallel requests; known unused reservations are
        // returned in another transaction after the model stream ends.
        const webSearchesAllowed = Math.min(AI_CONFIG.webSearch.perQuestion[tier],
          Math.max(0, AI_CONFIG.webSearch.dailyLimits[tier] - states[0].webUsed));
        paths.forEach((path, index) => tx.set(path, {
          day, used: states[index].used + 1, webUsed: states[index].webUsed + (index === 0 ? webSearchesAllowed : 0),
          requests: index === 0 ? [...states[index].requests, requestHash] : [],
          reservations: index === 0 && webSearchesAllowed > 0
            ? { ...states[index].reservations, [requestHash]: webSearchesAllowed } : states[index].reservations,
          updatedAt: new Date(stamp).toISOString(),
          // Configure Firestore TTL on aiQuota.expiresAt to purge inactive keys.
          expiresAt: new Date(stamp + RETAIN_MS),
        }));
        return { quota: { ...quota, remaining: remainingBefore - 1, actorId, day, webSearchesAllowed }, paths, requestHash };
      });
      const { quota, paths, requestHash } = reserved;
      return { ...quota, async settleWebSearch(actual) {
        if (!quota.webSearchesAllowed) return 'none';
        if (!Number.isSafeInteger(actual) || actual < 0 || actual > quota.webSearchesAllowed) return 'unconfirmed';
        // Idempotency is recorded in the primary document. If the process
        // crashes or the result is unknown, the conservative reservation stays.
        return store.transaction(async tx => {
          const record = await tx.get(paths[0]);
          if (!record || record.day !== day) return 'day-changed';
          const primary = usage(record, day), amount = primary.reservations[requestHash];
          if (amount === undefined) return 'already-settled';
          if (actual > amount) return 'unconfirmed';
          const refund = amount - actual;
          if (primary.webUsed < refund) fail(503, 'AI_USAGE_INVALID', 'Snejlens forbrug kan ikke bekræftes lige nu.');
          const reservations = { ...primary.reservations }; delete reservations[requestHash];
          tx.set(paths[0], { ...record, webUsed: primary.webUsed - refund, reservations });
          return refund ? 'refunded' : 'spent';
        });
      } };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // A transaction may have committed even if its result was lost. Do not
      // switch to uncounted client fallback after an attempted reservation.
      fail(503, 'AI_ACCESS_UNAVAILABLE', 'Snejlens forbrug kan ikke bekræftes lige nu. Prøv igen senere.');
    }
  };
}

let configPromise;
async function readConfig() {
  return configPromise ||= readFile(new URL('../../premium-config.json', import.meta.url), 'utf8').then(JSON.parse).catch(() => null);
}
export async function requireAiAccess(req) {
  return makeAiAccess({ publicConfig: await readConfig(), env: process.env })(req);
}
