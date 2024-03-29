export const PROFILE_ACTION = {
  MEMBERSHIP: 'membership',
  BECOME_BACKER: 'become-backer',
  SUBSCRIBE: 'subscribe',
  PERSONAL_INFORMATION: 'personal-info',
  BACKER_SUCCESS: 'backer_success',
  BACKER_CANCEL: 'backer_cancel',
};

export const TAB_BAR_ITEM = {
  PERSONAL_INFORMATION: 'personalInformation',
  MEMBERSHIP: 'membership',
  ACCOUNT_SETTING: 'accountSetting',
};

export const TAB_BAR_ITEMS = [
  TAB_BAR_ITEM.PERSONAL_INFORMATION,
  TAB_BAR_ITEM.MEMBERSHIP,
  TAB_BAR_ITEM.ACCOUNT_SETTING,
];

export const BASIC_INFORMATION = {
  DISPLAY_NAME: 'displayName',
  DESCRIPTION: 'description',
  EMAIL_ADDRESS: 'emailAddress',
  USERNAME: 'likeCoinId',
  SEEKING_SUBSCRIPTION_MESSAGE: 'seekingSubscriptionMessage',
  ROLE: 'role',
  LANGUAGE: 'language',
  STRIPE: 'stripe',
  LIKE_COIN_ID: 'likeCoinId',
};

export const BASIC_INFORMATION_LEFT_ITEMS = [
  BASIC_INFORMATION.DISPLAY_NAME,
  BASIC_INFORMATION.DESCRIPTION,
  BASIC_INFORMATION.USERNAME,
  // BASIC_INFORMATION.LIKE_COIN_ID,
  // BASIC_INFORMATION.EMAIL_ADDRESS, TODO: wait for the support in server
];

export const LINK_ALIAS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  PIVIX: 'pivix',
  INSTAGRAM: 'instagram',
  SOUNDCLOUD: 'soundcloud',
  MIRROR_FICTION: 'mirrorfiction',
  LIKECOIN: 'LikeCoin',
};
