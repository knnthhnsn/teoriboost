// teoriboost.dk: the scroll-led motion and the small interactions. Every text on the page is readable without it,
// and with reduced motion the page simply shows its finished states.
(() => {
  const doc = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const wide = matchMedia('(min-width: 900px)');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const fmt = n => Math.round(n).toLocaleString('da-DK');
  const still = () => reduce.matches;
  // where the browser has scroll timelines the CSS moves the continuous scroll effects itself, in step with the
  // finger (site.css); site.js does the same work only without them, and for reduced motion (the still states)
  const sda = !!window.CSS?.supports?.('animation-timeline: view()'), byCss = () => sda && !still();
  const topOf = el => el.getBoundingClientRect().top + scrollY;

  /* ---------- the scroll engine: every part measures on resize and updates once per frame, but only while its
     section (el) is near the screen; as it leaves it gets one last update, so it rests in its end state ---------- */
  const parts = [];
  let vh = innerHeight, raf = 0;
  const run = (y, all) => {
    for (const p of parts) {
      const near = !p.el || (y > p.lo && y < p.hi);
      if (near || all || p.live) p.update?.(y);
      p.live = near;
    }
  };
  const frame = () => { raf = 0; run(scrollY, false); };
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const measure = () => {
    vh = innerHeight;
    // twice: a part may change the height of the page (the chat, the hajtand text), which moves the parts below it
    for (let pass = 0; pass < 2; pass++) for (const p of parts) p.measure?.();
    for (const p of parts) if (p.el) { const r = p.el.getBoundingClientRect(); p.lo = r.top + scrollY - vh * 1.5; p.hi = r.bottom + scrollY + vh * .5; }
    run(scrollY, true);
  };
  const pinned = el => { const s = { top: 0, len: 1 }; s.measure = () => { s.top = topOf(el); s.len = Math.max(1, el.offsetHeight - vh); }; s.p = y => clamp((y - s.top) / s.len); return s; };
  const isSticky = el => !!el && getComputedStyle(el).position === 'sticky'; // the CSS decides what is pinned

  /* ---------- words: headings rise word by word ---------- */
  function splitWords(el) {
    let i = 0;
    for (const child of [...el.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        for (const part of child.textContent.split(/([ \t\n\r]+)/)) { // ordinary spaces only: a no-break space keeps its words together
          if (!part) continue;
          if (/^[ \t\n\r]+$/.test(part)) { frag.append(' '); continue; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--wi', i++);
          w.append(s); frag.append(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const w = document.createElement('span'); w.className = 'w';
        child.style.setProperty('--wi', i++); child.replaceWith(w); w.append(child);
      }
    }
  }
  $$('[data-split]').forEach(splitWords);

  /* ---------- reveal once, when it comes into view ---------- */
  const io = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  $$('[data-reveal],[data-split]').forEach(el => io.observe(el));
  const loaded = () => doc.classList.add('is-loaded');
  Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 700))]).then(loaded);

  /* ---------- sparks in the brand colours ---------- */
  function sparks(host, n = 14) {
    if (still() || !host) return;
    const C = ['#FFD60A', '#FEFFED', '#1F2328', '#FFE45C'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'); const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 110;
      s.style.cssText = `--x:${(50 + (Math.random() - .5) * 40).toFixed(1)}%;--y:${(50 + (Math.random() - .5) * 30).toFixed(1)}%;--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d * .8).toFixed(0)}px;--s:${(5 + Math.random() * 8).toFixed(0)}px;--c:${C[i % C.length]}`;
      host.append(s); setTimeout(() => s.remove(), 1000);
    }
  }

  /* ---------- 1. the crossing: scrolling walks you over it, one bob per stripe. Pinned with a mouse; on touch
     and short screens the hero scrolls away with your finger and the walk follows that (.is-flow) ---------- */
  const hero = $('[data-hero]'), road = $('[data-xing]'), heroPin = $('[data-pin="hero"]'), heroSticky = $('.hero-sticky');
  let heroEnd = 0;
  if (hero && road && heroPin) {
    const pin = pinned(heroPin), stripes = $$('.stripe', road);
    let W = 0, H = 0, pitch = 1, ends = [], flow = false, heroH = 1;
    parts.push({
      el: hero,
      measure() {
        pin.measure(); flow = !isSticky(heroSticky); hero.classList.toggle('is-flow', flow);
        W = road.offsetWidth; H = road.offsetHeight; heroH = hero.offsetHeight; heroEnd = pin.top + heroPin.offsetHeight;
        ends = stripes.map(s => s.offsetTop + s.offsetHeight); pitch = (stripes[1]?.offsetTop || 1) - (stripes[0]?.offsetTop || 0);
      },
      update(y) {
        if (byCss()) return;
        const p = still() ? 0 : flow ? clamp((y - pin.top) / (heroH * .85)) : pin.p(y);
        hero.style.setProperty('--hp', p.toFixed(4));
        const walk = p * pitch * 3.5;
        road.style.setProperty('--walk', `${walk.toFixed(1)}px`);
        road.style.setProperty('--bob', `${(Math.sin(walk / pitch * Math.PI * 2) * .7).toFixed(3)}deg`);
        stripes.forEach((s, i) => { // a stripe that has passed under your feet fades before it gets too close
          const past = ends[i] + walk - H;
          s.style.opacity = past > W * .2 ? clamp(1 - (past - W * .2) / (W * .25)).toFixed(3) : '';
        });
      },
    });
  }

  /* ---------- the hajtand: its words drive round it; hover or focus brings them gently to a stop ---------- */
  const tooth = $('[data-tooth]'), toothText = $('[data-tooth-text]');
  if (tooth && toothText && !still()) {
    const L = 801; let off = 0, v = 1, target = 1, last = 0, running = false;
    // the words move about half a pixel a frame, so 30 steps a second look the same as 60. Each step lays the text
    // out along its path again and repaints it, which kept an old phone's main thread busy while nothing else moved
    const tick = t => {
      if (!running) return;
      requestAnimationFrame(tick);
      if (last && t - last < 30) return;
      const dt = Math.min(64, t - (last || t)); last = t;
      v += (target - v) * Math.min(1, dt / 260);
      const next = (off + v * dt * .05) % L;
      if (Math.abs(next - off) < .01) return; // brought to a stop (hover, focus): nothing new to draw
      off = next; toothText.setAttribute('startOffset', off.toFixed(2));
    };
    const go = on => { if (on && !running) { running = true; last = 0; requestAnimationFrame(tick); } else if (!on) running = false; };
    tooth.addEventListener('pointerenter', () => { target = 0; });
    tooth.addEventListener('pointerleave', () => { target = 1; });
    tooth.addEventListener('focus', () => { target = 0; });
    tooth.addEventListener('blur', () => { target = 1; });
    new IntersectionObserver(([e]) => go(e.isIntersecting)).observe(tooth);
  }

  /* ---------- header: light over the crossing, glass after it; it steps aside while you read down ---------- */
  const top = $('[data-top]');
  let menuOpen = false, lastY = scrollY, topH = 76;
  if (top) parts.push({
    measure() { topH = top.offsetHeight; }, // read once: reading it every frame would force a layout mid-frame
    update(y) {
      const overHero = y < heroEnd - topH;
      top.classList.toggle('is-dark', overHero && !menuOpen);
      top.classList.toggle('is-solid', !overHero && y > 10);
      if (!menuOpen) {
        if (y > lastY + 4 && y > vh * .6) top.classList.add('is-away');
        else if (y < lastY - 4 || y < vh * .4) top.classList.remove('is-away');
      }
      lastY = y;
    },
  });

  /* the nav pill follows your pointer and rests on the section you are in */
  const nav = $('[data-pillnav]');
  if (nav) {
    const links = $$('a', nav); const pill = $('.nav-pill', nav) || nav; let active = null;
    const place = a => {
      links.forEach(l => l.classList.toggle('is-pilled', l === a));
      if (!a) { nav.classList.remove('has-pill'); return; }
      pill.style.setProperty('--px', `${a.offsetLeft}px`); pill.style.setProperty('--pw', `${a.offsetWidth}px`); nav.classList.add('has-pill');
    };
    links.forEach(a => a.addEventListener('pointerenter', () => place(a)));
    nav.addEventListener('pointerleave', () => place(active));
    const byId = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { active = byId.get(e.target.id) || null; if (!nav.matches(':hover')) place(active); }
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main > section, main > div').forEach(s => sio.observe(s));
  }

  /* the phone menu */
  const menuBtn = $('[data-menu-btn]'), menu = $('[data-menu]');
  if (menuBtn && menu) {
    const set = open => {
      menuOpen = open; menuBtn.setAttribute('aria-expanded', String(open)); top?.classList.toggle('menu-open', open);
      if (open) {
        menu.hidden = false; top?.classList.remove('is-away', 'is-dark');
        requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
        document.body.style.overflow = 'hidden'; setTimeout(() => menu.querySelector('a')?.focus(), 60);
      } else {
        menu.classList.remove('is-open'); document.body.style.overflow = '';
        setTimeout(() => { if (!menuOpen) menu.hidden = true; }, still() ? 0 : 700);
        request();
      }
    };
    menuBtn.addEventListener('click', () => set(!menuOpen));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { set(false); menuBtn.focus(); } });
    wide.addEventListener('change', () => { if (menuOpen && wide.matches) set(false); });
  }

  /* ---------- 2. ticker: the CSS drives it (and slides it as it passes); the list is doubled for a seamless loop ---------- */
  for (const track of $$('[data-ticker] .ticker-track'))
    for (const li of [...track.children]) { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); }

  /* ---------- 3. the numbers count up once ---------- */
  const cio = new IntersectionObserver(es => {
    for (const e of es) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      const el = e.target, to = Number(el.dataset.count);
      if (still()) continue;
      const t0 = performance.now(), dur = 1500;
      const step = t => { const k = clamp((t - t0) / dur); el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 4)))); if (k < 1) requestAnimationFrame(step); };
      el.textContent = '0'; requestAnimationFrame(step);
    }
  }, { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- 3b. the hajtand of words: lines that follow the triangle, painted on word by word ----------
     The lines are set here rather than by the browser around two shaped floats: Safari breaks lines around
     shape-outside its own way, and on an iPhone the text ran out of the triangle. Every word is measured in the
     page's own font, each line gets exactly the width of the triangle at its height and is justified, the soft
     hyphens still break long words, and the triangle is as small as the words allow, so "Kør!" sits in its point.
     Without JavaScript the paragraph keeps its CSS shape (.tri-l, .tri-r). */
  const tri = $('[data-paint]');
  if (tri) {
    const tipText = $('.tri-tip', tri)?.textContent || 'Kør!';
    const text = [...tri.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    const words = text.split(' ').map(w => w.split('­')); // each word in its hyphenation pieces
    let ws = [], key = '', t = 0, h = 1, lit = -1;
    const span = (cls, s) => { const e = document.createElement('span'); if (cls) e.className = cls; if (s != null) e.textContent = s; return e; };
    const setLines = () => {
      const W = tri.clientWidth; if (!W) return;
      const probe = span('tri-probe'); tri.append(probe);
      const cache = new Map(), wd = s => { if (!cache.has(s)) { probe.textContent = s; cache.set(s, probe.getBoundingClientRect().width); } return cache.get(s); };
      // set again only when the width or the font changed (a word's width tells: the web font may arrive late)
      const k = `${W}|${wd('Hajtænder').toFixed(2)}`; if (k === key) { probe.remove(); return; } key = k;
      // every piece the line setting below may ask for (whole words, the rest of a word, a head that breaks at a
      // soft hyphen) is measured in one go: one layout for them all instead of one per word
      const need = new Set(['X X', 'XX', tipText]);
      for (const p of words) for (let f = 0; f < p.length; f++) {
        need.add(p.slice(f).join(''));
        for (let c = f + 1; c < p.length; c++) need.add(p.slice(f, c).join('') + '-');
      }
      const todo = [...need].filter(s => !cache.has(s)), kids = todo.map(s => span('', s));
      probe.replaceChildren(...kids);
      kids.forEach((e, i) => cache.set(todo[i], e.getBoundingClientRect().width));
      const space = wd('X X') - wd('XX'), tipW = wd(tipText);
      probe.textContent = 'X'; probe.style.display = 'block'; const lh = probe.getBoundingClientRect().height; probe.style.display = '';
      // line n is as wide as the triangle at the line's foot (where it is narrowest), as with shape-outside
      const room = (n, H) => W * (1 - (n + 1) * lh / H);
      const layout = H => {
        const lines = []; let wi = 0, from = 0;
        while (wi < words.length) {
          const A = room(lines.length, H); if (A <= 0) return null;
          const items = []; let w = 0;
          while (wi < words.length) {
            const rest = words[wi].slice(from), gap = items.length ? space : 0, full = rest.join('');
            if (w + gap + wd(full) <= A) { items.push(full); w += gap + wd(full); wi++; from = 0; continue; }
            for (let c = rest.length - 1; c >= 1; c--) { // break at a soft hyphen: as much of the word as fits
              const head = rest.slice(0, c).join('') + '-';
              if (w + gap + wd(head) <= A) { items.push(head); w += gap + wd(head); from += c; break; }
            }
            break;
          }
          if (!items.length) return null;
          lines.push({ items, A });
        }
        return room(lines.length, H) >= tipW ? lines : null; // and "Kør!" fits in the point below
      };
      let lo = W * .3, hi = W * 3;
      if (!layout(hi)) { probe.remove(); return; }
      for (let n = 0; n < 24; n++) { const mid = (lo + hi) / 2; if (layout(mid)) hi = mid; else lo = mid; }
      const lines = layout(hi), box = span('tri-lines'); probe.remove(); // (measured words live in the cache now)
      lines.forEach((l, n) => {
        const row = span('tri-line' + (l.items.length === 1 || n === lines.length - 1 ? ' is-centred' : ''));
        row.style.width = `${l.A.toFixed(2)}px`;
        l.items.forEach((s, i) => { if (i) row.append(' '); row.append(span('pw', s)); });
        box.append(row);
      });
      const tip = span('tri-line is-centred'); tip.style.width = `${room(lines.length, hi).toFixed(2)}px`; tip.append(span('tri-tip', tipText)); box.append(tip);
      box.setAttribute('aria-hidden', 'true'); box.style.setProperty('--sp', `${space.toFixed(2)}px`);
      tri.replaceChildren(span('sr-only', `${text.replace(/­/g, '')} ${tipText}`), box); tri.classList.add('is-set');
      ws = [...tri.querySelectorAll('.pw, .tri-tip')]; lit = -1;
    };
    parts.push({
      el: tri.closest('section') || tri,
      measure() { setLines(); t = topOf(tri); h = tri.offsetHeight; },
      update(y) {
        const n = still() ? ws.length : Math.round(clamp((y + vh * .78 - t) / (h * .9)) * ws.length);
        if (n === lit) return; lit = n;
        ws.forEach((w, i) => w.classList.toggle('is-lit', i < n));
      },
    });
  }

  /* ---------- 4. four stops: a road that runs sideways while you scroll down ---------- */
  const howPin = $('[data-pin="how"]'), howTrack = $('[data-how-track]'), howWin = $('[data-how-window]');
  const howFill = $('[data-how-fill]'), howCar = $('[data-how-car]');
  if (howPin && howTrack && howWin) {
    const pin = pinned(howPin), howSticky = $('.how-sticky');
    let on = false, dist = 0, roadW = 0, carW = 64, swipe = 1;
    const road = p => {
      howFill?.parentElement.style.setProperty('--hp2', p.toFixed(4));
      howCar?.style.setProperty('--hcx', `${(p * Math.max(0, roadW - carW - 20)).toFixed(1)}px`);
    };
    parts.push({
      el: $('#saadan'),
      measure() {
        on = isSticky(howSticky);
        if (on) { dist = Math.max(0, howTrack.scrollWidth - innerWidth); howPin.style.setProperty('--how-dist', `${dist}px`); }
        else { dist = 0; howPin.style.removeProperty('--how-dist'); howTrack.style.removeProperty('--hx'); }
        pin.measure(); roadW = howCar?.parentElement.offsetWidth || 0; carW = howCar?.offsetWidth || 64;
        swipe = Math.max(0, howWin.scrollWidth - howWin.clientWidth);
      },
      update(y) {
        if (byCss()) return;
        if (on) { const p = pin.p(y); howTrack.style.setProperty('--hx', `${(p * dist).toFixed(1)}px`); road(p); }
        else road(swipe > 0 ? howWin.scrollLeft / swipe : 0);
      },
    });
    howWin.addEventListener('scroll', request, { passive: true });
  }

  /* ---------- 5. the app in your hand: native vertical scroll, alternating screenshot columns.
     Shares the page's measured/rAF engine; no layout reads in the scroll loop. Arrow buttons also work
     with reduced motion, and selecting a screen holds it until the visitor scrolls again. ---------- */
  const showcase = $('[data-showcase]'), showcasePin = $('[data-showcase-pin]');
  if (showcase && showcasePin) {
    const stage = $('[data-showcase-stage]', showcase), pin = pinned(showcasePin);
    const columns = $$('[data-showcase-column]', showcase).map(el => ({ el, direction: Number(el.dataset.showcaseColumn), start: 0, travel: 0 }));
    const screens = $$('[data-showcase-screen]', showcase), controls = $('[data-showcase-controls]', showcase);
    const count = $('[data-showcase-count]', showcase), caption = $('[data-showcase-caption]', showcase), progress = $('[data-showcase-progress]', showcase), status = $('[data-showcase-status]', showcase);
    let active = -1, on = false, lastP = 0, heldP = null;
    const show = index => {
      index = (index + screens.length) % screens.length;
      if (index === active) return;
      active = index;
      screens.forEach((img, i) => { img.classList.toggle('is-active', i === index); img.setAttribute('aria-hidden', String(i !== index)); });
      count.textContent = String(index + 1);
      caption.textContent = screens[index].dataset.showcaseScreen;
      progress.style.setProperty('--showcase-progress', ((index + 1) / screens.length).toFixed(3));
    };
    const announce = () => { status.textContent = `Skærm ${active + 1} af ${screens.length}: ${caption.textContent}`; };
    const browse = delta => { heldP = lastP; show(active + delta); announce(); };
    controls.hidden = false;
    $('[data-showcase-prev]', controls).addEventListener('click', () => browse(-1));
    $('[data-showcase-next]', controls).addEventListener('click', () => browse(1));
    controls.addEventListener('keydown', e => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault(); heldP = lastP;
      show(e.key === 'Home' ? 0 : e.key === 'End' ? screens.length - 1 : active + (e.key === 'ArrowLeft' ? -1 : 1));
      announce();
    });
    show(0);
    // The screenshots are lazy below the fold. Decode the whole tour just before it enters, not at page load.
    const preload = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      $$('img', showcase).forEach(img => { img.loading = 'eager'; img.decode?.().catch(() => {}); });
      preload.disconnect();
    }, { rootMargin: '100% 0px' });
    preload.observe(showcasePin);
    parts.push({
      el: showcasePin,
      measure() {
        on = isSticky(stage); pin.measure();
        for (const col of columns) {
          const room = Math.max(0, col.el.offsetHeight - stage.offsetHeight);
          col.travel = Math.min(room * .62, stage.offsetHeight * 1.25) * Math.abs(col.direction);
          // Each column starts and ends inside its image strip, so the wall never exposes an empty edge.
          const offset = Math.min(room - col.travel, stage.offsetHeight * (.08 + Math.abs(col.direction) * .12));
          col.start = -Math.max(0, offset) - (col.direction > 0 ? col.travel : 0);
        }
      },
      update(y) {
        const p = on && !still() ? pin.p(y) : 0;
        lastP = p;
        if (heldP !== null && Math.abs(p - heldP) > .025) heldP = null;
        if (heldP === null) show(still() || !on ? 0 : Math.min(screens.length - 1, Math.floor(p * screens.length)));
        for (const col of columns) col.el.style.setProperty('--col-y', `${(col.start + (col.direction > 0 ? 1 : -1) * col.travel * p).toFixed(1)}px`);
      },
    });
  }

  /* ---------- one real question ---------- */
  const answers = $('[data-answers]'), feedback = $('[data-feedback]');
  if (answers && feedback) {
    answers.hidden = false;
    const cast = $('[data-cast]', feedback), who = $('[data-cast-name]', feedback), line = $('[data-cast-line]', feedback), result = $('[data-result]', feedback);
    const burst = document.createElement('span'); burst.className = 'sparks'; burst.setAttribute('aria-hidden', 'true'); feedback.append(burst);
    for (const b of $$('[data-answer]', answers)) b.addEventListener('click', () => {
      const right = b.dataset.answer === 'yes';
      feedback.classList.toggle('is-wrong', !right);
      cast.src = right ? 'assets/cast/blink.webp' : 'assets/cast/kegle.webp';
      who.textContent = right ? 'Blink' : 'Kegle';
      line.textContent = right ? 'Du så det, før det blev farligt.' : 'Jeg vakler også. Men vi vælter ikke.';
      result.textContent = right ? 'Ja, lige præcis.' : 'Her er svaret ja.';
      answers.hidden = true; feedback.hidden = false;
      if (right) sparks(burst, 18);
      $('[data-reset]', feedback)?.focus({ preventScroll: true });
    });
    $('[data-reset]', feedback)?.addEventListener('click', () => { feedback.hidden = true; answers.hidden = false; answers.querySelector('button')?.focus({ preventScroll: true }); });
  }
  for (const fig of $$('[data-zoom]')) {
    let t = 0, h = 1;
    parts.push({ el: fig, measure() { t = topOf(fig); h = fig.offsetHeight; }, update(y) { if (!byCss()) fig.style.setProperty('--zp', (still() ? 1 : clamp((y + vh - t) / (vh + h * .5))).toFixed(4)); } });
  }

  /* ---------- 6. the garage: frames rendered from the app, one more part per step ---------- */
  const GLOW = {
    scooter: { name: 'Scooter', price: 'Din fra start', w: 592, h: 618, parts: [['Restaurering', 4000], ['Racerstriber', 3000], ['Kromfælge', 7000], ['Katteører-spejle', 5000], ['Hjerte', 1500], ['Sløjfe', 2500], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
    smallcar: { name: 'Lille bil', price: '25.000 Boosters', w: 640, h: 364, parts: [['Lakering', 6000], ['Racerstriber', 3000], ['Tonede ruder', 4000], ['Kromfælge', 7000], ['Spoiler', 5000], ['Tågelygter', 4000], ['LED-bryn', 3500], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
    bigcar: { name: 'Stor bil', price: '60.000 Boosters', w: 604, h: 368, parts: [['Lakering', 6000], ['Sidestribe', 3000], ['Tonede ruder', 4000], ['Kæmpe alufælge', 9000], ['Kofangerbøjle krom', 6000], ['Lygtebøjle på taget', 7000], ['4 rør', 6000], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
    racecar: { name: 'Racerbil', price: '120.000 Boosters', w: 640, h: 273, parts: [['Lakering', 6000], ['Racerstriber', 3000], ['Tonede ruder', 4000], ['Sportsfælge', 5000], ['LED-bryn', 3500], ['Street-kit', 8000], ['6 rør', 8000], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
  };
  const FRAMES_V = '81461f1e'; // set by tools/site-glowup.mjs: the frames' version, so a phone never shows week-old cached frames
  const car = $('[data-car]'), garagePin = $('[data-pin="garage"]');
  if (car && garagePin) {
    const list = $('[data-parts]'), spentEl = $('[data-spent]'), nameEl = $('[data-vehicle-name]'), priceEl = $('[data-vehicle-price]');
    const hint = $('[data-garage-hint]'), tabs = $('[data-vehicles]'), burst = $('[data-sparks]', car);
    const pin = pinned(garagePin), garageSticky = $('.garage-sticky');
    let on = false, vehicle = 'scooter', frames = [], step = -1, spent = 0, spentShown = 0, ready = false, carTop = 0, carH = 1;
    const build = v => {
      const g = GLOW[v];
      car.querySelectorAll('.car-frame').forEach(f => f.remove());
      frames = Array.from({ length: g.parts.length + 1 }, (_, i) => {
        const img = new Image(); img.className = 'car-frame'; img.alt = ''; img.decoding = 'async'; img.width = g.w; img.height = g.h;
        img.src = `assets/glowup/${v}-${String(i).padStart(2, '0')}.webp?v=${FRAMES_V}`; return img;
      });
      frames.forEach(f => car.insertBefore(f, burst));
      frames.forEach(f => f.decode?.().catch(() => {})); // decoded ahead, so a new part shows the moment you reach it
      list.innerHTML = g.parts.map(([n, p]) => `<li><span>${n}</span><b>${fmt(p)}</b></li>`).join('');
      nameEl.textContent = g.name; priceEl.textContent = g.price;
      car.setAttribute('aria-label', `${g.name}: fra vrag til lækker, del for del.`);
      step = -1;
    };
    const countTo = to => {
      const from = spentShown, t0 = performance.now();
      const tick = t => { const k = clamp((t - t0) / 500); spentShown = from + (to - from) * (1 - Math.pow(1 - k, 3)); spentEl.textContent = fmt(spentShown); if (k < 1 && spent === to) requestAnimationFrame(tick); };
      if (still()) { spentShown = to; spentEl.textContent = fmt(to); } else requestAnimationFrame(tick);
    };
    const setStep = (s, celebrate) => {
      if (s === step) return;
      const up = s > step && step >= 0; step = s;
      frames.forEach((f, i) => f.classList.toggle('is-on', i === s));
      const items = $$('li', list);
      items.forEach((li, i) => { li.classList.toggle('is-done', i < s); li.classList.toggle('is-now', i === s - 1); });
      spent = GLOW[vehicle].parts.slice(0, s).reduce((a, [, p]) => a + p, 0); countTo(spent);
      if (up && celebrate) {
        if (!still()) frames[s].animate?.([{ scale: '1' }, { scale: '1.035 .975', offset: .35 }, { scale: '1' }], { duration: 550, easing: 'cubic-bezier(.2,1.45,.4,1)' });
        sparks(burst, s === frames.length - 1 ? 26 : 10);
      }
      if (hint) hint.style.opacity = s > 0 ? '0' : '';
    };
    const progress = y => on ? pin.p(y) : clamp((y + vh * .82 - carTop) / (vh * .55 + carH * .4));
    const stepFor = p => Math.round(clamp((p - .04) / .82) * (frames.length - 1));
    const part = {
      el: $('#garage'),
      measure() { on = isSticky(garageSticky); pin.measure(); carTop = topOf(car); carH = car.offsetHeight; },
      update(y) { if (ready) setStep(stepFor(progress(y)), true); },
    };
    parts.push(part);
    // the frames load once the garage is close, so the top of the page stays light. They sit in a box of fixed
    // proportions, so nothing else on the page moves: only the garage itself is measured again, mid-scroll
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return; obs.disconnect();
      build(vehicle); ready = true; spentShown = 0; spentEl.textContent = '0'; part.measure(); request();
    }, { rootMargin: '120% 0px' }).observe(garagePin);
    tabs?.addEventListener('click', e => {
      const b = e.target.closest('[data-vehicle]'); if (!b || !GLOW[b.dataset.vehicle]) return;
      vehicle = b.dataset.vehicle;
      $$('[data-vehicle]', tabs).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      build(vehicle); setStep(stepFor(progress(scrollY)), false);
    });
  }

  /* ---------- 8. the race: three example cars take their places; the flame grows with the streak ---------- */
  const race = $('[data-race]');
  if (race) {
    const lanes = $$('.lane', race).map(l => ({ racer: $('.racer', l), to: parseFloat(l.style.getPropertyValue('--to')) || .5 }));
    let t = 0, room = 0;
    parts.push({
      el: race,
      measure() { t = topOf(race); room = race.offsetWidth; lanes.forEach(o => { o.cw = o.racer.offsetWidth; o.left = o.racer.offsetLeft; }); },
      update(y) {
        if (byCss()) return;
        const p = still() ? 1 : clamp((y + vh * .95 - t) / (vh * .75)), e = 1 - Math.pow(1 - p, 2.2);
        for (const o of lanes) o.racer.style.setProperty('--rx-px', `${(e * o.to * Math.max(0, room - o.cw - o.left * 2)).toFixed(1)}px`);
        lanes[0]?.racer.style.setProperty('--fire', p > .03 && p < .97 ? '1' : '0');
      },
    });
  }
  const streak = $('[data-streak]');
  if (streak) {
    // from smoke (no streak) to the big flame: the app's levels at 0, 1, 3, 7 and 30 days in a row
    const flames = $$('.flame', streak), days = [0, 1, 3, 7, 30], daysEl = $('[data-days]', streak), labelEl = $('[data-days-label]', streak);
    let t = 0, h = 1, level = -1;
    parts.push({
      el: streak,
      measure() { t = topOf(streak); h = streak.offsetHeight; },
      update(y) {
        const p = still() ? 1 : clamp((y + vh * .85 - t) / (h + vh * .35));
        const last = flames.length - 1, l = Math.min(last, Math.floor(p * flames.length)); if (l === level) return; level = l;
        flames.forEach((f, i) => f.classList.toggle('is-on', i === l));
        daysEl.textContent = String(days[l]); labelEl.textContent = days[l] === 1 ? 'dag i træk' : 'dage i træk';
      },
    });
  }

  /* ---------- 7b. Spørg Sneglen: the chat plays as you scroll, and Sneglen crawls behind, leaving a wet trail ---------- */
  const aiSec = $('#sneglen'), log = $('[data-ai-log]');
  if (aiSec && log) {
    // Written from the app's own exercises and their sources (dist/content.js: q-065, q-058, q-059, q-047, q-036, q-035)
    const CHATS = [
      { q: 'Forklar hajtænder på 20 sekunder',
        a: 'Hajtænder betyder ubetinget vigepligt. Du holder tilbage for al kørende færdsel på den vej, du kører ind på eller over – også cyklister. Du behøver ikke holde helt stille, hvis der er frit. Ved en stoptavle standser du altid helt ved stoplinjen.',
        gag: 'Trekanten kræver respekt, ikke teaterpause.', src: ['Færdselsloven', 'Bekendtgørelse om vejafmærkning'] },
      { q: 'Hvor mange fejl må jeg have?',
        a: 'Højst fem. Teoriprøven har 25 situationer med fire udsagn hver, mindst ét af dem er rigtigt, og du har 25 minutter. Appens øveprøver bruger samme format, så du kan se, hvor du står.',
        gag: '25-25-5. Den eneste trio uden comeback-turné.', src: ['Færdselsstyrelsen: Digitale teoriprøver'] },
      { q: 'Skal jeg altid køre 80, når skiltet siger 80?',
        a: 'Nej. Hastighedsgrænsen er et maksimum, ikke et mål. Vej, vejr og sigt kan kræve væsentligt lavere fart.',
        gag: 'Tavlen er et loft, ikke en KPI.', src: ['Færdselsloven'] },
      { q: 'Quiz mig i rundkørsler', intro: 'Klar? Her er en fra appen. Svar ja eller nej til hvert udsagn.',
        quiz: { kicker: 'Rundkørsel · udkørslen', q: 'Du forlader en rundkørsel. En gående er på vej ud i fodgængerfeltet lige efter udkørslen, og en cyklist fortsætter langs rundkørslen. Hvad gør du?',
          items: [['Accelererer gennem feltet, fordi jeg allerede er i rundkørslen.', false], ['Orienterer mig efter cyklisten og holder tilbage for den, før jeg krydser dens bane.', true],
            ['Holder tilbage for den gående og standser om nødvendigt før fodgængerfeltet.', true], ['Ser kun mod bilerne bagfra.', false]],
          why: 'Ved udkørslen skal du holde tilbage for cyklisten og for gående, der krydser eller er på vej ud i feltet; stands om nødvendigt.',
          gag: 'Rundkørslen er rund; dit ansvar er stadig helt.' } },
    ];
    const GREETING = 'Hej! Jeg er Sneglen. Spørg mig om alt i køreteori. Jeg svarer ud fra appens regelkort, tjekker Færdselsstyrelsen og kan quizze dig.';
    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    // like a chat, the newest message stays in view. On a phone the chat cannot be scrolled by hand (a swipe over it
    // moves the page), so it is scrolled for you as the messages arrive
    let aiPinned = false;
    const stick = () => { log.scrollTop = log.scrollHeight; };
    const show = (node, on) => { // true when it changed
      if (!node || node.hidden === !on) return false;
      node.hidden = !on;
      if (on && !still()) { node.classList.remove('is-new'); void node.offsetWidth; node.classList.add('is-new'); }
      return true;
    };

    function quizCard(qz) {
      const box = el('div', 'quiz'), list = el('ul', 'quiz-list'), answers = qz.items.map(() => null);
      const check = el('button', 'quiz-check', 'Tjek mine svar'), result = el('div', 'quiz-result'), burst = el('span', 'sparks');
      check.type = 'button'; check.disabled = true; result.hidden = true; result.setAttribute('role', 'status'); burst.setAttribute('aria-hidden', 'true');
      qz.items.forEach(([text], i) => {
        const li = el('li'); li.append(el('span', '', text));
        for (const [value, label] of [[true, 'Ja'], [false, 'Nej']]) {
          const b = el('button', '', label); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', `${label}: ${text}`);
          b.addEventListener('click', () => {
            manual = true; log.setAttribute('aria-live', 'polite'); // once you answer, the chat is yours: scrolling no longer drives it
            log.classList.add('is-free'); // and it may grow, so your answer and the explanation both fit
            answers[i] = value; li.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
            li.classList.remove('is-right', 'is-wrong'); result.hidden = true; check.disabled = answers.includes(null);
          });
          li.append(b);
        }
        list.append(li);
      });
      check.addEventListener('click', () => {
        let right = 0;
        qz.items.forEach(([, truth], i) => { const ok = answers[i] === truth; right += ok; list.children[i].classList.toggle('is-right', ok); list.children[i].classList.toggle('is-wrong', !ok); });
        result.replaceChildren(el('b', '', right === qz.items.length ? 'Alle fire rigtige!' : `${right} af ${qz.items.length} rigtige`), el('p', '', qz.why), el('p', 'msg-gag', qz.gag));
        result.hidden = false; stick(); if (right === qz.items.length) sparks(burst, 18);
      });
      box.append(el('p', 'quiz-kicker', qz.kicker), el('p', 'quiz-q', qz.q), list, check, result, burst);
      return box;
    }

    // one turn: my question (typed), Sneglen looking through the rule cards, then the answer word by word or a quiz
    function turn(c) {
      const t = { c, me: el('p', 'msg msg--me'), think: el('p', 'msg-think'), words: [] };
      t.think.innerHTML = '<i aria-hidden="true"><b></b><b></b><b></b></i><span>Slår op i regelkortene</span> <em>1/58</em>';
      if (c.quiz) { t.answer = el('p', 'msg msg--snail', c.intro); t.quiz = quizCard(c.quiz); }
      else {
        t.answer = el('div', 'msg msg--snail'); const p = el('p');
        c.a.split(' ').forEach((w, i) => { const s = el('span', 'aw', w); if (i) p.append(' '); p.append(s); t.words.push(s); });
        t.gag = el('p', 'msg-gag', c.gag); t.src = el('p', 'msg-src'); c.src.forEach(s => t.src.append(el('span', '', s)));
        t.answer.append(p, t.gag, t.src);
      }
      [t.me, t.think, t.answer, t.quiz, t.gag, t.src].forEach(n => { if (n) n.hidden = true; });
      return t;
    }
    function play(t, k) { // k: 0..1 through this turn; touches the page only where something changes
      let changed = false;
      const typed = t.c.q.slice(0, Math.round(clamp(k / .2) * t.c.q.length));
      if (t.me.textContent !== typed) { t.me.textContent = typed; changed = true; }
      changed = show(t.me, typed.length > 0) || changed;
      changed = show(t.think, k >= .22 && k < .38) || changed;
      if (k >= .22 && k < .38) { const n = `${1 + Math.round(clamp((k - .22) / .14) * 57)}/58`, em = t.think.querySelector('em'); if (em.textContent !== n) em.textContent = n; }
      changed = show(t.answer, k >= .38) || changed;
      if (t.quiz) changed = show(t.quiz, k >= .5) || changed;
      else {
        const lit = Math.round(clamp((k - .4) / .42) * t.words.length);
        if (lit !== t.lit) { t.words.forEach((w, i) => w.classList.toggle('on', i < lit)); t.lit = lit; }
        changed = show(t.gag, k >= .86) || changed; changed = show(t.src, k >= .92) || changed;
      }
      if (changed) stick();
    }
    const reset = turns => {
      const hi = el('p', 'msg msg--snail', GREETING);
      log.replaceChildren(hi, ...turns.flatMap(t => [t.me, t.think, t.answer, t.quiz].filter(Boolean)));
    };

    // the story the scroll tells: the hajtænder question, then a quiz
    const story = [turn(CHATS[0]), turn(CHATS[3])];
    reset(story);
    let manual = false, storyP = -1;
    const playStory = p => {
      if (manual || p === storyP) return; storyP = p;
      play(story[0], clamp((p - .02) / .5)); play(story[1], clamp((p - .58) / .34));
    };

    // the chips: ask Sneglen yourself; the chat then answers in its own time
    const chips = $('[data-ai-chips]');
    let timer = 0;
    if (chips) {
      chips.hidden = false;
      chips.addEventListener('click', e => {
        const b = e.target.closest('[data-chat]'); if (!b) return;
        const c = CHATS[Number(b.dataset.chat)]; if (!c) return;
        manual = true; cancelAnimationFrame(timer);
        $$('[data-chat]', chips).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        const t = turn(c); reset([t]); log.setAttribute('aria-live', 'polite');
        if (still()) { play(t, 1); return; }
        const t0 = performance.now(), dur = c.quiz ? 2600 : 3800;
        const step = now => { const k = clamp((now - t0) / dur); play(t, k); if (k < 1) timer = requestAnimationFrame(step); };
        timer = requestAnimationFrame(step);
      });
    }

    // on a phone the chat has a fixed height, so the page does not grow under your finger: just tall enough for
    // the story's last message (Sneglen's intro and the quiz), measured with the story briefly at its end
    const fitLog = () => {
      if (aiPinned || log.classList.contains('is-free')) { log.style.removeProperty('--log-h'); return; }
      const end = story[story.length - 1], nodes = [end.answer, end.quiz], hidden = nodes.map(n => n.hidden);
      nodes.forEach(n => { n.hidden = false; });
      const need = end.quiz.getBoundingClientRect().bottom - end.answer.getBoundingClientRect().top + 34; // + the chat's padding
      nodes.forEach((n, i) => { n.hidden = hidden[i]; });
      log.style.setProperty('--log-h', `${Math.ceil(need)}px`);
    };

    // the road: a wavy line along the bottom; Sneglen follows the story slowly, so it lags when you scroll fast.
    // Its path is sampled once (on resize), not every frame, and it only moves (and wiggles) while it has ground to cover
    const road = $('.ai-road', aiSec), svg = $('[data-ai-trail]', aiSec), crawler = $('[data-ai-crawler]', aiSec);
    const wet = $('.ai-trail-wet', svg), shine = $('.ai-trail-shine', svg), aiSticky = $('.ai-sticky', aiSec);
    const pin = pinned($('[data-pin="ai"]')), N = 160;
    let L = 1, pts = [], tMax = .94, cw = 100, ch = 100, phoneTop = 0, phoneH = 1, target = 0, t = 0, last = 0, running = false, visible = false;
    const phone = $('.ai-phone', aiSec);
    const place = () => {
      if (pts.length < 2) return;
      const f = clamp(t) * N, i = Math.min(N - 1, Math.floor(f)), k = f - i, a = pts[i], b = pts[i + 1];
      const x = a.x + (b.x - a.x) * k, y = a.y + (b.y - a.y) * k, ang = Math.atan2(b.y - a.y, b.x - a.x);
      crawler.style.transform = `translate(${(x - cw / 2).toFixed(1)}px,${(y - ch * .92).toFixed(1)}px) rotate(${ang.toFixed(3)}rad)`;
      const off = (L * (1 - clamp(t))).toFixed(1); wet.style.strokeDashoffset = off; shine.style.strokeDashoffset = off;
      crawler.classList.toggle('is-behind', target - t > .07);
      crawler.classList.toggle('is-right', t > tMax - .22); // near the right edge its bubble opens to the left
    };
    const tick = now => {
      const dt = Math.min(64, now - (last || now)); last = now;
      t += (target - t) * (1 - Math.exp(-dt / 700));
      const moving = Math.abs(target - t) > .0015;
      if (!moving) t = target;
      place(); crawler.classList.toggle('is-moving', moving);
      if (moving && visible) requestAnimationFrame(tick); else running = false;
    };
    const wake = () => { if (!running && visible && !still() && Math.abs(target - t) > .0015) { running = true; last = 0; requestAnimationFrame(tick); } };
    parts.push({
      el: aiSec,
      measure() {
        aiPinned = isSticky(aiSticky); fitLog();
        pin.measure(); phoneTop = topOf(phone); phoneH = phone.offsetHeight;
        const w = road.offsetWidth, h = road.offsetHeight;
        const d = `M ${-60} ${(h * .62).toFixed(1)} C ${(w * .2).toFixed(1)} ${(h * .12).toFixed(1)}, ${(w * .36).toFixed(1)} ${(h * .98).toFixed(1)}, ${(w * .55).toFixed(1)} ${(h * .56).toFixed(1)} S ${(w * .86).toFixed(1)} ${(h * .1).toFixed(1)}, ${w + 60} ${(h * .5).toFixed(1)}`;
        wet.setAttribute('d', d); shine.setAttribute('d', d);
        L = wet.getTotalLength(); [wet, shine].forEach(p => { p.style.strokeDasharray = `${L.toFixed(1)}`; });
        // the N + 1 points at equal steps along the road, worked out from its two curves (the S mirrors the C's
        // last handle). Asking the path itself, 161 getPointAtLength calls per measure, cost old phones half a second
        const q = v => Number(v.toFixed(1)), a3 = [q(w * .55), q(h * .56)], a2 = [q(w * .36), q(h * .98)];
        const curves = [[[-60, q(h * .62)], [q(w * .2), q(h * .12)], a2, a3], [a3, [2 * a3[0] - a2[0], 2 * a3[1] - a2[1]], [q(w * .86), q(h * .1)], [w + 60, q(h * .5)]]];
        const samples = []; let run = 0, prev = null;
        for (const [p0, p1, p2, p3] of curves) for (let i = prev ? 1 : 0; i <= 240; i++) {
          const s = i / 240, u = 1 - s, k0 = u * u * u, k1 = 3 * u * u * s, k2 = 3 * u * s * s, k3 = s * s * s;
          const x = k0 * p0[0] + k1 * p1[0] + k2 * p2[0] + k3 * p3[0], y = k0 * p0[1] + k1 * p1[1] + k2 * p2[1] + k3 * p3[1];
          if (prev) run += Math.hypot(x - prev.x, y - prev.y);
          samples.push(prev = { x, y, at: run });
        }
        pts = []; let j = 0;
        for (let i = 0; i <= N; i++) {
          const at = run * i / N; while (j < samples.length - 2 && samples[j + 1].at < at) j++;
          const a = samples[j], b = samples[j + 1], f = b.at > a.at ? clamp((at - a.at) / (b.at - a.at)) : 0;
          pts.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f });
        }
        cw = crawler.offsetWidth; ch = cw; // the snail art is square; its image may not have loaded yet
        // it stops where the whole snail still fits on the screen
        const edge = w - cw * .62; let i = N; while (i > 0 && pts[i].x > edge) i--; tMax = Math.max(.3, i / N);
        place();
      },
      update(y) {
        const p = still() ? 1 : aiPinned ? pin.p(y) : clamp((y + vh * .8 - phoneTop) / (phoneH + vh * .2));
        playStory(p);
        target = .04 + p * (tMax - .04);
        if (still()) { t = target; place(); } else wake();
      },
    });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; wake(); }).observe(aiSec);
    // a tap (or a click) makes Sneglen hop and say hi
    crawler.addEventListener('pointerdown', () => {
      crawler.classList.remove('is-hop'); void crawler.offsetWidth; crawler.classList.add('is-hop');
      clearTimeout(crawler.t); crawler.t = setTimeout(() => crawler.classList.remove('is-hop'), 1200);
    });
  }

  /* ---------- endless CSS loops rest while their section is off screen ---------- */
  const restIO = new IntersectionObserver(es => { for (const e of es) e.target.classList.toggle('is-off', !e.isIntersecting); }, { rootMargin: '20% 0px' });
  $$('main > section, main > div, footer').forEach(s => restIO.observe(s));

  /* ---------- 10. answers open smoothly: a second click reverses from wherever the answer is ---------- */
  for (const d of $$('.faq details')) {
    const s = $('summary', d), a = $('.faq-a', d);
    let anim = null, want = d.open;
    s.addEventListener('click', e => {
      if (still() || !a.animate) return;
      e.preventDefault();
      const from = a.offsetHeight;   // where the answer is right now, also mid-animation
      anim?.cancel();                // retarget instead of stacking a second animation
      want = !want;
      if (want) {
        d.classList.remove('is-closing');
        d.open = true;
        const to = a.offsetHeight;   // natural height, measured after the cancel
        anim = a.animate([{ height: `${from}px`, opacity: from ? 1 : 0 }, { height: `${to}px`, opacity: 1 }],
          { duration: 300, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim.onfinish = () => { anim = null; };
      } else {
        d.classList.add('is-closing');
        anim = a.animate([{ height: `${from}px` }, { height: '0px' }],
          { duration: 240, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
        anim.onfinish = () => { d.open = false; d.classList.remove('is-closing'); anim?.cancel(); anim = null; };
      }
    });
    d.addEventListener('toggle', () => { if (!anim) want = d.open; });
  }

  /* ---------- 11. the finish line: the race car crosses the road as you arrive ---------- */
  const fin = $('[data-final]'), fcar = $('[data-final-car]');
  if (fin && fcar) {
    let t = 0, roadW = 0, cw = 0;
    parts.push({
      el: fin,
      // the car sets off when the road comes into view and is across by the time the road reaches the upper third
      measure() { t = topOf(fcar.parentElement); roadW = fcar.parentElement.offsetWidth; cw = fcar.offsetWidth; },
      update(y) {
        if (byCss()) return;
        const p = still() ? .55 : clamp((y + vh - t) / (vh * .7));
        fcar.style.setProperty('--fcx', `${(-cw + p * (roadW + cw * 1.15)).toFixed(1)}px`);
        fcar.parentElement.style.setProperty('--fp', p.toFixed(4));
      },
    });
  }

  /* ---------- hover: magnetic buttons, cards that tilt toward the pointer ---------- */
  if (fine.matches && !still()) {
    for (const el of $$('[data-magnetic]')) {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * .16).toFixed(1)}px`);
        el.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * .28).toFixed(1)}px`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--mx', '0px'); el.style.setProperty('--my', '0px'); });
    }
    for (const el of $$('[data-tilt]')) {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--ry', `${((x - .5) * 7).toFixed(2)}deg`); el.style.setProperty('--rx', `${((.5 - y) * 5).toFixed(2)}deg`);
        el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    }
  }

  /* ---------- smooth scroll: the wheel glides with a little follow-through, and so do links within the page.
     Only for a mouse or touchpad on a computer: touch, keys and the scrollbar stay native, and it is off with
     reduced motion. Anything that scrolls by itself (the chat) keeps its own wheel. ---------- */
  {
    let goal = scrollY, now = scrollY, glide = 0, prev = 0, lastWrite = scrollY;
    const room = () => document.documentElement.scrollHeight - innerHeight;
    const stop = () => {
      if (glide) cancelAnimationFrame(glide);
      glide = 0; prev = 0; goal = now = lastWrite = scrollY;
    };
    const step = ts => {
      if (!fine.matches || still() || menuOpen) { stop(); return; }
      const dt = Math.min(48, ts - (prev || ts)); prev = ts;
      now += (goal - now) * (1 - Math.exp(-dt / 220));
      if (Math.abs(goal - now) < .4) now = goal;
      lastWrite = now;
      scrollTo(0, now);
      if (Math.abs(scrollY - now) > 1) { stop(); return; } // a shorter page clamped the browser's position
      if (now === goal) { glide = 0; prev = 0; goal = now = lastWrite = scrollY; } else glide = requestAnimationFrame(step);
    };
    const glideTo = y => { goal = clamp(y, 0, room()); if (!glide) { now = scrollY; prev = 0; glide = requestAnimationFrame(step); } };
    const ownScroll = (el, dy) => {
      for (; el && el !== document.body && el !== doc; el = el.parentElement) {
        if (!/(auto|scroll)/.test(getComputedStyle(el).overflowY) || el.scrollHeight <= el.clientHeight + 1) continue;
        if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      return false;
    };
    addEventListener('wheel', e => {
      if (!fine.matches || still() || e.ctrlKey || menuOpen || Math.abs(e.deltaX) > Math.abs(e.deltaY)) { stop(); return; }
      const dy = e.deltaY * (e.deltaMode === 1 ? 18 : e.deltaMode === 2 ? innerHeight : 1);
      if (!dy) return;
      if (ownScroll(e.target, dy)) { stop(); return; }
      if (!glide && (dy < 0 ? scrollY <= 0 : scrollY >= room())) return;
      e.preventDefault();
      glideTo((glide ? goal : scrollY) + dy);
    }, { passive: false });
    // Native input immediately takes over, including when it interrupts a long glide.
    addEventListener('scroll', () => {
      if (glide && Math.abs(scrollY - lastWrite) > 1) stop();
      else if (!glide) goal = now = lastWrite = scrollY;
    }, { passive: true });
    addEventListener('keydown', e => { if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Escape'].includes(e.key)) stop(); });
    addEventListener('pointerdown', stop, { passive: true });
    addEventListener('touchstart', stop, { passive: true });
    addEventListener('resize', stop, { passive: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    reduce.addEventListener?.('change', stop);
    fine.addEventListener?.('change', stop);
    document.addEventListener('click', e => {
      if (!fine.matches || still()) return;
      const a = e.target.closest('a[href^="#"]'); if (!a || a.hasAttribute('target') || a.hasAttribute('download') || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = decodeURIComponent(a.getAttribute('href').slice(1)), to = id === 'top' || !id ? null : document.getElementById(id);
      if (id && id !== 'top' && !to) return;
      e.preventDefault();
      history.pushState(null, '', `#${id || 'top'}`);
      glideTo(to ? topOf(to) - (parseFloat(getComputedStyle(doc).scrollPaddingTop) || 0) : 0);
      const focusTarget = to || document.body; // keyboard and screen reader users land where they went
      if (to && !to.matches('a,button,input,select,textarea,[tabindex]')) to.setAttribute('tabindex', '-1');
      focusTarget.focus?.({ preventScroll: true });
    });
  }

  addEventListener('scroll', request, { passive: true });
  let lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    // a phone's toolbar sliding in or out while you scroll only changes the height a little: no full re-measure
    // in the middle of a swipe, just the new height
    if (!fine.matches && innerWidth === lastW && Math.abs(innerHeight - lastH) < 160) { vh = innerHeight; request(); return; }
    lastW = innerWidth; lastH = innerHeight;
    clearTimeout(measure.t); measure.t = setTimeout(measure, 120);
  });
  // the page load and each font that arrives ask for a new measure; asked together, they share one in the next frame
  let remeasureRaf = 0;
  const remeasure = () => { if (!remeasureRaf) remeasureRaf = requestAnimationFrame(() => { remeasureRaf = 0; measure(); }); };
  addEventListener('load', remeasure);
  document.fonts?.ready.then(remeasure);
  document.fonts?.addEventListener?.('loadingdone', remeasure); // a font that arrives late re-sets the hajtand
  reduce.addEventListener?.('change', measure);
  wide.addEventListener?.('change', measure);
  measure();
})();

;(function () {
  'use strict';

  var root = document.documentElement;
  var guard = '__natkoerselScrollbarRuntime';
  if (window[guard]) return;
  window[guard] = true;

  var media = window.matchMedia('(hover: hover) and (pointer: fine) and (forced-colors: none)');
  var pending = false;

  function update() {
    pending = false;
    if (!media.matches) {
      root.removeAttribute('data-scrollbar-theme');
      return;
    }

    var sample = document.elementFromPoint(
      Math.max(0, root.clientWidth - 2),
      Math.max(0, Math.floor(window.innerHeight / 2))
    );
    if (!sample) return;

    var surface = window.getComputedStyle(sample).getPropertyValue('--brand-scroll-surface').trim();
    var theme = surface === 'dark' ? 'dark' : 'light';
    if (root.getAttribute('data-scrollbar-theme') !== theme) {
      root.setAttribute('data-scrollbar-theme', theme);
    }
  }

  function schedule() {
    if (!media.matches) {
      root.removeAttribute('data-scrollbar-theme');
      return;
    }
    if (!pending) {
      pending = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  if (media.addEventListener) media.addEventListener('change', schedule);
  else if (media.addListener) media.addListener(schedule);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
}());
