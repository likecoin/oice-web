export function logEvent(name, meta = {}) {
  if (window.gtag) {
    window.gtag('event', name, meta);
  }
}

export default logEvent;
