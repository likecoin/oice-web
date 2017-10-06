export const PROFILE_ACTION = {
  MEMBERSHIP: 'membership',
  BECOME_BACKER: 'become-backer',
};

export const TAB_BAR_ITEM = {
  PERSONAL_INFORMATION: 'personalInformation',
  ACCOUNT_SETTING: 'accountSetting',
};

export const TAB_BAR_ITEMS = [
  TAB_BAR_ITEM.PERSONAL_INFORMATION,
  TAB_BAR_ITEM.ACCOUNT_SETTING,
];

export const BASIC_INFORMATION = {
  DISPLAY_NAME: 'displayName',
  DESCRIPTION: 'description',
  EMAIL_ADDRESS: 'emailAddress',
  USERNAME: 'username',
  SEEKING_SUBSCRIPTION_MESSAGE: 'seekingSubscriptionMessage',
  ROLE: 'role',
  LANGUAGE: 'language',
  STRIPE: 'stripe',
};

export const BASIC_INFORMATION_LEFT_ITEMS = [
  BASIC_INFORMATION.DISPLAY_NAME,
  BASIC_INFORMATION.DESCRIPTION,
  BASIC_INFORMATION.USERNAME,
  // BASIC_INFORMATION.EMAIL_ADDRESS, TODO: wait for the support in server
];

export const LINK_ALIAS = {
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  PIVIX: 'pivix',
  INSTAGRAM: 'instagram',
  SOUNDCLOUD: 'soundcloud',
  MIRROR_FICTION: 'mirrorfiction',
};
