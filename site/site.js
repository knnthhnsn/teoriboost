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
  const topOf = el => el.getBoundingClientRect().top + scrollY;

  /* ---------- the scroll engine: every part measures on resize and updates once per frame ---------- */
  const parts = [];
  let vh = innerHeight, raf = 0;
  const frame = () => { raf = 0; const y = scrollY; for (const p of parts) p.update?.(y); };
  const request = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const measure = () => { vh = innerHeight; for (const p of parts) p.measure?.(); frame(); };
  const pinned = el => { const s = { top: 0, len: 1 }; s.measure = () => { s.top = topOf(el); s.len = Math.max(1, el.offsetHeight - vh); }; s.p = y => clamp((y - s.top) / s.len); return s; };

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
    const C = ['#FFD60A', '#FFFFFF', '#1F2328', '#FFE066'];
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'); const a = Math.random() * Math.PI * 2, d = 50 + Math.random() * 110;
      s.style.cssText = `--x:${(50 + (Math.random() - .5) * 40).toFixed(1)}%;--y:${(50 + (Math.random() - .5) * 30).toFixed(1)}%;--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d * .8).toFixed(0)}px;--s:${(5 + Math.random() * 8).toFixed(0)}px;--c:${C[i % C.length]}`;
      host.append(s); setTimeout(() => s.remove(), 1000);
    }
  }

  /* ---------- 1. the crossing: scrolling walks you over it, one bob per stripe ---------- */
  const hero = $('[data-hero]'), road = $('[data-xing]'), heroPin = $('[data-pin="hero"]');
  let heroEnd = 0;
  if (hero && road && heroPin) {
    const pin = pinned(heroPin), stripes = $$('.stripe', road);
    let W = 0, H = 0, pitch = 1;
    parts.push({
      measure() { pin.measure(); W = road.offsetWidth; H = road.offsetHeight; pitch = (stripes[1]?.offsetTop || 1) - (stripes[0]?.offsetTop || 0); heroEnd = pin.top + heroPin.offsetHeight; },
      update(y) {
        const p = still() ? 0 : pin.p(y);
        hero.style.setProperty('--hp', p.toFixed(4));
        const walk = p * pitch * 3.5;
        road.style.setProperty('--walk', `${walk.toFixed(1)}px`);
        road.style.setProperty('--bob', `${(Math.sin(walk / pitch * Math.PI * 2) * .7).toFixed(3)}deg`);
        for (const s of stripes) { // a stripe that has passed under your feet fades before it gets too close
          const past = s.offsetTop + s.offsetHeight + walk - H;
          s.style.opacity = past > W * .2 ? clamp(1 - (past - W * .2) / (W * .25)).toFixed(3) : '';
        }
      },
    });
  }

  /* ---------- the hajtand: its words drive round it; hover or focus brings them gently to a stop ---------- */
  const tooth = $('[data-tooth]'), toothText = $('[data-tooth-text]');
  if (tooth && toothText && !still()) {
    const L = 801; let off = 0, v = 1, target = 1, last = 0, running = false;
    const tick = t => {
      const dt = Math.min(64, t - (last || t)); last = t;
      v += (target - v) * Math.min(1, dt / 260);
      off = (off + v * dt * .05) % L;
      toothText.setAttribute('startOffset', off.toFixed(2));
      if (running) requestAnimationFrame(tick);
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
  let menuOpen = false, lastY = scrollY;
  if (top) parts.push({
    update(y) {
      const overHero = y < heroEnd - top.offsetHeight;
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
    const links = $$('a', nav); let active = null;
    const place = a => {
      links.forEach(l => l.classList.toggle('is-pilled', l === a));
      if (!a) { nav.classList.remove('has-pill'); return; }
      nav.style.setProperty('--px', `${a.offsetLeft}px`); nav.style.setProperty('--pw', `${a.offsetWidth}px`); nav.classList.add('has-pill');
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

  /* ---------- 2. ticker: it drives along, faster while you scroll, and turns with you ---------- */
  const rows = $$('[data-ticker]').map(row => {
    const track = $('.ticker-track', row);
    for (const li of [...track.children]) { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); }
    return { track, dir: Number(row.dataset.ticker) || 1, x: 0, half: 1 };
  });
  if (rows.length) {
    let vel = 0, sdir = 1, prevY = scrollY, prevT = 0, visible = false, running = false;
    const loop = t => {
      const dt = Math.min(64, t - (prevT || t)); prevT = t;
      const dy = scrollY - prevY; prevY = scrollY; if (dy) sdir = Math.sign(dy);
      vel += (Math.min(60, Math.abs(dy)) - vel) * .08;
      for (const r of rows) {
        r.x = (((r.x + r.dir * sdir * (.05 + vel * .012) * dt) % r.half) + r.half) % r.half;
        r.track.style.translate = `${(-r.x).toFixed(1)}px 0`;
      }
      if (visible && !still()) requestAnimationFrame(loop); else running = false;
    };
    parts.push({ measure() { for (const r of rows) r.half = Math.max(1, r.track.scrollWidth / 2); } });
    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !running && !still()) { running = true; prevT = 0; prevY = scrollY; requestAnimationFrame(loop); }
    }).observe($('.ticker'));
  }

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

  /* ---------- 3b. the hajtand of words is painted on, word by word ---------- */
  const tri = $('[data-paint]');
  if (tri) {
    const ws = [];
    for (const child of [...tri.childNodes]) {
      if (child.nodeType !== Node.TEXT_NODE) continue;
      const frag = document.createDocumentFragment();
      for (const part of child.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(' '); continue; }
        const s = document.createElement('span'); s.className = 'pw'; s.textContent = part; frag.append(s); ws.push(s);
      }
      child.replaceWith(frag);
    }
    // the triangle is exactly as tall as its words need, so they always end in the point
    const fit = () => {
      const w = tri.offsetWidth; if (!w) return;
      let lo = .5, hi = 1.6;
      for (let k = 0; k < 10; k++) { const mid = (lo + hi) / 2; tri.style.height = `${(mid * w).toFixed(1)}px`; if (tri.scrollHeight > tri.clientHeight + 1) lo = mid; else hi = mid; }
      tri.style.height = `${(hi * 1.05 * w).toFixed(1)}px`; // a little air, so the last lines are not stretched thin
    };
    let t = 0, h = 1, lit = -1;
    parts.push({
      measure() { fit(); t = topOf(tri); h = tri.offsetHeight; },
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
    const pin = pinned(howPin); const on = () => wide.matches && !still();
    let dist = 0, roadW = 0;
    const road = p => {
      howFill?.parentElement.style.setProperty('--hp2', p.toFixed(4));
      howCar?.style.setProperty('--hcx', `${(p * Math.max(0, roadW - (howCar.offsetWidth || 64) - 20)).toFixed(1)}px`);
    };
    parts.push({
      measure() {
        if (on()) { dist = Math.max(0, howTrack.scrollWidth - innerWidth); howPin.style.setProperty('--how-dist', `${dist}px`); }
        else { dist = 0; howPin.style.removeProperty('--how-dist'); howTrack.style.removeProperty('--hx'); }
        pin.measure(); roadW = howCar?.parentElement.offsetWidth || 0;
      },
      update(y) {
        if (on()) { const p = pin.p(y); howTrack.style.setProperty('--hx', `${(p * dist).toFixed(1)}px`); road(p); }
        else { const max = howWin.scrollWidth - howWin.clientWidth; road(max > 0 ? howWin.scrollLeft / max : 0); }
      },
    });
    howWin.addEventListener('scroll', request, { passive: true });
  }

  /* ---------- 5. one real question ---------- */
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
    parts.push({ measure() { t = topOf(fig); h = fig.offsetHeight; }, update(y) { fig.style.setProperty('--zp', (still() ? 1 : clamp((y + vh - t) / (vh + h * .5))).toFixed(4)); } });
  }

  /* ---------- 6. the garage: frames rendered from the app, one more part per step ---------- */
  const GLOW = {
    scooter: { name: 'Scooter', price: 'Din fra start', w: 592, h: 618, parts: [['Restaurering', 4000], ['Racerstriber', 3000], ['Kromfælge', 7000], ['Katteører-spejle', 5000], ['Hjerte', 1500], ['Sløjfe', 2500], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
    smallcar: { name: 'Lille bil', price: '25.000 Boosters', w: 640, h: 364, parts: [['Lakering', 6000], ['Racerstriber', 3000], ['Tonede ruder', 4000], ['Kromfælge', 7000], ['Spoiler', 5000], ['Tågelygter', 4000], ['LED-bryn', 3500], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
    bigcar: { name: 'Stor bil', price: '60.000 Boosters', w: 604, h: 368, parts: [['Lakering', 6000], ['Sidestribe', 3000], ['Tonede ruder', 4000], ['Kæmpe alufælge', 9000], ['Kofangerbøjle krom', 6000], ['Lygtebøjle på taget', 7000], ['4 rør', 6000], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
    racecar: { name: 'Racerbil', price: '120.000 Boosters', w: 640, h: 273, parts: [['Lakering', 6000], ['Racerstriber', 3000], ['Tonede ruder', 4000], ['Sportsfælge', 5000], ['LED-bryn', 3500], ['Street-kit', 8000], ['6 rør', 8000], ['Egen nummerplade', 2000], ['Neon og sænkning', 9000]] },
  };
  const car = $('[data-car]'), garagePin = $('[data-pin="garage"]');
  if (car && garagePin) {
    const list = $('[data-parts]'), spentEl = $('[data-spent]'), nameEl = $('[data-vehicle-name]'), priceEl = $('[data-vehicle-price]');
    const hint = $('[data-garage-hint]'), tabs = $('[data-vehicles]'), burst = $('[data-sparks]', car);
    const pin = pinned(garagePin); const on = () => wide.matches && !still();
    let vehicle = 'scooter', frames = [], step = -1, spent = 0, spentShown = 0, ready = false, carTop = 0, carH = 1;
    const build = v => {
      const g = GLOW[v];
      car.querySelectorAll('.car-frame').forEach(f => f.remove());
      frames = Array.from({ length: g.parts.length + 1 }, (_, i) => {
        const img = new Image(); img.className = 'car-frame'; img.alt = ''; img.decoding = 'async'; img.width = g.w; img.height = g.h;
        img.src = `assets/glowup/${v}-${String(i).padStart(2, '0')}.webp`; return img;
      });
      frames.forEach(f => car.insertBefore(f, burst));
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
      if (up && celebrate) { car.classList.remove('is-pop'); void car.offsetWidth; car.classList.add('is-pop'); sparks(burst, s === frames.length - 1 ? 26 : 10); }
      if (hint) hint.style.opacity = s > 0 ? '0' : '';
    };
    const progress = y => on() ? pin.p(y) : clamp((y + vh * .82 - carTop) / (vh * .55 + carH * .4));
    const stepFor = p => Math.round(clamp((p - .04) / .82) * (frames.length - 1));
    parts.push({
      measure() { pin.measure(); carTop = topOf(car); carH = car.offsetHeight; },
      update(y) { if (ready) setStep(stepFor(progress(y)), true); },
    });
    // the frames load once the garage is close, so the top of the page stays light
    new IntersectionObserver(([e], obs) => {
      if (!e.isIntersecting) return; obs.disconnect();
      build(vehicle); ready = true; tabs.hidden = false; spentShown = 0; spentEl.textContent = '0'; measure();
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
      measure() { t = topOf(race); room = race.offsetWidth; lanes.forEach(o => { o.cw = o.racer.offsetWidth; o.left = o.racer.offsetLeft; }); },
      update(y) {
        const p = still() ? 1 : clamp((y + vh * .95 - t) / (vh * .75)), e = 1 - Math.pow(1 - p, 2.2);
        for (const o of lanes) o.racer.style.setProperty('--rx-px', `${(e * o.to * Math.max(0, room - o.cw - o.left * 2)).toFixed(1)}px`);
        lanes[0]?.racer.style.setProperty('--fire', p > .03 && p < .97 ? '1' : '0');
      },
    });
  }
  const streak = $('[data-streak]');
  if (streak) {
    const flames = $$('.flame', streak), days = [1, 3, 7, 30], daysEl = $('[data-days]', streak), labelEl = $('[data-days-label]', streak);
    let t = 0, h = 1, level = -1;
    parts.push({
      measure() { t = topOf(streak); h = streak.offsetHeight; },
      update(y) {
        const p = still() ? 1 : clamp((y + vh * .85 - t) / (h + vh * .35));
        const l = Math.min(3, Math.floor(p * 4)); if (l === level) return; level = l;
        flames.forEach((f, i) => f.classList.toggle('is-on', i === l));
        daysEl.textContent = String(days[l]); labelEl.textContent = l ? 'dage i træk' : 'dag i træk';
      },
    });
  }

  /* ---------- 10. answers open smoothly ---------- */
  for (const d of $$('.faq details')) {
    const s = $('summary', d), a = $('.faq-a', d);
    s.addEventListener('click', e => {
      if (still() || !a.animate) return;
      e.preventDefault();
      if (d.open) {
        d.classList.add('is-closing');
        a.animate([{ height: `${a.offsetHeight}px` }, { height: '0px' }], { duration: 380, easing: 'cubic-bezier(.65,0,.35,1)' })
          .onfinish = () => { d.open = false; d.classList.remove('is-closing'); };
      } else {
        d.open = true;
        a.animate([{ height: '0px', opacity: 0 }, { height: `${a.offsetHeight}px`, opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  }

  /* ---------- 11. the finish line: the race car crosses the road as you arrive ---------- */
  const fin = $('[data-final]'), fcar = $('[data-final-car]');
  if (fin && fcar) {
    let t = 0, h = 1, roadW = 0, cw = 0;
    parts.push({
      measure() { t = topOf(fin); h = fin.offsetHeight; roadW = fcar.parentElement.offsetWidth; cw = fcar.offsetWidth; },
      update(y) {
        const p = still() ? .55 : clamp((y + vh - t) / (h + vh * .1));
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

  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', () => { clearTimeout(measure.t); measure.t = setTimeout(measure, 120); });
  addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  reduce.addEventListener?.('change', measure);
  wide.addEventListener?.('change', measure);
  measure();
})();
