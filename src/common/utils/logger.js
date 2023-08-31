export function logEvent(name, meta = {}) {
  if (window.gtag) {
    window.gtag('event', name, meta);
  }
  if (window.$crisp) {
    window.$crisp.push(['set', 'session:event', [[[`oice_${name}`, meta]]]]);
  }
}

export default logEvent;
