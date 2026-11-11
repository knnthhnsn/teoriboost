// Keep the approved explanation asset unchanged while resolving its document link at every route.
document.addEventListener('click', event => {
  if (!event.target.closest('[data-cookie-settings]')) return;
  queueMicrotask(() => {
    const link = document.querySelector('#current-cookie-settings a[href="cookies.html"]');
    if (link) link.setAttribute('href', '/cookies/');
  });
});
