import _get from 'lodash/get';

import {
  DOMAIN_URL,
  LOG_KEY,
  PLAY_STORE_URL,
} from 'common/constants';

export function getDesktopURL(uuid, language) {
  return `${DOMAIN_URL}/story/${uuid}?lang=${language}`;
}

export function getDeepLinkObject({ t, channel, oice, data = {} }) {
  const {
    image,
    ogImage,
    uuid,
    ogDescription,
    name,
    storyName,
    storyDescription,
    description,
  } = oice;

  const $og_image_url = (
    _get(ogImage, 'button') ||
    _get(image, 'button') ||
    `${DOMAIN_URL}/static/img/oice-default-cover.jpg`
  );
  const $og_description = storyDescription || ogDescription || description || t('site:description');
  const $og_title = `${storyName}: ${name}`;
  const language = oice.language;
  const desktopUrl = getDesktopURL(uuid, language);
  return ({
    channel,
    data: {
      log_key: LOG_KEY,
      uuid,
      language,
      $desktop_url: desktopUrl,
      $android_url: PLAY_STORE_URL,
      $ios_url: desktopUrl,
      $og_title,
      $og_description,
      $og_image_url,
      ...data,
    },
  });
}
