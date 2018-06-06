export const redirectToLoginPage = () => window.location.href = '/login';

export const setAuthItem = (email, token) => {
  if (email && token) {
    localStorage.setItem('auth', JSON.stringify({ email, token }));
  } else {
    throw new Error('setAuthItem email and token cannot be null.');
  }
};

export const getAuthItem = () => {
  if (localStorage.auth) {
    return JSON.parse(localStorage.getItem('auth'));
  }
  return null;
};

export const setLocalUserItem = (profile) => {
  if (profile) {
    localStorage.setItem('currentUser', JSON.stringify(profile));
  } else {
    throw new Error('setProfileItem profile cannot be null.');
  }
};

export const getLocalUserItem = () => {
  if (localStorage.currentUser) {
    return JSON.parse(localStorage.getItem('currentUser'));
  }
  return null;
};

export const clearLocalItems = () => {
  localStorage.removeItem('auth');
  localStorage.removeItem('currentUser');
};

const REDIRECT_KEY = 'redirect';
export const redirectPathname = {
  get: () => {
    const pathname = sessionStorage.getItem(REDIRECT_KEY);
    sessionStorage.removeItem(REDIRECT_KEY);
    return pathname;
  },
  set: pathname => sessionStorage.setItem(REDIRECT_KEY, pathname),
};

const SHOW_PAYMENT_KEY = 'SHOW_PAYMENT';
export const showPaymentInProfile = {
  set: () => sessionStorage.setItem(SHOW_PAYMENT_KEY, true),
  get: () => sessionStorage.getItem(SHOW_PAYMENT_KEY),
  clear: () => sessionStorage.removeItem(SHOW_PAYMENT_KEY),
};
