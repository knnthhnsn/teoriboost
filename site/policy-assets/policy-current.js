// Current public policy pages have no analytics and do not request consent or access storage.
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-cookie-settings]');
  if (!trigger) return;
  event.preventDefault();
  let dialog = document.getElementById('current-cookie-settings');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'current-cookie-settings';
    dialog.className = 'confirm';
    dialog.setAttribute('aria-labelledby', 'current-cookie-title');
    dialog.innerHTML = '<div class="confirm-content"><h2 id="current-cookie-title">Cookieindstillinger</h2><p>Vi tæller besøg med Vercel Web Analytics uden analysecookies eller varigt analyse-id. Den måling bygger på vores legitime interesse og har ikke et samtykkevalg her. Der kører ingen valgfri produktanalyse eller sessionsoptagelse. Appen bruger browserlagring til de funktioner, du vælger. Hvis vi indfører valgfri måling, beder vi om dit samtykke først.</p><div class="actions"><button class="tb-button" type="button" data-close>Luk</button><a class="tb-button" href="cookies.html">Læs cookiepolitikken</a></div></div>';
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => trigger.focus());
    document.body.append(dialog);
  }
  dialog.showModal();
});
