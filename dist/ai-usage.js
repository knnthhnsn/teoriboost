// Local daily usage is also the fallback when the shared quota service is unavailable.
// It is device storage, not a fraud-resistant or cross-device quota. Server metadata,
// when present, replaces the local count. No messages or fingerprints are stored here.
import { AI_CONFIG, aiDayKey, aiResetAt } from './ai-config.js';

const DEVICE_KEY = 'teoriboost.aiDevice.v1';
const USAGE_PREFIX = 'teoriboost.aiUsage.v1.';

function availableStorage() {
  try { return globalThis.localStorage; } catch { return null; }
}
export function randomAiId(cryptoSource = globalThis.crypto) {
  if (cryptoSource?.randomUUID) return cryptoSource.randomUUID();
  if (!cryptoSource?.getRandomValues) throw new Error('Sikker tilfældighed er ikke tilgængelig.');
  const bytes = cryptoSource.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function createAiUsage({ storage = availableStorage(), now = () => Date.now(), locks = globalThis.navigator?.locks,
  id = () => randomAiId(), win = globalThis.window, config = AI_CONFIG } = {}) {
  const fallback = new Map(); let storageUnavailable = !storage;
  const get = key => { try { if (!storageUnavailable) return storage.getItem(key); } catch { storageUnavailable = true; } return fallback.get(key) ?? null; };
  const set = (key, value) => { fallback.set(key, value); try { if (!storageUnavailable) storage.setItem(key, value); } catch { storageUnavailable = true; } };
  const validDevice = value => /^[A-Za-z0-9_-]{16,128}$/.test(value || '');
  let device = get(DEVICE_KEY);
  if (!validDevice(device)) device = id();
  if (!validDevice(device)) throw new Error('Ugyldigt enheds-id.');
  // A provisional ID is published under a shared lock at first use. Two tabs
  // opened together must not race to create different persistent device IDs.
  function deviceId() { const stored = get(DEVICE_KEY); if (validDevice(stored)) device = stored; return device; }
  function ensureDevice() { const stored = get(DEVICE_KEY); if (validDevice(stored)) device = stored; else set(DEVICE_KEY, device); return device; }
  const listeners = new Set(), lastTier = new Map(), ignoredOverride = new Map();
  const owner = identity => identity?.uid ? `user.${encodeURIComponent(String(identity.uid))}` : `device.${deviceId()}`;
  const tierOf = identity => !identity?.uid ? 'guest' : identity.premium === true ? 'premium' : 'free';
  const storageKey = identity => USAGE_PREFIX + owner(identity);
  const emit = () => listeners.forEach(fn => fn());
  function read(identity) {
    let value;
    try { value = JSON.parse(get(storageKey(identity)) || 'null'); } catch {}
    const day = aiDayKey(now());
    if (!value || value.day !== day || !Number.isSafeInteger(value.used) || value.used < 0) return { day, used: 0, mode: 'local' };
    return value;
  }
  function serverOverride(identity, value) {
    const server = value.server, clientTier = tierOf(identity), key = owner(identity), previousTier = lastTier.get(key);
    const configChanged = server && (server.clientConfigLimit !== config.dailyLimits[clientTier] || server.serverConfigLimit !== config.dailyLimits[server.tier]);
    if (server?.revision && ((previousTier && previousTier !== clientTier) || configChanged)) ignoredOverride.set(key, server.revision);
    lastTier.set(key, clientTier);
    if (!server || server.clientTier !== clientTier ||
        typeof server.revision !== 'string' || ignoredOverride.get(key) === server.revision ||
        server.clientConfigLimit !== config.dailyLimits[clientTier] || server.serverConfigLimit !== config.dailyLimits[server.tier] ||
        !Number.isSafeInteger(server.limit) || server.limit < 0 ||
        (clientTier === 'guest' ? server.tier !== 'guest' : !['free', 'premium'].includes(server.tier))) return null;
    return server;
  }
  function write(identity, value) { set(storageKey(identity), JSON.stringify(value)); emit(); }
  function view(identity) {
    const value = read(identity), server = serverOverride(identity, value);
    const tier = server?.tier ?? tierOf(identity), limit = server?.limit ?? config.dailyLimits[tier];
    return { tier, limit, used: value.used, remaining: Math.max(0, limit - value.used), mode: server ? 'server' : value.mode, resetAt: value.resetAt || aiResetAt(now()) };
  }
  function reconcile(identity, response) {
    const headers = response.headers;
    const mode = headers?.get('X-TeoriBoost-AI-Mode');
    const accepted = headers?.get('X-TeoriBoost-AI-Accepted');
    const value = read(identity);
    const resetAt = headers?.get('X-TeoriBoost-AI-Reset');
    const resetMs = Date.parse(resetAt || '');
    const validReset = Number.isFinite(resetMs) && aiDayKey(resetMs - 1) !== aiDayKey(resetMs);
    const reset = validReset ? new Date(resetMs).toISOString() : aiResetAt(now());
    const day = aiDayKey(Date.parse(reset) - 1);
    const priorFallback = value.day === day && Number.isSafeInteger(value.fallbackUsed) && value.fallbackUsed >= 0 ? value.fallbackUsed : 0;
    if (mode === 'server') {
      const rawLimit = headers.get('X-TeoriBoost-AI-Limit'), rawRemaining = headers.get('X-TeoriBoost-AI-Remaining'), serverTier = headers.get('X-TeoriBoost-AI-Tier');
      const limit = Number(rawLimit), remaining = Number(rawRemaining);
      const validTier = identity?.uid ? ['free', 'premium'].includes(serverTier) : serverTier === 'guest';
      const validAdmission = accepted === '1' || (accepted === '0' && response.status === 429);
      const used = limit - remaining + priorFallback;
      if (validReset && validTier && /^(0|[1-9]\d*)$/.test(rawLimit || '') && /^(0|[1-9]\d*)$/.test(rawRemaining || '') &&
          Number.isSafeInteger(limit) && Number.isSafeInteger(remaining) && remaining <= limit && Number.isSafeInteger(used) && validAdmission) {
        // Server use includes other devices. Fallback admissions happened while the
        // server store was unavailable, so retain those additional local admissions.
        // Bind the authoritative tier to the client identity snapshot that made the
        // request; a later login, logout or entitlement change cannot inherit it.
        const clientTier = tierOf(identity);
        ignoredOverride.delete(owner(identity));
        write(identity, { day, used, fallbackUsed: priorFallback, mode, resetAt: reset,
          server: { tier: serverTier, limit, clientTier, clientConfigLimit: config.dailyLimits[clientTier],
            serverConfigLimit: config.dailyLimits[serverTier], revision: randomAiId() } });
      }
    } else if (mode === 'client' && accepted === '1') {
      // Count only once response headers confirm admission. A network failure before
      // headers cannot be confirmed locally; server mode reconciles on a later reply.
      const server = value.day === day ? serverOverride(identity, value) : null;
      write(identity, { day, used: (value.day === day ? value.used : 0) + 1, fallbackUsed: priorFallback + 1, mode, resetAt: reset,
        ...(server ? { server } : {}) });
    }
  }
  async function request(identity, send, { signal } = {}) {
    const run = async () => {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
      const quota = view(identity);
      if (!quota.remaining) return { blocked: true, quota };
      const response = await send();
      reconcile(identity, response);
      return { response, quota: view(identity) };
    };
    // Web Locks serializes ID creation and fallback admission across same-origin
    // tabs. Without it, storage events refresh the UI but this is not authoritative.
    if (locks?.request) {
      await locks.request('teoriboost.aiDevice.init', { signal }, ensureDevice);
      const lockOwner = identity?.uid ? owner(identity) : 'guest-device';
      return locks.request(`teoriboost.aiUsage:${lockOwner}`, { signal }, run);
    }
    ensureDevice();
    return run();
  }
  function onStorage(event) {
    if (!event.key || event.key === DEVICE_KEY || event.key.startsWith(USAGE_PREFIX)) emit();
  }
  win?.addEventListener?.('storage', onStorage);
  return { deviceId, view, request, reconcile, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    dispose() { win?.removeEventListener?.('storage', onStorage); listeners.clear(); } };
}
