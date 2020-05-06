// TODO: Use class implementation

export function boot() {
  if (!window.$crisp) return;
  window.$crisp.push(['do', 'chat:show']);
}

export function update(key, value) {
  if (!window.$crisp) return;
  const opt = [[key, value]];
  window.$crisp.push(['set', 'session:data', [opt]]);
}

export function updateWithUser(user) {
  if (!user) return;
  if (!window.$crisp) return;
  const {
    email,
    crispUserHash,
    displayName,
  } = user;
  if (displayName) window.$crisp.push(['set', 'user:nickname', [displayName]]);
  if (email) {
    const emailPayload = [email];
    if (crispUserHash) emailPayload.push(crispUserHash);
    window.$crisp.push(['set', 'user:email', emailPayload]);
  }
}

export function event(name, meta = {}) {
  if (!window.$crisp) return;
  window.$crisp.push(['set', 'session:event', [[[`oice_${name}`, meta]]]]);
}

export function shutdown() {
  if (!window.$crisp) return;
  window.$crisp.push(['do', 'session:reset']);
}
