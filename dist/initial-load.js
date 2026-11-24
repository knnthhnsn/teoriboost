// Keep optional engines off the first Lær request path. A failed request is
// retryable; every caller still runs its existing text/diagram fallback.
let threeRequest;
export function loadThree() {
  if (window.THREE) return Promise.resolve(true);
  if (threeRequest) return threeRequest;
  threeRequest = new Promise(resolve => {
    const script = document.createElement('script');
    script.src = new URL('./assets/three.min.js', import.meta.url).href;
    script.async = true;
    let timer;
    const finish = () => {
      clearTimeout(timer);
      script.onload = script.onerror = null;
      script.remove();
      const ready = !!window.THREE;
      if (!ready) threeRequest = null;
      resolve(ready);
    };
    script.onload = script.onerror = finish;
    timer = setTimeout(finish, 30000);
    document.head.append(script);
  });
  return threeRequest;
}

// Preserve stop-on-navigation while an optional voice manifest is downloading.
// The audio element and narration controls are still owned by voice.js.
export function createLazyNarrator({createNarrator, loadPack = () => import('./voice-pack.js'), ...options}) {
  let narrator, request, generation = 0, disposed = false;
  return {
    async read(parts, info) {
      if (disposed) return false;
      if (narrator) return narrator.read(parts, info);
      const current = ++generation;
      if (!request) {
        options.notify?.('Henter oplæsningen …');
        request = loadPack().catch(() => { request = null; return null; });
      }
      const result = await request;
      if (disposed || current !== generation) return false;
      if (!result) {
        options.notify?.('Vi kunne ikke hente oplæsningen lige nu. Teksten står stadig på skærmen.');
        return false;
      }
      narrator ||= createNarrator({...options, pack: result.VOICE_PACK});
      return narrator.read(parts, info);
    },
    stop() { generation++; return narrator?.stop(); },
    dispose() { disposed = true; generation++; narrator?.dispose(); }
  };
}
