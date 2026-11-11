// On a slow line the first screen's own pictures go first. Optional work (animations, screens that are not open yet)
// waits for the page to load, for #view to show a real screen (not the "Henter" line) and for that screen's visible
// pictures, at most 4 s, and then for a quiet moment.
let settled = null;
export function afterFirstScreen() {
  return settled ||= new Promise(resolve => {
    const idle = () => (globalThis.requestIdleCallback || (f => setTimeout(f, 300)))(() => resolve(), { timeout: 1500 });
    const pictures = view => {
      const pending = [...view.querySelectorAll('img')].filter(img => {
        if (img.complete) return false;
        const r = img.getBoundingClientRect();
        return r.width > 0 && r.bottom > 0 && r.top < innerHeight;
      });
      if (!pending.length) return idle();
      let left = pending.length, done = false;
      const finish = () => { if (!done) { done = true; idle(); } };
      const one = () => { if (--left === 0) finish(); };
      for (const img of pending) { img.addEventListener('load', one, { once: true }); img.addEventListener('error', one, { once: true }); }
      setTimeout(finish, 4000);
    };
    const drawn = view => !!view.querySelector(':scope > :not(.tb-stripes)');
    const watch = () => {
      const view = document.getElementById('view');
      if (!view) return pictures(document.body);
      if (drawn(view)) return pictures(view);
      let done = false;
      const go = () => { if (done) return; done = true; observer.disconnect(); clearTimeout(cap); pictures(view); };
      const observer = new MutationObserver(() => { if (drawn(view)) go(); });
      observer.observe(view, { childList: true });
      const cap = setTimeout(go, 8000);
    };
    if (document.readyState === 'complete') watch(); else addEventListener('load', watch, { once: true });
  });
}
