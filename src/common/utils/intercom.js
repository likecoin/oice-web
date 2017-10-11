import { INTERCOM_APP_ID } from 'common/constants';


// TODO: Use class implementation

export function boot() {
  window.Intercom('boot', {
    app_id: INTERCOM_APP_ID,
  });
}

export function update(options) {
  window.Intercom('update', { ...options });
}

export function updateWithUser(user) {
  if (!user) return;
  update({
    user_id: user.id,
    email: user.email,
    user_hash: user.intercomUserHash,
    name: user.displayName,
    type: user.role,

    // custom data
    _language: user.language,
    _ui_language: user.uiLanguage,
    _is_first_login: !!user.isFirstLogin,
    _is_trial: user.isTrial,
    _is_trial_ended: user.isTrialEnded,
    _is_stripe_connected: user.isStripeConnect,
    _has_payment_info: user.hasPaymentInfo,
    _membership: user.role,
    _membership_expire_date: user.expireDate,
    _membership_is_cancelled: user.isCancelled,
  });
}

export function shutdown() {
  window.Intercom('shutdown');
}
